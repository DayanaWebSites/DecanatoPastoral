/**
 * HEFESTO disk guard + post-forge cleanup (PC Mario / Windows)
 *
 * Causa raíz 2026-08-03: Docker Desktop dejó crecer
 * %LOCALAPPDATA%\Docker\wsl\disk\docker_data.vhdx ~419 GB en C:
 * hasta 0 GB libres → Cursor/shell/apps fallan.
 *
 * - Preflight: mide libre; prune si WARN; HALT si &lt; MIN
 * - Post-forja (default ON): borra tags viejos del proyecto, dangling,
 *   builder cache &gt; N horas — forjar sí, acumular infinito no
 *
 * HEFESTO_POST_CLEAN=0 → no limpiar al terminar
 * HEFESTO_KEEP_IMAGE_TAGS=2 → cuántas versiones SIGMA locales conservar
 * HEFESTO_BUILDER_PRUNE_HOURS=72 → cache BuildKit más vieja se va
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/** GB libres mínimos para arrancar un build (override: HEFESTO_MIN_FREE_GB) */
const MIN_FREE_GB = Number(process.env.HEFESTO_MIN_FREE_GB || 25);
/** Por debajo de esto → prune preventivo antes de build */
const WARN_FREE_GB = Number(process.env.HEFESTO_WARN_FREE_GB || 40);
/** VHDX Docker por encima de esto → prune + warning fuerte (220→320: +100G cache en D:) */
const MAX_VHDX_GB = Number(process.env.HEFESTO_MAX_VHDX_GB || 320);
const KEEP_TAGS = Math.max(1, Number(process.env.HEFESTO_KEEP_IMAGE_TAGS || 2));
const BUILDER_PRUNE_HOURS = Math.max(1, Number(process.env.HEFESTO_BUILDER_PRUNE_HOURS || 72));

function pipe(cmd, timeout = 120_000) {
  return spawnSync(cmd, {
    shell: true,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout,
  });
}

function dockerVhdxPath() {
  if (process.platform !== 'win32') return null;
  const candidates = [
    process.env.HEFESTO_DOCKER_VHDX,
    'D:\\DockerData\\disk\\docker_data.vhdx',
    path.join(process.env.LOCALAPPDATA || '', 'Docker', 'wsl', 'disk', 'docker_data.vhdx'),
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** True if another HEFESTO/buildx/skopeo is using Docker right now. */
export function otherForgesActive() {
  const ps = pipe('docker ps --format "{{.Image}}"', 20_000);
  if (/skopeo/i.test(String(ps.stdout || ''))) return 'skopeo';
  if (process.platform === 'win32') {
    const n = pipe(
      'powershell -NoProfile -Command "(Get-Process docker-buildx -EA SilentlyContinue | Measure-Object).Count"',
      15_000,
    );
    const count = Number(String(n.stdout || '').trim());
    if (Number.isFinite(count) && count > 0) return `buildx:${count}`;
  }
  return null;
}

/**
 * Un solo HEFESTO en la PC. Si hay buildx/skopeo u otro turbo, HALT
 * (no encolar: eso es lo que tumba Docker Desktop).
 */
export function assertSoloForgeOrThrow() {
  const busy = otherForgesActive();
  if (busy) {
    throw new Error(
      `[HEFESTO] HALT: Docker ocupado (${busy}). Un forge/push a la vez — no relances.`,
    );
  }
  if (process.platform !== 'win32') return;
  const r = pipe(
    'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name=\'node.exe\'\\" | Where-Object { $_.CommandLine -match \'hefesto-turbo\\.mjs|hefesto\\.mjs\' } | Measure-Object | Select-Object -ExpandProperty Count"',
    20_000,
  );
  const n = Number(String(r.stdout || '').trim());
  // este proceso cuenta 1; 2+ = estampida
  if (Number.isFinite(n) && n > 1) {
    throw new Error(
      `[HEFESTO] HALT: ya hay ${n} procesos hefesto. Mata duplicados antes de forjar.`,
    );
  }
}

function isPidAlive(pid) {
  if (!pid || pid === process.pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

const LOCK_DIR = path.join(process.env.LOCALAPPDATA || os.tmpdir(), 'hefesto');
const PUSH_LOCK = path.join(LOCK_DIR, 'push.lock');

function sleepMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Un solo skopeo a la vez en la PC. Si ya hay push de la MISMA imagen → aborta
 * duplicado. Si es otra imagen → espera (default 12 min).
 */
export function acquirePushLock(ref, { waitMs = 12 * 60_000 } = {}) {
  fs.mkdirSync(LOCK_DIR, { recursive: true });
  const deadline = Date.now() + waitMs;
  while (true) {
    let existing = null;
    try {
      existing = JSON.parse(fs.readFileSync(PUSH_LOCK, 'utf8'));
    } catch {
      existing = null;
    }
    if (existing?.pid && isPidAlive(existing.pid)) {
      if (String(existing.ref) === String(ref)) {
        throw new Error(
          `[HEFESTO] push duplicado de ${ref} (pid ${existing.pid}) — no lanzo segundo skopeo`,
        );
      }
      if (Date.now() > deadline) {
        throw new Error(
          `[HEFESTO] timeout esperando push lock (lo tiene ${existing.ref} pid ${existing.pid})`,
        );
      }
      console.log(
        `[HEFESTO] cola push: espero a ${existing.ref} pid=${existing.pid}…`,
      );
      sleepMs(8_000);
      continue;
    }
    fs.writeFileSync(
      PUSH_LOCK,
      JSON.stringify({ pid: process.pid, ref, ts: new Date().toISOString() }),
    );
    return;
  }
}

export function releasePushLock() {
  try {
    const existing = JSON.parse(fs.readFileSync(PUSH_LOCK, 'utf8'));
    if (existing.pid === process.pid) fs.unlinkSync(PUSH_LOCK);
  } catch {
    /* ignore */
  }
}

function freeGbOnDrive(driveLetter) {
  if (process.platform !== 'win32') {
    try {
      const st = fs.statfsSync('/');
      return (st.bfree * st.bsize) / 1024 ** 3;
    } catch {
      return null;
    }
  }
  const letter = String(driveLetter || 'C').replace(':', '').toUpperCase();
  const ps = [
    `$d=Get-PSDrive -Name ${letter} -EA SilentlyContinue;`,
    `if($d){[math]::Round($d.Free/1GB,2)}else{'NaN'}`,
  ].join('');
  const r = pipe(
    `powershell -NoProfile -Command "${ps}"`,
    30_000,
  );
  const n = Number(String(r.stdout || '').trim());
  return Number.isFinite(n) ? n : null;
}

function vhdxGb(vhdx) {
  if (!vhdx || !fs.existsSync(vhdx)) return null;
  return fs.statSync(vhdx).size / 1024 ** 3;
}

function pruneDocker(level = 'warn') {
  console.log(`[HEFESTO-DISK] prune nivel=${level}…`);
  // siempre: builder cache viejo + dangling images
  pipe('docker builder prune -af --filter until=48h', 300_000);
  pipe('docker image prune -f', 120_000);
  pipe('docker container prune -f', 60_000);
  if (level === 'halt' || level === 'aggressive') {
    // imágenes sin tag / no usadas (no borra las que están en uso)
    pipe('docker image prune -af --filter until=168h', 300_000);
    pipe('docker volume prune -f', 120_000);
  }
}

/**
 * @returns {{ ok: boolean, freeGb: number|null, vhdxGb: number|null, actions: string[] }}
 */
export function assertForgeDiskOrThrow() {
  const actions = [];
  const vhdx = dockerVhdxPath();
  const drive = vhdx ? path.parse(vhdx).root.replace('\\', '').replace(':', '') : 'C';
  let free = freeGbOnDrive(drive);
  let vGb = vhdxGb(vhdx);

  console.log(
    `[HEFESTO-DISK] drive=${drive}: free=${free != null ? free.toFixed(1) : '?'}G` +
      (vGb != null ? ` docker_data.vhdx=${vGb.toFixed(1)}G` : '') +
      ` (min=${MIN_FREE_GB}G warn=${WARN_FREE_GB}G maxVhdx=${MAX_VHDX_GB}G)`,
  );

  const busy = otherForgesActive();
  if (busy) {
    console.log(`[HEFESTO-DISK] Docker ocupado (${busy}) — skip prune (no matar cache ajeno)`);
    actions.push(`skip-prune:${busy}`);
  } else if (vGb != null && vGb > MAX_VHDX_GB) {
    actions.push('vhdx-over-cap');
    console.warn(
      `[HEFESTO-DISK] VHDX ${vGb.toFixed(0)}G > ${MAX_VHDX_GB}G — prune agresivo. ` +
        `Docker data canónico: D:\\DockerData (no hinchar C:).`,
    );
    pruneDocker('aggressive');
    actions.push('prune-aggressive');
    free = freeGbOnDrive(drive);
    vGb = vhdxGb(vhdx);
  } else if (free != null && free < WARN_FREE_GB) {
    actions.push('low-free-warn');
    pruneDocker(free < MIN_FREE_GB ? 'halt' : 'warn');
    actions.push('prune');
    free = freeGbOnDrive(drive);
  }

  if (free != null && free < MIN_FREE_GB) {
    const msg =
      `[HEFESTO-DISK] HALT: ${drive}: tiene ${free.toFixed(1)}G libres (< ${MIN_FREE_GB}G). ` +
      `No forjamos en esta PC — usa VULKANO o libera disco. ` +
      `Culprit habitual: Docker vhdx en %LOCALAPPDATA%\\Docker\\wsl\\disk\\docker_data.vhdx` +
      (vGb != null ? ` (~${vGb.toFixed(0)}G).` : '.');
    console.error(msg);
    throw new Error(msg);
  }

  if (actions.length) {
    console.log(`[HEFESTO-DISK] acciones: ${actions.join(', ')} | free ahora=${free?.toFixed?.(1)}G`);
  }
  return { ok: true, freeGb: free, vhdxGb: vGb, actions };
}

/**
 * Limpieza post-forja: no acumular infinito en la PC.
 * Conserva la imagen recién forjada + N-1 versiones SIGMA previas del mismo imageBase.
 * Best-effort: nunca lanza.
 *
 * @param {{ imageBase?: string, keepRefs?: string[], branch?: string, ver?: string }} opts
 */
export function postForgeCleanup(opts = {}) {
  if (process.env.HEFESTO_POST_CLEAN === '0' || process.env.HEFESTO_POST_CLEAN === 'false') {
    console.log('[HEFESTO-DISK] post-clean omitido (HEFESTO_POST_CLEAN=0)');
    return { skipped: true, removed: [] };
  }

  const busy = otherForgesActive();
  if (busy) {
    console.log(`[HEFESTO-DISK] post-clean omitido — hay otra forja (${busy})`);
    return { skipped: true, removed: [], reason: busy };
  }

  const imageBase = opts.imageBase || '';
  const keep = new Set(
    (opts.keepRefs || []).filter(Boolean).map((r) => String(r).trim()),
  );
  if (imageBase && opts.ver) keep.add(`${imageBase}:${opts.ver}`);
  if (imageBase && opts.branch) {
    keep.add(`${imageBase}:${opts.branch}`);
    keep.add(`${imageBase}:latest-${opts.branch}`);
  }

  const removed = [];
  console.log(
    `[HEFESTO-DISK] post-forge cleanup (keep≤${KEEP_TAGS} versiones, builder>${BUILDER_PRUNE_HOURS}h)…`,
  );

  // 1) Contenedores huérfanos de build
  pipe('docker container prune -f', 60_000);

  // 2) Tags viejos del mismo repo de imagen
  if (imageBase) {
    const listed = pipe(
      `docker images ${imageBase} --format "{{.Repository}}:{{.Tag}}"`,
      60_000,
    );
    const refs = String(listed.stdout || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.endsWith(':<none>'));

    // Separar tags "versión SIGMA" (digit.digit…) del resto (branch/latest)
    const versionRe = /^\d+\.\d+\.\d+$/;
    const versionTags = [];
    for (const ref of refs) {
      if (keep.has(ref)) continue;
      const tag = ref.includes(':') ? ref.slice(ref.lastIndexOf(':') + 1) : '';
      if (versionRe.test(tag)) versionTags.push(ref);
      else if (/^buildcache/.test(tag)) {
        // no borrar buildcache de registry local por tag name en docker images
        continue;
      } else if (!/^(preview|main|latest|latest-preview|latest-main)$/.test(tag)) {
        // tags raros / digest locales → candidatos a borrar
        const r = pipe(`docker rmi -f ${ref}`, 60_000);
        if (r.status === 0) removed.push(ref);
      }
    }

    // Ordenar versiones SIGMA (string YYMMDDBB al final suele bastar) y dejar KEEP_TAGS
    // keep ya tiene la actual; entre el resto conservamos KEEP_TAGS-1 más recientes
    versionTags.sort((a, b) => {
      const ta = a.slice(a.lastIndexOf(':') + 1);
      const tb = b.slice(b.lastIndexOf(':') + 1);
      return tb.localeCompare(ta);
    });
    const keepExtra = Math.max(0, KEEP_TAGS - 1);
    const drop = versionTags.slice(keepExtra);
    for (const ref of drop) {
      if (keep.has(ref)) continue;
      const r = pipe(`docker rmi -f ${ref}`, 60_000);
      if (r.status === 0) removed.push(ref);
    }
  }

  // 3) Capas huérfanas + cache BuildKit vieja (NO borra cache caliente del día)
  pipe('docker image prune -f', 120_000);
  pipe(`docker builder prune -af --filter until=${BUILDER_PRUNE_HOURS}h`, 300_000);

  // 4) Si el VHDX sigue enorme o libres bajos → un poco más agresivo
  const vhdx = dockerVhdxPath();
  const drive = vhdx ? path.parse(vhdx).root.replace('\\', '').replace(':', '') : 'C';
  const free = freeGbOnDrive(drive);
  const vGb = vhdxGb(vhdx);
  if ((free != null && free < WARN_FREE_GB) || (vGb != null && vGb > MAX_VHDX_GB)) {
    console.warn('[HEFESTO-DISK] post-clean: presión de disco → prune imágenes unused 7d');
    pipe('docker image prune -af --filter until=168h', 300_000);
  }

  const freeAfter = freeGbOnDrive(drive);
  console.log(
    `[HEFESTO-DISK] post-clean listo — removidas=${removed.length}` +
      (removed.length ? ` (${removed.slice(0, 8).join(', ')}${removed.length > 8 ? '…' : ''})` : '') +
      (freeAfter != null ? ` | ${drive}: ${freeAfter.toFixed(1)}G libres` : ''),
  );
  console.log(
    '[HEFESTO-DISK] nota: en Windows el .vhdx puede no encoger hasta compactar/mover a D:; el prune evita que SIGA creciendo',
  );

  return { skipped: false, removed, freeGb: freeAfter };
}

/**
 * Gate anti-marranada: si la imagen local supera el techo, HALT el push
 * (evita saturar ZENITH con capas duplicadas tipo 5.6GB).
 * Override: HEFESTO_MAX_IMAGE_GB (default 4.5)
 */
export function assertImageSizeOrThrow(localRef) {
  const maxGb = Number(process.env.HEFESTO_MAX_IMAGE_GB || 4.5);
  if (!localRef || !(maxGb > 0)) return { ok: true, sizeGb: null };
  const r = pipe(
    `docker image inspect ${localRef} --format "{{.Size}}"`,
    60_000,
  );
  const bytes = Number(String(r.stdout || '').trim());
  if (!Number.isFinite(bytes) || bytes <= 0) {
    console.warn(`[HEFESTO-DISK] no pude medir tamaño de ${localRef} — sigo`);
    return { ok: true, sizeGb: null };
  }
  const sizeGb = bytes / 1024 ** 3;
  console.log(`[HEFESTO-DISK] imagen ${localRef} = ${sizeGb.toFixed(2)}G (max=${maxGb}G)`);
  if (sizeGb > maxGb) {
    const msg =
      `[HEFESTO-DISK] HALT: imagen ${sizeGb.toFixed(2)}G > ${maxGb}G. ` +
      `No empujamos basura a ZENITH. Revisa Dockerfile (bind mounts SKIP_*) ` +
      `o sube HEFESTO_MAX_IMAGE_GB con causa documentada.`;
    console.error(msg);
    throw new Error(msg);
  }
  return { ok: true, sizeGb };
}

export function diskGuardEnvSummary() {
  return {
    platform: process.platform,
    hostname: os.hostname(),
    minFreeGb: MIN_FREE_GB,
    warnFreeGb: WARN_FREE_GB,
    maxVhdxGb: MAX_VHDX_GB,
    keepImageTags: KEEP_TAGS,
    builderPruneHours: BUILDER_PRUNE_HOURS,
    maxImageGb: Number(process.env.HEFESTO_MAX_IMAGE_GB || 4.5),
    vhdx: dockerVhdxPath(),
  };
}
