---
name: sigma-db-admin
description: INERTE. Este sitio no tiene base de datos. No invocar para Prisma, RLS ni migraciones.
model: inherit
readonly: true
---

# sigma-db-admin — INERTE

Este proyecto es `by-type-sitio-web-astro`. **No hay base de datos, ni Prisma, ni RLS.**

El contenido vive en JSON versionado:

- `src/content/comedores/*.json`
- `src/content/parroquias/*.json`
- `src/data/decanato.json`
- `src/data/textos.json`

Si te invocan para “crear una tabla” o “conectar Supabase como CMS de runtime”: **HALT**.
Eso es fase 2 (`adr-002-panel-edicion-fase2`) o una migración a `by-type-app-web` (ADR-001).

Reportar: `SIGMA-DB INERTE — este repo no tiene DB. Usar content collections.`
