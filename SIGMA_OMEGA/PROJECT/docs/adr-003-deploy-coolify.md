# ADR-003 — Deploy en Coolify: Dockerfile nginx, cache y CSP

Fecha: 2026-09-09
Actualizado: 2026-09-10
Estado: ACEPTADA (runtime en vivo)
Proyecto: Decanato Dulce Nombre de Jesús — Pastoral Social
Shot: SB-DECANATO-02-deploy-certificacion-Composer2Max
Rama: `shot/sb-decanato-02-deploy`
Commit en `main`: `defaeb6d30af6173564d3248c5d2309027ae9fe0`

## Contexto
Sitio estático Astro 5. Coolify construye desde GitHub. El contenedor es nginx, no Node.

## Decisiones

1. **Imagen.** `node:22-alpine` (build) → `nginx:1.27-alpine` (runtime). Health check HTTP `GET /health` → `ok`. Puerto **80**.
2. **`try_files`.** `$uri $uri/index.html $uri.html =404`. El último término es `=404`, no `/404.html`, para que `error_page` entregue 404 de verdad.
3. **Cache.** `/_astro/` `public, immutable` 1 año. HTML `max-age=0, must-revalidate`. Imágenes/fuentes 30 días.
4. **CSP.** `default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`. Sin `unsafe-inline` ni `unsafe-eval`.
5. **`inlineStylesheets: 'never'`** en `astro.config.mjs`. Si aparece un `<style>` inline, se arregla el origen, no la CSP. En nginx, cada `location` que usa `add_header` **repite** las cabeceras de seguridad: nginx no hereda `add_header` del `server` cuando el hijo declara uno.
6. **OneClick no es el camino.** Provisiona Redis/memoria y asume puerto 3000. Los runs de preview murieron en `provisioning_memory` antes de `createApplication`. La app Dockerfile se creó aparte y se desplegó con el API de Coolify.
7. **GitHub.** Coolify usa la source *Public GitHub* (`source_id = 0`). El repo se publicó para que el clone funcione. `main` en `defaeb6`.
8. **DNS.** Zona Cloudflare `b8a625978b3933c9e34442fd6082c3fc` en la cuenta EurekaSigma. Apex, `preview` y `www` son A DNS-only a `93.188.162.107`. Correo Hostinger no se tocó.
9. **Proxy.** Traefik/Caddy en Coolify con FQDN sslip + preview + apex + www. Let's Encrypt en los tres hostnames HTTPS.

## IDs
| Recurso | Valor |
|---|---|
| projectId ZENTINEK | `d697de05-d529-4fbb-8e13-63f69b1a0e3f` |
| appUuid Coolify | `nihyul3yga0ntudzvi0abxnm` |
| hostname | `https://pastoralsocialdecanatodulcenombre.org` |
| hostname www | `https://www.pastoralsocialdecanatodulcenombre.org` |
| hostname preview | `https://preview.pastoralsocialdecanatodulcenombre.org` |
| sslip (ops) | `http://nihyul3yga0ntudzvi0abxnm.93.188.162.107.sslip.io` |
| env preview | `be55357e-74f5-4f9c-91af-5136f0f7b7f5` |
| zoneId Cloudflare | `b8a625978b3933c9e34442fd6082c3fc` |
| commit desplegado | `defaeb6d30af6173564d3248c5d2309027ae9fe0` |

## Evidencia en vivo (2026-09-10)
- `verify-produccion.mjs` contra el apex: certificado, 0 avisos.
- Lighthouse mobile apex: **99 / 100 / 100 / 100**, LCP 1.9 s.
- Lighthouse mobile San Bernardo: **100 / 100 / 100 / 100**, LCP 1.3 s.
- `/health` → `ok`. `/no-existe` → 404. CSP sin `unsafe-inline`.

## Consecuencias
El sitio está publicado. No se envía el enlace a Angie ni al decanato hasta que Mario apruebe el mensaje.
