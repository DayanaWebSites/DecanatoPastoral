import { comedorSchema, parroquiaSchema, type ComedorData, type ContentEntry, type ParroquiaData } from './zod';
import { CAMPOS_COMEDOR, CAMPOS_PARROQUIA } from './keys';

export type FilaContenido = {
  clave: string;
  valor_publicado: unknown;
  valor_borrador?: unknown | null;
};

function valorDe(fila: FilaContenido, usarBorrador: boolean) {
  if (usarBorrador && fila.valor_borrador != null) return fila.valor_borrador;
  return fila.valor_publicado;
}

function mapaPorPrefijo(filas: FilaContenido[], prefijo: string, usarBorrador: boolean) {
  const out: Record<string, unknown> = {};
  const head = `${prefijo}.`;
  for (const f of filas) {
    if (!f.clave.startsWith(head)) continue;
    out[f.clave.slice(head.length)] = valorDe(f, usarBorrador);
  }
  return out;
}

export function armarComedor(slug: string, filas: FilaContenido[], usarBorrador = false): ContentEntry<ComedorData> {
  const raw = mapaPorPrefijo(filas, `comedor.${slug}`, usarBorrador);
  const parsed = comedorSchema.parse(raw);
  return { id: slug, data: parsed };
}

export function armarParroquia(slug: string, filas: FilaContenido[], usarBorrador = false): ContentEntry<ParroquiaData> {
  const raw = mapaPorPrefijo(filas, `parroquia.${slug}`, usarBorrador);
  const parsed = parroquiaSchema.parse(raw);
  return { id: slug, data: parsed };
}

export function slugsDesdeClaves(filas: FilaContenido[], tipo: 'comedor' | 'parroquia'): string[] {
  const set = new Set<string>();
  for (const f of filas) {
    const p = f.clave.split('.');
    if (p[0] === tipo && p[1]) set.add(p[1]);
  }
  return [...set];
}

export function aplanarComedor(slug: string, data: ComedorData): { clave: string; tipo: string; parroquia: string | null; valor: unknown }[] {
  const parroquia = typeof data.parroquia === 'string' ? slugDeParroquiaNombre(data.parroquia) : slug;
  return CAMPOS_COMEDOR.map((campo) => ({
    clave: `comedor.${slug}.${campo}`,
    tipo: tipoDeValor(data[campo]),
    parroquia,
    valor: data[campo] ?? null,
  }));
}

export function aplanarParroquia(slug: string, data: ParroquiaData) {
  return CAMPOS_PARROQUIA.map((campo) => ({
    clave: `parroquia.${slug}.${campo}`,
    tipo: tipoDeValor(data[campo]),
    parroquia: slug,
    valor: data[campo] ?? null,
  }));
}

export function aplanarSitio(seccion: string, valor: unknown, campo?: string) {
  const clave = campo ? `sitio.${seccion}.${campo}` : `sitio.${seccion}`;
  return { clave, tipo: tipoDeValor(valor), parroquia: null as string | null, valor };
}

function tipoDeValor(v: unknown): 'texto' | 'lista' | 'objeto' {
  if (Array.isArray(v)) return 'lista';
  if (v && typeof v === 'object') return 'objeto';
  return 'texto';
}

function slugDeParroquiaNombre(nombre: string): string | null {
  const n = nombre.toLowerCase();
  if (n.includes('san bernardo')) return 'san-bernardo';
  if (n.includes('tepeyac')) return 'el-tepeyac';
  if (n.includes('dulce nombre') || n.includes('san vicente')) return 'dulce-nombre-de-jesus';
  return null;
}
