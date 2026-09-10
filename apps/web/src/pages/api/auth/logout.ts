import type { APIRoute } from 'astro';
import { REFRESH_COOKIE, clearAuthCookies } from '../../../lib/auth/cookies';
import { revocarRefresh } from '../../../lib/auth/session';
import { auditar } from '../../../lib/audit';
import { ipDe, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const raw = ctx.cookies.get(REFRESH_COOKIE)?.value;
  if (raw) await revocarRefresh(raw);
  if (user) await auditar({ usuarioId: user.id, accion: 'logout', entidad: 'usuarios', entidadId: user.id, ip: ipDe(ctx.request) });
  clearAuthCookies(ctx.cookies);
  return json({ ok: true });
};
