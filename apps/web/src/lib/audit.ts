import { jsonb, sql } from './db/client';

export async function auditar(opts: {
  usuarioId?: string | null;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  antes?: unknown;
  despues?: unknown;
  ip?: string | null;
}) {
  await sql()`
    INSERT INTO audit_log (usuario_id, accion, entidad, entidad_id, valor_antes, valor_despues, ip)
    VALUES (
      ${opts.usuarioId ?? null},
      ${opts.accion},
      ${opts.entidad},
      ${opts.entidadId ?? null},
      ${opts.antes === undefined ? null : jsonb(opts.antes)},
      ${opts.despues === undefined ? null : jsonb(opts.despues)},
      ${opts.ip ?? null}
    )
  `;
}
