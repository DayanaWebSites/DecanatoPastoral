import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db/client';
import { publicCdnUrl, bucketName } from '../../../lib/storage/presign';
import { auditar } from '../../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const body = await ctx.request.json().catch(() => ({})) as {
    key?: string;
    alt?: string;
    comedor?: string;
    parroquia?: string;
  };
  if (!body.key) return json({ error: 'Falta la clave.' }, 400);
  const tickets = await sql()`
    SELECT * FROM upload_tickets WHERE object_key = ${body.key} AND usuario_id = ${user!.id} LIMIT 1
  `;
  const t = tickets[0];
  if (!t || !t.usado_en) return json({ error: 'Esa subida no está confirmada.' }, 400);
  if (!body.alt || body.alt.trim().length < 10) return json({ error: 'El texto alternativo es obligatorio.' }, 400);

  const ordenRows = await sql()`
    SELECT COALESCE(max(orden), -1) + 1 AS n FROM imagenes
    WHERE comedor_slug = ${body.comedor ?? null} OR parroquia_slug = ${body.parroquia ?? null}
  `;
  const rows = await sql()`
    INSERT INTO imagenes (
      parroquia_slug, comedor_slug, bucket, key, cdn_url, thumb_key, alt, orden,
      procesada, rostros_detectados, sin_rostros_confirmado, publicada, subida_por
    ) VALUES (
      ${body.parroquia ?? null}, ${body.comedor ?? null}, ${bucketName()}, ${body.key},
      ${publicCdnUrl(body.key)}, ${body.key.replace(/\.webp$/i, '-thumb.webp')}, ${body.alt.trim()}, ${ordenRows[0].n},
      true, ${t.rostros_detectados}, ${t.sin_rostros_confirmado}, false, ${user!.id}
    )
    RETURNING *
  `;
  await auditar({
    usuarioId: user!.id,
    accion: 'imagen-alta',
    entidad: 'imagenes',
    entidadId: rows[0].id,
    despues: { key: body.key, rostros: t.rostros_detectados },
    ip: ipDe(ctx.request),
  });
  return json(rows[0]);
};
