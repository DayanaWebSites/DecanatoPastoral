#!/usr/bin/env node
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
let ok = false;
try {
  await sql`
    INSERT INTO imagenes (bucket, key, alt, procesada, publicada)
    VALUES ('test', 'test/no-procesada.webp', 'Foto de prueba sin procesar xx', false, true)
  `;
} catch (e) {
  ok = String(e).includes('imagenes_publicada_requiere_procesada');
}
const leftover = await sql`SELECT id FROM imagenes WHERE key = 'test/no-procesada.webp'`;
if (leftover.length) await sql`DELETE FROM imagenes WHERE key = 'test/no-procesada.webp'`;
await sql.end();
if (!ok) {
  console.error('HALT: el CHECK no impidió publicar una imagen sin procesar.');
  process.exit(1);
}
console.log('Constraint procesada: impide publicada=true si procesada=false.');
