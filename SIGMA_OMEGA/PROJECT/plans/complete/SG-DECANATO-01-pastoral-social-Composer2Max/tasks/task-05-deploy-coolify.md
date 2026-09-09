# task-05 · Deploy en Coolify vía ZENTINEK

## Decisión de deploy (ADR-001)
Coolify vía ZENTINEK. No Vercel. Es infraestructura propia, costo marginal cero,
y el decanato no tiene presupuesto de hosting.

## Dockerfile (multi-stage, nginx)
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`nginx.conf` debe incluir:
- `try_files $uri $uri/ $uri.html /404.html;` (Astro genera carpetas con index.html)
- `gzip` y `brotli` para html, css, svg, json
- Cache largo e inmutable para `/_astro/` (los nombres llevan hash)
- Cache corto para `.html`
- Cabeceras de seguridad: `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY`, y una CSP estricta (el sitio no carga nada de terceros, así que puede ser muy cerrada)

## Pasos con el MCP de ZENTINEK
1. `project_create` — proyecto "Decanato Pastoral Social".
2. `deploy_app` desde el repo `DayanaWebSites/DecanatoPastoral`, rama `main`.
3. `env_set` — `PUBLIC_SITE_URL`, y las de Resend cuando exista el endpoint (task-01).
4. `domain_attach_custom` — `pastoralsocialdecanatodulcenombre.org` + `www`.
5. `domain_doctor` para verificar DNS y SSL antes del cutover.
6. `deploy_status` y `runtime_probe` para confirmar que responde 200.

## Antes del cutover
- Confirmar con Mario que el dominio ya está comprado y a nombre de quién.
  **Al 2026-09-09 esto no está confirmado.** Si no lo está, despliega en el subdominio
  temporal de ZENTINEK y deja el cutover para después.
- `astro.config.mjs` → `site` debe coincidir exactamente con el dominio final,
  o el sitemap y los canonical salen mal.

## Criterio de cierre
URL respondiendo 200, SSL válido, `/404` sirviendo la página correcta,
sitemap accesible, y una captura del sitio en producción. Sin evidencia en vivo, no cierra.
