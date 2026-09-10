# 03 · Snapshot del stack

## De dónde partimos
Astro 5 estático, 23 páginas, 0 KB de JS, contenido en Content Collections con Zod,
desplegado en Coolify con nginx y CSP estricta.

## A dónde vamos
```
Astro 5  output: 'server'  (adapter node)
├── rutas públicas   → SSR + micro-cache nginx → 0 KB de JS
└── /editar/*        → SSR, auth, noindex, sin cache, isla React del editor

Postgres (Eurekabase)   contenido, borradores, usuarios, roles, audit log
R2 vía Eurekabase       bucket eb-{slug}, expuesto como cdn.{apex del cliente}
                        subida por presigned PUT directo del navegador
```

## Lo que NO cambia
- El diseño ni los textos aprobados.
- La paleta del logo del decanato.
- Las 12 fotos ya difuminadas que están en `apps/web/src/assets/comedores/`.
- La CSP estricta. Si el editor necesita algo que la CSP bloquea, se resuelve con
  nonces, no aflojando la política para todo el sitio.

## Lo que se retira
Las Content Collections dejan de ser la fuente de verdad. **El esquema Zod NO se
tira**: se reusa para validar lo que entra y sale de la base. Es el contrato.
