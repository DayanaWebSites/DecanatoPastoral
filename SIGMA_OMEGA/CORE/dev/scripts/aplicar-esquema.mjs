#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../../..');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Falta DATABASE_URL.');
  process.exit(2);
}

const sql = postgres(url, { max: 1 });
const schema = readFileSync(join(root, 'SIGMA_OMEGA/CORE/dev/scripts/panel-schema.sql'), 'utf8');
await sql.unsafe(schema);
const roles = await sql`SELECT slug, nivel FROM roles ORDER BY nivel DESC`;
console.log('Esquema aplicado. Roles:', roles.map((r) => `${r.slug}:${r.nivel}`).join(', '));
await sql.end();
