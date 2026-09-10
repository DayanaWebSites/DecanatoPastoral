import type { APIRoute } from 'astro';
import { ZodError } from 'zod';
import { begin, sql } from '../../lib/db/client';
import { armarComedor, armarParroquia } from '../../lib/content/assemble';
import { puedePublicar } from '../../lib/roles';
import { auditar } from '../../lib/audit';
import { purgarCachePublica } from '../../lib/cache-purge';
import { exigir, ipDe, json, usuarioDe } from '../../lib/http';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;

  const body = await ctx.request.json().catch(() => ({})) as { claves?: string[] };
  const pendientes = await sql()`
    SELECT clave, parroquia_slug, valor_publicado, valor_borrador
    FROM contenido WHERE valor_borrador IS NOT NULL
  `;
  let claves = body.claves?.length
    ? pendientes.filter((p) => body.claves!.includes(p.clave))
    : pendientes;
  claves = claves.filter((p) => puedePublicar(user!, p.clave));
  if (!claves.length) return json({ error: 'No hay cambios que te toque publicar.' }, 400);

  const fotosPendientes = await sql()`
    SELECT id, key FROM imagenes
    WHERE publicada = false AND procesada = false
      AND (comedor_slug IS NOT NULL OR parroquia_slug IS NOT NULL)
  `;
  if (fotosPendientes.length) {
    return json({ error: 'Hay fotos sin pasar por el difuminado. No se puede publicar.' }, 409);
  }

  const comedores = [...new Set(claves.map((c) => c.clave.split('.')).filter((p) => p[0] === 'comedor' && p[1]).map((p) => p[1]))];
  const parroquias = [...new Set(claves.map((c) => c.clave.split('.')).filter((p) => p[0] === 'parroquia' && p[1]).map((p) => p[1]))];
  const errores: string[] = [];
  for (const slug of comedores) {
    const filas = await sql()`SELECT clave, valor_publicado, valor_borrador FROM contenido WHERE clave LIKE ${`comedor.${slug}.%`}`;
    try { armarComedor(slug, filas, true); }
    catch (e) { errores.push(...zodMsg(e, `comedor ${slug}`)); }
  }
  for (const slug of parroquias) {
    const filas = await sql()`SELECT clave, valor_publicado, valor_borrador FROM contenido WHERE clave LIKE ${`parroquia.${slug}.%`}`;
    try { armarParroquia(slug, filas, true); }
    catch (e) { errores.push(...zodMsg(e, `parroquia ${slug}`)); }
  }
  if (errores.length) return json({ error: 'El borrador no cumple el esquema.', detalle: errores }, 400);

  await begin(async (tx) => {
    for (const fila of claves) {
      await tx`
        UPDATE contenido
        SET valor_publicado = valor_borrador,
            valor_borrador = NULL,
            borrador_por = NULL,
            borrador_en = NULL,
            publicado_en = now(),
            updated_at = now()
        WHERE clave = ${fila.clave} AND valor_borrador IS NOT NULL
      `;
    }
    await tx`
      UPDATE imagenes SET publicada = true
      WHERE procesada = true AND publicada = false
    `;
  });

  for (const fila of claves) {
    await auditar({
      usuarioId: user!.id,
      accion: 'publicar',
      entidad: 'contenido',
      entidadId: fila.clave,
      antes: fila.valor_publicado,
      despues: fila.valor_borrador,
      ip: ipDe(ctx.request),
    });
  }
  await purgarCachePublica();
  return json({ ok: true, publicados: claves.map((c) => c.clave) });
};

function zodMsg(e: unknown, donde: string): string[] {
  if (e instanceof ZodError) {
    return e.issues.map((i) => `${donde} · ${i.path.join('.') || 'campo'}: ${i.message}`);
  }
  return [`${donde}: ${e instanceof Error ? e.message : 'no valida'}`];
}
