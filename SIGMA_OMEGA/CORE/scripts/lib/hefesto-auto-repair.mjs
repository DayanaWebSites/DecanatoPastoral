/**
 * HEFESTO auto-repair — lee el error (+ logs Docker) y aplica fixes conocidos
 * antes de reintentar el pipeline. Best-effort: nunca lanza si el repair falla.
 */
import { spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

function pipe(cmd, timeout = 30_000) {
  return spawnSync(cmd, {
    shell: true,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout,
  });
}

function dockerReady() {
  return pipe('docker info', 20_000).status === 0;
}

async function waitForDocker(maxMs = 120_000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    if (dockerReady()) return true;
    await sleep(3_000);
  }
  return dockerReady();
}

function restartDockerDesktop() {
  if (process.platform !== 'win32') return false;
  console.log('[HEFESTO-REPAIR] reiniciando Docker Desktop…');
  pipe('powershell -NoProfile -Command "Stop-Process -Name \'Docker Desktop\' -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; Start-Process \\"$env:ProgramFiles\\Docker\\Docker\\Docker Desktop.exe\\""', 60_000);
  return true;
}

/**
 * @param {string} message
 * @param {{ imageBase?: string, ver?: string, branch?: string, localRef?: string }} ctx
 * @returns {Promise<{ actions: string[], skipBuildNext: boolean }>}
 */
export async function diagnoseAndRepair(message, ctx = {}) {
  const msg = String(message || '');
  const lower = msg.toLowerCase();
  const actions = [];
  let skipBuildNext = false;

  const diag = pipe('docker info', 15_000);
  const diagOut = `${diag.stdout || ''}${diag.stderr || ''}`.slice(0, 800);
  if (diagOut) {
    console.log(`[HEFESTO-REPAIR] docker info (recorte):\n${diagOut}`);
  }

  const dockerBroken =
    !dockerReady() ||
    /dockerdesktoplinuxengine|error during connect|eof|pipe|the system cannot find the file|docker daemon|cannot connect to the docker|4294967295/i.test(
      msg,
    ) ||
    /error during connect|dockerdesktoplinuxengine/i.test(diagOut);

  if (dockerBroken) {
    actions.push('docker-engine-recover');
    if (process.platform === 'win32') {
      restartDockerDesktop();
    }
    const ok = await waitForDocker(150_000);
    actions.push(ok ? 'docker-ready' : 'docker-still-down');
    if (!ok) {
      console.warn('[HEFESTO-REPAIR] Docker sigue caído tras espera — el reintento puede fallar');
    }
  }

  if (/already exists|name is already in use|conflict|tag.*exists/i.test(msg)) {
    actions.push('remove-conflicting-tags');
    const refs = [ctx.localRef, ctx.imageBase && ctx.ver ? `${ctx.imageBase}:${ctx.ver}` : null].filter(
      Boolean,
    );
    for (const ref of refs) {
      const r = pipe(`docker rmi -f ${ref}`, 60_000);
      console.log(`[HEFESTO-REPAIR] docker rmi ${ref} → status=${r.status}`);
    }
  }

  if (/health verify failed|versión vieja|recreate_ok|vps recreate|container never reported healthy|no traefik labels/i.test(lower)) {
    actions.push('deploy-verify-backoff');
    skipBuildNext = true;
    await sleep(12_000);
  }

  if (/skopeo|push|registry|connection refused|i\/o timeout/i.test(lower) && !dockerBroken) {
    actions.push('push-backoff');
    skipBuildNext = true;
    await sleep(8_000);
    // refrescar skopeo image si falta
    pipe('docker pull quay.io/skopeo/stable:v1.16.1', 300_000);
  }

  if (/out of memory|oom|no space left|disk|ENOSPC|hefesto-disk|halt:/i.test(lower)) {
    actions.push('prune-disk-aggressive');
    pipe('docker builder prune -af', 300_000);
    pipe('docker image prune -af --filter until=168h', 300_000);
    pipe('docker container prune -f', 60_000);
    pipe('docker volume prune -f', 120_000);
    // Si el error es HALT de disco, no tiene sentido reintentar build en esta PC
    if (/hefesto-disk|halt:/i.test(lower)) {
      skipBuildNext = false;
      console.warn(
        '[HEFESTO-REPAIR] disco host saturado — aborta retries locales; forja en VULKANO/GHA',
      );
    }
  }

  if (actions.length === 0) {
    actions.push('generic-backoff');
    await sleep(10_000);
    // Si Docker responde, al menos limpiar dangling
    if (dockerReady()) {
      pipe('docker container prune -f', 60_000);
    }
  }

  console.log(`[HEFESTO-REPAIR] acciones: ${actions.join(', ')} | skipBuildNext=${skipBuildNext}`);
  return { actions, skipBuildNext };
}

export function maxAttemptsFromEnv() {
  const n = Number(process.env.HEFESTO_MAX_ATTEMPTS || 5);
  if (!Number.isFinite(n) || n < 1) return 5;
  return Math.min(Math.floor(n), 12);
}
