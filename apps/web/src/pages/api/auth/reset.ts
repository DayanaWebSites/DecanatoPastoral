import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { begin, sql } from '../../../lib/db/client';
import { hashPassword } from '../../../lib/auth/password';
import { revocarTodos } from '../../../lib/auth/session';
import { auditar } from '../../../lib/audit';
import { ipDe, json } from '../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({})) as { token?: string; password?: string };
  const token = body.token ?? '';
  const password = body.password ?? '';
  if (password.length < 10) return json({ error: 'La contraseña debe tener al menos 10 caracteres.' }, 400);
  if (!token) return json({ error: 'Falta el enlace de recuperación.' }, 400);

  const hash = createHash('sha256').update(token).digest('hex');
  const rows = await sql()`
    SELECT id, usuario_id, expires_at, used_at
    FROM password_reset_tokens WHERE token_hash = ${hash} LIMIT 1
  `;
  const row = rows[0];
  if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
    return json({ error: 'Ese enlace ya no sirve. Pide uno nuevo.' }, 400);
  }
  const hashed = await hashPassword(password);
  await begin(async (tx) => {
    await tx`UPDATE usuarios SET password_hash = ${hashed}, debe_cambiar_password = false WHERE id = ${row.usuario_id}`;
    await tx`UPDATE password_reset_tokens SET used_at = now() WHERE id = ${row.id}`;
  });
  await revocarTodos(row.usuario_id);
  await auditar({ usuarioId: row.usuario_id, accion: 'password-reset', entidad: 'usuarios', entidadId: row.usuario_id, ip: ipDe(request) });
  return json({ ok: true });
};
