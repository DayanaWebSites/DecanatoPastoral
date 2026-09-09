#!/usr/bin/env node
/**
 * Genera public/og.jpg 1200×630: logo sobre verde, filete dorado, sin personas.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const logo = await sharp(join(raiz, 'src/assets/decanato/logo-claro.webp'))
  .resize(200, 200, { fit: 'contain', background: { r: 4, g: 85, b: 31, alpha: 0 } })
  .png()
  .toBuffer();

const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#04551F"/>
  <rect x="80" y="430" width="200" height="3" fill="#DEAB33"/>
  <text x="80" y="490" fill="#FCF9F2" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-weight="600">Pastoral Social</text>
  <text x="80" y="540" fill="#FCF9F2" font-family="Georgia, 'Times New Roman', serif" font-size="28">Decanato Dulce Nombre de Jesús</text>
  <text x="80" y="580" fill="#DEAB33" font-family="Georgia, 'Times New Roman', serif" font-size="18">Arquidiócesis de Guadalajara</text>
</svg>`);

await sharp(overlay)
  .composite([{ input: logo, top: 160, left: 80 }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(join(raiz, 'public/og.jpg'));

console.log('public/og.jpg 1200×630');
