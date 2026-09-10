import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db/client';
import { puedeEditar } from '../../../lib/roles';
import { exigir, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const rows = await sql()`
    SELECT clave, parroquia_slug, valor_publicado, valor_borrador, updated_at
    FROM contenido WHERE valor_borrador IS NOT NULL
    ORDER BY clave
  `;
  return json({ pendientes: rows.filter((r) => puedeEditar(user!, r.clave)) });
};
