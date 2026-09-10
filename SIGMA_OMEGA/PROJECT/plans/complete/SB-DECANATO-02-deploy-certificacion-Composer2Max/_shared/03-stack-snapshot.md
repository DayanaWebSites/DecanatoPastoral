# 03 · Snapshot del stack de deploy

## Archivos que este Shot da por existentes
```
Dockerfile        multi-stage node:22-alpine → nginx:1.27-alpine
nginx.conf        try_files para las carpetas de Astro, /health, cache, CSP
.dockerignore     excluye node_modules, dist, _source, planes
```

## Decisiones ya tomadas y por qué
- **`try_files $uri $uri/ $uri.html $uri/index.html /404.html`** — Astro genera
  `/comedores/index.html`. Sin esto, `/comedores` da 404.
- **`/health` devuelve 200 en texto plano** — es el health check del Dockerfile y
  el que va a mirar Coolify.
- **`/_astro/` con `immutable` a 1 año** — los nombres llevan hash de contenido.
- **HTML con `must-revalidate`** — el contenido cambia cuando el decanato manda datos.
- **CSP sin `unsafe-inline`** — se puso `inlineStylesheets: 'never'` en
  `apps/web/astro.config.mjs` para que sea determinista que no hay `<style>` inline.
  Verificado: 0 tags `<style>` y 0 scripts ejecutables en el build (los 26
  `<script>` son `application/ld+json`, que el navegador no ejecuta).

## Lo que NO se pudo verificar al generar el Shot
El contenedor no se construyó ni se levantó: en el entorno donde se generó este
Shot no había daemon de Docker ni nginx. **La task A9 es la que lo verifica de
verdad**, construyendo la imagen y levantándola en local antes de tocar Coolify.
