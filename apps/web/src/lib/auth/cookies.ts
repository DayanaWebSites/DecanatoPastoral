import type { AstroCookies } from 'astro';

export const ACCESS_COOKIE = 'dp_access';
export const REFRESH_COOKIE = 'dp_refresh';

const secure = process.env.NODE_ENV === 'production';

export function setAccessCookie(cookies: AstroCookies, token: string) {
  cookies.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 15 * 60,
  });
}

export function setRefreshCookie(cookies: AstroCookies, token: string) {
  cookies.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(cookies: AstroCookies) {
  cookies.delete(ACCESS_COOKIE, { path: '/' });
  cookies.delete(REFRESH_COOKIE, { path: '/' });
}
