import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db/client';
import { hashPassword, verifyPassword } from '../../../lib/auth/password';
import { buscarPorCorreo, cargarUsuario, emitirRefresh, revocarTodos } from '../../../lib/auth/session';
import { firmarAccess } from '../../../lib/auth/tokens';
import { setAccessCookie, setRefreshCookie } from '../../../lib/auth/cookies';
import { auditar } from '../../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const body = await ctx.request.json().catch(() => ({})) as { actual?: string; nueva?: string };
  const nueva = body.nueva ?? '';
  if (nueva.length < 10) return json({ error: 'La contraseña nueva debe tener al menos 10 caracteres.' }, 400);
  const row = await buscarPorCorreo(user!.correo);
  if (!row) return json({ error: 'No encontrado.' }, 404);
  if (!user!.debeCambiarPassword) {
    if (!body.actual || !(await verifyPassword(body.actual, row.password_hash))) {
      return json({ error: 'La contraseña actual no coincide.' }, 400);
    }
  }
  const hashed = await hashPassword(nueva);
  await sql()`UPDATE usuarios SET password_hash = ${hashed}, debe_cambiar_password = false WHERE id = ${user!.id}`;
  await revocarTodos(user!.id);
  const fresco = await cargarUsuario(user!.id);
  if (!fresco) return json({ error: 'No encontrado.' }, 404);
  const refresh = await emitirRefresh(fresco.id, ipDe(ctx.request), ctx.request.headers.get('user-agent') ?? undefined);
  setAccessCookie(ctx.cookies, await firmarAccess(fresco));
  setRefreshCookie(ctx.cookies, refresh.raw);
  await auditar({ usuarioId: user!.id, accion: 'password-cambio', entidad: 'usuarios', entidadId: user!.id, ip: ipDe(ctx.request) });
  return json({ ok: true });
};
