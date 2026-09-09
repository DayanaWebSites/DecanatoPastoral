#!/usr/bin/env node
/**
 * HEFESTO TURBO — CasaAlfareros (Astro SSG → nginx :80)
 *
 * Forja = VULKANO. Pull&run = Coolify dockerimage (NO recreate Nest:3000).
 * Prohibido: botón Coolify, compilar en ZENTITH, apex/MX, --skip-build con código nuevo.
 *
 *   node scripts/hefesto-turbo.mjs --branch preview
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveCoolifyHostKey, VPS } from './lib/hefesto-vps-ssh.mjs';
import { resolveVulkanoRepoUrl } from './lib/hefesto-repo-url.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'hefesto-turbo.config.json'), 'utf8'));
const branchArg = process.argv.includes('--branch')
  ? process.argv[process.argv.indexOf('--branch') + 1]
  : process.argv.find((a) => a.startsWith('--branch='))?.split('=')[1] ||
    cfg.defaultBranch ||
    'preview';
const branch = String(branchArg).trim();
const branchNorm = branch.toLowerCase();
const skipBuild = process.argv.includes('--skip-build');

if ((branchNorm === 'main' || branchNorm === 'master') && process.env.HEFESTO_ALLOW_MAIN !== '1') {
  console.error(
    '[HEFESTO-TURBO] HALT: forja en main/master bloqueada.\n' +
      '  Apex/correo siguen en tusite. Hace falta HEFESTO_ALLOW_MAIN=1 + frase Mario.',
  );
  process.exit(1);
}

const appUuid = cfg.coolify?.[branch]?.uuid || cfg.coolify?.preview?.uuid;
const healthUrls = cfg.coolify?.[branch]?.health || cfg.health?.[branch] || [];
const slug = cfg.registrySlug || 'casa-alfareros';
const ver = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
if (!appUuid) {
  throw new Error(
    `No coolify.uuid for branch=${branch}. Corre: node scripts/hefesto-create-preview-app.mjs`,
  );
}

function formatMs(ms) {
  if (ms == null || Number.isNaN(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function shNode(args, opts = {}) {
  const r = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'inherit',
    env: {
      ...process.env,
      HEFESTO_VULKANO_REPO:
        process.env.HEFESTO_VULKANO_REPO ||
        cfg.vulkanoRepo ||
        resolveVulkanoRepoUrl({ project: cfg.project, root: ROOT, env: process.env }),
    },
    timeout: opts.timeout ?? 3_600_000,
  });
  return r.status ?? 1;
}

const startPy = `# -*- coding: utf-8 -*-
import json, subprocess, time, urllib.request, urllib.error, sys

APP = ${JSON.stringify(appUuid)}
SLUG = ${JSON.stringify(slug)}
BRANCH = ${JSON.stringify(branch)}
IMG = "127.0.0.1:5000/%s:%s" % (SLUG, BRANCH)
URL = "http://127.0.0.1:8000"
ENVF = "/data/coolify/applications/inc6njpxwq67g4x0i5vl3fjn/.env"
FQDN = "https://preview.casaalfareros.com"

def token():
    for line in open(ENVF, encoding="utf-8", errors="replace"):
        if line.startswith("COOLIFY_API_TOKEN="):
            return line.split("=", 1)[1].strip().strip("'").strip('"')
    raise SystemExit("no COOLIFY_API_TOKEN")

TOK = token()

def cfy(method, path, data=None):
    req = urllib.request.Request(
        URL + path,
        data=None if data is None else json.dumps(data).encode(),
        headers={
            "Authorization": "Bearer " + TOK,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            raw = r.read().decode("utf-8", "replace")
            code = r.status
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        code = e.code
    try:
        body = json.loads(raw) if raw else {}
    except Exception:
        body = {"_raw": raw[:400]}
    return code, body

print("[pull]", IMG)
subprocess.check_call(["docker", "pull", IMG])
subprocess.check_call(["docker", "tag", IMG, "localhost:5000/%s:%s" % (SLUG, BRANCH)])

code, patched = cfy("PATCH", "/api/v1/applications/%s" % APP, {
    "docker_registry_image_name": "localhost:5000/" + SLUG,
    "docker_registry_image_tag": BRANCH,
    "domains": FQDN,
    "ports_exposes": "80",
    "is_auto_deploy_enabled": False,
})
print("patched", code)

code, app = cfy("GET", "/api/v1/applications/%s" % APP)
labels_raw = ""
if isinstance(app, dict):
    labels_raw = str(app.get("custom_labels") or "")
if labels_raw and "traefik." not in labels_raw:
    try:
        import base64
        dec = base64.b64decode(labels_raw).decode("utf-8", "replace")
        if "traefik." in dec:
            labels_raw = dec
    except Exception:
        pass
if "preview.casaalfareros.com" not in labels_raw:
    raise SystemExit("no Traefik Host preview.casaalfareros.com in Coolify labels")

subprocess.run(["docker", "rm", "-f", APP], check=False)
cmd = [
    "docker", "run", "-d",
    "--name", APP,
    "--restart", "unless-stopped",
    "--network", "coolify",
    "--expose", "80",
    "--health-cmd", "wget -qO- --timeout=5 http://127.0.0.1/health || exit 1",
    "--health-interval", "15s",
    "--health-timeout", "5s",
    "--health-retries", "5",
]
for line in labels_raw.splitlines():
    line = line.strip()
    if line and "=" in line and not line.startswith("#"):
        cmd += ["--label", line]
cmd.append(IMG)
print("[run]", " ".join(cmd[:12]), "... labels", labels_raw.count("traefik."))
subprocess.check_call(cmd)

healthy = False
last = ""
for i in range(1, 21):
    try:
        last = subprocess.check_output(
            ["docker", "exec", APP, "wget", "-qO-", "http://127.0.0.1/health"],
            text=True, timeout=6, stderr=subprocess.DEVNULL,
        ).strip()
    except Exception as e:
        last = "ERR %s" % e
    print("try %s/20 in-container /health: %s" % (i, last[:120]))
    if last and not last.startswith("ERR"):
        healthy = True
        break
    time.sleep(2)

ps = subprocess.check_output(
    ["docker", "ps", "--filter", "name=%s" % APP, "--format", "{{.Names}} {{.Status}} {{.Image}}"],
    text=True,
)
print(ps)
if not healthy:
    raise SystemExit("container never served /health — NOT marking START_OK")
print("START_OK")
`;

function sshStart() {
  const key = resolveCoolifyHostKey();
  const host = VPS.zentith;
  const user = process.env.HEFESTO_SSH_USER || 'root';
  const tmp = path.join(os.tmpdir(), 'casa-hefesto-start.py');
  fs.writeFileSync(tmp, startPy.replace(/\r\n/g, '\n'), 'utf8');
  const sshBase = [
    '-i',
    key,
    '-o',
    'IdentitiesOnly=yes',
    '-o',
    'StrictHostKeyChecking=accept-new',
    '-o',
    'BatchMode=yes',
    '-o',
    'ConnectTimeout=20',
  ];
  const scp = spawnSync('scp', [...sshBase, tmp, `${user}@${host}:/tmp/casa-hefesto-start.py`], {
    encoding: 'utf8',
  });
  if ((scp.status ?? 1) !== 0) {
    throw new Error(`scp start script falló: ${scp.stderr || scp.stdout}`);
  }
  const ssh = spawnSync(
    'ssh',
    [
      ...sshBase,
      '-o',
      'ServerAliveInterval=15',
      '-o',
      'ServerAliveCountMax=8',
      `${user}@${host}`,
      'python3 /tmp/casa-hefesto-start.py; rm -f /tmp/casa-hefesto-start.py',
    ],
    { encoding: 'utf8', timeout: 600_000, maxBuffer: 8 * 1024 * 1024 },
  );
  process.stdout.write(ssh.stdout || '');
  if (ssh.stderr) process.stderr.write(ssh.stderr.replace(/Warning: Permanently added[^\n]+\n/g, ''));
  if (ssh.signal) throw new Error(`VPS start matado: ${ssh.signal}`);
  if ((ssh.status ?? 1) !== 0) throw new Error(`VPS start failed (status=${ssh.status})`);
  if (!/START_OK/.test(ssh.stdout || '')) {
    throw new Error('VPS start no confirmó START_OK');
  }
}

function looksLikeHouse(html) {
  const t = String(html || '');
  return (
    /Casa Alfareros/i.test(t) &&
    (/habitacion/i.test(t) || /Tlaquepaque/i.test(t) || /Gilda/i.test(t) || /WhatsApp/i.test(t))
  );
}

async function verifyGate() {
  const urls = healthUrls.length ? healthUrls : ['https://preview.casaalfareros.com/health'];
  let healthOk = false;
  let lastHealth = '';
  for (let i = 0; i < 12; i++) {
    for (const u of urls) {
      try {
        const res = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
        const text = await res.text();
        lastHealth = `${res.status} ${text.slice(0, 120)}`;
        console.log(`health ${lastHealth} ${u}`);
        if (res.ok && (text.includes(ver) || /ok|healthy|0\.\d/i.test(text))) {
          healthOk = true;
          break;
        }
      } catch (e) {
        console.log(`health ERR ${u} ${e.message}`);
      }
    }
    if (healthOk) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  if (!healthOk) {
    throw new Error(`health verify FAILED — ${lastHealth || 'sin respuesta'}`);
  }

  const pageUrl = 'https://preview.casaalfareros.com/';
  let html = '';
  let pageStatus = 0;
  for (let i = 0; i < 8; i++) {
    try {
      const res = await fetch(pageUrl, { redirect: 'follow', signal: AbortSignal.timeout(10000) });
      pageStatus = res.status;
      html = await res.text();
      console.log(`html ${res.status} ${pageUrl} ${html.length}b`);
      if (res.ok && looksLikeHouse(html)) return;
    } catch (e) {
      console.log(`html ERR ${pageUrl} ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(
    `HTML verify FAILED — status=${pageStatus} (404 Traefik no cuenta). snippet=${html.slice(0, 180)}`,
  );
}

const t0 = performance.now();
const times = {};

console.log(`[HEFESTO-TURBO] CasaAlfareros v${ver} branch=${branch} app=${appUuid} nginx:80`);
console.log(`[HEFESTO-TURBO] forge=vulkano · pull&run=Coolify dockerimage (no Nest recreate)`);

if (!skipBuild) {
  const t = performance.now();
  const st = shNode([path.join(ROOT, 'scripts', 'hefesto-forge-vulkano.mjs'), '--branch', branch]);
  if (st !== 0) throw new Error('forja VULKANO falló');
  times.build = performance.now() - t;
  console.log(`[HEFESTO-TURBO] build(vulkano) ${formatMs(times.build)}`);
} else {
  console.log('[HEFESTO-TURBO] --skip-build → solo pull&run Coolify');
  times.build = 0;
}

{
  const t = performance.now();
  sshStart();
  times.deploy = performance.now() - t;
  console.log(`[HEFESTO-TURBO] Coolify start ${formatMs(times.deploy)}`);
}

{
  const t = performance.now();
  await verifyGate();
  times.verify = performance.now() - t;
  console.log(`[HEFESTO-TURBO] verify ${formatMs(times.verify)}`);
}

const total = performance.now() - t0;
console.log('\n════════ HEFESTO TURBO REPORT ════════');
console.log(`project:  ${cfg.project}`);
console.log(`version:  ${ver}`);
console.log(`branch:   ${branch}`);
console.log(`build:    ${formatMs(times.build)}`);
console.log(`deploy:   ${formatMs(times.deploy)}`);
console.log(`verify:   ${formatMs(times.verify)}`);
console.log(`TOTAL:    ${formatMs(total)}`);
console.log(`✅ CasaAlfareros v${ver} en preview (${formatMs(total)})`);
