import sharp from 'sharp';

/** WebP ≤1600px, calidad 82, sin EXIF/GPS. Thumbnail 200×200. */
export async function normalizarWebp(buf: Uint8Array): Promise<{ webp: Buffer; thumb: Buffer }> {
  const webp = await sharp(buf, { failOn: 'none' })
    .rotate()
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const thumb = await sharp(webp)
    .resize(200, 200, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer();
  return { webp, thumb };
}

export async function tieneExif(buf: Uint8Array): Promise<boolean> {
  const meta = await sharp(buf, { failOn: 'none' }).metadata();
  return Boolean(meta.exif && meta.exif.byteLength > 0);
}
