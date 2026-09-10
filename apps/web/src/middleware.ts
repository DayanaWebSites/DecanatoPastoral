import { defineMiddleware } from 'astro:middleware';
import { ACCESS_COOKIE, REFRESH_COOKIE, setAccessCookie, setRefreshCookie, clearAuthCookies } from './lib/auth/cookies';
import { accessExpiraPronto, firmarAccess, leerAccess, sesionDesdeClaims } from './lib/auth/tokens';
import { cargarUsuario, rotarRefresh, sesionVersionDe } from './lib/auth/session';
import { auditar } from './lib/audit';
import { hasDatabase } from './lib/db/client';
import { ipDe } from './lib/http';
import type { UsuarioSesion } from './lib/roles';

const PANEL = [/^\/editar(\/|$)/, /^\/auth\/(?!login|recuperar|nueva-clave|refresh)/];
const PUBLIC_AUTH = [/^\/login$/, /^\/auth\/recuperar/, /^\/auth\/nueva-clave/];

export const onRequest = defineMiddleware(async (ctx, next) => {
  if (ctx.isPrerendered) return next();
  const path = ctx.url.pathname;
  let user: UsuarioSesion | null = null;

  const access = ctx.cookies.get(ACCESS_COOKIE)?.value;
  if (access) {
    const claims = await leerAccess(access);
    if (claims) {
      const vigente = !hasDatabase() || (await sesionVersionDe(claims.sub)) === claims.sesionVersion;
      if (vigente) {
        user = sesionDesdeClaims(claims);
        if (accessExpiraPronto(access) && hasDatabase()) {
          const fresco = await cargarUsuario(claims.sub);
          if (fresco) {
            user = fresco;
            setAccessCookie(ctx.cookies, await firmarAccess(fresco));
          }
        }
      }
    }
  }

  if (!user && process.env.DATABASE_URL) {
    const refresh = ctx.cookies.get(REFRESH_COOKIE)?.value;
    if (refresh) {
      const rot = await rotarRefresh(refresh, ipDe(ctx.request), ctx.request.headers.get('user-agent') ?? undefined);
      if (rot.ok) {
        user = await cargarUsuario(rot.usuarioId);
        if (user) {
          setAccessCookie(ctx.cookies, await firmarAccess(user));
          setRefreshCookie(ctx.cookies, rot.raw);
        }
      } else if (rot.motivo === 'reuse' && rot.usuarioId) {
        await auditar({
          usuarioId: rot.usuarioId,
          accion: 'token-reuse-detected',
          entidad: 'refresh_tokens',
          ip: ipDe(ctx.request),
        });
        clearAuthCookies(ctx.cookies);
      }
    }
  }

  ctx.locals.user = user;

  if (PANEL.some((r) => r.test(path)) && !path.startsWith('/api/')) {
    if (!user) {
      return ctx.redirect(`/login?next=${encodeURIComponent(path)}`);
    }
    if (user.debeCambiarPassword && !path.startsWith('/auth/nueva-clave')) {
      return ctx.redirect('/auth/nueva-clave?obligatorio=1');
    }
  }

  if (PUBLIC_AUTH.some((r) => r.test(path)) && user && !user.debeCambiarPassword) {
    return ctx.redirect('/editar');
  }

  const res = await next();
  if (path.startsWith('/editar') || path.startsWith('/auth') || path.startsWith('/login')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('Cache-Control', 'no-store');
  }
  return res;
});
