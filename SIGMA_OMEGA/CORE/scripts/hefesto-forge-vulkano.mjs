#!/usr/bin/env node
/**
 * HEFESTO — forja en VULKANO (nunca en ZENTITH).
 *
 * Default flota: HEFESTO_FORGE=vulkano + clone SSH en servidor (deploy key).
 * Override PC: HEFESTO_FORGE=local | --forge local
 * Sync archive (scp): HEFESTO_VULKANO_GIT=0
 *
 * Paralelismo: HEFESTO_FORGE_SLOTS (default 4) · espera HEFESTO_FORGE_WAIT_SEC (900)
 * Peak logs: antes/después del build imprime df/load/mem en VULKANO (picos de disco).
 *
 * Cache BuildKit local: HEFESTO_CACHE_MODE=min|max (default min — SC-81 eviction).
 *   min = escrituras más pequeñas por build; evita /var/cache/hefesto sin techo.
 *   max = mejor hit rate; override HEFESTO_CACHE_MODE=max. Janitor --prune-cache acota disco.
 *
 * Uso:
 *   node scripts/hefesto-forge-vulkano.mjs [--branch preview|main] [--skip-push]
 *     [--skip-panel] [--skip-nest]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveCoolifyHostKey, sshVps, VPS } from './lib/hefesto-vps-ssh.mjs';
import { detectSkipFlags } from './lib/hefesto-skip-detect.mjs';
import { resolveVulkanoRepoUrl } from './lib/hefesto-repo-url.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZENTINEK_ROOT = process.env.ZENTINEK_ROOT || 'D:/Github/ZENTINEK';
const RUN_ID = randomBytes(8).toString('hex');

function loadEnv(p) {
  if (!fs.existsSync(p)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(p, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );
}
const branchArg = process.argv.includes('--branch')
  ? process.argv[process.argv.indexOf('--branch') + 1]
  : 'preview';
const skipPush = process.argv.includes('--skip-push');
const cliSkipPanel = process.argv.includes('--skip-panel');
const cliSkipNest = process.argv.includes('--skip-nest');
/** Default ON (deploy key en VULKANO). Apagar: HEFESTO_VULKANO_GIT=0 */
const preferGit = process.env.HEFESTO_VULKANO_GIT !== '0';
const FORGE_SLOTS = Math.max(1, Number(process.env.HEFESTO_FORGE_SLOTS || 4) || 4);
/** HALT forja si libres en / < este umbral (GB). Override: HEFESTO_VULKANO_MIN_FREE_GB=0 para desactivar. */
const MIN_FREE_GB = Math.max(0, Number(process.env.HEFESTO_VULKANO_MIN_FREE_GB ?? 25) || 0);
const FORGE_WAIT_SEC = Math.max(0, Number(process.env.HEFESTO_FORGE_WAIT_SEC || 900) || 900);
/** BuildKit cache-to mode: min (default, SC-81) or max. Invalid values fall back to min. */
const CACHE_MODE_RAW = String(process.env.HEFESTO_CACHE_MODE || 'min').trim().toLowerCase();
const CACHE_MODE = CACHE_MODE_RAW === 'max' ? 'max' : 'min';
const CACHE_REGISTRY = process.env.HEFESTO_CACHE_REGISTRY !== '0';

const cfg = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'scripts', 'hefesto-turbo.config.json'), 'utf8'),
);
const ver = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const slug = cfg.registrySlug || 'zentinek';
const imageBase = cfg.image || `ghcr.io/eurekasigma/${slug}`;
const ZENTITH = process.env.HEFESTO_ZENTITH_HOST || '93.188.162.107';
const WORKDIR = process.env.HEFESTO_VULKANO_WORKDIR || `/opt/hefesto/${cfg.project || 'ZENTINEK'}`;
const projectName = cfg.project || 'ZENTINEK';
const REPO_URL = resolveVulkanoRepoUrl({
  project: projectName,
  root: ROOT,
  env: process.env,
  preferGit,
});
const skip = detectSkipFlags(ROOT, {
  stack: cfg.stack || 'both',
  skipPanel: cliSkipPanel,
  skipNest: cliSkipNest,
  baseRef: `origin/${branchArg}`,
});

const SKIP_PANEL = skip.skipPanel ? 1 : 0;
const SKIP_NEST = skip.skipNest ? 1 : 0;
const syncMode = preferGit ? 'git' : 'archive';

const boot = {
  ...loadEnv(path.join(ZENTINEK_ROOT, '.env')),
  ...loadEnv(path.join(ZENTINEK_ROOT, '.env.local')),
  ...loadEnv(path.join(ROOT, '.env')),
  ...loadEnv(path.join(ROOT, '.env.local')),
  ...process.env,
};
const HEFESTO_REPORT_URL = boot.ZENTINEK_HEFESTO_URL || 'https://zentinek.com';
const HEFESTO_API_KEY = boot.ZENTINEK_API_KEY || '';

async function reportEvent(phase, status, extra = {}) {
  if (!HEFESTO_API_KEY) return;
  try {
    await fetch(`${HEFESTO_REPORT_URL.replace(/\/$/, '')}/api/hefesto/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HEFESTO_API_KEY}`,
      },
      body: JSON.stringify({
        runId: RUN_ID,
        project: projectName,
        environment: branchArg,
        version: ver,
        phase,
        status,
        host: os.hostname(),
        ...extra,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.warn(
      `[forge-vulkano] aviso ZENTINEK omitido (no fatal): ${err instanceof Error ? err.message : err}`,
    );
  }
}

function parseMarker(out, name) {
  const m = out.match(new RegExp(`\\[forge-vulkano\\] MARKER ${name} (\\d+)`));
  return m ? Number(m[1]) : null;
}

function syncCodeViaArchive() {
  const keyPath = resolveCoolifyHostKey();
  const host = VPS.vulkano;
  const user = process.env.HEFESTO_SSH_USER || 'root';
  const staging = `${WORKDIR}.staging`;
  const remoteTar = `/tmp/hefesto-sync-${slug}-${Date.now()}.tar`;
  const localTar = path.join(
    process.env.TEMP || process.env.TMPDIR || '/tmp',
    `hefesto-${slug}-${process.pid}.tar`,
  );
  console.log(`[forge-vulkano] sync git archive HEAD → ${host}:${WORKDIR}`);

  const arch = spawnSync('git', ['archive', '--format=tar', 'HEAD', '-o', localTar], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if ((arch.status ?? 1) !== 0) {
    throw new Error('git archive falló');
  }
  const bytes = fs.statSync(localTar).size;
  console.log(`[forge-vulkano] archive ${(bytes / 1024 / 1024).toFixed(1)} MB → scp`);

  const scp = spawnSync(
    'scp',
    [
      '-i',
      keyPath,
      '-o',
      'IdentitiesOnly=yes',
      '-o',
      'StrictHostKeyChecking=accept-new',
      '-o',
      'BatchMode=yes',
      localTar,
      `${user}@${host}:${remoteTar}`,
    ],
    { encoding: 'utf8', stdio: 'inherit' },
  );
  try {
    fs.unlinkSync(localTar);
  } catch {
    /* ignore */
  }
  if ((scp.status ?? 1) !== 0) {
    throw new Error('scp archive → VULKANO falló');
  }

  const unpack = sshVps(
    'vulkano',
    `
set -euo pipefail
rm -rf '${staging}'
mkdir -p '${staging}'
tar -xf '${remoteTar}' -C '${staging}'
rm -f '${remoteTar}'
rm -rf '${WORKDIR}'
mv '${staging}' '${WORKDIR}'
test -f '${WORKDIR}/Dockerfile'
test -f '${WORKDIR}/VERSION'
echo SYNC_OK
`,
    { purpose: 'forge', stdio: 'inherit', timeoutMs: 300_000 },
  );
  if ((unpack.status ?? 1) !== 0) {
    throw new Error('unpack en VULKANO falló');
  }
  console.log('[forge-vulkano] SYNC_OK');
  return Promise.resolve();
}

/** Cuerpo del build (sin lock). Se envuelve con flock multi-slot. */
const buildBody = `
set -euo pipefail
echo "[forge-vulkano] slot=\${HEFESTO_SLOT:-?} branch=${branchArg} ver=${ver} CACHE_MODE=${CACHE_MODE} SKIP_PANEL=${SKIP_PANEL} SKIP_NEST=${SKIP_NEST} reason=${String(skip.reason).replace(/→/g, '->').replace(/[^a-zA-Z0-9_./+=: -]/g, '')} sync=${syncMode}"
cd '${WORKDIR}'
test -f Dockerfile
test -f VERSION
echo "[forge-vulkano] VERSION=$(tr -d '\\r\\n' < VERSION) HEAD_SYNC=${syncMode}"
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=\${BUILDKIT_PROGRESS:-plain}
PREV_ARGS=""
if docker image inspect '${imageBase}:${branchArg}' >/dev/null 2>&1; then
  PREV_ARGS="--build-context previous=docker-image://${imageBase}:${branchArg}"
elif docker image inspect '${slug}:${branchArg}' >/dev/null 2>&1; then
  PREV_ARGS="--build-context previous=docker-image://${slug}:${branchArg}"
fi
mkdir -p /var/cache/hefesto/${slug}
# mode=min (default SC-81): menos bytes por build. mode=max: HEFESTO_CACHE_MODE=max.
CACHE_FROM="--cache-from type=local,src=/var/cache/hefesto/${slug}"
CACHE_TO="--cache-to type=local,dest=/var/cache/hefesto/${slug},mode=${CACHE_MODE}"
REGISTRY_CACHE_REF="${ZENTITH}:5000/${slug}:buildcache-${branchArg}"
if ${CACHE_REGISTRY ? 'true' : 'false'}; then
  CACHE_FROM="$CACHE_FROM --cache-from type=registry,ref=\${REGISTRY_CACHE_REF}"
  CACHE_TO="$CACHE_TO --cache-to type=registry,ref=\${REGISTRY_CACHE_REF},mode=${CACHE_MODE}"
fi
if docker manifest inspect '${imageBase}:buildcache-${branchArg}' >/dev/null 2>&1; then
  CACHE_FROM="$CACHE_FROM --cache-from type=registry,ref=${imageBase}:buildcache-${branchArg}"
fi

BUILD_CMD="docker buildx build --file Dockerfile --platform linux/amd64 \\
  -t '${imageBase}:${ver}' \\
  -t '${imageBase}:${branchArg}' \\
  -t '${slug}:${branchArg}' \\
  -t '${slug}:${ver}' \\
  --build-arg VERSION=${ver} \\
  --build-arg SKIP_PANEL=${SKIP_PANEL} \\
  --build-arg SKIP_NEST=${SKIP_NEST} \\
  --build-arg NEXT_PUBLIC_PANEL_VERSION=${ver} \\
  $PREV_ARGS $CACHE_FROM $CACHE_TO --load ."

if docker buildx version >/dev/null 2>&1; then
  set +e
  bash -lc "$BUILD_CMD"
  _bx=$?
  set -e
  if [ "$_bx" -ne 0 ]; then
    if docker image inspect '${imageBase}:${ver}' >/dev/null 2>&1; then
      echo "[forge-vulkano] buildx exit $_bx but image ${ver} loaded — continue (cache-to registry is best-effort)"
    else
      echo "[forge-vulkano] FATAL: buildx exit $_bx and image missing"
      exit "$_bx"
    fi
  fi
else
  docker build \\
    -t '${imageBase}:${ver}' \\
    -t '${imageBase}:${branchArg}' \\
    -t '${slug}:${branchArg}' \\
    --build-arg "VERSION=${ver}" \\
    --build-arg "SKIP_PANEL=${SKIP_PANEL}" \\
    --build-arg "SKIP_NEST=${SKIP_NEST}" \\
    -f Dockerfile .
fi
docker tag '${imageBase}:${ver}' '${slug}:${ver}' || true
echo "[forge-vulkano] images:"
docker images '${imageBase}' --format '{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}}' | head -5
${
  skipPush
    ? 'echo "[forge-vulkano] skip-push"'
    : `
if curl -fsS -m 5 "http://${ZENTITH}:5000/v2/" >/dev/null 2>&1; then
  docker tag '${imageBase}:${branchArg}' '${ZENTITH}:5000/${slug}:${branchArg}'
  docker push '${ZENTITH}:5000/${slug}:${branchArg}'
  docker tag '${imageBase}:${ver}' '${ZENTITH}:5000/${slug}:${ver}'
  docker push '${ZENTITH}:5000/${slug}:${ver}'
  echo "[forge-vulkano] PUSHED_REGISTRY=1"
else
  echo "[forge-vulkano] FATAL: ${ZENTITH}:5000 no alcanzable"
  exit 76
fi
`
}
echo "OK forge-vulkano ${ver} ${branchArg}"
# Eviction AFTER this forge's slot work; flock so two finishing forges don't prune together.
# Skip if another prune/forge holds the lock (HEFESTO_FORGE_SLOTS>1).
if flock -n /var/lock/hefesto-builder-prune.lock -c 'docker builder prune --filter until=168h -f'; then
  echo "[forge-vulkano] builder prune until=168h OK"
else
  echo "[forge-vulkano] builder prune skipped (lock busy)"
fi
`.trim();

/** Multi-slot: hasta N forjas en paralelo; si lleno, espera (no HALT inmediato). */
const remoteBuild = `
set -euo pipefail
SLOTS=${FORGE_SLOTS}
WAIT=${FORGE_WAIT_SEC}
MIN_FREE_GB=${MIN_FREE_GB}
SLOT_DIR=/var/lock/hefesto-forge-slots
mkdir -p "$SLOT_DIR"
# Peak / preflight: disco + load + RAM (picos de forja paralela)
peak_snapshot() {
  local tag="\$1"
  local free_kb used_pct load1 mem_used mem_tot slots_busy
  free_kb=\$(df -Pk / | awk 'NR==2{print \$4}')
  used_pct=\$(df -P / | awk 'NR==2{print \$5}')
  load1=\$(awk '{print \$1}' /proc/loadavg)
  mem_used=\$(free -m | awk '/Mem:/{print \$3}')
  mem_tot=\$(free -m | awk '/Mem:/{print \$2}')
  slots_busy=0
  shopt -s nullglob
  for f in "\$SLOT_DIR"/s*.lock; do
    # Subshell: probar lock sin retenerlo (evita false busy bajo set -e)
    if ! ( flock -n 9 9<"\$f" ) 2>/dev/null; then
      slots_busy=\$((slots_busy+1))
    fi
  done
  shopt -u nullglob
  echo "[forge-vulkano] PEAK \$tag free_kb=\$free_kb used=\$used_pct load1=\$load1 mem=\${mem_used}/\${mem_tot}MiB slots_busy=\$slots_busy/\$SLOTS"
  mkdir -p /var/log/hefesto
  echo "\$(date -Is) PEAK \$tag free_kb=\$free_kb used=\$used_pct load1=\$load1 mem=\${mem_used}/\${mem_tot}MiB slots_busy=\$slots_busy/\$SLOTS" >> /var/log/hefesto/forge-peak.log
  if [ "\$MIN_FREE_GB" -gt 0 ]; then
    local min_free_kb=\$(( MIN_FREE_GB * 1024 * 1024 ))
    if [ "\$free_kb" -lt "\$min_free_kb" ]; then
      local free_gb=\$(( free_kb / 1024 / 1024 ))
      echo "[forge-vulkano] HALT disco: \${free_gb}GB libres (\${free_kb}KB) < MIN_FREE_GB=\$MIN_FREE_GB"
      exit 78
    fi
  fi
}
peak_snapshot preflight
# Compat: si alguien aún usa el lock legacy exclusivo, no lo bloqueamos a slots nuevos
# (legacy se abandona; slots son s1..sN)
BODY=$(mktemp /tmp/hefesto-build-XXXXXX.sh)
trap 'rm -f "$BODY"' EXIT
cat > "$BODY" <<'HEFESTO_BUILD_EOF'
peak_snapshot() {
  local tag="\$1"
  local free_kb used_pct load1 mem_used mem_tot
  free_kb=\$(df -Pk / | awk 'NR==2{print \$4}')
  used_pct=\$(df -P / | awk 'NR==2{print \$5}')
  load1=\$(awk '{print \$1}' /proc/loadavg)
  mem_used=\$(free -m | awk '/Mem:/{print \$3}')
  mem_tot=\$(free -m | awk '/Mem:/{print \$2}')
  echo "[forge-vulkano] PEAK \$tag slot=\${HEFESTO_SLOT:-?} free_kb=\$free_kb used=\$used_pct load1=\$load1 mem=\${mem_used}/\${mem_tot}MiB"
  mkdir -p /var/log/hefesto
  echo "\$(date -Is) PEAK \$tag slot=\${HEFESTO_SLOT:-?} free_kb=\$free_kb used=\$used_pct load1=\$load1 mem=\${mem_used}/\${mem_tot}MiB" >> /var/log/hefesto/forge-peak.log
}
trap 'peak_snapshot build-end' EXIT
peak_snapshot build-start
${buildBody}
# build-end vía trap EXIT (corre también si buildBody falla con set -e)
HEFESTO_BUILD_EOF
[ -s "$BODY" ] || { echo "[forge-vulkano] FATAL: BODY vacío"; exit 77; }
echo "[forge-vulkano] BODY size=$(wc -c < "$BODY" | tr -d ' ') bytes"
chmod +x "$BODY"

acquire() {
  local i st
  for i in $(seq 1 "$SLOTS"); do
    # Portable: no flock -c. NO usar st=$? despues de if (flock...); bash deja $?=0 si el if falla.
    (
      flock -n 9 || exit 75
      echo "[forge-vulkano] SLOT $i/$SLOTS adquirido"
      export HEFESTO_SLOT=$i
      bash "$BODY"
    ) 9>"$SLOT_DIR/s$i.lock"
    st=$?
    if [ "$st" -eq 0 ]; then
      return 0
    fi
    if [ "$st" -ne 75 ]; then
      return "$st"
    fi
  done
  return 75
}

if acquire; then
  exit 0
fi
echo "[forge-vulkano] slots llenos — en cola (wait ${FORGE_WAIT_SEC}s, slots=${FORGE_SLOTS})"
# Espera bloqueante en slot 1 (FIFO simple) — portable sin flock -c/-E
(
  flock -w "$WAIT" 9 || exit 75
  echo "[forge-vulkano] SLOT 1/$SLOTS adquirido"
  export HEFESTO_SLOT=1
  bash "$BODY"
) 9>"$SLOT_DIR/s1.lock"
st=\$?
if [ "\$st" -eq 0 ]; then
  exit 0
fi
echo "[forge-vulkano] HALT: timeout o error esperando slot (st=\$st HEFESTO_FORGE_WAIT_SEC=$WAIT)"
exit "\$st"
`.trim();

console.log(
  `[HEFESTO] forja remota VULKANO · ${branchArg} · v${ver} · ${skip.reason} · SKIP_PANEL=${SKIP_PANEL} SKIP_NEST=${SKIP_NEST} · slots=${FORGE_SLOTS} · sync=${syncMode}`,
);

async function main() {
  const t0 = performance.now();
  try {
    if (preferGit) {
      console.log('[forge-vulkano] sync git clone/fetch en VULKANO (SSH deploy key)');
      const cloneCmd = `
set -euo pipefail
mkdir -p "$(dirname '${WORKDIR}')"
if [ ! -d '${WORKDIR}/.git' ]; then
  git clone --depth 50 '${REPO_URL}' '${WORKDIR}'
fi
cd '${WORKDIR}'
git remote set-url origin '${REPO_URL}' 2>/dev/null || true
git fetch --depth 50 origin '${branchArg}:refs/remotes/origin/${branchArg}' || git fetch origin '${branchArg}'
git checkout -B '${branchArg}' "origin/${branchArg}" || git checkout -B '${branchArg}' FETCH_HEAD
git reset --hard "origin/${branchArg}" 2>/dev/null || git reset --hard FETCH_HEAD
`;
      const c = sshVps('vulkano', cloneCmd, { purpose: 'forge', stdio: 'inherit' });
      if ((c.status ?? 1) !== 0) {
        throw new Error(
          'git en VULKANO falló — revisa deploy key o usa HEFESTO_VULKANO_GIT=0 (archive)',
        );
      }
    } else {
      await syncCodeViaArchive();
    }
  } catch (err) {
    console.error(`❌ sync código: ${err instanceof Error ? err.message : err}`);
    await reportEvent('done', 'failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  }

  const t1 = performance.now();
  const syncMs = Math.round(t1 - t0);
  await reportEvent('build', 'running');

  const r = sshVps('vulkano', remoteBuild, {
    timeoutMs: 3_600_000,
    stdio: 'pipe',
    purpose: 'forge',
  });
  const out = `${r.stdout || ''}\n${r.stderr || ''}`;
  if (out.trim()) process.stdout.write(out);

  const t2 = performance.now();
  const buildStart = parseMarker(out, 'BUILD_START');
  const buildDone = parseMarker(out, 'BUILD_DONE');
  const pushDone = parseMarker(out, 'PUSH_DONE');
  const buildMs =
    buildStart != null && buildDone != null ? Math.max(0, buildDone - buildStart) : Math.round(t2 - t1);
  const pushMs =
    buildDone != null && pushDone != null ? Math.max(0, pushDone - buildDone) : skipPush ? 0 : 0;
  const totalMs = Math.round(t2 - t0);

  console.log(
    `[forge-vulkano] TIMINGS syncMs=${syncMs} buildMs=${buildMs} pushMs=${pushMs} totalMs=${totalMs}`,
  );

  if ((r.status ?? 1) !== 0) {
    await reportEvent('build', 'failed', { durationMs: buildMs, error: `exit ${r.status ?? 1}` });
    await reportEvent('done', 'failed', { totalMs, error: `forge exit ${r.status ?? 1}` });
    console.error('❌ hefesto-forge-vulkano falló — override: HEFESTO_FORGE=local');
    process.exit(r.status ?? 1);
  }
  if (!skipPush && !/PUSHED_REGISTRY=1/.test(out)) {
    await reportEvent('push', 'failed', { error: 'sin PUSHED_REGISTRY=1' });
    await reportEvent('done', 'failed', { totalMs, error: 'sin PUSHED_REGISTRY=1' });
    console.error('❌ forja sin PUSHED_REGISTRY=1');
    process.exit(76);
  }

  await reportEvent('build', 'success', { durationMs: buildMs });
  await reportEvent('push', 'success', {
    durationMs: pushMs,
    ...(skipPush ? { meta: { note: 'skip-push' } } : {}),
  });
  await reportEvent('done', 'success', { totalMs });

  console.log(`✅ forja VULKANO lista · v${ver} · ${branchArg}`);
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
