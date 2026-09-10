#!/usr/bin/env node
/**
 * Migra JSON → contenido/imagenes. Idempotente: ON CONFLICT (clave) DO NOTHING.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import postgres from 'postgres';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../../..');
const web = join(root, 'apps/web/src');
const url = process.env.DATABASE_URL;
if (!url) { console.error('Falta DATABASE_URL'); process.exit(2); }
const sql = postgres(url, { max: 1 });

const foto = z.object({
  archivo: z.string(),
  alt: z.string().min(10),
});
const comedorSchema = z.object({
  nombre: z.string(),
  parroquia: z.string(),
  orden: z.number().int(),
  resumen: z.string(),
  direccion: z.string(),
  ciudad: z.string(),
  mapaUrl: z.string().url().optional(),
  telefono: z.string().optional(),
  horario: z.object({ dias: z.string(), inicio: z.string(), fin: z.string() }),
  cifras: z.array(z.object({ valor: z.string(), etiqueta: z.string(), detalle: z.string().optional() })).default([]),
  jornada: z.array(z.object({ hora: z.string(), que: z.string() })).default([]),
  notas: z.array(z.string()).default([]),
  comoAyudar: z.array(z.string()).default([]),
  fotos: z.array(foto).default([]),
});
const parroquiaSchema = z.object({
  nombre: z.string(),
  orden: z.number().int(),
  estado: z.enum(['publicada', 'en_construccion']),
  imagen: z.string().optional(),
  nota: z.string().optional(),
  comedor: z.string().optional(),
  direccion: z.string().optional(),
  servicios: z.array(z.string()).default([]),
  horariosMisa: z.array(z.string()).default([]),
  contacto: z.object({
    telefono: z.string().optional(),
    whatsapp: z.string().optional(),
    correo: z.string().email().optional(),
    facebook: z.string().url().optional(),
  }).default({}),
});

const COMEDOR_PARROQUIA = {
  'casa-san-vicente': 'dulce-nombre-de-jesus',
  'san-bernardo': 'san-bernardo',
  'el-tepeyac': 'el-tepeyac',
};

function tipo(v) {
  if (Array.isArray(v)) return 'lista';
  if (v && typeof v === 'object') return 'objeto';
  return 'texto';
}

async function upsert(clave, tipoVal, parroquia, valor) {
  await sql`
    INSERT INTO contenido (clave, tipo, parroquia_slug, valor_publicado, publicado_en)
    VALUES (${clave}, ${tipoVal}, ${parroquia}, ${sql.json(valor)}, now())
    ON CONFLICT (clave) DO NOTHING
  `;
}

const comedoresDir = join(web, 'content/comedores');
const parroquiasDir = join(web, 'content/parroquias');
let campos = 0;
let fotos = 0;

for (const file of readdirSync(comedoresDir).filter((f) => f.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '');
  const raw = JSON.parse(readFileSync(join(comedoresDir, file), 'utf8'));
  const data = comedorSchema.parse(raw);
  const parroquia = COMEDOR_PARROQUIA[slug] ?? null;
  for (const [k, v] of Object.entries(data)) {
    if (k === 'fotos') continue;
    await upsert(`comedor.${slug}.${k}`, tipo(v), parroquia, v);
    campos++;
  }
  let orden = 0;
  for (const f of data.fotos) {
    await sql`
      INSERT INTO imagenes (
        parroquia_slug, comedor_slug, bucket, key, alt, orden,
        procesada, publicada, archivo_local, rostros_detectados
      ) VALUES (
        ${parroquia}, ${slug}, 'local-assets', ${`assets/comedores/${f.archivo}`},
        ${f.alt}, ${orden}, true, true, ${f.archivo}, 0
      )
      ON CONFLICT (key) DO NOTHING
    `;
    orden++;
    fotos++;
  }
}

for (const file of readdirSync(parroquiasDir).filter((f) => f.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '');
  const raw = JSON.parse(readFileSync(join(parroquiasDir, file), 'utf8'));
  const data = parroquiaSchema.parse(raw);
  for (const [k, v] of Object.entries(data)) {
    await upsert(`parroquia.${slug}.${k}`, tipo(v), slug, v);
    campos++;
  }
}

const textos = JSON.parse(readFileSync(join(web, 'data/textos.json'), 'utf8'));
const decanato = JSON.parse(readFileSync(join(web, 'data/decanato.json'), 'utf8'));
await upsert('sitio.textos', 'objeto', null, textos);
await upsert('sitio.decanato', 'objeto', null, decanato);
campos += 2;

const nCont = await sql`SELECT count(*)::int AS n FROM contenido`;
const nImg = await sql`SELECT count(*)::int AS n FROM imagenes`;
console.log(`Migración lista. Filas tocadas ≈ ${campos}. Contenido en base: ${nCont[0].n}. Imágenes: ${nImg[0].n} (fotos JSON: ${fotos}).`);
await sql.end();
