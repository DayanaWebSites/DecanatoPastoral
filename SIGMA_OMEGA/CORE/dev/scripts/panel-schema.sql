-- SB-DECANATO-03 · esquema del panel
-- El contrato es el Zod de apps/web/src/content.config.ts.
-- Idempotente: se puede aplicar más de una vez.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  nombre text NOT NULL,
  nivel int NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  password_hash text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  debe_cambiar_password boolean NOT NULL DEFAULT true,
  sesion_version int NOT NULL DEFAULT 1,
  creado_en timestamptz NOT NULL DEFAULT now(),
  ultimo_acceso timestamptz
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS sesion_version int NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS usuario_roles (
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE IF NOT EXISTS usuario_parroquias (
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  parroquia_slug text NOT NULL,
  PRIMARY KEY (usuario_id, parroquia_slug)
);

CREATE TABLE IF NOT EXISTS contenido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave text UNIQUE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('texto', 'html', 'lista', 'objeto')),
  parroquia_slug text,
  valor_publicado jsonb NOT NULL,
  valor_borrador jsonb,
  borrador_por uuid REFERENCES usuarios(id),
  borrador_en timestamptz,
  publicado_en timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contenido_clave_idx ON contenido (clave);
CREATE INDEX IF NOT EXISTS contenido_parroquia_idx ON contenido (parroquia_slug);

CREATE TABLE IF NOT EXISTS imagenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parroquia_slug text,
  comedor_slug text,
  bucket text NOT NULL DEFAULT 'local',
  key text NOT NULL,
  cdn_url text,
  thumb_key text,
  alt text NOT NULL,
  orden int NOT NULL DEFAULT 0,
  procesada boolean NOT NULL DEFAULT false,
  rostros_detectados int NOT NULL DEFAULT 0,
  sin_rostros_confirmado boolean NOT NULL DEFAULT false,
  publicada boolean NOT NULL DEFAULT false,
  archivo_local text,
  subida_por uuid REFERENCES usuarios(id),
  subida_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT imagenes_publicada_requiere_procesada CHECK (NOT publicada OR procesada),
  CONSTRAINT imagenes_alt_min CHECK (char_length(alt) >= 10)
);

CREATE UNIQUE INDEX IF NOT EXISTS imagenes_key_idx ON imagenes (key);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  replaced_by_id uuid REFERENCES refresh_tokens(id),
  created_ip text,
  user_agent text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens (usuario_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

CREATE TABLE IF NOT EXISTS upload_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  object_key text NOT NULL UNIQUE,
  sha256 text NOT NULL,
  usado_en timestamptz,
  expires_at timestamptz NOT NULL,
  rostros_detectados int NOT NULL DEFAULT 0,
  sin_rostros_confirmado boolean NOT NULL DEFAULT false,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id),
  accion text NOT NULL,
  entidad text NOT NULL,
  entidad_id text,
  valor_antes jsonb,
  valor_despues jsonb,
  ip text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_creado_idx ON audit_log (creado_en DESC);
CREATE INDEX IF NOT EXISTS audit_log_entidad_idx ON audit_log (entidad, entidad_id);

CREATE TABLE IF NOT EXISTS cache_meta (
  clave text PRIMARY KEY,
  valor text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO cache_meta (clave, valor) VALUES ('version', '1')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO roles (slug, nombre, nivel) VALUES
  ('SUPERMASTER', 'Supermaster', 100),
  ('MASTER', 'Master', 80),
  ('ADMIN', 'Administrador', 60),
  ('EDITOR_PARROQUIA', 'Editor de parroquia', 40),
  ('SOLO_LECTURA', 'Sólo lectura', 20)
ON CONFLICT (slug) DO NOTHING;
