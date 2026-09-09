# 00 · Layout lock (SS-FLOTA-03e)

El sitio **ya no está en la raíz**.

- Producto Astro = `apps/web/`
- Todo path de este shot que diga `src/` o `public/` o `astro.config.mjs` = `apps/web/...`
- Scripts de producto = `SIGMA_OMEGA/CORE/dev/scripts/`
- HEFESTO = `SIGMA_OMEGA/CORE/scripts/` (UUIDs vacíos; no turbo sin OK Mario)
- `npm run verify` **falla** si reaparece `src/`, `public/`, `astro.config.mjs`, `CHANGELOG.md` o `scripts/` en la raíz

Canon: `SIGMA_OMEGA/PROJECT/context/layout-lock.md`
