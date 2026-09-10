#!/usr/bin/env node
/**
 * E1 · intentar romper scoping, sesión y subida. Contra un origen local.
 * Uso: node e1-seguridad.mjs http://127.0.0.1:4321
 */
const base = (process.argv[2] || 'http://127.0.0.1:4321').replace(/\/$/, '');
const pass = process.env.PANEL_SEED_PASSWORD;
if (!pass) { console.error('Falta PANEL_SEED_PASSWORD'); process.exit(2); }

const fallos = [];
const ok = (m) => console.log('  ✓', m);
const falla = (m) => { console.log('  ✗', m); fallos.push(m); };

async function login(correo) {
  const r = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ correo, password: pass }),
  });
  return { status: r.status, cookies: r.headers.getSetCookie?.() || r.headers.get('set-cookie'), body: await r.json().catch(() => ({})) };
}

function cookieHeader(setCookie) {
  if (!setCookie) return '';
  const list = Array.isArray(setCookie) ? setCookie : [setCookie];
  return list.map((c) => c.split(';')[0]).join('; ');
}

const editor = await login('editor.bernardo@decanato.local');
const lector = await login('lector@decanato.local');
const angie = await login('angie@decanato.local');
if (editor.status !== 200) falla('Login editor falló: ' + editor.status);
else ok('Login editor');
if (lector.status !== 200) falla('Login lector falló');
else ok('Login lector');
if (angie.status !== 200) falla('Login admin falló');
else ok('Login admin');

const ckEd = cookieHeader(editor.cookies);
const ckLe = cookieHeader(lector.cookies);

let r = await fetch(base + '/api/contenido/parroquia.el-tepeyac.servicios', {
  method: 'PUT', headers: { 'content-type': 'application/json', cookie: ckEd },
  body: JSON.stringify({ valor: ['probando'] }),
});
if (r.status !== 403) falla(`Editor vs Tepeyac: ${r.status} (debía 403)`);
else ok('EDITOR_PARROQUIA no edita El Tepeyac');

r = await fetch(base + '/api/publicar', {
  method: 'POST', headers: { 'content-type': 'application/json', cookie: ckEd },
  body: JSON.stringify({ claves: ['sitio.textos'] }),
});
if (r.status !== 400 && r.status !== 403) falla(`Editor publica home: ${r.status}`);
else ok('EDITOR no publica contenido global');

r = await fetch(base + '/api/usuarios', { headers: { cookie: ckEd } });
if (r.status !== 403) falla(`Editor lista usuarios: ${r.status}`);
else ok('EDITOR no lista usuarios');

r = await fetch(base + '/api/contenido/comedor.san-bernardo.resumen', {
  method: 'PUT', headers: { 'content-type': 'application/json', cookie: ckLe },
  body: JSON.stringify({ valor: 'x' }),
});
if (r.status !== 403) falla(`Lector escribe: ${r.status}`);
else ok('SOLO_LECTURA no escribe');

r = await fetch(base + '/api/publicar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
if (![401, 403].includes(r.status)) falla(`Publicar sin sesión: ${r.status}`);
else ok('Escritura sin sesión rechazada');

r = await fetch(base + '/api/imagenes', { method: 'POST', headers: { 'content-type': 'application/json', cookie: ckEd }, body: '{}' });
if (r.status !== 403) falla(`POST crudo imágenes: ${r.status}`);
else ok('POST de foto cruda rechazado');

r = await fetch(base + '/api/imagenes/presign', {
  method: 'POST', headers: { 'content-type': 'application/json', cookie: ckEd },
  body: JSON.stringify({ processed: false, sha256: 'a'.repeat(64), alt: 'descripcion larga', comedor: 'san-bernardo' }),
});
if (r.status !== 403) falla(`Presign sin difuminar: ${r.status}`);
else ok('Presign sin difuminar rechazado');

// JWT manipulado
const fake = 'eyJhbGciOiJub25lIn0.' + Buffer.from(JSON.stringify({ sub: 'x', rol: 'SUPERMASTER', nivel: 100, parroquias: [] })).toString('base64url') + '.x';
r = await fetch(base + '/api/usuarios', { headers: { cookie: `dp_access=${fake}` } });
if (![401, 403].includes(r.status)) falla(`JWT falso: ${r.status}`);
else ok('JWT manipulado rechazado');

// XSS: guardar script como borrador con admin y leer
const ckAn = cookieHeader(angie.cookies);
r = await fetch(base + '/api/contenido/comedor.san-bernardo.resumen', {
  method: 'PUT', headers: { 'content-type': 'application/json', cookie: ckAn },
  body: JSON.stringify({ valor: '<script>alert(1)</script>' }),
});
if (r.status !== 200) falla('No se pudo guardar payload XSS de prueba: ' + r.status);
else {
  const pub = await fetch(base + '/editar/comedores/san-bernardo', { headers: { cookie: ckAn } });
  const html = await pub.text();
  if (html.includes('<script>alert(1)</script>') && !html.includes('&lt;script&gt;')) {
    falla('El script se renderizó sin escapar.');
  } else ok('Texto con <script> queda escapado');
  await fetch(base + '/api/descartar', { method: 'POST', headers: { 'content-type': 'application/json', cookie: ckAn }, body: JSON.stringify({ claves: ['comedor.san-bernardo.resumen'] }) });
}

// Refresh reuse
{
  const reuseLogin = await login('editor.bernardo@decanato.local');
  const list = Array.isArray(reuseLogin.cookies) ? reuseLogin.cookies : [reuseLogin.cookies].filter(Boolean);
  const header = cookieHeader(reuseLogin.cookies);
  const refreshLine = list.find((c) => String(c).startsWith('dp_refresh='));
  if (!refreshLine) falla('Login no emitió dp_refresh');
  else {
    const r1 = await fetch(base + '/api/auth/refresh', { method: 'POST', headers: { cookie: header } });
    if (!r1.ok) falla('Primera rotación de refresh falló: ' + r1.status);
    else {
      const r2 = await fetch(base + '/api/auth/refresh', { method: 'POST', headers: { cookie: header } });
      if (r2.status !== 401) falla(`Reuse de refresh: ${r2.status} (debía 401)`);
      else ok('Reuse de refresh revoca la cadena');
    }
  }
}

// Cookies httpOnly
{
  const list = Array.isArray(editor.cookies) ? editor.cookies : [editor.cookies].filter(Boolean);
  const access = list.find((c) => String(c).startsWith('dp_access=')) || '';
  if (!/httponly/i.test(access)) falla('dp_access no es httpOnly');
  else ok('Cookie de acceso es httpOnly');
}

// Ticket de un solo uso + MIME + tamaño
{
  const { createHash } = await import('node:crypto');
  const sharp = (await import('sharp')).default;
  const ck = cookieHeader(editor.cookies);
  const php = Buffer.from('<?php echo 1;');
  const preBad = await fetch(base + '/api/imagenes/presign', {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: ck },
    body: JSON.stringify({
      processed: true, rostros: 1, sha256: 'ab'.repeat(32),
      alt: 'Foto de prueba del candado de subida', comedor: 'san-bernardo',
    }),
  });
  const badBody = await preBad.json().catch(() => ({}));
  if (preBad.ok && badBody.url) {
    const bad = await fetch(base + badBody.url, { method: 'PUT', headers: { cookie: ck, 'content-type': 'image/webp' }, body: php });
    if (![400, 415].includes(bad.status)) falla(`MIME falso aceptado: ${bad.status}`);
    else ok('PUT con bytes que no son foto: rechazado');
    const huge = Buffer.alloc(11 * 1024 * 1024, 0xff);
    huge[0] = 0xff; huge[1] = 0xd8; huge[2] = 0xff;
    const big = await fetch(base + badBody.url, { method: 'PUT', headers: { cookie: ck, 'content-type': 'image/jpeg' }, body: huge });
    if (![400, 413, 415].includes(big.status)) falla(`Archivo >10MB aceptado: ${big.status}`);
    else ok('Archivo de más de 10 MB rechazado');
  } else falla('Presign de prueba MIME falló: ' + preBad.status);

  const webp = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#04551F' } }).webp({ quality: 80 }).toBuffer();
  const sha = createHash('sha256').update(webp).digest('hex');
  const pre = await fetch(base + '/api/imagenes/presign', {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: ck },
    body: JSON.stringify({
      processed: true, rostros: 1, sha256: sha,
      alt: 'Miniatura de prueba del ticket de un uso', comedor: 'san-bernardo',
    }),
  });
  const body = await pre.json().catch(() => ({}));
  if (!pre.ok || !body.url) falla('Presign de ticket falló: ' + pre.status);
  else {
    const put1 = await fetch(base + body.url, { method: 'PUT', headers: { cookie: ck, 'content-type': 'image/webp' }, body: webp });
    if (![200, 204].includes(put1.status)) falla('PUT válido del ticket falló: ' + put1.status);
    const put2 = await fetch(base + body.url, { method: 'PUT', headers: { cookie: ck, 'content-type': 'image/webp' }, body: webp });
    if (put2.status !== 403) falla(`Ticket reusado: ${put2.status} (debía 403)`);
    else ok('Ticket de subida de un solo uso');
  }
}

// Cambiar contraseña tumba las otras sesiones
{
  const a = await login('lector@decanato.local');
  const b = await login('lector@decanato.local');
  const ckA = cookieHeader(a.cookies);
  const ckB = cookieHeader(b.cookies);
  const ch = await fetch(base + '/api/auth/cambiar-password', {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: ckA },
    body: JSON.stringify({ actual: pass, nueva: pass + '-x' }),
  });
  if (!ch.ok) falla('Cambio de contraseña falló: ' + ch.status);
  else {
    const probe = await fetch(base + '/api/contenido/comedor.san-bernardo.resumen', { headers: { cookie: ckB } });
    if (![401, 403].includes(probe.status)) falla(`Sesión B sobrevivió al cambio de clave: ${probe.status}`);
    else ok('Cambiar contraseña tumba las otras sesiones');
    const ckNew = cookieHeader(ch.headers.getSetCookie?.() || []);
    await fetch(base + '/api/auth/cambiar-password', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ckNew || ckA },
      body: JSON.stringify({ actual: pass + '-x', nueva: pass }),
    });
  }
}

// Rate limit
let blocked = false;
for (let i = 0; i < 6; i++) {
  const lr = await fetch(base + '/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ correo: 'nadie@x.com', password: 'mala' }),
  });
  if (lr.status === 429) blocked = true;
}
if (!blocked) falla('Rate limit del login no disparó a los 6 intentos.');
else ok('Rate limit del login a los 6 intentos');

if (fallos.length) {
  console.error('\nHALT E1 —', fallos.length, 'fallo(s)');
  process.exit(1);
}
console.log('\nE1 verde.');
