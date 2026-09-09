# C2 · Cutover del dominio

## Esta task requiere a Mario en vivo
El apex y el `www` son PRODUCTION. `domain_attach_custom` y `domain_cutover`
devuelven `PENDING` con `pendingActionId` + `approvalToken`, y sólo avanzan con:
- `safety_approve` con ambos valores, o
- la **frase de autorización** que Mario dicta.

Ver `_shared/08-gates-zentinek.md`. Comprobado el 2026-09-09 con `domain_doctor`
sobre este mismo hostname.

## Pasos
1. `domain_attach_custom` para `pastoralsocialdecanatodulcenombre.org` y
   `www.pastoralsocialdecanatodulcenombre.org`.
2. Pasar el gate con Mario.
3. `domain_cutover` → `domain_cutover_status` hasta `live`.
4. `domain_status`: `sslStatus` en `ok`/`active`.
5. `cdn_purge` después del cutover.

## Antes de dar el paso
Confirma que `astro.config.mjs` → `site` es exactamente el dominio final y que
el build desplegado es posterior a ese cambio. Si no, el sitemap y los canonical
apuntan al lugar equivocado y hay que redeployar.

## Cierre
`domain_cutover_status: live`, SSL válido, `curl -I` al apex devolviendo 200
sobre HTTPS.
