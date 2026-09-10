import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { begin, sql } from '../../lib/db/client';
import { hashPassword } from '../../lib/auth/password';
import { puedeGestionarUsuarios } from '../../lib/roles';
import { auditar } from '../../lib/audit';
import { exigir, ipDe, json, usuarioDe } from '../../lib/http';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user, puedeGestionarUsuarios);
  if (deny) return deny;
  const rows = await sql()`
    SELECT u.id, u.correo, u.nombre, u.activo, u.creado_en, u.ultimo_acceso, r.slug AS rol,
           coalesce((SELECT array_agg(parroquia_slug) FROM usuario_parroquias p WHERE p.usuario_id = u.id), '{}') AS parroquias
    FROM usuarios u
    JOIN usuario_roles ur ON ur.usuario_id = u.id
    JOIN roles r ON r.id = ur.rol_id
    ORDER BY r.nivel DESC, u.nombre
  `;
  return json({ usuarios: rows });
};

export const POST: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user, puedeGestionarUsuarios);
  if (deny) return deny;
  const body = await ctx.request.json().catch(() => ({})) as {
    correo?: string; nombre?: string; rol?: string; parroquias?: string[];
  };
  const correo = (body.correo ?? '').trim().toLowerCase();
  const nombre = (body.nombre ?? '').trim();
  const rol = body.rol ?? 'SOLO_LECTURA';
  if (!correo || !nombre) return json({ error: 'Faltan nombre y correo.' }, 400);
  const temporal = body.correo && process.env.PANEL_SEED_PASSWORD
    ? process.env.PANEL_SEED_PASSWORD
    : `CambiaMe-${randomBytes(6).toString('hex')}`;
  const hashed = await hashPassword(temporal);
  try {
    const created = await begin(async (tx) => {
      const u = await tx`
        INSERT INTO usuarios (correo, nombre, password_hash, debe_cambiar_password)
        VALUES (${correo}, ${nombre}, ${hashed}, true)
        RETURNING id, correo, nombre
      `;
      await tx`
        INSERT INTO usuario_roles (usuario_id, rol_id)
        SELECT ${u[0].id}, id FROM roles WHERE slug = ${rol}
      `;
      for (const p of body.parroquias ?? []) {
        await tx`INSERT INTO usuario_parroquias (usuario_id, parroquia_slug) VALUES (${u[0].id}, ${p})`;
      }
      return u[0];
    });
    await auditar({ usuarioId: user!.id, accion: 'usuario-alta', entidad: 'usuarios', entidadId: created.id, despues: { correo, rol }, ip: ipDe(ctx.request) });
    return json({ ...created, passwordTemporal: process.env.NODE_ENV === 'production' ? undefined : temporal });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) return json({ error: 'Ese correo ya está dado de alta.' }, 409);
    throw e;
  }
};

export const PATCH: APIRoute = async (ctx) => {
  const user = await usuarioDe(ctx);
  const deny = exigir(user, puedeGestionarUsuarios);
  if (deny) return deny;
  const body = await ctx.request.json().catch(() => ({})) as {
    id?: string; activo?: boolean; rol?: string; parroquias?: string[];
  };
  if (!body.id) return json({ error: 'Falta el usuario.' }, 400);
  if (typeof body.activo === 'boolean') {
    await sql()`UPDATE usuarios SET activo = ${body.activo} WHERE id = ${body.id}`;
  }
  if (body.rol) {
    await sql()`DELETE FROM usuario_roles WHERE usuario_id = ${body.id}`;
    await sql()`INSERT INTO usuario_roles (usuario_id, rol_id) SELECT ${body.id}, id FROM roles WHERE slug = ${body.rol}`;
  }
  if (body.parroquias) {
    await sql()`DELETE FROM usuario_parroquias WHERE usuario_id = ${body.id}`;
    for (const p of body.parroquias) {
      await sql()`INSERT INTO usuario_parroquias (usuario_id, parroquia_slug) VALUES (${body.id}, ${p})`;
    }
  }
  await auditar({ usuarioId: user!.id, accion: 'usuario-cambio', entidad: 'usuarios', entidadId: body.id, despues: body, ip: ipDe(ctx.request) });
  return json({ ok: true });
};
