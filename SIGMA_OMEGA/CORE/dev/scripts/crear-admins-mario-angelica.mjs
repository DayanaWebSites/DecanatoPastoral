#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Falta DATABASE_URL.');
  process.exit(2);
}

function clave() {
  return randomBytes(6).toString('base64url').replace(/[^a-zA-Z0-9]/g, 'x');
}

const users = [
  {
    correo: 'mario@deltatasker.com',
    nombre: 'Mario Fernando Davalos',
    rol: 'ADMIN',
    password: `MFD-Pastoral-${clave()}`,
    debeCambiar: false,
  },
  {
    correo: 'angelica.rubio@decanato.local',
    nombre: 'Angelica Rubio Rabago',
    rol: 'ADMIN',
    password: `ARR-Pastoral-${clave()}`,
    debeCambiar: true,
  },
];

const sql = postgres(url, { max: 1 });

for (const u of users) {
  const hash = await bcrypt.hash(u.password, 12);
  const row = await sql`
    INSERT INTO usuarios (correo, nombre, password_hash, debe_cambiar_password, activo)
    VALUES (${u.correo}, ${u.nombre}, ${hash}, ${u.debeCambiar}, true)
    ON CONFLICT (correo) DO UPDATE SET
      nombre = excluded.nombre,
      password_hash = excluded.password_hash,
      debe_cambiar_password = excluded.debe_cambiar_password,
      activo = true
    RETURNING id
  `;
  const id = row[0].id;
  await sql`DELETE FROM usuario_roles WHERE usuario_id = ${id}`;
  await sql`
    INSERT INTO usuario_roles (usuario_id, rol_id)
    SELECT ${id}, id FROM roles WHERE slug = ${u.rol}
  `;
  await sql`UPDATE refresh_tokens SET revoked_at = now() WHERE usuario_id = ${id} AND revoked_at IS NULL`;
  await sql`UPDATE usuarios SET sesion_version = sesion_version + 1 WHERE id = ${id}`;
}

await sql`UPDATE usuarios SET activo = false WHERE correo = 'angie@decanato.local'`;
await sql.end();

for (const u of users) {
  console.log(`${u.nombre}\t${u.correo}\t${u.rol}\t${u.password}\tdebe_cambiar=${u.debeCambiar}`);
}
