import { getCollection } from 'astro:content';
import { hasDatabase, sql } from '../db/client';
import { armarComedor, armarParroquia, slugsDesdeClaves, type FilaContenido } from './assemble';
import type { ComedorData, ContentEntry, ParroquiaData } from './zod';
import decanatoJson from '../../data/decanato.json';
import textosJson from '../../data/textos.json';

async function filas(like: string): Promise<FilaContenido[]> {
  return sql()`
    SELECT clave, valor_publicado, valor_borrador
    FROM contenido WHERE clave LIKE ${like}
  `;
}

export async function loadComedores(opts: { borrador?: boolean } = {}): Promise<ContentEntry<ComedorData>[]> {
  if (!hasDatabase()) {
    const col = await getCollection('comedores');
    return col.map((c) => ({ id: c.id, data: c.data })).sort((a, b) => a.data.orden - b.data.orden);
  }
  const rows = await filas('comedor.%');
  return slugsDesdeClaves(rows, 'comedor')
    .map((slug) => armarComedor(slug, rows, opts.borrador))
    .sort((a, b) => a.data.orden - b.data.orden);
}

export async function loadComedor(slug: string, opts: { borrador?: boolean } = {}): Promise<ContentEntry<ComedorData> | null> {
  if (!hasDatabase()) {
    const col = await getCollection('comedores');
    const c = col.find((x) => x.id === slug);
    return c ? { id: c.id, data: c.data } : null;
  }
  const rows = await filas(`comedor.${slug}.%`);
  if (!rows.length) return null;
  return armarComedor(slug, rows, opts.borrador);
}

export async function loadParroquias(opts: { borrador?: boolean } = {}): Promise<ContentEntry<ParroquiaData>[]> {
  if (!hasDatabase()) {
    const col = await getCollection('parroquias');
    return col.map((c) => ({ id: c.id, data: c.data })).sort((a, b) => a.data.orden - b.data.orden);
  }
  const rows = await filas('parroquia.%');
  return slugsDesdeClaves(rows, 'parroquia')
    .map((slug) => armarParroquia(slug, rows, opts.borrador))
    .sort((a, b) => a.data.orden - b.data.orden);
}

export async function loadParroquia(slug: string, opts: { borrador?: boolean } = {}): Promise<ContentEntry<ParroquiaData> | null> {
  if (!hasDatabase()) {
    const col = await getCollection('parroquias');
    const c = col.find((x) => x.id === slug);
    return c ? { id: c.id, data: c.data } : null;
  }
  const rows = await filas(`parroquia.${slug}.%`);
  if (!rows.length) return null;
  return armarParroquia(slug, rows, opts.borrador);
}

export async function loadTextos(opts: { borrador?: boolean } = {}): Promise<typeof textosJson> {
  if (!hasDatabase()) return textosJson;
  const rows = await filas('sitio.textos%');
  const fila = rows.find((r) => r.clave === 'sitio.textos');
  if (!fila) return textosJson;
  const valor = opts.borrador && fila.valor_borrador != null ? fila.valor_borrador : fila.valor_publicado;
  return valor as typeof textosJson;
}

export async function loadDecanato(opts: { borrador?: boolean } = {}): Promise<typeof decanatoJson> {
  if (!hasDatabase()) return decanatoJson;
  const rows = await filas('sitio.decanato');
  const fila = rows[0];
  if (!fila) return decanatoJson;
  const valor = opts.borrador && fila.valor_borrador != null ? fila.valor_borrador : fila.valor_publicado;
  return valor as typeof decanatoJson;
}

export async function contarBorradores(scope?: { parroquia?: string | null }): Promise<number> {
  if (!hasDatabase()) return 0;
  if (scope?.parroquia) {
    const rows = await sql()`
      SELECT count(*)::int AS n FROM contenido
      WHERE valor_borrador IS NOT NULL AND parroquia_slug = ${scope.parroquia}
    `;
    return rows[0].n;
  }
  const rows = await sql()`SELECT count(*)::int AS n FROM contenido WHERE valor_borrador IS NOT NULL`;
  return rows[0].n;
}
