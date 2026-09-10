#!/usr/bin/env node
/**
 * C9 · cinco campos, "cerrar navegador", volver, publicar, ver en pública.
 * También colisión 409 y restauración desde historial.
 */
const base = (process.argv[2] || 'http://127.0.0.1:4321').replace(/\/$/, '');
const pass = process.env.PANEL_SEED_PASSWORD;
if (!pass) { console.error('Falta PANEL_SEED_PASSWORD'); process.exit(2); }

async function login(correo) {
  const r = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ correo, password: pass }),
  });
  const cookies = r.headers.getSetCookie?.() || [];
  return { status: r.status, cookie: cookies.map((c) => c.split(';')[0]).join('; ') };
}

const a = await login('angie@decanato.local');
if (a.status !== 200) { console.error('Login Angie', a.status); process.exit(1); }
const h = { 'content-type': 'application/json', cookie: a.cookie };

const original = {};
const claves = [
  ['comedor.san-bernardo.resumen', 'Resumen C9 de prueba local, se revierte al cerrar.'],
  ['comedor.san-bernardo.direccion', 'Calle de prueba C9 100, Guadalajara.'],
  ['comedor.san-bernardo.ciudad', 'Guadalajara C9'],
  ['comedor.san-bernardo.notas', ['Nota C9 uno', 'Nota C9 dos']],
  ['comedor.san-bernardo.comoAyudar', ['Ayuda C9 despensa', 'Ayuda C9 tiempo']],
];

for (const [clave] of claves) {
  const r = await fetch(base + '/api/contenido/' + encodeURIComponent(clave), { headers: { cookie: a.cookie } });
  const row = await r.json();
  original[clave] = row.valor_publicado;
}

for (const [clave, valor] of claves) {
  const r = await fetch(base + '/api/contenido/' + encodeURIComponent(clave), {
    method: 'PUT', headers: h, body: JSON.stringify({ valor }),
  });
  if (r.status !== 200) { console.error('PUT', clave, r.status, await r.text()); process.exit(1); }
}

// "cerrar navegador": nueva sesión, el borrador sigue
const a2 = await login('angie@decanato.local');
const pend = await fetch(base + '/api/contenido/pendientes', { headers: { cookie: a2.cookie } });
const lista = (await pend.json()).pendientes || [];
const hay = claves.every(([c]) => lista.some((p) => p.clave === c));
if (!hay) { console.error('El borrador no sobrevivió a un segundo login.'); process.exit(1); }
console.log('  ✓ Borrador sigue tras "cerrar" y volver');

// Colisión
const b = await login('mario@deltatasker.com');
const row = await fetch(base + '/api/contenido/comedor.san-bernardo.resumen', { headers: { cookie: a2.cookie } });
const { updated_at } = await row.json();
await fetch(base + '/api/contenido/comedor.san-bernardo.resumen', {
  method: 'PUT',
  headers: { 'content-type': 'application/json', cookie: b.cookie },
  body: JSON.stringify({ valor: 'Pisa de otra sesión C9', updated_at }),
});
const choc = await fetch(base + '/api/contenido/comedor.san-bernardo.resumen', {
  method: 'PUT',
  headers: { 'content-type': 'application/json', cookie: a2.cookie },
  body: JSON.stringify({ valor: 'No debería pisar', updated_at }),
});
if (choc.status !== 409) { console.error('Colisión no avisó:', choc.status); process.exit(1); }
console.log('  ✓ Colisión entre dos sesiones: 409');

const pub = await fetch(base + '/api/publicar', {
  method: 'POST',
  headers: { 'content-type': 'application/json', cookie: a2.cookie },
  body: '{}',
});
const pubText = await pub.text();
let pubBody = {};
try { pubBody = JSON.parse(pubText); } catch { console.error('Publicar no JSON', pub.status, pubText); process.exit(1); }
if (!pub.ok) { console.error('Publicar', pub.status, pubBody); process.exit(1); }
console.log('  ✓ Publicados', pubBody.publicados.length, 'campos');

const page = await fetch(base + '/comedores/san-bernardo');
const html = await page.text();
if (!html.includes('Resumen C9 de prueba local') && !html.includes('Ayuda C9 despensa')) {
  console.error('La pública no muestra los 5 cambios.');
  process.exit(1);
}
console.log('  ✓ URL pública refleja el publish');

const hist = await fetch(base + '/api/audit?entidad=contenido', { headers: { cookie: a2.cookie } });
const eventos = (await hist.json()).eventos || [];
const ev = eventos.find((e) => e.entidad_id === 'comedor.san-bernardo.resumen' && e.accion === 'publicar');
if (!ev) { console.error('Sin evento de publish en audit.'); process.exit(1); }
const rest = await fetch(base + '/api/audit', {
  method: 'POST',
  headers: { 'content-type': 'application/json', cookie: a2.cookie },
  body: JSON.stringify({ id: ev.id }),
});
if (!rest.ok) { console.error('Restaurar falló', rest.status); process.exit(1); }
console.log('  ✓ Restaurar desde historial al borrador');

// Volver el comedor a los valores originales y publicar
for (const [clave] of claves) {
  await fetch(base + '/api/contenido/' + encodeURIComponent(clave), {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie: a2.cookie },
    body: JSON.stringify({ valor: original[clave] }),
  });
}
await fetch(base + '/api/publicar', {
  method: 'POST',
  headers: { 'content-type': 'application/json', cookie: a2.cookie },
  body: '{}',
});
console.log('C9 verde. Valores de prueba revertidos.');
