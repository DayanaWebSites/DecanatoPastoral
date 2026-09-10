import { z } from 'zod';

export const fotoSchema = z.object({
  archivo: z.string(),
  alt: z.string().min(10, 'El alt debe describir la foto, no repetir el título'),
});

export const comedorSchema = z.object({
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
  fotos: z.array(fotoSchema).default([]),
});

export const parroquiaSchema = z.object({
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
});

export type ComedorData = z.infer<typeof comedorSchema>;
export type ParroquiaData = z.infer<typeof parroquiaSchema>;

export type ContentEntry<T> = { id: string; data: T };
