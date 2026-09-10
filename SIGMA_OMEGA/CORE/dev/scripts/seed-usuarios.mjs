#!/usr/bin/env node
import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL;
const pass = process.env.PANEL_SEED_PASSWORD;
if (!url || !pass) {
  console.error('Faltan DATABASE_URL o PANEL_SEED_PASSWORD.');
  process.exit(2);
}
if (pass.length < 10) {
  console.error('PANEL_SEED_PASSWORD debe tener 10+ caracteres.');
  process.exit(2);
}

const sql = postgres(url, { max: 1 });
const hash = await bcrypt.hash(pass, 12);

const users = [
  { correo: 'mario@deltatasker.com', nombre: 'Mario Fernando Davalos', rol: 'ADMIN', parroquias: [] },
  { correo: 'angelica.rubio@decanato.local', nombre: 'Angelica Rubio Rabago', rol: 'ADMIN', parroquias: [] },
  { correo: 'editor.bernardo@decanato.local', nombre: 'Editor San Bernardo', rol: 'EDITOR_PARROQUIA', parroquias: ['san-bernardo'] },
  { correo: 'lector@decanato.local', nombre: 'Revisor', rol: 'SOLO_LECTURA', parroquias: [] },
];

for (const u of users) {
  const row = await sql`
    INSERT INTO usuarios (correo, nombre, password_hash, debe_cambiar_password)
    VALUES (${u.correo}, ${u.nombre}, ${hash}, ${u.correo !== 'mario@deltatasker.com'})
    ON CONFLICT (correo) DO UPDATE SET nombre = excluded.nombre
    RETURNING id
  `;
  await sql`DELETE FROM usuario_roles WHERE usuario_id = ${row[0].id}`;
  await sql`
    INSERT INTO usuario_roles (usuario_id, rol_id)
    SELECT ${row[0].id}, id FROM roles WHERE slug = ${u.rol}
  `;
  await sql`DELETE FROM usuario_parroquias WHERE usuario_id = ${row[0].id}`;
  for (const p of u.parroquias) {
    await sql`INSERT INTO usuario_parroquias (usuario_id, parroquia_slug) VALUES (${row[0].id}, ${p})`;
  }
}

console.log('Usuarios semilla listos:', users.map((u) => `${u.correo} (${u.rol})`).join(', '));
await sql.end();
