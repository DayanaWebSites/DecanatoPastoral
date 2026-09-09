/**
 * HEFESTO v2 bootstrap — inyectable en cualquier hefesto-turbo de la flota.
 * Default forja VULKANO; skip skopeo si el registry ya recibió la imagen.
 * ADR-059: PROHIBIDO compilar en ZENTITH.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { detectSkipFlags } from './hefesto-skip-detect.mjs';
import { VPS } from './hefesto-vps-ssh.mjs';

/**
 * @returns {'vulkano'|'local'|'gha'}
 */
export function resolveForgeTarget(argv = process.argv, env = process.env) {
  if (argv.includes('--forge-local') || argv.includes('--forge-pc')) return 'local';
  if (argv.includes('--forge-vulkano')) return 'vulkano';
  if (argv.includes('--forge-gha')) return 'gha';
  const idx = argv.indexOf('--forge');
  if (idx >= 0 && argv[idx + 1]) {
    const v = String(argv[idx + 1]).toLowerCase();
    if (v === 'local' || v === 'pc') return 'local';
    if (v === 'vulkano') return 'vulkano';
    if (v === 'gha') return 'gha';
  }
  const e = String(env.HEFESTO_FORGE || 'vulkano').toLowerCase();
  if (e === 'local' || e === 'pc') return 'local';
  if (e === 'gha') return 'gha';
  return 'vulkano';
}

function assertNotCompilingOnZentith(forgeTarget) {
  const zentith = String(VPS.zentith || '93.188.162.107');
  const vulkano = String(VPS.vulkano || '');
  if (vulkano && vulkano === zentith) {
    throw new Error(
      '[HEFESTO-V2] HALT: HEFESTO_VULKANO_HOST no puede ser ZENTITH (compile en prod prohibido)',
    );
  }
  if (forgeTarget === 'local') {
    const host = String(os.hostname() || '').toLowerCase();
    const envHost = String(process.env.HEFESTO_THIS_HOST || '');
    if (host.includes('zentith') || envHost.includes('93.188.162.107')) {
      throw new Error('[HEFESTO-V2] HALT: no forjar en ZENTITH (HEFESTO_FORGE=local en prod)');
    }
  }
}

/**
 * Si forge=vulkano: ejecuta hefesto-forge-vulkano.mjs y marca registry listo.
 * @returns {{ forgeTarget: string, registryReady: boolean, skipBuild: boolean }}
 */
export function applyHefestoV2Forge({
  root,
  branch,
  cfg = {},
  skipBuild = false,
  forgeScriptRel = 'scripts/hefesto-forge-vulkano.mjs',
}) {
  const forgeTarget = resolveForgeTarget();
  console.log(
    `[HEFESTO-V2] forge=${forgeTarget} (override: HEFESTO_FORGE=local|--forge local)`,
  );

  if (forgeTarget === 'gha') {
    throw new Error(
      '[HEFESTO-V2] GHA no es default. Usa workflow_dispatch o HEFESTO_FORGE=vulkano|local.',
    );
  }

  assertNotCompilingOnZentith(forgeTarget);

  if (skipBuild || forgeTarget !== 'vulkano') {
    return { forgeTarget, registryReady: false, skipBuild };
  }

  const forgePath = path.join(root, forgeScriptRel);
  if (!fs.existsSync(forgePath)) {
    throw new Error(
      `[HEFESTO-V2] falta ${forgeScriptRel} — copia desde ZENTINEK (no hay fallback silencioso a local)`,
    );
  }

  const skip = detectSkipFlags(root, {
    stack: cfg.stack || 'both',
    baseRef: `origin/${branch}`,
  });
  const args = [forgePath, '--branch', branch];
  if (skip.skipPanel) args.push('--skip-panel');
  if (skip.skipNest) args.push('--skip-nest');

  console.log(`[HEFESTO-V2] forja VULKANO · ${skip.reason}`);
  const fr = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
    env: {
      ...process.env,
      /** Clone SSH en VULKANO (deploy key). Apagar: HEFESTO_VULKANO_GIT=0 */
      HEFESTO_VULKANO_GIT: process.env.HEFESTO_VULKANO_GIT ?? '1',
      HEFESTO_FORGE_SLOTS: process.env.HEFESTO_FORGE_SLOTS ?? '4',
      HEFESTO_FORGE_WAIT_SEC: process.env.HEFESTO_FORGE_WAIT_SEC ?? '900',
    },
  });
  const out = `${fr.stdout || ''}\n${fr.stderr || ''}`;
  if (out.trim()) process.stdout.write(out);
  if ((fr.status ?? 1) !== 0) {
    throw new Error(
      '[HEFESTO-V2] forja VULKANO falló — prueba HEFESTO_FORGE=local',
    );
  }
  if (!/PUSHED_REGISTRY=1/.test(out) && process.env.HEFESTO_ALLOW_NO_PUSH !== '1') {
    throw new Error(
      '[HEFESTO-V2] forja OK pero sin PUSHED_REGISTRY=1 — no se omite skopeo',
    );
  }
  return { forgeTarget, registryReady: true, skipBuild: true };
}
