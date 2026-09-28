#!/usr/bin/env node
/**
 * HEFESTO — forja en VULKANO (nunca en ZENTITH).
 *
 * Default flota: HEFESTO_FORGE=vulkano + clone SSH en servidor (deploy key).
 * Override PC: HEFESTO_FORGE=local | --forge local
 * Sync archive (scp): HEFESTO_VULKANO_GIT=0
 *
 * Paralelismo: HEFESTO_FORGE_SLOTS (default 6) · espera HEFESTO_FORGE_WAIT_SEC (120).
 * Workdir por rama: /opt/hefesto/<project>-<branch> — main+preview en paralelo.
 * Peak logs: antes/después del build imprime df/load/mem en VULKANO (picos de disco).
 *
 * Host ops: /etc/hefesto/forge.env (BUILDKIT_MAX_PARALLELISM, etc.) — no pisa SLOTS/CACHE_MODE
 *   interpolados desde Node; archivo reservado a knobs ops / futuro en VULKANO.
 *
 * Cache BuildKit local: HEFESTO_CACHE_MODE=min|max (default max, solo JS — VULKANO forja-only).
 *   max = mejor hit rate (forjas calientes en putiza).
 *   min = escrituras chicas; solo si disco apretado. Janitor --prune-cache acota edad.
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
import {
  assertHefestoBranch,
  assertHefestoHost,
  assertHefestoImageBase,
  assertHefestoProject,
  assertHefestoRepoUrl,
  assertHefestoSlug,
  assertHefestoVersion,
  assertHefestoWorkdir,
} from './lib/hefesto-assert-ident.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Repo git, no el padre de `scripts/`. El mismo archivo vive en scripts/ o en SIGMA_OMEGA/CORE/scripts/. */
function findGitRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start, '..');
}

function firstExisting(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const ROOT = findGitRoot(SCRIPT_DIR);
const configPath = firstExisting([
  path.join(SCRIPT_DIR, 'hefesto-turbo.config.json'),
  path.join(ROOT, 'scripts', 'hefesto-turbo.config.json'),
  path.join(ROOT, 'scripts', 'deploy', 'hefesto-turbo.config.json'),
  path.join(ROOT, 'SIGMA_OMEGA', 'CORE', 'scripts', 'hefesto-turbo.config.json'),
  path.join(ROOT, 'SIGMA_OMEGA', 'CORE', 'dev', 'scripts', 'hefesto-turbo.config.json'),
  path.join(ROOT, 'SIGMA_OMEGA', 'CORE', 'dev', 'scripts', 'deploy', 'hefesto-turbo.config.json'),
]);
if (!configPath) {
  throw new Error('[forge-vulkano] falta hefesto-turbo.config.json junto al script o en scripts/');
}
const versionPath = path.join(ROOT, 'VERSION');
if (!fs.existsSync(versionPath)) {
  throw new Error(`[forge-vulkano] falta VERSION en ${ROOT}`);
}
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
const branchArg = assertHefestoBranch(
  process.argv.includes('--branch')
    ? process.argv[process.argv.indexOf('--branch') + 1]
    : 'preview',
);
/** Siempre las dos ramas. HEFESTO_DUAL_BRANCH=0 ya no apaga esto: un agente lo ponía y compilaba dos veces. */
const siblingBranch =
  branchArg === 'preview'
    ? 'main'
    : branchArg === 'main' || branchArg === 'master'
      ? 'preview'
      : '';
const skipPush = process.argv.includes('--skip-push');
const cliSkipPanel = process.argv.includes('--skip-panel');
const cliSkipNest = process.argv.includes('--skip-nest');
/** Default ON (deploy key en VULKANO). Apagar: HEFESTO_VULKANO_GIT=0 */
const preferGit = process.env.HEFESTO_VULKANO_GIT !== '0';
/** Default 6 slots — solo Node; forge.env no puede reducir/aumentar (wrapper re-asigna tras source). */
const FORGE_SLOTS = Math.max(1, Number(process.env.HEFESTO_FORGE_SLOTS || 6) || 6);
/** HALT forja si libres en / < este umbral (GB). Override: HEFESTO_VULKANO_MIN_FREE_GB=0 para desactivar. */
const MIN_FREE_GB = Math.max(0, Number(process.env.HEFESTO_VULKANO_MIN_FREE_GB ?? 25) || 0);
const FORGE_WAIT_SEC = (() => {
  const raw = process.env.HEFESTO_FORGE_WAIT_SEC;
  if (raw === undefined || raw === '') return 120; // fail-fast cola (antes 900 = 15min de espera ciega)
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 120;
})();
/** BuildKit cache-to mode: max (default) or min. Invalid values fall back to max. */
const CACHE_MODE_RAW = String(process.env.HEFESTO_CACHE_MODE || 'max').trim().toLowerCase();
const CACHE_MODE = CACHE_MODE_RAW === 'min' ? 'min' : 'max';
/**
 * cache-from del registry (:5000 y GHCR buildcache) — default OFF.
 * Ese manifiesto revienta buildx al final (`can't evaluate field Id`)
 * aunque el push ya salió. La caché que acelera es la local /var/cache/hefesto.
 * Opt-in: HEFESTO_CACHE_REGISTRY_FROM=1
 */
const CACHE_REGISTRY_FROM = process.env.HEFESTO_CACHE_REGISTRY_FROM === '1';
/**
 * cache-to registry (write). Default OFF en path load (subir a :5000 suma minutos).
 * Con HEFESTO_PUSH_DIRECT=1 se fuerza ON (sustituye local, que cuelga con --push).
 * Opt-in manual: HEFESTO_CACHE_REGISTRY_TO=1
 */
const WANT_PUSH_DIRECT = process.env.HEFESTO_PUSH_DIRECT === '1';
const CACHE_REGISTRY_TO =
  process.env.HEFESTO_CACHE_REGISTRY_TO === '1' || WANT_PUSH_DIRECT;
/**
 * PUSH_DIRECT: buildx --push a :5000 en un paso.
 * Default OFF — --load + cache-to local + push serial calienta /var/cache/hefesto (forjas hot).
 * Opt-in: HEFESTO_PUSH_DIRECT=1 (usa cache-to registry, nunca local).
 */
/** Post-forge builder prune age (hours). Default 336h (14d) — no matar cache caliente. */
const BUILDER_PRUNE_HOURS = Math.max(
  24,
  Number(process.env.HEFESTO_BUILDER_PRUNE_HOURS || 336) || 336,
);

const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const ver = assertHefestoVersion(fs.readFileSync(versionPath, 'utf8').trim());
const slug = assertHefestoSlug(cfg.registrySlug || 'zentinek');
const imageBase = assertHefestoImageBase(cfg.image || `ghcr.io/eurekasigma/${slug}`);
const ZENTITH = assertHefestoHost(process.env.HEFESTO_ZENTITH_HOST || '93.188.162.107');
const projectName = assertHefestoProject(cfg.project || 'ZENTINEK');
/** Per-branch workdir — main+preview no pelean el mismo flock (cola de 10+min). */
const WORKDIR = assertHefestoWorkdir(
  process.env.HEFESTO_VULKANO_WORKDIR || `/opt/hefesto/${projectName}-${branchArg}`,
);
const WD_LOCK_NAME = `${slug}-${branchArg}`;
const REPO_URL = assertHefestoRepoUrl(
  resolveVulkanoRepoUrl({
    project: projectName,
    root: ROOT,
    env: process.env,
    preferGit,
  }),
  { preferGit },
);
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
set -a; [ -f /etc/hefesto/forge.env ] && . /etc/hefesto/forge.env; set +a
WD_LOCK=/var/lock/hefesto-wd-${WD_LOCK_NAME}.lock
ACTIVE_MARK=/var/lock/hefesto-forge-active-${WD_LOCK_NAME}
mkdir -p /var/lock
(
  flock -w ${FORGE_WAIT_SEC} 8 || { echo "[forge-vulkano] HALT workdir lock (archive unpack)"; exit 74; }
  echo \$\$ > "\$ACTIVE_MARK"
  trap 'rm -f "\$ACTIVE_MARK"' EXIT
  echo "[forge-vulkano] TIMING SYNC start \$(date -Is)"
  echo "[forge-vulkano] MARKER SYNC_START \$(date +%s%3N 2>/dev/null || date +%s)"
  rm -rf '${staging}'
  mkdir -p '${staging}'
  tar -xf '${remoteTar}' -C '${staging}'
  rm -f '${remoteTar}'
  rm -rf '${WORKDIR}'
  mv '${staging}' '${WORKDIR}'
  test -f '${WORKDIR}/Dockerfile'
  test -f '${WORKDIR}/VERSION'
  echo "[forge-vulkano] TIMING SYNC end \$(date -Is)"
  echo "[forge-vulkano] MARKER SYNC_END \$(date +%s%3N 2>/dev/null || date +%s)"
  echo SYNC_OK
) 8>"\$WD_LOCK"
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
# Ops knobs en host (BUILDKIT_*, etc.); CACHE_MODE/slots vienen del wrapper Node — no los pisa.
set -a; [ -f /etc/hefesto/forge.env ] && . /etc/hefesto/forge.env; set +a
echo "[forge-vulkano] slot=\${HEFESTO_SLOT:-?} branch=${branchArg} ver=${ver} CACHE_MODE=${CACHE_MODE} SKIP_PANEL=${SKIP_PANEL} SKIP_NEST=${SKIP_NEST} reason=${String(skip.reason).replace(/→/g, '->').replace(/[^a-zA-Z0-9_./+=: -]/g, '')} sync=${syncMode}"
cd '${WORKDIR}'
test -f Dockerfile
test -f VERSION
echo "[forge-vulkano] VERSION=$(tr -d '\\r\\n' < VERSION) HEAD_SYNC=${syncMode}"
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=\${BUILDKIT_PROGRESS:-plain}
export BUILDKIT_MAX_PARALLELISM="\${HEFESTO_BUILDKIT_MAX_PARALLELISM:-$(nproc)}"
echo "[forge-vulkano] BUILDKIT parallelism=\$BUILDKIT_MAX_PARALLELISM DOCKER_BUILDKIT=\$DOCKER_BUILDKIT progress=\$BUILDKIT_PROGRESS"
PREV_ARGS=""
if docker image inspect '${imageBase}:${branchArg}' >/dev/null 2>&1; then
  PREV_ARGS="--build-context previous=docker-image://${imageBase}:${branchArg}"
elif docker image inspect '${slug}:${branchArg}' >/dev/null 2>&1; then
  PREV_ARGS="--build-context previous=docker-image://${slug}:${branchArg}"
elif docker image inspect '${ZENTITH}:5000/${slug}:${branchArg}' >/dev/null 2>&1; then
  PREV_ARGS="--build-context previous=docker-image://${ZENTITH}:5000/${slug}:${branchArg}"
fi
SKIP_PANEL_EFF=${SKIP_PANEL}
SKIP_NEST_EFF=${SKIP_NEST}
if [ -z "\$PREV_ARGS" ]; then
  if [ "\$SKIP_PANEL_EFF" = "1" ] || [ "\$SKIP_NEST_EFF" = "1" ]; then
    echo "[forge-vulkano] no previous image — forcing SKIP_*=0 (hasPrev gate)"
  fi
  SKIP_PANEL_EFF=0
  SKIP_NEST_EFF=0
fi
# Cache por rama — main+preview paralelos no pelean el mismo dest (corrupción/lock).
CACHE_DIR="/var/cache/hefesto/${slug}-${branchArg}"
mkdir -p "\$CACHE_DIR"
# mode=max (default): hit rate alto. mode=min: HEFESTO_CACHE_MODE=min si disco apretado.
CACHE_FROM="--cache-from type=local,src=\${CACHE_DIR}"
# Sibling branch cache = bonus hit rate sin escribir al mismo dest
for _sib in preview main; do
  if [ "\$_sib" != "${branchArg}" ] && [ -d "/var/cache/hefesto/${slug}-\$_sib" ]; then
    CACHE_FROM="\$CACHE_FROM --cache-from type=local,src=/var/cache/hefesto/${slug}-\$_sib"
  fi
done
# Legacy slug-wide cache (migración)
if [ -d "/var/cache/hefesto/${slug}" ]; then
  CACHE_FROM="\$CACHE_FROM --cache-from type=local,src=/var/cache/hefesto/${slug}"
fi
CACHE_TO=""
REGISTRY_CACHE_REF="${ZENTITH}:5000/${slug}:buildcache-${branchArg}"
if ${CACHE_REGISTRY_FROM ? 'true' : 'false'}; then
  CACHE_FROM="\$CACHE_FROM --cache-from type=registry,ref=\${REGISTRY_CACHE_REF}"
  if docker manifest inspect '${imageBase}:buildcache-${branchArg}' >/dev/null 2>&1; then
    CACHE_FROM="\$CACHE_FROM --cache-from type=registry,ref=${imageBase}:buildcache-${branchArg}"
  fi
fi

PUSH_DIRECT=0
if ${skipPush ? 'false' : 'true'} && ${WANT_PUSH_DIRECT ? 'true' : 'false'}; then
  if curl -fsS -m 5 "http://${ZENTITH}:5000/v2/" >/dev/null 2>&1; then
    PUSH_DIRECT=1
  fi
fi

# Exportar caché (local o registry) al final revienta buildx: "can't evaluate field Id".
# La velocidad sale de cache-from local ya caliente, no de reescribir cache-to en cada forja.
if [ "\$PUSH_DIRECT" = "1" ]; then
  if ${CACHE_REGISTRY_TO ? 'true' : 'false'}; then
    CACHE_TO="--cache-to type=registry,ref=\${REGISTRY_CACHE_REF},mode=${CACHE_MODE}"
  fi
  echo "[forge-vulkano] PUSH_DIRECT=1 (cache-to registry solo si opt-in)"
else
  echo "[forge-vulkano] path=load+push cache-to=off (export local revienta buildx .Id) — cache-from local sigue"
fi

if [ "\$PUSH_DIRECT" = "1" ]; then
  BUILD_CMD="docker buildx build --file Dockerfile --platform linux/amd64 \\
    -t '${ZENTITH}:5000/${slug}:${ver}' \\
    -t '${ZENTITH}:5000/${slug}:${branchArg}' \\
    ${siblingBranch ? `-t '${ZENTITH}:5000/${slug}:${siblingBranch}' \\` : ''}\\
    --build-arg VERSION=${ver} \\
    --build-arg SKIP_PANEL=\${SKIP_PANEL_EFF} \\
    --build-arg SKIP_NEST=\${SKIP_NEST_EFF} \\
    --build-arg NEXT_PUBLIC_PANEL_VERSION=${ver} \\
    \$PREV_ARGS \$CACHE_FROM \$CACHE_TO --provenance=false --sbom=false --push ."
  echo "[forge-vulkano] hot-path PUSH_DIRECT=1 (buildx --push → :5000)"
else
  BUILD_CMD="docker buildx build --file Dockerfile --platform linux/amd64 \\
    -t '${imageBase}:${ver}' \\
    -t '${imageBase}:${branchArg}' \\
    -t '${slug}:${branchArg}' \\
    -t '${slug}:${ver}' \\
    ${siblingBranch ? `-t '${imageBase}:${siblingBranch}' \\` : ''}\\
    ${siblingBranch ? `-t '${slug}:${siblingBranch}' \\` : ''}\\
    --build-arg VERSION=${ver} \\
    --build-arg SKIP_PANEL=\${SKIP_PANEL_EFF} \\
    --build-arg SKIP_NEST=\${SKIP_NEST_EFF} \\
    --build-arg NEXT_PUBLIC_PANEL_VERSION=${ver} \\
    \$PREV_ARGS \$CACHE_FROM \$CACHE_TO --provenance=false --sbom=false --load ."
fi

exec 7>/var/lock/hefesto-slug-${slug}.lock
echo "[forge-vulkano] slug-lock ${slug}: una compilacion por version"
flock -w 1200 7
if docker image inspect '${imageBase}:${ver}' >/dev/null 2>&1; then
  echo "[forge-vulkano] SKIP_BUILD ${ver} ya esta en esta maquina — retag ${branchArg}, sin next build"
  SKIP_REBUILD=1
else
  SKIP_REBUILD=0
fi
echo "[forge-vulkano] TIMING BUILD start \$(date -Is)"
echo "[forge-vulkano] MARKER BUILD_START \$(date +%s%3N 2>/dev/null || date +%s)"
if [ "\$SKIP_REBUILD" != "1" ]; then
# RT-01: no marcar PUSHED si buildx falla
_PRE_ID=\$(docker image inspect '${imageBase}:${ver}' --format '{{.Id}}' 2>/dev/null || echo "")
if docker buildx version >/dev/null 2>&1; then
  set +e
  bash -lc "\$BUILD_CMD"
  _bx=\$?
  set -e
  if [ "\$_bx" -ne 0 ]; then
    if [ "\$PUSH_DIRECT" = "1" ]; then
      _code=\$(curl -sS -o /dev/null -w '%{http_code}' -m 20 \\
        -H 'Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json' \\
        "http://${ZENTITH}:5000/v2/${slug}/manifests/${ver}" || echo 000)
      if [ "\$_code" = "200" ]; then
        echo "[forge-vulkano] buildx exit \$_bx pero ${ver} ya está en :5000; sigo"
      else
        echo "[forge-vulkano] FATAL: buildx --push exit \$_bx (registry \$_code)"
        exit "\$_bx"
      fi
    else
    _POST_ID=\$(docker image inspect '${imageBase}:${ver}' --format '{{.Id}}' 2>/dev/null || echo "")
    if [ -n "\$_POST_ID" ]; then
      echo "[forge-vulkano] buildx exit \$_bx but image ${ver} loaded — continue (cache export .Id)"
    else
      echo "[forge-vulkano] FATAL: buildx exit \$_bx (stale or missing image ${ver})"
      exit "\$_bx"
    fi
    fi
  fi
else
  # Fallback sin buildx: mismos tags + build-args (sin cache-to local — best-effort)
  docker build \\
    --platform linux/amd64 \\
    -t '${imageBase}:${ver}' \\
    -t '${imageBase}:${branchArg}' \\
    -t '${slug}:${branchArg}' \\
    -t '${slug}:${ver}' \\
    --build-arg "VERSION=${ver}" \\
    --build-arg "SKIP_PANEL=\${SKIP_PANEL_EFF}" \\
    --build-arg "SKIP_NEST=\${SKIP_NEST_EFF}" \\
    --build-arg "NEXT_PUBLIC_PANEL_VERSION=${ver}" \\
    -f Dockerfile .
  PUSH_DIRECT=0
fi
fi
echo "[forge-vulkano] TIMING BUILD end \$(date -Is)"
echo "[forge-vulkano] MARKER BUILD_DONE \$(date +%s%3N 2>/dev/null || date +%s)"
# No re-bajar la imagen a VULKANO: el pull post-push suma minutos y la siguiente forja usa caché local.
if [ "\$PUSH_DIRECT" = "1" ]; then
  echo "[forge-vulkano] skip post-pull (caché local basta)"
  docker tag '${ZENTITH}:5000/${slug}:${ver}' '${imageBase}:${branchArg}' || true
  docker tag '${ZENTITH}:5000/${slug}:${ver}' '${slug}:${ver}' || true
  docker tag '${ZENTITH}:5000/${slug}:${ver}' '${slug}:${branchArg}' || true
fi
docker tag '${imageBase}:${ver}' '${slug}:${ver}' || true
echo "[forge-vulkano] images:"
docker images '${imageBase}' --format '{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}}' | head -5 || true
${
  skipPush
    ? 'echo "[forge-vulkano] skip-push"'
    : `
if [ "\$PUSH_DIRECT" = "1" ]; then
  echo "[forge-vulkano] TIMING PUSH skipped (already in buildx --push)"
  ${siblingBranch ? `echo "[forge-vulkano] DUAL_PUSHED ${siblingBranch} misma imagen sin segundo build"` : ''}
  echo "[forge-vulkano] MARKER PUSH_DONE \$(date +%s%3N 2>/dev/null || date +%s)"
  echo "[forge-vulkano] PUSHED_REGISTRY=1"
else
echo "[forge-vulkano] TIMING PUSH start \$(date -Is)"
echo "[forge-vulkano] MARKER PUSH_START \$(date +%s%3N 2>/dev/null || date +%s)"
if curl -fsS -m 5 "http://${ZENTITH}:5000/v2/" >/dev/null 2>&1; then
  docker tag '${imageBase}:${ver}' '${ZENTITH}:5000/${slug}:${ver}'
  docker tag '${imageBase}:${branchArg}' '${ZENTITH}:5000/${slug}:${branchArg}'
  # RT-04: serial — primero tag inmutable :ver; luego :branch (mutable). Evita :branch envenenado si ver falla.
  docker push '${ZENTITH}:5000/${slug}:${ver}'
  docker push '${ZENTITH}:5000/${slug}:${branchArg}'
  ${
    siblingBranch
      ? `docker tag '${imageBase}:${ver}' '${ZENTITH}:5000/${slug}:${siblingBranch}'
  docker push '${ZENTITH}:5000/${slug}:${siblingBranch}'
  echo "[forge-vulkano] DUAL_PUSHED ${siblingBranch} misma imagen sin segundo build"`
      : ''
  }
  echo "[forge-vulkano] TIMING PUSH end \$(date -Is)"
  echo "[forge-vulkano] MARKER PUSH_DONE \$(date +%s%3N 2>/dev/null || date +%s)"
  echo "[forge-vulkano] PUSHED_REGISTRY=1"
else
  echo "[forge-vulkano] FATAL: ${ZENTITH}:5000 no alcanzable"
  exit 76
fi
fi
`
}
echo "OK forge-vulkano ${ver} ${branchArg}"
# Eviction AFTER this forge's slot work; flock so two finishing forges don't prune together.
# Skip if another prune/forge holds the lock (HEFESTO_FORGE_SLOTS>1).
# Default until=${BUILDER_PRUNE_HOURS}h — no matar cache caliente de la flota.
if flock -n /var/lock/hefesto-builder-prune.lock -c 'docker builder prune --filter until=${BUILDER_PRUNE_HOURS}h -f'; then
  echo "[forge-vulkano] builder prune until=${BUILDER_PRUNE_HOURS}h OK"
else
  echo "[forge-vulkano] builder prune skipped (lock busy)"
fi
`.trim();

/** Sync git bajo workdir lock (RT-02). Archive: PC ya unpackeó; solo verifica. */
const syncUnderLock = preferGit
  ? `
echo "[forge-vulkano] TIMING SYNC start \$(date -Is)"
echo "[forge-vulkano] MARKER SYNC_START \$(date +%s%3N 2>/dev/null || date +%s)"
mkdir -p "\$(dirname '${WORKDIR}')"
if [ ! -d '${WORKDIR}/.git' ]; then
  git clone --depth 50 '${REPO_URL}' '${WORKDIR}'
fi
cd '${WORKDIR}'
git remote set-url origin '${REPO_URL}' 2>/dev/null || true
git fetch --depth 50 origin -- '${branchArg}' || git fetch origin -- '${branchArg}'
git checkout -B '${branchArg}' "origin/${branchArg}" || git checkout -- '${branchArg}'
git reset --hard "origin/${branchArg}"
echo "[forge-vulkano] TIMING SYNC end \$(date -Is)"
echo "[forge-vulkano] MARKER SYNC_END \$(date +%s%3N 2>/dev/null || date +%s)"
`
  : `
cd '${WORKDIR}'
test -f Dockerfile
test -f VERSION
`;

/** Multi-slot: hasta N forjas en paralelo; workdir exclusive por slug (RT-02). */
const remoteBuild = `
set -euo pipefail
# forge.env: knobs ops en VULKANO; valores Node abajo ganan (SLOTS, WAIT, MIN_FREE_GB, CACHE_MODE en BODY).
set -a; [ -f /etc/hefesto/forge.env ] && . /etc/hefesto/forge.env; set +a
SLOTS=${FORGE_SLOTS}
WAIT=${FORGE_WAIT_SEC}
MIN_FREE_GB=${MIN_FREE_GB}
SLOT_DIR=/var/lock/hefesto-forge-slots
WD_LOCK=/var/lock/hefesto-wd-${WD_LOCK_NAME}.lock
ACTIVE_MARK=/var/lock/hefesto-forge-active-${WD_LOCK_NAME}
mkdir -p "\$SLOT_DIR" /var/lock
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
BODY=\$(mktemp /tmp/hefesto-build-XXXXXX.sh)
trap 'rm -f "\$BODY"' EXIT
cat > "\$BODY" <<'HEFESTO_BUILD_EOF'
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
[ -s "\$BODY" ] || { echo "[forge-vulkano] FATAL: BODY vacío"; exit 72; }
echo "[forge-vulkano] BODY size=\$(wc -c < "\$BODY" | tr -d ' ') bytes"
chmod +x "\$BODY"

# RT-09: slot busy = 71 (no 75) — BODY que sale 75 no se reintenta en otro slot
acquire() {
  local i st
  for i in \$(seq 1 "\$SLOTS"); do
    (
      flock -n 9 || exit 71
      echo "[forge-vulkano] SLOT \$i/\$SLOTS adquirido"
      export HEFESTO_SLOT=\$i
      bash "\$BODY"
    ) 9>"\$SLOT_DIR/s\$i.lock"
    st=\$?
    if [ "\$st" -eq 0 ]; then
      return 0
    fi
    if [ "\$st" -ne 71 ]; then
      return "\$st"
    fi
  done
  return 71
}

# RT-02: workdir exclusive por project-branch (main+preview paralelos)
(
  flock -w "\$WAIT" 8 || { echo "[forge-vulkano] HALT workdir lock timeout (otro forge misma rama)"; exit 74; }
  echo \$\$ > "\$ACTIVE_MARK"
  trap 'rm -f "\$ACTIVE_MARK"' EXIT
  ${syncUnderLock}
  # RT-03: VERSION en origin debe coincidir con el del PC (build-arg)
  _remote_ver=\$(tr -d '\\r\\n' < VERSION)
  if [ "\$_remote_ver" != "${ver}" ]; then
    echo "[forge-vulkano] FATAL VERSION mismatch PC=${ver} worktree=\$_remote_ver — push VERSION antes de forjar"
    exit 73
  fi
  echo "[forge-vulkano] VERSION_OK \$_remote_ver HEAD=\$(git rev-parse --short HEAD 2>/dev/null || echo archive)"
  if acquire; then
    exit 0
  fi
  echo "[forge-vulkano] slots llenos — en cola (wait ${FORGE_WAIT_SEC}s, slots=${FORGE_SLOTS})"
  # RT-08: reintentar cualquier slot libre, no solo s1
  _deadline=\$(( \$(date +%s) + WAIT ))
  while [ "\$(date +%s)" -lt "\$_deadline" ]; do
    if acquire; then
      exit 0
    fi
    sleep 2
  done
  echo "[forge-vulkano] HALT: timeout esperando slot (HEFESTO_FORGE_WAIT_SEC=\$WAIT)"
  exit 71
) 8>"\$WD_LOCK"
`.trim();

console.log(
  `[HEFESTO] forja remota VULKANO · ${branchArg} · v${ver} · ${skip.reason} · SKIP_PANEL=${SKIP_PANEL} SKIP_NEST=${SKIP_NEST} · slots=${FORGE_SLOTS} · sync=${syncMode}`,
);

async function main() {
  const t0 = performance.now();
  let syncMs = 0;
  try {
    if (preferGit) {
      // RT-02: sync corre DENTRO de remoteBuild bajo WD_LOCK (no SSH sync aparte)
      console.log('[forge-vulkano] sync diferido → remoteBuild (workdir lock + git)');
    } else {
      await syncCodeViaArchive();
      syncMs = Math.round(performance.now() - t0);
    }
  } catch (err) {
    console.error(`❌ sync código: ${err instanceof Error ? err.message : err}`);
    await reportEvent('done', 'failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  }

  const t1 = performance.now();
  if (!syncMs) syncMs = Math.round(t1 - t0);
  await reportEvent('build', 'running');

  const r = sshVps('vulkano', remoteBuild, {
    timeoutMs: 3_600_000,
    stdio: 'pipe',
    purpose: 'forge',
  });
  const out = `${r.stdout || ''}\n${r.stderr || ''}`;
  if (out.trim()) process.stdout.write(out);

  const t2 = performance.now();
  const syncEnd = parseMarker(out, 'SYNC_END');
  const syncStart = parseMarker(out, 'SYNC_START');
  if (syncStart != null && syncEnd != null) {
    syncMs = Math.max(0, syncEnd - syncStart);
  }
  const buildStart = parseMarker(out, 'BUILD_START');
  const buildDone = parseMarker(out, 'BUILD_DONE');
  const pushDone = parseMarker(out, 'PUSH_DONE');
  const buildMs =
    buildStart != null && buildDone != null ? Math.max(0, buildDone - buildStart) : Math.round(t2 - t1);
  const pushMs =
    buildDone != null && pushDone != null ? Math.max(0, pushDone - buildDone) : skipPush ? 0 : 0;
  const totalMs = Math.round(t2 - t0);

  const sec = (ms) => (ms / 1000).toFixed(1);
  console.log(
    `[forge-vulkano] TIMINGS sync=${sec(syncMs)}s build=${sec(buildMs)}s push=${sec(pushMs)}s total=${sec(totalMs)}s (syncMs=${syncMs} buildMs=${buildMs} pushMs=${pushMs} totalMs=${totalMs})`,
  );

  if ((r.status ?? 1) !== 0) {
    await reportEvent('build', 'failed', { durationMs: buildMs, error: `exit ${r.status ?? 1}` });
    await reportEvent('done', 'failed', { totalMs, error: `forge exit ${r.status ?? 1}` });
    console.error('❌ hefesto-forge-vulkano falló — override: HEFESTO_FORGE=local');
    process.exit(r.status ?? 1);
  }
  if (!skipPush && !/\[forge-vulkano\] PUSHED_REGISTRY=1/.test(out)) {
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
