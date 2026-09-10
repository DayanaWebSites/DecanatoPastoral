import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db/client';
import { puedeEditarComedor, puedeEditarParroquia } from '../../../lib/roles';
import { nuevaKey, presignPut, publicCdnUrl, storageListo } from '../../../lib/storage/presign';
import { auditar } from '../../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const body = await ctx.request.json().catch(() => ({})) as {
    processed?: boolean;
    rostros?: number;
    sinRostrosConfirmado?: boolean;
    sha256?: string;
    alt?: string;
    comedor?: string;
    parroquia?: string;
    contentType?: string;
  };
  if (!body.processed) return json({ error: 'La foto tiene que pasar por el difuminado antes de subir.' }, 403);
  const rostros = Number(body.rostros ?? 0);
  if (rostros === 0 && !body.sinRostrosConfirmado) {
    return json({ error: 'Confirma que no aparece la cara de ninguna persona atendida.' }, 400);
  }
  if (!body.sha256 || !/^[a-f0-9]{64}$/i.test(body.sha256)) return json({ error: 'Falta la huella de la foto procesada.' }, 400);
  if (!body.alt || body.alt.trim().length < 10) return json({ error: 'Describe qué se ve (mínimo 10 caracteres).' }, 400);
  if (body.comedor && !puedeEditarComedor(user!, body.comedor)) return json({ error: 'No te toca este comedor.' }, 403);
  if (body.parroquia && !puedeEditarParroquia(user!, body.parroquia)) return json({ error: 'No te toca esta parroquia.' }, 403);
  if (!body.comedor && !body.parroquia) return json({ error: 'Indica el comedor o la parroquia.' }, 400);

  if (body.comedor) {
    const n = await sql()`SELECT count(*)::int AS n FROM imagenes WHERE comedor_slug = ${body.comedor}`;
    if (n[0].n >= 12) return json({ error: 'Este comedor ya tiene 12 fotos. Quita una antes de subir otra.' }, 400);
  }

  const key = nuevaKey();
  const expires = new Date(Date.now() + 300 * 1000);
  await sql()`
    INSERT INTO upload_tickets (usuario_id, object_key, sha256, expires_at, rostros_detectados, sin_rostros_confirmado)
    VALUES (${user!.id}, ${key}, ${body.sha256.toLowerCase()}, ${expires}, ${rostros}, ${Boolean(body.sinRostrosConfirmado)})
  `;

  let url: string;
  if (storageListo()) {
    url = await presignPut(key, 'image/webp', 300);
  } else {
    url = `/api/imagenes/local-put?key=${encodeURIComponent(key)}`;
  }

  await auditar({
    usuarioId: user!.id,
    accion: 'presign',
    entidad: 'imagenes',
    entidadId: key,
    despues: { rostros, sinRostrosConfirmado: body.sinRostrosConfirmado },
    ip: ipDe(ctx.request),
  });

  return json({
    url,
    key,
    method: 'PUT',
    headers: { 'content-type': 'image/webp' },
    cdnUrl: publicCdnUrl(key),
    expiresIn: 300,
  });
};
