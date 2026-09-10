import { sql } from '../db/client';
import { esDominioSupermaster, type RolSlug, type UsuarioSesion } from '../roles';
import { hashToken, nuevoRefresh } from './tokens';

export async function cargarUsuario(id: string): Promise<UsuarioSesion | null> {
  const rows = await sql()`
    SELECT u.id, u.correo, u.nombre, u.activo, u.debe_cambiar_password,
           u.sesion_version, r.slug AS rol, r.nivel
    FROM usuarios u
    JOIN usuario_roles ur ON ur.usuario_id = u.id
    JOIN roles r ON r.id = ur.rol_id
    WHERE u.id = ${id}
    ORDER BY r.nivel DESC
    LIMIT 1
  `;
  const u = rows[0];
  if (!u || !u.activo) return null;
  const parroquias = await sql()`
    SELECT parroquia_slug FROM usuario_parroquias WHERE usuario_id = ${id}
  `;
  return {
    id: u.id,
    correo: u.correo,
    nombre: u.nombre,
    rol: u.rol as RolSlug,
    nivel: Number(u.nivel),
    parroquias: parroquias.map((p) => p.parroquia_slug),
    debeCambiarPassword: Boolean(u.debe_cambiar_password),
    sesionVersion: Number(u.sesion_version ?? 1),
  };
}

export async function buscarPorCorreo(correo: string) {
  const rows = await sql()`
    SELECT id, correo, nombre, password_hash, activo, debe_cambiar_password
    FROM usuarios WHERE lower(correo) = lower(${correo}) LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function asegurarSupermaster(usuarioId: string, correo: string) {
  if (!esDominioSupermaster(correo)) return;
  await sql()`
    INSERT INTO usuario_roles (usuario_id, rol_id)
    SELECT ${usuarioId}, id FROM roles WHERE slug = 'SUPERMASTER'
    ON CONFLICT DO NOTHING
  `;
}

export async function emitirRefresh(usuarioId: string, ip: string | undefined, ua: string | undefined) {
  const t = nuevoRefresh();
  const rows = await sql()`
    INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at, created_ip, user_agent)
    VALUES (${usuarioId}, ${t.hash}, ${t.expiresAt}, ${ip ?? null}, ${ua ?? null})
    RETURNING id
  `;
  return { id: rows[0].id as string, raw: t.raw };
}

export async function rotarRefresh(raw: string, ip: string | undefined, ua: string | undefined) {
  const hash = hashToken(raw);
  const rows = await sql()`
    SELECT id, usuario_id, expires_at, revoked_at, replaced_by_id
    FROM refresh_tokens WHERE token_hash = ${hash} LIMIT 1
  `;
  const row = rows[0];
  if (!row) return { ok: false as const, motivo: 'desconocido' };
  if (row.replaced_by_id) {
    await sql()`
      UPDATE refresh_tokens SET revoked_at = now()
      WHERE usuario_id = ${row.usuario_id} AND revoked_at IS NULL
    `;
    return { ok: false as const, motivo: 'reuse', usuarioId: row.usuario_id as string };
  }
  if (row.revoked_at || new Date(row.expires_at) < new Date()) {
    return { ok: false as const, motivo: 'invalido' };
  }
  const nuevo = await emitirRefresh(row.usuario_id, ip, ua);
  await sql()`
    UPDATE refresh_tokens
    SET revoked_at = now(), replaced_by_id = ${nuevo.id}
    WHERE id = ${row.id}
  `;
  return { ok: true as const, usuarioId: row.usuario_id as string, raw: nuevo.raw };
}

export async function revocarRefresh(raw: string) {
  const hash = hashToken(raw);
  await sql()`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = ${hash} AND revoked_at IS NULL`;
}

export async function revocarTodos(usuarioId: string) {
  await sql()`UPDATE refresh_tokens SET revoked_at = now() WHERE usuario_id = ${usuarioId} AND revoked_at IS NULL`;
  await sql()`UPDATE usuarios SET sesion_version = sesion_version + 1 WHERE id = ${usuarioId}`;
}

export async function sesionVersionDe(usuarioId: string): Promise<number> {
  const rows = await sql()`SELECT sesion_version FROM usuarios WHERE id = ${usuarioId} LIMIT 1`;
  return Number(rows[0]?.sesion_version ?? 0);
}

export async function listarSesiones(usuarioId: string) {
  return sql()`
    SELECT id, created_ip, user_agent, creado_en, expires_at, revoked_at
    FROM refresh_tokens
    WHERE usuario_id = ${usuarioId} AND revoked_at IS NULL AND expires_at > now()
    ORDER BY creado_en DESC
  `;
}

export async function revocarSesion(usuarioId: string, id: string) {
  await sql()`
    UPDATE refresh_tokens SET revoked_at = now()
    WHERE id = ${id} AND usuario_id = ${usuarioId} AND revoked_at IS NULL
  `;
}

export async function marcarAcceso(usuarioId: string) {
  await sql()`UPDATE usuarios SET ultimo_acceso = now() WHERE id = ${usuarioId}`;
}
