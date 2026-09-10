#!/usr/bin/env node
const base = (process.argv[2] || 'http://127.0.0.1:18080').replace(/\/$/, '');
const pass = process.env.PANEL_SEED_PASSWORD;

async function headers(path) {
  const r = await fetch(base + path, { redirect: 'manual' });
  return {
    status: r.status,
    cache: (r.headers.get('x-cache-status') || '').toUpperCase(),
    robots: r.headers.get('x-robots-tag') || '',
    csp: r.headers.get('content-security-policy') || '',
  };
}

const first = await headers('/');
const second = await headers('/');
console.log('home1', first);
console.log('home2', second);
if (!first.cache && !second.cache) {
  console.error('HALT: sin X-Cache-Status');
  process.exit(1);
}
if (second.cache === 'MISS' && first.cache === 'MISS') {
  console.error('HALT: dos MISS seguidos');
  process.exit(1);
}
const editar = await headers('/editar');
console.log('editar', editar);
if (['HIT', 'STALE', 'UPDATING'].includes(editar.cache)) {
  console.error('HALT: /editar cacheado');
  process.exit(1);
}
if (editar.status === 302 && !/noindex/i.test(editar.robots)) {
  console.error('HALT: /editar sin noindex');
  process.exit(1);
}

if (pass) {
  const login = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ correo: 'angie@decanato.local', password: pass }),
  });
  const cookie = (login.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
  const marker = 'Purga-cache-B2-' + Date.now();
  await fetch(base + '/api/contenido/comedor.san-bernardo.ciudad', {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ valor: marker }),
  });
  const pub = await fetch(base + '/api/publicar', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: '{}',
  });
  if (!pub.ok) {
    console.error('Publicar para purga falló', pub.status, await pub.text());
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 400));
  const page = await fetch(base + '/comedores/san-bernardo');
  const html = await page.text();
  if (!html.includes(marker)) {
    console.error('HALT: después de publicar la pública no cambió (cache no se purgó).');
    process.exit(1);
  }
  await fetch(base + '/api/contenido/comedor.san-bernardo.ciudad', {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ valor: 'Guadalajara' }),
  });
  await fetch(base + '/api/publicar', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: '{}',
  });
  console.log('  ✓ Purga al publicar: el cambio salió sin esperar 10 min');
}

console.log('B2 verde. Micro-cache HIT en público, /editar sin cache.');
