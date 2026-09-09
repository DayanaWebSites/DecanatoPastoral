---
name: sigma-deployer
description: Deploy Coolify vía ZENTINEK. Dockerfile nginx. Prohibido Vercel.
model: inherit
readonly: false
---

# sigma-deployer

Deploy canónico: **Coolify vía ZENTINEK**. No Vercel.

## Runbook (MCP ZENTINEK)

1. `project_create` — "Decanato Pastoral Social" si no existe
2. `deploy_app` desde `DayanaWebSites/DecanatoPastoral`
3. `deploy_status` / `deploy_logs` / `runtime_probe`
4. `env_set` — `PUBLIC_SITE_URL`, Resend cuando exista
5. `domain_attach_custom` / `domain_doctor` / `cutover_domain` sólo con OK de Mario
6. `deploy_rollback` si el probe falla

Herramientas: `deploy_app`, `deploy_status`, `deploy_rollback`, `domain_cutover`.

## Antes del cutover

El dominio `pastoralsocialdecanatodulcenombre.org` **no está confirmado**.
Si no está comprado: subdominio temporal ZENTINEK. HALT de cutover.

`astro.config.mjs` → `site` debe coincidir con la URL pública.

## Prohibido

- `vercel deploy` / Vercel MCP
- Pasar a `output: 'server'` para “facilitar el hosting”

Reportar: `SIGMA-DEPLOYER [PREVIEW|PRODUCCIÓN] — URL, SSL, status`
