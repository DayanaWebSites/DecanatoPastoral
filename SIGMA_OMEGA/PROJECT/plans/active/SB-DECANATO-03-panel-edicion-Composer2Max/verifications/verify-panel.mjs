#!/usr/bin/env node
/**
 * Audita los invariantes del panel de edición contra el sitio EN VIVO.
 * Lo que se puede comprobar sin credenciales: que el público no se degradó y que
 * el panel no está abierto. Lo que necesita sesión se prueba a mano en la task E1.
 *
 * Uso: node verify-panel.mjs https://pastoralsocialdecanatodulcenombre.org
 */
const base = (process.argv[2] || '').replace(/\/$/, '');
if (!base) { console.error('Falta la URL.'); process.exit(2); }

const fallos = [], avisos = [], oks = [];
const ok = (m) => oks.push(m), falla = (m) => fallos.push(m), avisa = (m) => avisos.push(m);

const PUBLICAS = [
  '/', '/comedores', '/comedores/casa-san-vicente', '/comedores/san-bernardo',
  '/comedores/el-tepeyac', '/parroquias',
  '/parroquias/dulce-nombre-de-jesus', '/parroquias/santa-teresita-del-nino-jesus',
  '/parroquias/san-bernardo', '/parroquias/el-tepeyac', '/parroquias/jesus-nino',
  '/parroquias/jesus-nuestra-pascua', '/parroquias/la-sagrada-familia',
  '/parroquias/nuestra-senora-del-buen-consejo', '/parroquias/oratorio-san-luis-gonzaga',
  '/parroquias/san-ignacio-de-loyola', '/parroquias/san-miguel-de-mezquitan',
  '/parroquias/santa-maria-goretti', '/parroquias/senor-de-la-ascension',
  '/pastoral-social', '/ayudar', '/aviso-de-privacidad', '/gracias',
];
const PANEL = ['/editar', '/editar/comedores/san-bernardo', '/editar/historial', '/editar/usuarios'];
const ESCRITURA = [
  ['PUT', '/api/contenido/sitio.home.hero'],
  ['POST', '/api/publicar'],
  ['POST', '/api/imagenes'],
  ['GET', '/api/usuarios'],
];

// ── 1. El público sigue en 0 KB de JavaScript ──────────────────────────
let conJs = [];
for (const ruta of PUBLICAS) {
  try {
    const r = await fetch(base + ruta);
    if (r.status !== 200) { falla(`${ruta} devolvió ${r.status}.`); continue; }
    const html = await r.text();
    const ejecutables = [...html.matchAll(/<script(?![^>]*type="application\/ld\+json")[^>]*>/g)];
    if (ejecutables.length) conJs.push(`${ruta} (${ejecutables.length})`);
  } catch (e) { falla(`${ruta} no respondió: ${e.message}`); }
}
if (conJs.length) falla(`Rutas públicas sirviendo JavaScript: ${conJs.join(', ')}. El bundle del editor sólo va en /editar.`);
else ok(`Las ${PUBLICAS.length} rutas públicas siguen en 0 KB de JavaScript.`);

// ── 2. El panel exige sesión ───────────────────────────────────────────
for (const ruta of PANEL) {
  const r = await fetch(base + ruta, { redirect: 'manual' });
  if (![301, 302, 303, 307, 401, 403, 404].includes(r.status)) {
    falla(`${ruta} devolvió ${r.status} sin sesión. Debería redirigir al login o rechazar.`);
  }
}
if (!fallos.some((f) => f.includes('sin sesión'))) ok('El panel exige sesión en todas sus rutas.');

// ── 3. El panel no se indexa ni se cachea ──────────────────────────────
const rp = await fetch(base + '/editar', { redirect: 'manual' });
const robots = rp.headers.get('x-robots-tag') || '';
if (!robots.includes('noindex')) falla('/editar sin X-Robots-Tag: noindex. El panel no puede aparecer en Google.');
else ok('/editar marcado noindex.');

const cacheStatus = (rp.headers.get('x-cache-status') || '').toUpperCase();
if (['HIT', 'STALE', 'UPDATING'].includes(cacheStatus)) falla(`/editar se está sirviendo desde cache (${cacheStatus}). El panel nunca se cachea.`);
else ok('/editar no se sirve desde cache.');

const rt = await fetch(base + '/robots.txt');
if (rt.status === 200) {
  const t = await rt.text();
  if (!/Disallow:\s*\/editar/i.test(t)) avisa('robots.txt no bloquea /editar. El header noindex ya cubre, pero conviene declararlo.');
  else ok('robots.txt bloquea /editar.');
}

// ── 4. El cache público sí funciona ────────────────────────────────────
await fetch(base + '/');
const r2 = await fetch(base + '/');
const cs = (r2.headers.get('x-cache-status') || '').toUpperCase();
if (!cs) avisa('Sin cabecera X-Cache-Status: no se puede verificar el micro-cache. Agrégala en nginx.');
else if (cs === 'MISS') avisa('La home devolvió MISS dos veces seguidas. Revisa proxy_cache: le estás pegando a la base en cada visita.');
else ok(`Micro-cache activo en el sitio público (${cs}).`);

// ── 5. Los endpoints de escritura rechazan sin sesión ──────────────────
for (const [metodo, ruta] of ESCRITURA) {
  const r = await fetch(base + ruta, {
    method: metodo, redirect: 'manual',
    headers: { 'Content-Type': 'application/json' },
    body: metodo === 'GET' ? undefined : '{}',
  });
  if (![401, 403, 404, 405].includes(r.status)) {
    falla(`${metodo} ${ruta} devolvió ${r.status} sin sesión. Tiene que ser 401 o 403.`);
  }
}
if (!fallos.some((f) => f.includes('sin sesión. Tiene'))) ok('Los endpoints de escritura rechazan sin sesión.');

// ── 6. La CSP del público sigue estricta ───────────────────────────────
const home = await fetch(base + '/');
const csp = home.headers.get('content-security-policy') || '';
if (!csp) falla('La home perdió la CSP.');
else if (csp.includes("'unsafe-inline'") && !csp.includes('nonce-')) {
  falla("La CSP del sitio público trae 'unsafe-inline'. Si el editor lo necesitaba, se resuelve con nonces, no aflojando la política de todo el sitio.");
} else ok('CSP del sitio público sigue estricta.');

// ── Reporte ────────────────────────────────────────────────────────────
const c = { v: '\x1b[32m', r: '\x1b[31m', a: '\x1b[33m', g: '\x1b[90m', x: '\x1b[0m' };
console.log(`\n${c.g}── Verificación del panel · ${base} ──${c.x}\n`);
for (const m of oks) console.log(`  ${c.v}✓${c.x} ${m}`);
if (avisos.length) { console.log(`\n${c.a}Avisos:${c.x}`); for (const m of avisos) console.log(`  ${c.a}!${c.x} ${m}`); }
if (fallos.length) {
  console.log(`\n${c.r}Fallos:${c.x}`);
  for (const m of fallos) console.log(`  ${c.r}✗${c.x} ${m}`);
  console.log(`\n${c.r}HALT — ${fallos.length} fallo(s).${c.x}\n`);
  process.exit(1);
}
console.log(`\n${c.v}Invariantes del panel en verde.${c.x}`);
console.log(`${c.g}Lo que necesita sesión (scoping de roles, subida, rotación de tokens)`);
console.log(`se prueba a mano en la task E1. Este auditor NO lo cubre.${c.x}\n`);
