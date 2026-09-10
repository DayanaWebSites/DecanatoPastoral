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

function destinoSeguro(raw: string) {
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/editar';
  return raw;
}

async function leerCredenciales(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const body = await request.json().catch(() => ({})) as { correo?: string; password?: string; next?: string };
    return {
      correo: (body.correo ?? '').trim(),
      password: body.password ?? '',
      next: destinoSeguro(body.next ?? '/editar'),
      viaForm: false,
    };
  }
  const fd = await request.formData().catch(() => null);
  return {
    correo: String(fd?.get('correo') ?? '').trim(),
    password: String(fd?.get('password') ?? ''),
    next: destinoSeguro(String(fd?.get('next') ?? '/editar')),
    viaForm: true,
  };
}

function fallo(viaForm: boolean, url: string, payload: unknown, status: number, headers?: Record<string, string>) {
  if (viaForm) return new Response(null, { status: 303, headers: { location: url } });
  return json(payload, status, headers);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const { correo, password, next, viaForm } = await leerCredenciales(request);

  if (!hasDatabase()) {
    return fallo(viaForm, '/login?error=conexion', { error: 'El panel aún no está conectado. Intenta en unos minutos.' }, 503);
  }

  const ip = ipDe(request);
  const cupo = loginPermitido(ip);
  if (!cupo.ok) {
    return fallo(viaForm, '/login?error=limite', { error: 'Demasiados intentos. Espera unos minutos.' }, 429, { 'Retry-After': String(cupo.retryAfter) });
  }

  if (!correo || !password) {
    return fallo(viaForm, '/login?error=faltan', { error: 'Escribe tu correo y tu contraseña.' }, 400);
  }

  const row = await buscarPorCorreo(correo);
  const dummy = await hashPassword('no-existe');
  const hash = row?.password_hash ?? dummy;
  const ok = await verifyPassword(password, hash);
  if (!row || !row.activo || !ok) {
    await auditar({ accion: 'login-fallido', entidad: 'usuarios', entidadId: correo, ip });
    return fallo(viaForm, '/login?error=credenciales', { error: 'Correo o contraseña no coinciden.' }, 401);
  }

  await asegurarSupermaster(row.id, row.correo);
  const user = await cargarUsuario(row.id);
  if (!user) {
    return fallo(viaForm, '/login?error=credenciales', { error: 'Correo o contraseña no coinciden.' }, 401);
  }

  const access = await firmarAccess(user);
  const refresh = await emitirRefresh(user.id, ip, request.headers.get('user-agent') ?? undefined);
  setAccessCookie(cookies, access);
  setRefreshCookie(cookies, refresh.raw);
  await marcarAcceso(user.id);
  resetLogin(ip);
  await auditar({ usuarioId: user.id, accion: 'login', entidad: 'usuarios', entidadId: user.id, ip });

  if (viaForm) {
    const dest = user.debeCambiarPassword ? '/auth/nueva-clave?obligatorio=1' : next;
    return new Response(null, { status: 303, headers: { location: dest } });
  }
  return json({ ok: true, nombre: user.nombre, debeCambiarPassword: user.debeCambiarPassword });
};
