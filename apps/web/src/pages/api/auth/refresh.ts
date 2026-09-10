import type { APIRoute } from 'astro';
import { REFRESH_COOKIE, clearAuthCookies, setAccessCookie, setRefreshCookie } from '../../../lib/auth/cookies';
import { firmarAccess } from '../../../lib/auth/tokens';
import { cargarUsuario, rotarRefresh } from '../../../lib/auth/session';
import { auditar } from '../../../lib/audit';
import { ipDe, json } from '../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const raw = cookies.get(REFRESH_COOKIE)?.value;
  if (!raw) return json({ error: 'Sin sesión.' }, 401);
  const rot = await rotarRefresh(raw, ipDe(request), request.headers.get('user-agent') ?? undefined);
  if (!rot.ok) {
    if (rot.motivo === 'reuse' && rot.usuarioId) {
      await auditar({ usuarioId: rot.usuarioId, accion: 'token-reuse-detected', entidad: 'refresh_tokens', ip: ipDe(request) });
    }
    clearAuthCookies(cookies);
    return json({ error: 'Sesión cerrada.' }, 401);
  }
  const user = await cargarUsuario(rot.usuarioId);
  if (!user) {
    clearAuthCookies(cookies);
    return json({ error: 'Sesión cerrada.' }, 401);
  }
  setAccessCookie(cookies, await firmarAccess(user));
  setRefreshCookie(cookies, rot.raw);
  await auditar({ usuarioId: user.id, accion: 'refresh-rotation', entidad: 'refresh_tokens', ip: ipDe(request) });
  return json({ ok: true });
};
