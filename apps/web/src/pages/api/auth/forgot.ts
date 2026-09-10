import type { APIRoute } from 'astro';
import { createHash, randomBytes } from 'node:crypto';
import { sql } from '../../../lib/db/client';
import { buscarPorCorreo } from '../../../lib/auth/session';
import { auditar } from '../../../lib/audit';
import { ipDe, json } from '../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({})) as { correo?: string };
  const correo = (body.correo ?? '').trim();
  const generico = { ok: true, mensaje: 'Si esa cuenta existe, recibirás un enlace.' };
  if (!correo) return json(generico);

  const row = await buscarPorCorreo(correo);
  if (!row || !row.activo) return json(generico);

  const raw = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(raw).digest('hex');
  const exp = new Date(Date.now() + 60 * 60 * 1000);
  await sql()`
    INSERT INTO password_reset_tokens (usuario_id, token_hash, expires_at)
    VALUES (${row.id}, ${hash}, ${exp})
  `;
  await auditar({ usuarioId: row.id, accion: 'password-reset-pedido', entidad: 'usuarios', entidadId: row.id, ip: ipDe(request) });

  const url = new URL('/auth/nueva-clave', process.env.PUBLIC_SITE_URL || request.url);
  url.searchParams.set('token', raw);
  return json({
    ...generico,
    ...(process.env.NODE_ENV !== 'production' ? { devUrl: url.toString() } : {}),
  });
};
