const PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024;

export function mimeReal(buf: Uint8Array): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
    && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';
  return null;
}

export function validarImagen(buf: Uint8Array): { ok: true; mime: string } | { ok: false; error: string } {
  if (buf.byteLength > MAX_BYTES) return { ok: false, error: 'La foto pesa más de 10 MB.' };
  const mime = mimeReal(buf);
  if (!mime || !PERMITIDOS.has(mime)) return { ok: false, error: 'Sólo se aceptan JPG, PNG o WebP.' };
  return { ok: true, mime };
}
