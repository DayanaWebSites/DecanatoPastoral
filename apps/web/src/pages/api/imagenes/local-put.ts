import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { sql } from '../../../lib/db/client';
import { validarImagen } from '../../../lib/storage/mime';
import { normalizarWebp } from '../../../lib/storage/process';
import { usuarioDe } from '../../../lib/http';

export const prerender = false;

const ROOT = process.env.UPLOAD_DIR || join(process.cwd(), 'apps/web/.data/uploads');

export const PUT: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  if (!user) return new Response('Necesitas entrar.', { status: 401 });
  const key = ctx.url.searchParams.get('key');
  if (!key || key.includes('..')) return new Response('Clave inválida.', { status: 400 });

  const tickets = await sql()`
    SELECT id, sha256, usado_en, expires_at FROM upload_tickets
    WHERE object_key = ${key} AND usuario_id = ${user.id} LIMIT 1
  `;
  const ticket = tickets[0];
  if (!ticket) return new Response('Sin permiso de subida.', { status: 403 });
  if (ticket.usado_en) return new Response('Este enlace ya se usó.', { status: 403 });
  if (new Date(ticket.expires_at) < new Date()) return new Response('El enlace expiró.', { status: 403 });

  const buf = new Uint8Array(await ctx.request.arrayBuffer());
  const mime = validarImagen(buf);
  if (!mime.ok) return new Response(mime.error, { status: 415 });
  const sha = createHash('sha256').update(buf).digest('hex');
  if (sha !== ticket.sha256) return new Response('La foto no es la que pasó por el difuminado.', { status: 400 });

  const { webp, thumb } = await normalizarWebp(buf);
  const dest = join(ROOT, key);
  const thumbKey = key.replace(/\.webp$/i, '-thumb.webp');
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, webp);
  await writeFile(join(ROOT, thumbKey), thumb);
  await sql()`UPDATE upload_tickets SET usado_en = now() WHERE id = ${ticket.id}`;
  return new Response(null, { status: 204 });
};
