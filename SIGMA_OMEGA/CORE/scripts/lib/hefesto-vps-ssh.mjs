/**
 * SSH helper for HEFESTO forges (VULKANO / ZENTITH).
 * Prefer ~/.ssh/coolify-host.key — never print key material.
 * ADR-059: forja SOLO en vulkano; zentith = pull&run.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const VPS = {
  vulkano: process.env.HEFESTO_VULKANO_HOST || '177.7.56.235',
  zentith: process.env.HEFESTO_ZENTITH_HOST || '93.188.162.107',
};

/**
 * @returns {string} path to private key
 */
export function resolveCoolifyHostKey() {
  const candidates = [
    process.env.HEFESTO_SSH_KEY,
    path.join(os.homedir(), '.ssh', 'coolify-host.key'),
    path.join(process.env.USERPROFILE || '', '.ssh', 'coolify-host.key'),
  ].filter(Boolean);
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error(
    '[HEFESTO] falta SSH key (~/.ssh/coolify-host.key). No se puede forjar en VULKANO.',
  );
}

/**
 * @param {'vulkano'|'zentith'|string} target
 * @param {string} remoteCmd  bash script or one-liner
 * @param {{ timeoutMs?: number, stdio?: 'inherit'|'pipe', purpose?: 'forge'|'deploy'|'ops' }} [opts]
 */
export function sshVps(target, remoteCmd, opts = {}) {
  const purpose = opts.purpose || 'ops';
  if (purpose === 'forge') {
    if (target !== 'vulkano') {
      throw new Error(
        `[HEFESTO] HALT: forja solo en vulkano (pedido: ${target}). ZENTITH no compila.`,
      );
    }
    if (String(VPS.vulkano) === String(VPS.zentith)) {
      throw new Error('[HEFESTO] HALT: VULKANO_HOST == ZENTITH_HOST');
    }
  }
  const host =
    target === 'vulkano' || target === 'zentith'
      ? VPS[target]
      : purpose === 'forge'
        ? null
        : String(target).includes('.')
          ? target
          : VPS[target];
  if (!host) throw new Error(`[HEFESTO] host desconocido o prohibido: ${target}`);
  if (purpose === 'forge' && host === VPS.zentith) {
    throw new Error('[HEFESTO] HALT: no SSH-forge a ZENTITH');
  }
  const keyPath = resolveCoolifyHostKey();
  const timeoutMs = opts.timeoutMs ?? 3_600_000;
  const stdio = opts.stdio ?? 'inherit';
  const user = process.env.HEFESTO_SSH_USER || 'root';
  const args = [
    '-i',
    keyPath,
    '-o',
    'IdentitiesOnly=yes',
    '-o',
    'StrictHostKeyChecking=accept-new',
    '-o',
    'BatchMode=yes',
    '-o',
    'ConnectTimeout=15',
    `${user}@${host}`,
    remoteCmd,
  ];
  console.log(`[HEFESTO] ssh ${user}@${host} (${target}/${purpose})…`);
  return spawnSync('ssh', args, {
    encoding: 'utf8',
    stdio,
    timeout: timeoutMs,
  });
}
