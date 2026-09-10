# A1 · Esquema en Eurekabase

## Principio
El esquema Zod de `apps/web/src/content.config.ts` es el contrato. La base lo respeta, no lo
reinventa. Si un campo es opcional en Zod, es nullable aquí.

## Tablas

```sql
-- Contenido: una fila por bloque editable, con publicado y borrador separados
contenido (
  id, clave, tipo,            -- 'comedor.san-bernardo.resumen', 'texto'|'html'|'lista'
  parroquia_slug,             -- scope: NULL = contenido global
  valor_publicado  jsonb,
  valor_borrador   jsonb,     -- NULL = sin cambios sin publicar
  borrador_por     uuid,
  borrador_en      timestamptz,
  publicado_en     timestamptz,
  updated_at       timestamptz -- para el bloqueo optimista
)

imagenes (
  id, parroquia_slug, comedor_slug,
  bucket, key,                -- R2 vía Eurekabase. NUNCA el binario ni base64
  cdn_url,                    -- buildPublicCdnUrl(recordName, key)
  thumb_key,
  alt, orden,
  procesada        boolean NOT NULL DEFAULT false,   -- pasó por el difuminado
  rostros_detectados int,
  sin_rostros_confirmado boolean DEFAULT false,      -- confirmación explícita
  subida_por, subida_en
)

usuarios (id, correo, nombre, password_hash, activo, creado_en, ultimo_acceso)
roles (id, slug, nombre, nivel)
usuario_roles (usuario_id, rol_id)
usuario_parroquias (usuario_id, parroquia_slug)      -- el scope de EDITOR_PARROQUIA
refresh_tokens (id, usuario_id, token_hash, expires_at, revoked_at,
                replaced_by_id, created_ip, user_agent)
audit_log (id, usuario_id, accion, entidad, entidad_id,
           valor_antes jsonb, valor_despues jsonb, ip, creado_en)
```

## Reglas duras del esquema
- `imagenes.procesada = false` → **no se puede publicar**. Constraint o trigger, no
  una validación en el frontend.
- `contenido.valor_borrador IS NOT NULL` → hay cambios sin publicar. La UI lo muestra.
- Índice en `contenido.clave` y en `contenido.parroquia_slug`: son los dos accesos.
- `refresh_tokens.token_hash`, nunca el token en claro.

## Seed
Los cinco roles de `_shared/02-cronfix-context.md` con su nivel.
SUPERMASTER se auto-asigna por dominio de correo (@deltatasker.com, @eurekasigma.com,
@obsidiancore.com.mx) según el módulo `roles`.

## Cierre
Migración aplicada, seed corrido, y una prueba de que el constraint de `procesada`
realmente impide publicar. Sin esa prueba no cierra.
