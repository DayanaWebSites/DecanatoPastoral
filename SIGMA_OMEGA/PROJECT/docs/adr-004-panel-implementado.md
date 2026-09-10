# ADR-004 — Panel de edición: esquema, cache y decisiones de ejecución

- Slug: `adr-004-panel-implementado`
- Tipo: adr-local
- Versión: 1.0.0
- Fecha: 2026-09-09
- Estado: active — el Shot sigue en `plans/active/` hasta Mario + Angie + Eurekabase

## Qué se implementó
Astro `output: 'server'` (`@astrojs/node` standalone) detrás de nginx. El visitante anónimo sigue en 0 KB de JavaScript ejecutable. El bundle React del editor carga sólo en `/editar`, `/login` y `/auth/*`.

## Esquema
Postgres local (`decanato-panel-pg:5433`) con el SQL de `SIGMA_OMEGA/CORE/dev/scripts/panel-schema.sql`.
Tablas: `contenido`, `imagenes` (CHECK `NOT publicada OR procesada`), `usuarios`, `roles`, `usuario_roles`, `usuario_parroquias`, `refresh_tokens` (sólo hash), `password_reset_tokens`, `upload_tickets` (un uso), `audit_log`, `cache_meta`.
`usuarios.sesion_version` sube al cambiar clave o `logout-all`; el JWT lleva `sv` y se rechaza si no coincide.

Eurekabase de este proyecto: **pendiente de aprobación Mario**. No hay `DATABASE_URL` en el vault. No se forjó el apex.

## Auth
- Access JWT 15 min, cookie `dp_access` httpOnly + SameSite=lax. Path `/`.
- Refresh opaco 30 d, cookie `dp_refresh` path `/` (no `/auth/refresh`) para que el middleware SSR pueda rotar.
- Rotación + reuse → revoca toda la cadena. Probado.
- bcryptjs cost 12. Rate limit login 5/15 min/IP.
- Sin registro público. SUPERMASTER por dominio `@deltatasker.com`, `@eurekasigma.com`, `@obsidiancore.com.mx`.
- Astro `security.checkOrigin = false`: el Host local no coincide con `site`. La defensa es SameSite=lax + httpOnly. El contacto público no usa cookie (honeypot + Zod).

## Cache
Micro-cache nginx 10 min, `X-Cache-Status`. `/editar`, `/login`, `/auth`, `/api` con `proxy_cache off` y `noindex`.
Purga al publicar: `cache_meta.version` + borrar `/var/cache/nginx/decanato`. Documentado aquí, no hay PURGE de nginx open source.

## Difuminado
Detector: FaceDetector API del navegador. Si no hay rostros, confirmación explícita (`sin_rostros_confirmado`). No se vendieron pesos de MediaPipe (la CSP no se afloja a un CDN de modelos).
Presign sólo con `processed: true` y (rostros > 0 o confirmación). POST crudo a `/api/imagenes` → 403. Ticket de un uso + sha256 del WebP procesado.
Canvas → WebP 82, lado ≤1600. Sharp en el PUT local quita EXIF y saca thumbnail 200×200.
`_source/` no está en este disco: no se procesaron las 5 fotos originales con cara. El candado HTTP sí está probado.

## CDN / R2
Cliente R2 listo (`apps/web/src/lib/storage/presign.ts`). Sin credenciales en vault.
Hasta `provisionStorage` + `cdn_attach` con `domainHint: pastoralsocialdecanatodulcenombre.org` y `allowSlugDefault: false`, el CDN queda **deferred**. Nunca `{slug}-cdn.eurekasigma.com`.

## Evidencia local (2026-09-09)
- Constraint `procesada` impide `publicada=true`.
- Diff JSON vs `valor_publicado`: vacío (131 filas).
- `git ls-files` no trackea `.env` (sólo `.env.example`).
- C9: cinco campos, segundo login, 409 de colisión, publish, pública, restaurar, revertir.
- B3: 23 rutas públicas, 0 `<script>` ejecutable.
- E1 verde: scope 403, JWT falso, XSS escapado, reuse 401, ticket 403, MIME, >10 MB, password tumba sesiones, login 429.
- `npm run verify` verde (3 avisos de datos del cliente).
- Lighthouse mobile en Docker local (`http://127.0.0.1:18080/`): 99 / 100 / 100 / 100, igual que el apex SB-02.

## Lo que NO cierra el Shot
1. Mario aprueba Eurekabase (`decanato-panel`) y el vault.
2. `cdn_attach` deferred o `cdn.pastoralsocialdecanatodulcenombre.org`.
3. Sesión en vivo con Angie (E2). No se le manda ningún enlace ni clave sin el texto aprobado palabra por palabra.
4. Deploy SSR al apex. Coolify sigue en el árbol estático certificado de SB-02.
5. Lighthouse mobile contra el apex SSR (el apex todavía es SSG).

## Fricciones previstas para Angie (dry-run)
- Primer acceso obliga a cambiar la contraseña.
- Publicar es un botón aparte del autosave: hay que ver “Borrador: N cambio(s)”.
- Subir foto no tiene atajo fuera del difuminado. Si el detector no ve caras, hay que marcar la casilla.

No se actualiza `public.proyectos.fase`. Sigue `entrega` hasta esos gates.
