import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import type { RolSlug, UsuarioSesion } from '../roles';

const ACCESS_TTL_SEC = 15 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface AccessClaims {
  sub: string;
  correo: string;
  nombre: string;
  rol: RolSlug;
  nivel: number;
  parroquias: string[];
  debeCambiarPassword: boolean;
  sesionVersion: number;
}

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error('AUTH_SECRET corto o ausente.');
  return new TextEncoder().encode(s);
}

export async function firmarAccess(u: UsuarioSesion): Promise<string> {
  return new SignJWT({
    correo: u.correo,
    nombre: u.nombre,
    rol: u.rol,
    nivel: u.nivel,
    parroquias: u.parroquias,
    debeCambiarPassword: u.debeCambiarPassword,
    sv: u.sesionVersion,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(u.id)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(secret());
}

export async function leerAccess(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.rol !== 'string') return null;
    return {
      sub: payload.sub,
      correo: String(payload.correo),
      nombre: String(payload.nombre),
      rol: payload.rol as RolSlug,
      nivel: Number(payload.nivel),
      parroquias: Array.isArray(payload.parroquias) ? payload.parroquias.map(String) : [],
      debeCambiarPassword: Boolean(payload.debeCambiarPassword),
      sesionVersion: Number(payload.sv ?? 1),
    };
  } catch {
    return null;
  }
}

export function accessExpiraPronto(token: string): boolean {
  try {
    const parts = token.split('.');
    const body = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return typeof body.exp === 'number' && body.exp * 1000 - Date.now() < 5 * 60 * 1000;
  } catch {
    return true;
  }
}

export function nuevoRefresh(): { raw: string; hash: string; expiresAt: Date } {
  const raw = `${randomUUID()}.${randomBytes(32).toString('hex')}`;
  return {
    raw,
    hash: hashToken(raw),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  };
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function sesionDesdeClaims(c: AccessClaims): UsuarioSesion {
  return {
    id: c.sub,
    correo: c.correo,
    nombre: c.nombre,
    rol: c.rol,
    nivel: c.nivel,
    parroquias: c.parroquias,
    debeCambiarPassword: c.debeCambiarPassword,
    sesionVersion: c.sesionVersion,
  };
}
