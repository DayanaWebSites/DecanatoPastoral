import type { APIRoute } from 'astro';
import { jsonb, sql } from '../../lib/db/client';
import { puedeVerHistorial } from '../../lib/roles';
import { auditar } from '../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../lib/http';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user, puedeVerHistorial);
  if (deny) return deny;
  const entidad = ctx.url.searchParams.get('entidad');
  const usuario = ctx.url.searchParams.get('usuario');
  const desde = ctx.url.searchParams.get('desde');
  const rows = await sql()`
    SELECT a.*, u.nombre, u.correo
    FROM audit_log a
    LEFT JOIN usuarios u ON u.id = a.usuario_id
    WHERE (${entidad}::text IS NULL OR a.entidad = ${entidad})
      AND (${usuario}::text IS NULL OR a.usuario_id::text = ${usuario})
      AND (${desde}::timestamptz IS NULL OR a.creado_en >= ${desde}::timestamptz)
      AND a.creado_en > now() - interval '12 months'
    ORDER BY a.creado_en DESC
    LIMIT 200
  `;
  return json({ eventos: rows });
};

export const POST: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user, puedeVerHistorial);
  if (deny) return deny;
  const body = await ctx.request.json().catch(() => ({})) as { id?: string };
  if (!body.id) return json({ error: 'Falta el evento.' }, 400);
  const rows = await sql()`SELECT * FROM audit_log WHERE id = ${body.id} LIMIT 1`;
  const ev = rows[0];
  if (!ev || ev.entidad !== 'contenido' || !ev.entidad_id) return json({ error: 'Ese evento no se puede restaurar.' }, 400);
  const valor = ev.valor_antes;
  await sql()`
    UPDATE contenido
        SET valor_borrador = ${jsonb(valor)},
        borrador_por = ${user!.id},
        borrador_en = now(),
        updated_at = now()
    WHERE clave = ${ev.entidad_id}
  `;
  await auditar({
    usuarioId: user!.id,
    accion: 'restaurar',
    entidad: 'contenido',
    entidadId: ev.entidad_id,
    antes: ev.valor_despues,
    despues: valor,
    ip: ipDe(ctx.request),
  });
  return json({ ok: true, clave: ev.entidad_id });
};
