#!/usr/bin/env node
import sharp from 'sharp';

const conMeta = await sharp({
  create: { width: 32, height: 32, channels: 3, background: '#DEAB33' },
}).withMetadata({
  exif: { IFD0: { Copyright: 'test-gps-standin' } },
}).jpeg().toBuffer();

const webp = await sharp(conMeta, { failOn: 'none' })
  .rotate()
  .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 82 })
  .toBuffer();

const despues = await sharp(webp).metadata();
if (despues.exif && despues.exif.byteLength > 0) {
  console.error('HALT: el WebP normalizado todavía trae EXIF.');
  process.exit(1);
}
console.log('EXIF eliminado al normalizar. bytes=', webp.byteLength);
