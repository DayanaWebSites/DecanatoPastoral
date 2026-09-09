import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// SIGMA_OMEGA — by-type-sitio-web-astro: toda collection lleva esquema Zod.
// Los campos que el decanato todavía no entrega son opcionales y el estado
// `en_construccion` los marca en la UI. No se omiten del esquema.

const foto = z.object({
  archivo: z.string(),
  alt: z.string().min(10, 'El alt debe describir la foto, no repetir el título'),
});

const comedores = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/comedores' }),
  schema: z.object({
    nombre: z.string(),
    parroquia: z.string(),
    orden: z.number().int(),
    resumen: z.string(),
    direccion: z.string(),
    ciudad: z.string(),
    mapaUrl: z.string().url().optional(),
    telefono: z.string().optional(),
    horario: z.object({ dias: z.string(), inicio: z.string(), fin: z.string() }),
    cifras: z
      .array(z.object({ valor: z.string(), etiqueta: z.string(), detalle: z.string().optional() }))
      .default([]),
    jornada: z.array(z.object({ hora: z.string(), que: z.string() })).default([]),
    notas: z.array(z.string()).default([]),
    comoAyudar: z.array(z.string()).default([]),
    fotos: z.array(foto).default([]),
  }),
});

const parroquias = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/parroquias' }),
  schema: z.object({
    nombre: z.string(),
    orden: z.number().int(),
    estado: z.enum(['publicada', 'en_construccion']),
    imagen: z.string().optional(),
    nota: z.string().optional(),
    comedor: z.string().optional(),
    direccion: z.string().optional(),
    servicios: z.array(z.string()).default([]),
    horariosMisa: z.array(z.string()).default([]),
    contacto: z
      .object({
        telefono: z.string().optional(),
        whatsapp: z.string().optional(),
        correo: z.string().email().optional(),
        facebook: z.string().url().optional(),
      })
      .default({}),
  }),
});

export const collections = { comedores, parroquias };
