import type { APIRoute } from 'astro';
import { jsonb, sql } from '../../../lib/db/client';
import { puedeEditar, puedeLeerBorrador } from '../../../lib/roles';
import { auditar } from '../../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user, puedeLeerBorrador);
  if (deny) return deny;
  const clave = ctx.params.clave;
  if (!clave) return json({ error: 'Falta la clave.' }, 400);
  const rows = await sql()`SELECT * FROM contenido WHERE clave = ${clave} LIMIT 1`;
  if (!rows[0]) return json({ error: 'No existe.' }, 404);
  return json(rows[0]);
};

export const PUT: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const clave = ctx.params.clave;
  if (!clave) return json({ error: 'Falta la clave.' }, 400);
  if (!puedeEditar(user!, clave)) return json({ error: 'No te toca este contenido.' }, 403);

  const body = await ctx.request.json().catch(() => ({})) as { valor?: unknown; updated_at?: string };
  if (body.valor === undefined) return json({ error: 'Falta el valor.' }, 400);

  const rows = await sql()`SELECT id, valor_publicado, valor_borrador, updated_at FROM contenido WHERE clave = ${clave} LIMIT 1`;
  const row = rows[0];
  if (!row) return json({ error: 'No existe.' }, 404);

  if (body.updated_at && new Date(body.updated_at).getTime() !== new Date(row.updated_at).getTime()) {
    return json({
      error: 'conflicto',
      mensaje: 'Alguien más editó esto mientras trabajabas.',
      actual: row.valor_borrador ?? row.valor_publicado,
      updated_at: row.updated_at,
    }, 409);
  }

  const updated = await sql()`
    UPDATE contenido
    SET valor_borrador = ${jsonb(body.valor)},
        borrador_por = ${user!.id},
        borrador_en = now(),
        updated_at = now()
    WHERE clave = ${clave}
    RETURNING clave, valor_borrador, updated_at
  `;
  await auditar({
    usuarioId: user!.id,
    accion: 'borrador',
    entidad: 'contenido',
    entidadId: clave,
    antes: row.valor_borrador ?? row.valor_publicado,
    despues: body.valor,
    ip: ipDe(ctx.request),
  });
  return json(updated[0]);
};
