/**
 * HEFESTO skip inteligente — decide SKIP_PANEL / SKIP_NEST según diff + perfil stack.
 *
 * stack en hefesto-turbo.config.json:
 *   "next"  → nunca nest (SKIP_NEST siempre si hay previous)
 *   "nest"  → nunca panel (SKIP_PANEL siempre)
 *   "both"  → auto por paths (default ZENTINEK)
 *
 * Overrides:
 *   HEFESTO_FORCE_FULL=1 → rebuild completo
 *   HEFESTO_SKIP_PANEL=1 / HEFESTO_SKIP_NEST=1
 *   CLI --skip-panel / --skip-nest (caller)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PANEL_GLOBS = [
  /^panel\//,
  /^packages\/eurekasigma-ui\//,
  /^packages\/eurekasigma-realtime\//,
];

const NEST_GLOBS = [
  /^src\//,
  /^prisma\//,
  /^nest-cli\.json$/,
  /^tsconfig.*\.json$/,
  /^scripts\/docker-entrypoint/,
  /^public\//,
];

const BOTH_GLOBS = [
  /^Dockerfile/,
  /^docker-compose/,
  /^package\.json$/,
  /^pnpm-lock\.yaml$/,
  /^pnpm-workspace\.yaml$/,
  /^\.npmrc$/,
];

function gitChangedFiles(root, baseRef) {
  const attempts = [
    ['diff', '--name-only', `${baseRef}...HEAD`],
    ['diff', '--name-only', 'HEAD~1'],
    ['diff', '--name-only', '--cached'],
    ['status', '--porcelain'],
  ];
  for (const args of attempts) {
    const r = spawnSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (r.status !== 0) continue;
    const out = String(r.stdout || '');
    if (args[0] === 'status') {
      const files = out
        .split(/\r?\n/)
        .map((l) => l.slice(3).trim().replace(/^.* -> /, ''))
        .filter(Boolean);
      if (files.length) return files;
      continue;
    }
    const files = out
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (files.length) return files;
  }
  return [];
}

function matchesAny(file, globs) {
  const f = file.replace(/\\/g, '/');
  return globs.some((g) => g.test(f));
}

function detectStack(root, cfg = {}) {
  if (cfg.stack === 'next' || cfg.stack === 'nest' || cfg.stack === 'both') {
    return cfg.stack;
  }
  const hasPanel =
    fs.existsSync(path.join(root, 'panel')) ||
    fs.existsSync(path.join(root, 'apps', 'web')) ||
    fs.existsSync(path.join(root, 'apps', 'panel'));
  const hasNest =
    fs.existsSync(path.join(root, 'nest-cli.json')) ||
    fs.existsSync(path.join(root, 'src', 'main.ts'));
  if (hasPanel && hasNest) return 'both';
  if (hasNest) return 'nest';
  if (hasPanel) return 'next';
  return 'both';
}

/**
 * @param {string} root
 * @param {{ stack?: string, skipPanel?: boolean, skipNest?: boolean, baseRef?: string }} [opts]
 * @returns {{ skipPanel: boolean, skipNest: boolean, stack: string, reason: string, files: string[] }}
 */
export function detectSkipFlags(root, opts = {}) {
  if (process.env.HEFESTO_FORCE_FULL === '1') {
    return {
      skipPanel: false,
      skipNest: false,
      stack: detectStack(root, opts),
      reason: 'HEFESTO_FORCE_FULL=1',
      files: [],
    };
  }

  const stack = detectStack(root, opts);
  let skipPanel = Boolean(opts.skipPanel) || process.env.HEFESTO_SKIP_PANEL === '1';
  let skipNest = Boolean(opts.skipNest) || process.env.HEFESTO_SKIP_NEST === '1';

  if (stack === 'next') {
    skipNest = true;
    return {
      skipPanel,
      skipNest,
      stack,
      reason: 'stack=next → SKIP_NEST',
      files: [],
    };
  }
  if (stack === 'nest') {
    skipPanel = true;
    return {
      skipPanel,
      skipNest,
      stack,
      reason: 'stack=nest → SKIP_PANEL',
      files: [],
    };
  }

  // stack=both — auto por diff
  if (skipPanel || skipNest) {
    return {
      skipPanel,
      skipNest,
      stack,
      reason: 'override CLI/env',
      files: [],
    };
  }

  const baseRef = opts.baseRef || process.env.HEFESTO_DIFF_BASE || 'origin/preview';
  const files = gitChangedFiles(root, baseRef);
  if (!files.length) {
    return {
      skipPanel: false,
      skipNest: false,
      stack,
      reason: 'sin diff usable → full rebuild',
      files,
    };
  }

  const touchesBoth = files.some((f) => matchesAny(f, BOTH_GLOBS));
  if (touchesBoth) {
    return {
      skipPanel: false,
      skipNest: false,
      stack,
      reason: 'tocó Dockerfile/lock/package → full',
      files,
    };
  }

  const touchesPanel = files.some((f) => matchesAny(f, PANEL_GLOBS));
  const touchesNest = files.some((f) => matchesAny(f, NEST_GLOBS));
  // VERSION alone → nest stage (VERSION COPY) but panel can skip if UI unchanged
  const onlyVersion =
    files.length > 0 && files.every((f) => /^(VERSION|CHANGELOG\.md|\.sigma-version)$/.test(f));

  if (onlyVersion) {
    return {
      skipPanel: true,
      skipNest: false,
      stack,
      reason: 'solo VERSION/CHANGELOG → SKIP_PANEL',
      files,
    };
  }

  if (touchesPanel && !touchesNest) {
    return {
      skipPanel: false,
      skipNest: true,
      stack,
      reason: 'solo panel/UI → SKIP_NEST',
      files,
    };
  }
  if (touchesNest && !touchesPanel) {
    return {
      skipPanel: true,
      skipNest: false,
      stack,
      reason: 'solo Nest/API → SKIP_PANEL',
      files,
    };
  }

  return {
    skipPanel: false,
    skipNest: false,
    stack,
    reason: touchesPanel && touchesNest ? 'panel+nest → full' : 'paths mixtos → full',
    files,
  };
}
