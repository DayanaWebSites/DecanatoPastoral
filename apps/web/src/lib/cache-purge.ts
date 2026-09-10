import { mkdir, readdir, rm, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { sql } from './db/client';

const CACHE_DIR = process.env.NGINX_CACHE_DIR || '/var/cache/nginx/decanato';

export async function bumpCacheVersion(): Promise<string> {
  const rows = await sql()`
    UPDATE cache_meta SET valor = (COALESCE(valor, '0')::int + 1)::text, updated_at = now()
    WHERE clave = 'version'
    RETURNING valor
  `;
  return String(rows[0]?.valor ?? '1');
}

export async function cacheVersion(): Promise<string> {
  const rows = await sql()`SELECT valor FROM cache_meta WHERE clave = 'version'`;
  return String(rows[0]?.valor ?? '1');
}

/** Purga archivos de la zona, sin borrar el directorio (nginx se cae si desaparece). */
export async function purgarCachePublica() {
  await bumpCacheVersion();
  try {
    const entries = await readdir(CACHE_DIR, { withFileTypes: true });
    await Promise.all(entries.map((e) => {
      const p = join(CACHE_DIR, e.name);
      return e.isDirectory() ? rm(p, { recursive: true, force: true }) : unlink(p);
    }));
    await mkdir(CACHE_DIR, { recursive: true });
  } catch {
    /* en local sin nginx no hay zona */
  }
}
