import type { APIRoute } from 'astro';
import { begin, sql } from '../../lib/db/client';
import { puedeEditar } from '../../lib/roles';
import { auditar } from '../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../lib/http';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const body = await ctx.request.json().catch(() => ({})) as { claves?: string[] };
  const pendientes = await sql()`
    SELECT clave, valor_publicado, valor_borrador FROM contenido WHERE valor_borrador IS NOT NULL
  `;
  const filas = pendientes.filter((p) => puedeEditar(user!, p.clave) && (!body.claves?.length || body.claves.includes(p.clave)));
  if (!filas.length) return json({ error: 'No hay borrador que te toque descartar.' }, 400);

  await begin(async (tx) => {
    for (const fila of filas) {
      await tx`
        UPDATE contenido
        SET valor_borrador = NULL, borrador_por = NULL, borrador_en = NULL, updated_at = now()
        WHERE clave = ${fila.clave}
      `;
    }
  });
  for (const fila of filas) {
    await auditar({
      usuarioId: user!.id,
      accion: 'descartar',
      entidad: 'contenido',
      entidadId: fila.clave,
      antes: fila.valor_borrador,
      despues: fila.valor_publicado,
      ip: ipDe(ctx.request),
    });
  }
  return json({ ok: true, descartados: filas.map((f) => f.clave) });
};
