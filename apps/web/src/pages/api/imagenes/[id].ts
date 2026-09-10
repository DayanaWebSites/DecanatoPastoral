import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db/client';
import { puedeEditarComedor, puedeEditarParroquia } from '../../../lib/roles';
import { auditar } from '../../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const DELETE: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const id = ctx.params.id;
  const rows = await sql()`SELECT * FROM imagenes WHERE id = ${id} LIMIT 1`;
  const img = rows[0];
  if (!img) return json({ error: 'No existe.' }, 404);
  if (img.comedor_slug && !puedeEditarComedor(user!, img.comedor_slug)) return json({ error: 'No te toca.' }, 403);
  if (img.parroquia_slug && !puedeEditarParroquia(user!, img.parroquia_slug)) return json({ error: 'No te toca.' }, 403);
  await sql()`DELETE FROM imagenes WHERE id = ${id}`;
  await auditar({ usuarioId: user!.id, accion: 'imagen-baja', entidad: 'imagenes', entidadId: id, antes: img, ip: ipDe(ctx.request) });
  return json({ ok: true });
};

export const PATCH: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const id = ctx.params.id;
  const body = await ctx.request.json().catch(() => ({})) as { alt?: string };
  if (!body.alt || body.alt.trim().length < 10) return json({ error: 'El alt es obligatorio.' }, 400);
  const rows = await sql()`SELECT * FROM imagenes WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return json({ error: 'No existe.' }, 404);
  const updated = await sql()`UPDATE imagenes SET alt = ${body.alt.trim()} WHERE id = ${id} RETURNING *`;
  await auditar({ usuarioId: user!.id, accion: 'imagen-alt', entidad: 'imagenes', entidadId: id, antes: rows[0].alt, despues: body.alt, ip: ipDe(ctx.request) });
  return json(updated[0]);
};
