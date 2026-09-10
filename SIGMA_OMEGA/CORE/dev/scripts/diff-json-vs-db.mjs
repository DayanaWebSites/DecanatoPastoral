#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../../..');
const web = join(root, 'apps/web/src');
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const rows = await sql`SELECT clave, valor_publicado FROM contenido`;
const map = Object.fromEntries(rows.map((r) => [r.clave, r.valor_publicado]));
let diffs = 0;

function norm(v) {
  if (Array.isArray(v)) return v.map(norm);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k])]));
  }
  return v;
}
function cmp(clave, expected) {
  const got = map[clave];
  if (JSON.stringify(norm(got)) !== JSON.stringify(norm(expected))) {
    console.error('DIFF', clave);
    diffs++;
  }
}

for (const file of readdirSync(join(web, 'content/comedores')).filter((f) => f.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '');
  const data = JSON.parse(readFileSync(join(web, 'content/comedores', file), 'utf8'));
  for (const [k, v] of Object.entries(data)) {
    if (k === 'fotos') continue;
    cmp(`comedor.${slug}.${k}`, v);
  }
}
for (const file of readdirSync(join(web, 'content/parroquias')).filter((f) => f.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '');
  const data = JSON.parse(readFileSync(join(web, 'content/parroquias', file), 'utf8'));
  for (const [k, v] of Object.entries(data)) cmp(`parroquia.${slug}.${k}`, v);
}
cmp('sitio.textos', JSON.parse(readFileSync(join(web, 'data/textos.json'), 'utf8')));
cmp('sitio.decanato', JSON.parse(readFileSync(join(web, 'data/decanato.json'), 'utf8')));
await sql.end();
if (diffs) { console.error('HALT:', diffs, 'diferencias JSON vs base'); process.exit(1); }
console.log('Diff JSON vs base: vacío. Las filas publicadas coinciden con los JSON congelados.');
