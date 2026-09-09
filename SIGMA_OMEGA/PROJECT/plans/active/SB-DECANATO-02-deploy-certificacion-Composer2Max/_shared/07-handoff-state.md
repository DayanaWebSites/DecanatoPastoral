# 07 · Estado de entrega

## Bloques
| Bloque | Estado | Evidencia |
|---|---|---|
| A · Certificación | cerrado 2026-09-09 | build 24 páginas; verify SG-01 verde; docker `decanato:local` :8080; `/` y `/comedores` 200; `/health` `ok`; `/no-existe` 404 + CSP; LH home 98/100/100/100; LH comedor 99/100/100/100; 12 fotos; `og.jpg` 57 KB |
| B · Infra | parcial | Repo en `main` `2520e97`. Proyecto ZENTINEK sí. **Sin app Coolify.** Dominio no está en ZENTINEK. Gates PENDING |
| C · Deploy | no arranca | Falta `appUuid`. No se fuerza |
| D · Verificación | no arranca | No hay URL pública. Un build local no certifica |

## Evidencia del bloque A
- Rama: `shot/sb-decanato-02-deploy`
- `npm run build`: 24 páginas, 0 JS
- `npm run verify`: superada, 3 avisos (correo, 10 parroquias, Santa Teresita)
- Docker `decanato:local`:
  - `curl -I /` → 200 + CSP sin `unsafe-inline`
  - `curl -I /comedores` → 200
  - `curl -s /health` → `ok`
  - `curl /no-existe` → 404 + página del sitio
- axe CLI: Chrome 152 vs driver 153. Sustituto: Lighthouse a11y 100, 0 auditorías en rojo
- Lighthouse mobile local: home 98/100/100/100 LCP 2.3 s; comedor 99/100/100/100 LCP 2.0 s
- 12 fotos: rostros de personas atendidas difuminados
- Enlaces internos del contenedor: 21, 0 rotos
- `/ayudar`: aviso de formulario no conectado

## Evidencia del bloque B
- GitHub `main` = `2520e9799e7c8248ea76faf503f74a1761d0baa6`
- `git ls-files _source/` → 0. No hay `.env` en el remoto
- `Dockerfile`, `nginx.conf`, `public/og.jpg`, 24 páginas fuente en el remoto
- projectId: `d697de05-d529-4fbb-8e13-63f69b1a0e3f`
- `apps_list`: ninguna app del decanato
- `env_set PUBLIC_SITE_URL` → PENDING. `pendingActionId`: `ddf1fd47-0671-437c-b22a-bb4db11e3f18`
- `domain_assign_subdomain` → PENDING (el proyecto está clasificado PRODUCTION)
- `domain_create` / `domain_attach_custom` / `domain_doctor` / `domain_list_zones`: timeout MCP (Cloudflare)
- OneClick `f8b10993-990a-49ea-8f9a-354b6ac688cf`: falló en `provisioning_memory` antes de crear app. No se reintenta

## Bloqueos que requieren a Mario
1. **Crear la app Coolify** Dockerfile, puerto 80, health `/health`, repo `DayanaWebSites/DecanatoPastoral` rama `main`. ZENTINEK no expone `createApplication` sin OneClick.
2. **Aprobar** `pendingActionId` `ddf1fd47-0671-437c-b22a-bb4db11e3f18` (`PUBLIC_SITE_URL`) o dictar la frase.
3. **Confirmar el dominio:** ¿`pastoralsocialdecanatodulcenombre.org` ya está comprado? ¿En qué cuenta de Cloudflare?
4. **Frase de autorización** para el cutover del apex (task C2).

## IDs
| Recurso | Valor |
|---|---|
| proyecto_id CRONFIX | `2335fb6d-3bbc-4f86-bb5d-09045e91b74c` |
| projectId ZENTINEK | `d697de05-d529-4fbb-8e13-63f69b1a0e3f` |
| env preview | `be55357e-74f5-4f9c-91af-5136f0f7b7f5` |
| env production | `1700e993-4b48-48bf-804a-c48de6aaa2e1` |
| appUuid Coolify | pendiente |
| commit GitHub | `https://github.com/DayanaWebSites/DecanatoPastoral/commit/2520e9799e7c8248ea76faf503f74a1761d0baa6` |

## Bitácora
| Fecha | Bloque | Qué quedó |
|---|---|---|
| 2026-09-09 | — | Shot generado. |
| 2026-09-09 | A | Certificación local cerrada. nginx 404/CSP corregidos. |
| 2026-09-09 | B | Repo en `main`. Gates y app Coolify pendientes de Mario. |
| 2026-09-09 | C/D | No arrancan: no hay URL pública. El plan se queda en `active/`. |
