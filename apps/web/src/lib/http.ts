import type { APIContext } from 'astro';
import { ACCESS_COOKIE, REFRESH_COOKIE, setAccessCookie, setRefreshCookie } from './auth/cookies';
import { accessExpiraPronto, firmarAccess, leerAccess, sesionDesdeClaims } from './auth/tokens';
import { cargarUsuario, rotarRefresh, sesionVersionDe } from './auth/session';
import { auditar } from './audit';
import { hasDatabase } from './db/client';
import type { UsuarioSesion } from './roles';

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

export function ipDe(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '0.0.0.0';
}

export async function usuarioDe(ctx: APIContext | { cookies: APIContext['cookies']; request: Request }): Promise<UsuarioSesion | null> {
  const access = ctx.cookies.get(ACCESS_COOKIE)?.value;
  if (access) {
    const claims = await leerAccess(access);
    if (claims) {
      if (hasDatabase()) {
        const sv = await sesionVersionDe(claims.sub);
        if (sv !== claims.sesionVersion) {
          /* access viejo: cae al refresh */
        } else {
          if (accessExpiraPronto(access)) {
            const u = await cargarUsuario(claims.sub);
            if (u) setAccessCookie(ctx.cookies, await firmarAccess(u));
            return u;
          }
          return sesionDesdeClaims(claims);
        }
      } else {
        return sesionDesdeClaims(claims);
      }
    }
  }
  const refresh = ctx.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;
  const rot = await rotarRefresh(refresh, ipDe(ctx.request), ctx.request.headers.get('user-agent') ?? undefined);
  if (!rot.ok) {
    if (rot.motivo === 'reuse' && rot.usuarioId) {
      await auditar({
        usuarioId: rot.usuarioId,
        accion: 'token-reuse-detected',
        entidad: 'refresh_tokens',
        ip: ipDe(ctx.request),
      });
    }
    return null;
  }
  const u = await cargarUsuario(rot.usuarioId);
  if (!u) return null;
  setAccessCookie(ctx.cookies, await firmarAccess(u));
  setRefreshCookie(ctx.cookies, rot.raw);
  return u;
}

export function exigir(u: UsuarioSesion | null, predicado?: (u: UsuarioSesion) => boolean) {
  if (!u) return json({ error: 'Necesitas entrar.' }, 401);
  if (predicado && !predicado(u)) return json({ error: 'No te toca esto.' }, 403);
  return null;
}
