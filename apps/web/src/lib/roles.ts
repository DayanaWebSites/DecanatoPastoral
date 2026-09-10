import { parroquiaDeClave, parroquiaDeComedor, type Alcance, alcanceDeClave } from './content/keys';

export type RolSlug = 'SUPERMASTER' | 'MASTER' | 'ADMIN' | 'EDITOR_PARROQUIA' | 'SOLO_LECTURA';

export interface UsuarioSesion {
  id: string;
  correo: string;
  nombre: string;
  rol: RolSlug;
  nivel: number;
  parroquias: string[];
  debeCambiarPassword: boolean;
  sesionVersion: number;
}

export const DOMINIOS_SUPERMASTER = ['deltatasker.com', 'eurekasigma.com', 'obsidiancore.com.mx'];

export function esDominioSupermaster(correo: string): boolean {
  const dominio = correo.split('@')[1]?.toLowerCase() ?? '';
  return DOMINIOS_SUPERMASTER.includes(dominio);
}

export function esAdminOMas(u: UsuarioSesion): boolean {
  return u.nivel >= 60;
}

export function puedeLeerBorrador(u: UsuarioSesion): boolean {
  return u.nivel >= 20;
}

export function puedeEditar(usuario: UsuarioSesion, clave: string): boolean {
  if (usuario.nivel < 40) return false;
  if (usuario.nivel >= 60) return true;
  const parroquia = parroquiaDeClave(clave);
  if (!parroquia) return false;
  return usuario.parroquias.includes(parroquia);
}

export function puedePublicar(usuario: UsuarioSesion, clave: string): boolean {
  return puedeEditar(usuario, clave);
}

export function puedeGestionarUsuarios(usuario: UsuarioSesion): boolean {
  return usuario.nivel >= 60;
}

export function puedeVerHistorial(usuario: UsuarioSesion): boolean {
  return usuario.nivel >= 60;
}

export function puedeEditarComedor(usuario: UsuarioSesion, comedorSlug: string): boolean {
  return puedeEditar(usuario, `comedor.${comedorSlug}.resumen`);
}

export function puedeEditarParroquia(usuario: UsuarioSesion, parroquiaSlug: string): boolean {
  return puedeEditar(usuario, `parroquia.${parroquiaSlug}.nombre`);
}

export function clavesDentroDeScope(usuario: UsuarioSesion, claves: string[]): string[] {
  return claves.filter((c) => puedeEditar(usuario, c));
}

export function alcancePermitido(usuario: UsuarioSesion, alcance: Alcance): boolean {
  if (usuario.nivel >= 60) return true;
  if (usuario.nivel < 40) return false;
  if (alcance.tipo === 'global') return false;
  if (alcance.tipo === 'parroquia') return usuario.parroquias.includes(alcance.slug);
  const p = parroquiaDeComedor(alcance.slug);
  return Boolean(p && usuario.parroquias.includes(p));
}

export { alcanceDeClave };
