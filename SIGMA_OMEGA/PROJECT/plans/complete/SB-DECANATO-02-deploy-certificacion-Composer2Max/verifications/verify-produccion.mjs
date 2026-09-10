#!/usr/bin/env node
/**
 * Auditoría del sitio EN VIVO. Contra el dominio público, no contra localhost.
 * Un build verde no prueba nada; esto sí.
 *
 * Uso: node verify-produccion.mjs https://pastoralsocialdecanatodulcenombre.org
 */
const base = (process.argv[2] || '').replace(/\/$/, '');
if (!base) {
  console.error('Falta la URL. Ej: node verify-produccion.mjs https://pastoralsocialdecanatodulcenombre.org');
  process.exit(2);
}
const esLocal = /localhost|127\.0\.0\.1/.test(base);

const fallos = [], avisos = [], oks = [];
const ok = (m) => oks.push(m);
const falla = (m) => fallos.push(m);
const avisa = (m) => avisos.push(m);

const RUTAS = [
  '/', '/comedores', '/comedores/casa-san-vicente', '/comedores/san-bernardo',
  '/comedores/el-tepeyac', '/parroquias', '/parroquias/dulce-nombre-de-jesus',
  '/parroquias/santa-teresita-del-nino-jesus', '/pastoral-social', '/ayudar',
  '/aviso-de-privacidad',
];

const pedir = async (ruta, opts = {}) => {
  const t0 = Date.now();
  const r = await fetch(base + ruta, { redirect: 'follow', ...opts });
  return { r, ms: Date.now() - t0 };
};

// ── 1. Todas las rutas responden 200 ───────────────────────────────────
let lento = 0;
for (const ruta of RUTAS) {
  try {
    const { r, ms } = await pedir(ruta);
    if (r.status !== 200) falla(`${ruta} devolvió ${r.status}, se esperaba 200.`);
    if (ms > 1500) { lento++; avisa(`${ruta} tardó ${ms} ms.`); }
  } catch (e) {
    falla(`${ruta} no respondió: ${e.message}`);
  }
}
if (!fallos.length) ok(`Las ${RUTAS.length} rutas responden 200${lento ? ` (${lento} lenta(s))` : ''}.`);

// ── 2. HTTPS y certificado ─────────────────────────────────────────────
if (esLocal) avisa('Corriendo contra local: no se verifican HTTPS ni HSTS.');
else if (!base.startsWith('https://')) falla('El sitio no se está sirviendo por HTTPS.');
else ok('HTTPS activo (el fetch no falló la validación del certificado).');

// ── 3. Cabeceras de seguridad ──────────────────────────────────────────
const { r: home } = await pedir('/');
const h = (k) => home.headers.get(k) || '';
const esperadas = [
  ['content-security-policy', (v) => v.includes("default-src 'self'"), "debe incluir default-src 'self'"],
  ['x-content-type-options', (v) => v.toLowerCase() === 'nosniff', 'debe ser nosniff'],
  ['x-frame-options', (v) => v.toUpperCase() === 'DENY', 'debe ser DENY'],
  ['referrer-policy', (v) => v.includes('strict-origin'), 'debe ser strict-origin-when-cross-origin'],
  ['permissions-policy', (v) => v.includes('camera'), 'debe restringir cámara, micrófono y geolocalización'],
];
if (!esLocal) esperadas.push(['strict-transport-security', (v) => /max-age=\d{7,}/.test(v), 'debe tener max-age de al menos un año']);

// Las cabeceras las pone nginx. `astro preview` no es nginx: contra local
// esto informa, no reprueba. Un auditor que grita en falso acaba ignorado.
const marca = esLocal ? avisa : falla;
for (const [k, valida, que] of esperadas) {
  const v = h(k);
  if (!v) marca(`Falta la cabecera ${k}.${esLocal ? ' (esperado en local: las pone nginx)' : ''}`);
  else if (!valida(v)) marca(`Cabecera ${k} incorrecta (${v}) — ${que}.`);
}
const csp = h('content-security-policy');
if (csp.includes("'unsafe-inline'")) falla("La CSP trae 'unsafe-inline'. Este proyecto no lo necesita: inlineStylesheets está en 'never'.");
if (csp.includes("'unsafe-eval'")) falla("La CSP trae 'unsafe-eval'.");
if (esLocal) avisa('Cabeceras de seguridad no verificables en local — corre esto contra el dominio real.');
else if (!fallos.some((f) => f.includes('abecera') || f.includes('CSP'))) ok('Cabeceras de seguridad correctas y CSP sin directivas permisivas.');

// ── 4. Compresión ──────────────────────────────────────────────────────
const { r: gz } = await pedir('/', { headers: { 'Accept-Encoding': 'gzip, br' } });
const enc = gz.headers.get('content-encoding');
if (!enc) avisa('La home se sirve sin comprimir. Revisa gzip en nginx.conf.');
else ok(`Compresión activa (${enc}).`);

// ── 5. Cero JavaScript servido ─────────────────────────────────────────
const html = await (await fetch(base + '/')).text();
const scriptsEjecutables = [...html.matchAll(/<script(?![^>]*type="application\/ld\+json")[^>]*>/g)];
if (scriptsEjecutables.length) falla(`La home sirve ${scriptsEjecutables.length} script(s) ejecutable(s). El estándar de este proyecto es 0.`);
else ok('Cero JavaScript ejecutable en la home.');

// ── 6. Nada de terceros ────────────────────────────────────────────────
const host = new URL(base).host;
const externos = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
  .map((m) => m[1])
  .filter((u) => !u.includes(host) && !u.includes('schema.org'))
  // en local, el canonical apunta al dominio de producción: no es un tercero
  .filter((u) => !(esLocal && u.includes('pastoralsocialdecanatodulcenombre.org')));
if (externos.length) falla(`La home carga recursos de terceros: ${[...new Set(externos)].join(', ')}`);
else ok('Cero recursos de terceros.');

// ── 7. Canonical y OG apuntando al dominio real ────────────────────────
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
if (!canonical) falla('La home no tiene canonical.');
else if (!esLocal && !canonical.includes(host)) falla(`El canonical apunta a ${canonical}, no a ${host}. Revisa "site" en astro.config.mjs y redeploya.`);
else ok('Canonical correcto.');

const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? '';
if (!og) falla('Falta og:image.');
else {
  const { r } = await pedir(new URL(og).pathname);
  if (r.status !== 200) falla(`og:image apunta a ${new URL(og).pathname} y devuelve ${r.status}. La tarjeta de WhatsApp va a salir vacía (task A3).`);
  else ok('og:image existe y responde 200.');
}

// ── 8. 404 real ────────────────────────────────────────────────────────
const { r: r404 } = await pedir('/esta-ruta-no-existe-' + Date.now());
if (r404.status !== 404) falla(`Una ruta inexistente devolvió ${r404.status}, debería ser 404.`);
else {
  const t = await r404.text();
  if (!t.includes('404')) avisa('El 404 responde con el código correcto pero no parece la página del sitio.');
  else ok('404 sirviendo la página del sitio.');
}

// ── 9. Health check ────────────────────────────────────────────────────
// /health lo sirve nginx, no astro: en local no existe y está bien.
const { r: rh } = await pedir('/health');
if (rh.status !== 200) (esLocal ? avisa : falla)(`/health devolvió ${rh.status}.${esLocal ? ' (esperado en local: lo sirve nginx)' : ' Coolify lo usa para saber si el contenedor está vivo.'}`);
else ok('/health responde 200.');

// ── 10. Sitemap y robots ───────────────────────────────────────────────
const { r: rs } = await pedir('/sitemap-index.xml');
if (rs.status !== 200) falla('No hay sitemap-index.xml.');
else {
  const idx = await rs.text();
  let primero = idx.match(/<loc>([^<]+)<\/loc>/)?.[1];
  // el sitemap se genera con el dominio de producción; en local se reapunta
  if (primero && esLocal) primero = base + new URL(primero).pathname;
  if (primero) {
    const sm = await (await fetch(primero)).text();
    const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    // 23 páginas construidas menos /404, que correctamente no va al sitemap
    if (urls.length < 22) falla(`El sitemap lista ${urls.length} URLs, se esperaban al menos 22 (23 páginas menos el 404).`);
    else if (!esLocal && urls.some((u) => !u.includes(host))) falla('El sitemap tiene URLs de otro dominio. Se generó con el "site" equivocado.');
    else ok(`Sitemap con ${urls.length} URLs del dominio correcto.`);
  }
}
const { r: rr } = await pedir('/robots.txt');
if (rr.status !== 200) falla('No hay robots.txt.');
else if (!(await rr.text()).includes('Sitemap:')) avisa('robots.txt no declara el sitemap.');
else ok('robots.txt correcto.');

// ── 11. Cache de assets con hash ───────────────────────────────────────
const asset = html.match(/href="(\/_astro\/[^"]+\.css)"/)?.[1];
if (asset && !esLocal) {
  const { r } = await pedir(asset);
  const cc = r.headers.get('cache-control') || '';
  if (!cc.includes('immutable')) avisa(`Los assets de /_astro/ no se sirven como immutable (${cc}).`);
  else ok('Assets con hash servidos como immutable.');
}

// ── Reporte ────────────────────────────────────────────────────────────
const c = { v: '\x1b[32m', r: '\x1b[31m', a: '\x1b[33m', g: '\x1b[90m', x: '\x1b[0m' };
console.log(`\n${c.g}── Verificación en vivo · ${base}${esLocal ? ' (MODO LOCAL: no certifica)' : ''} ──${c.x}\n`);
for (const m of oks) console.log(`  ${c.v}✓${c.x} ${m}`);
if (avisos.length) {
  console.log(`\n${c.a}Avisos:${c.x}`);
  for (const m of avisos) console.log(`  ${c.a}!${c.x} ${m}`);
}
if (fallos.length) {
  console.log(`\n${c.r}Fallos:${c.x}`);
  for (const m of fallos) console.log(`  ${c.r}✗${c.x} ${m}`);
  console.log(`\n${c.r}HALT — el sitio NO está certificado. ${fallos.length} fallo(s).${c.x}\n`);
  process.exit(1);
}
if (esLocal) console.log(`\n${c.a}Local en verde.${c.x} Esto NO certifica: corre el auditor contra el dominio público.\n`);
else console.log(`\n${c.v}Sitio certificado en vivo.${c.x} ${avisos.length} aviso(s).\n`);
