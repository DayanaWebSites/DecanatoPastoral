#!/usr/bin/env node
const base = (process.argv[2] || 'http://127.0.0.1:4321').replace(/\/$/, '');
const pass = process.env.PANEL_SEED_PASSWORD;
const r = await fetch(base + '/api/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ correo: 'angie@decanato.local', password: pass }),
});
const cookies = r.headers.getSetCookie?.() || [];
const refresh = cookies.find((c) => c.startsWith('dp_refresh='))?.split(';')[0];
if (!refresh) { console.error('Sin refresh'); process.exit(1); }
const header = cookies.map((c) => c.split(';')[0]).join('; ');
const r1 = await fetch(base + '/api/auth/refresh', {
  method: 'POST',
  headers: { cookie: header, origin: base },
});
if (!r1.ok) { console.error('Primera rotación falló', r1.status, await r1.text()); process.exit(1); }
const r2 = await fetch(base + '/api/auth/refresh', { method: 'POST', headers: { cookie: header } });
if (r2.status !== 401) { console.error('Reuse no revocó. status=', r2.status); process.exit(1); }
console.log('Reuse de refresh: 401 y cadena revocada.');
