/**
 * Resuelve URL git SSH para forja en VULKANO.
 * Prioridad: HEFESTO_VULKANO_REPO → map → remote origin local → EurekaSigma fallback.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MAP_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'hefesto-repo-map.json',
);

function toSshUrl(url) {
  const u = String(url || '').trim();
  if (!u) return null;
  if (u.startsWith('git@')) return u.endsWith('.git') ? u : `${u}.git`;
  const m = u.match(/github\.com[/:]([^/]+)\/([^/.]+)/i);
  if (!m) return null;
  return `git@github.com:${m[1]}/${m[2].replace(/\.git$/i, '')}.git`;
}

function readMap() {
  try {
    return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function detectOrigin(root) {
  const r = spawnSync('git', ['remote', 'get-url', 'origin'], {
    cwd: root,
    encoding: 'utf8',
  });
  if ((r.status ?? 1) !== 0) return null;
  return toSshUrl((r.stdout || '').trim());
}

/**
 * @param {{ project: string, root: string, env?: NodeJS.ProcessEnv, preferGit?: boolean }} opts
 */
export function resolveVulkanoRepoUrl({ project, root, env = process.env, preferGit = true }) {
  if (env.HEFESTO_VULKANO_REPO) {
    return preferGit
      ? toSshUrl(env.HEFESTO_VULKANO_REPO) || env.HEFESTO_VULKANO_REPO
      : env.HEFESTO_VULKANO_REPO;
  }
  const map = readMap();
  if (map[project]) return map[project];
  const fromGit = detectOrigin(root);
  if (fromGit) return fromGit;
  if (preferGit) return `git@github.com:EurekaSigma/${project}.git`;
  return `https://github.com/EurekaSigma/${project}.git`;
}
