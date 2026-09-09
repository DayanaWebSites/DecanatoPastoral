# B2 · Proyecto y app en ZENTINEK

## Estado comprobado el 2026-09-09
`projects_list` no tiene ningún proyecto del decanato. `apps_list` (39 apps) no
tiene ninguna app del decanato. Se crea todo desde cero.

## Pasos
1. **Crear el proyecto**
   ```
   project_create
     name: "decanato-pastoral-social"
     repoUrl: "https://github.com/DayanaWebSites/DecanatoPastoral"
   ```
   Guarda el `projectId` que devuelve: lo necesitan B3, C1 y C2.

2. **Crear la app en Coolify** apuntando a ese repo, rama `main`, build por
   **Dockerfile** (no nixpacks: el Dockerfile ya define el runtime nginx).
   Puerto expuesto: **80**. Health check: `/health`.

3. **Variables de entorno** (`env_set`, environment `production`):
   | Key | Valor |
   |---|---|
   | `PUBLIC_SITE_URL` | `https://pastoralsocialdecanatodulcenombre.org` |

   Las de Resend (`RESEND_API_KEY`, `CONTACTO_DESTINO`) sólo cuando exista el
   endpoint del formulario (SG-01 task-01). **La key completa no se pega en el
   chat**: se carga en el vault de ZENTINEK y en conversación sólo va prefijo +
   últimos 4.

4. Confirmar que `astro.config.mjs` tiene `site` igual al dominio final. Si no,
   el sitemap y los canonical salen mal y hay que rehacer el build.

## Gate
`project_create` sobre PRODUCTION puede devolver `PENDING`. Ver
`_shared/08-gates-zentinek.md`. Si pasa: se detiene, se le dice a Mario el
`pendingActionId`, y se espera. No se fuerza.

## Cierre
`projectId` y `appUuid` anotados en `_shared/07-handoff-state.md`.
