import type { APIRoute } from 'astro';
import { listarSesiones, revocarSesion } from '../../../lib/auth/session';
import { auditar } from '../../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../../lib/http';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const rows = await listarSesiones(user!.id);
  return json({ sesiones: rows });
};

export const DELETE: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user);
  if (deny) return deny;
  const id = ctx.url.searchParams.get('id');
  if (!id) return json({ error: 'Falta la sesión.' }, 400);
  await revocarSesion(user!.id, id);
  await auditar({ usuarioId: user!.id, accion: 'revocar-sesion', entidad: 'refresh_tokens', entidadId: id, ip: ipDe(ctx.request) });
  return json({ ok: true });
};
