import type { APIRoute } from 'astro';
import { hashPassword, verifyPassword } from '../../../lib/auth/password';
import { firmarAccess } from '../../../lib/auth/tokens';
import { setAccessCookie, setRefreshCookie } from '../../../lib/auth/cookies';
import { loginPermitido, resetLogin } from '../../../lib/auth/rate-limit';
import { asegurarSupermaster, buscarPorCorreo, cargarUsuario, emitirRefresh, marcarAcceso } from '../../../lib/auth/session';
import { auditar } from '../../../lib/audit';
import { ipDe, json } from '../../../lib/http';
import { hasDatabase } from '../../../lib/db/client';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!hasDatabase()) {
    return json({ error: 'El panel aún no está conectado. Intenta en unos minutos.' }, 503);
  }

  const ip = ipDe(request);
  const cupo = loginPermitido(ip);
  if (!cupo.ok) {
    return json({ error: 'Demasiados intentos. Espera unos minutos.' }, 429, { 'Retry-After': String(cupo.retryAfter) });
  }

  const body = await request.json().catch(() => ({})) as { correo?: string; password?: string };
  const correo = (body.correo ?? '').trim();
  const password = body.password ?? '';
  if (!correo || !password) return json({ error: 'Escribe tu correo y tu contraseña.' }, 400);

  const row = await buscarPorCorreo(correo);
  const dummy = await hashPassword('no-existe');
  const hash = row?.password_hash ?? dummy;
  const ok = await verifyPassword(password, hash);
  if (!row || !row.activo || !ok) {
    await auditar({ accion: 'login-fallido', entidad: 'usuarios', entidadId: correo, ip });
    return json({ error: 'Correo o contraseña no coinciden.' }, 401);
  }

  await asegurarSupermaster(row.id, row.correo);
  const user = await cargarUsuario(row.id);
  if (!user) return json({ error: 'Correo o contraseña no coinciden.' }, 401);

  const access = await firmarAccess(user);
  const refresh = await emitirRefresh(user.id, ip, request.headers.get('user-agent') ?? undefined);
  setAccessCookie(cookies, access);
  setRefreshCookie(cookies, refresh.raw);
  await marcarAcceso(user.id);
  resetLogin(ip);
  await auditar({ usuarioId: user.id, accion: 'login', entidad: 'usuarios', entidadId: user.id, ip });
  return json({ ok: true, nombre: user.nombre, debeCambiarPassword: user.debeCambiarPassword });
};
