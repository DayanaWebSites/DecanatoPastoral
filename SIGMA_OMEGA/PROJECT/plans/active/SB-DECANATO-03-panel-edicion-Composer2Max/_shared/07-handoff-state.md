# 07 · Estado de entrega

| Bloque | Estado | Evidencia |
|---|---|---|
| A · Base y auth | cerrado en local | Esquema + seed en Postgres 5433. Constraint `procesada` probado. Diff JSON vs DB vacío. E1: login/logout/refresh/reuse/429/403. `.env` no está en git. Eurekabase de este proyecto: **espera OK Mario**. |
| B · SSR y cache | cerrado en local | `output: 'server'`. Docker `decanato-ssr:sb03` healthy. Home MISS→HIT. `/editar` BYPASS + noindex. Purga al publicar demostrada. 23 rutas públicas, 0 JS. CSP sin `unsafe-inline`. Lighthouse mobile local 99/100/100/100 (igual SB-02). Apex **no** se tocó. |
| C · Editor de textos | cerrado en local | Overlay `/editar/<ruta>`. Autosave a borrador. C9: 5 campos, segundo login, 409, publish, pública, restaurar. |
| D · Imágenes | candado HTTP cerrado; CDN deferred | Presign exige difuminado. POST crudo 403. Ticket un uso. EXIF fuera (sharp). FaceDetector + confirmación. `_source/` no está en este disco: faltan las 5 fotos originales a ojo. R2/CDN **deferred**. |
| E · Certificación | E1 verde; E2 humano pendiente | E1 completo. Dry-run de las 5 tareas de Angie por API. Sesión en vivo **no hecha**. No se mandó ningún mensaje. |

## Decisiones tomadas (ADR-002 + ADR-004)
- Base: Eurekabase cuando Mario apruebe; hoy Postgres local.
- Refresh cookie `path=/` (no `/auth/refresh`) para rotar en middleware SSR.
- Purga de cache: vaciar archivos de `/var/cache/nginx/decanato` + `cache_meta.version`. No borrar el directorio (nginx se cae).
- Detector: FaceDetector API. Sin pesos de CDN.
- `security.checkOrigin = false`. Defensa: SameSite=lax + httpOnly.
- CDN: `cdn.pastoralsocialdecanatodulcenombre.org` o deferred. Nunca `{slug}-cdn.eurekasigma.com`.

## Rama
`shot/sb-decanato-03-panel`. Apex sigue en el estático certificado de SB-02. **No deploy SSR sin OK Mario.**

## Pendientes del cliente que este Shot NO resuelve
- [ ] Correo y teléfono del decanato
- [ ] Quiénes son los encargados por parroquia y sus correos
- [ ] Logo de Santa Teresita del Niño Jesús

## Gates que impiden archivar el plan
1. Mario aprueba Eurekabase `decanato-panel` y el vault (`DATABASE_URL`, `AUTH_SECRET`, luego R2).
2. `cdn_attach` con `domainHint: pastoralsocialdecanatodulcenombre.org`, `allowSlugDefault: false`.
3. Sesión E2 con Angie, texto de acceso aprobado palabra por palabra.
4. Deploy SSR a Coolify **después** de 1–3.

## Texto propuesto para Angie (NO ENVIAR sin OK de Mario)

**Canal A (usuario):** correo a `angie@…` (el real, no el de seed).

> Angie: ya puedes entrar al sitio para corregir textos y fotos. Te dejo el enlace de entrada. La contraseña te la mando por otro lado. La primera vez te va a pedir que la cambies.

**Canal B (contraseña):** WhatsApp o llamada, nunca en el mismo correo.

> Tu contraseña temporal es: [la que Mario genere]. Entra, cámbiala, y no la compartas.

**Tareas a mirar sin ayudar:**
1. Entrar.
2. Cambiar el horario de un comedor y publicar.
3. Agregar servicios de una parroquia en construcción y publicar.
4. Subir dos fotos, difuminarlas, alt, ordenar.
5. Ver que tiene borrador y publicarlo.

## Bitácora
| Fecha | Bloque | Qué quedó |
|---|---|---|
| 2026-09-09 | — | Shot generado. Módulo corregido a v1.1.0 y ADR-002 registrado. |
| 2026-09-09 | A–E local | Panel implementado en local + Docker. ADR-004 en CRONFIX. Plan sigue en `active/`. |
