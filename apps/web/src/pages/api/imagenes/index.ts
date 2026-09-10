import type { APIRoute } from 'astro';
import { begin, sql } from '../../../lib/db/client';
import { puedeEditarComedor, puedeEditarParroquia } from '../../../lib/roles';
import { auditar } from '../../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const comedor = ctx.url.searchParams.get('comedor');
  const parroquia = ctx.url.searchParams.get('parroquia');
  const rows = comedor
    ? await sql()`SELECT * FROM imagenes WHERE comedor_slug = ${comedor} ORDER BY orden`
    : parroquia
      ? await sql()`SELECT * FROM imagenes WHERE parroquia_slug = ${parroquia} ORDER BY orden`
      : await sql()`SELECT * FROM imagenes ORDER BY orden`;
  return json({ imagenes: rows });
};

export const POST: APIRoute = async () => {
  return json({ error: 'No se puede subir una foto cruda. Pásala por el difuminado y pide un presign.' }, 403);
};

export const PATCH: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const body = await ctx.request.json().catch(() => ({})) as { orden?: { id: string; orden: number }[]; comedor?: string; parroquia?: string };
  if (body.comedor && !puedeEditarComedor(user!, body.comedor)) return json({ error: 'No te toca.' }, 403);
  if (body.parroquia && !puedeEditarParroquia(user!, body.parroquia)) return json({ error: 'No te toca.' }, 403);
  if (!body.orden?.length) return json({ error: 'Falta el orden.' }, 400);
  await begin(async (tx) => {
    for (const item of body.orden!) {
      await tx`UPDATE imagenes SET orden = ${item.orden} WHERE id = ${item.id}`;
    }
  });
  await auditar({ usuarioId: user!.id, accion: 'imagen-orden', entidad: 'imagenes', despues: body.orden, ip: ipDe(ctx.request) });
  return json({ ok: true });
};
