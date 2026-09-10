export type Alcance =
  | { tipo: 'global' }
  | { tipo: 'parroquia'; slug: string }
  | { tipo: 'comedor'; slug: string };

const COMEDOR_PARROQUIA: Record<string, string> = {
  'casa-san-vicente': 'dulce-nombre-de-jesus',
  'san-bernardo': 'san-bernardo',
  'el-tepeyac': 'el-tepeyac',
};

export function parroquiaDeComedor(slug: string): string | undefined {
  return COMEDOR_PARROQUIA[slug];
}

export function alcanceDeClave(clave: string): Alcance {
  const partes = clave.split('.');
  if (partes[0] === 'parroquia' && partes[1]) return { tipo: 'parroquia', slug: partes[1] };
  if (partes[0] === 'comedor' && partes[1]) return { tipo: 'comedor', slug: partes[1] };
  return { tipo: 'global' };
}

export function parroquiaDeClave(clave: string): string | null {
  const a = alcanceDeClave(clave);
  if (a.tipo === 'parroquia') return a.slug;
  if (a.tipo === 'comedor') return parroquiaDeComedor(a.slug) ?? null;
  return null;
}

export function clavesDeEntidad(prefijo: string, campos: string[]): string[] {
  return campos.map((c) => `${prefijo}.${c}`);
}

export const CAMPOS_COMEDOR = [
  'nombre', 'parroquia', 'orden', 'resumen', 'direccion', 'ciudad',
  'mapaUrl', 'telefono', 'horario', 'cifras', 'jornada', 'notas', 'comoAyudar', 'fotos',
] as const;

export const CAMPOS_PARROQUIA = [
  'nombre', 'orden', 'estado', 'imagen', 'nota', 'comedor', 'direccion',
  'servicios', 'horariosMisa', 'contacto',
] as const;
