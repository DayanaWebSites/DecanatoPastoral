# ADR-003 — Deploy en Coolify: Dockerfile nginx, cache y CSP

Fecha: 2026-09-09
Estado: ACEPTADA (runtime pendiente de Mario)
Proyecto: Decanato Dulce Nombre de Jesús — Pastoral Social
Shot: SB-DECANATO-02-deploy-certificacion-Composer2Max
Rama: `shot/sb-decanato-02-deploy`
Commit en `main`: `2520e9799e7c8248ea76faf503f74a1761d0baa6`

## Contexto
Sitio estático Astro 5. Coolify construye desde GitHub. El contenedor es nginx, no Node.

## Decisiones

1. **Imagen.** `node:22-alpine` (build) → `nginx:1.27-alpine` (runtime). Health check HTTP `GET /health` → `ok`. Puerto **80**.
2. **`try_files`.** `$uri $uri/index.html $uri.html =404`. El último término es `=404`, no `/404.html`, para que `error_page` entregue 404 de verdad.
3. **Cache.** `/_astro/` `public, immutable` 1 año. HTML `max-age=0, must-revalidate`. Imágenes/fuentes 30 días.
4. **CSP.** `default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`. Sin `unsafe-inline` ni `unsafe-eval`.
5. **`inlineStylesheets: 'never'`** en `astro.config.mjs`. Si aparece un `<style>` inline, se arregla el origen, no la CSP. En nginx, cada `location` que usa `add_header` **repite** las cabeceras de seguridad: nginx no hereda `add_header` del `server` cuando el hijo declara uno.
6. **OneClick no es el camino.** Provisiona Redis/memoria y asume puerto 3000. Se intentó un run con `reuseExistingDatabase: true` (`f8b10993-990a-49ea-8f9a-354b6ac688cf`) y murió en `provisioning_memory` (`fetch failed`) **antes** de crear app. `appUuid` sigue vacío. No se reintenta.
7. **Apex.** `pastoralsocialdecanatodulcenombre.org` no está en `domain_list`. Cutover espera frase de Mario y confirmación de compra/zona Cloudflare.

## IDs
| Recurso | Valor |
|---|---|
| projectId ZENTINEK | `d697de05-d529-4fbb-8e13-63f69b1a0e3f` |
| appUuid Coolify | **pendiente** — hay que crear la app Dockerfile a mano o con `domain_doctor` `create_preview_app` cuando CF responda |
| hostname objetivo | `pastoralsocialdecanatodulcenombre.org` |
| hostname preview propuesto | `preview.decanato-pastoral.zentinek.com` (PREVIEW, sin frase) |
| env preview | `be55357e-74f5-4f9c-91af-5136f0f7b7f5` (clasificado PREVIEW) |

## Lo que falta (Mario)
1. Crear en Coolify una app Dockerfile del repo `DayanaWebSites/DecanatoPastoral`, rama `main`, puerto 80, health `/health`.
2. Aprobar `PUBLIC_SITE_URL` (`pendingActionId` `ddf1fd47-0671-437c-b22a-bb4db11e3f18`, expira 2026-09-09 22:24Z) o dictar la frase y reintentar `env_set`.
3. Decir si el dominio ya está comprado y en qué zona de Cloudflare.
4. Frase de autorización para el cutover del apex.

## Consecuencias
El bloque A está certificado en local (contenedor incluido). Los bloques C y D no se cierran sin URL pública.
