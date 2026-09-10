import type { APIRoute } from 'astro';
import { clearAuthCookies } from '../../../lib/auth/cookies';
import { revocarTodos } from '../../../lib/auth/session';
import { auditar } from '../../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  await revocarTodos(user!.id);
  await auditar({ usuarioId: user!.id, accion: 'logout-all', entidad: 'usuarios', entidadId: user!.id, ip: ipDe(ctx.request) });
  clearAuthCookies(ctx.cookies);
  return json({ ok: true });
};
