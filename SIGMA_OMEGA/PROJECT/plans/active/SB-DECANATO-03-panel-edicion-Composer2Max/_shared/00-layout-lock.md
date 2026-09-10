# 00 · Layout lock (SS-FLOTA-03e)

El panel se construye **encima** de `apps/web/`. No se recrea `src/` en la raíz.

- Contenido actual = `apps/web/src/content/` y `apps/web/src/data/`
- Estilos = `apps/web/src/styles/global.css`
- Fotos = `apps/web/src/assets/`
- Config Astro = `apps/web/astro.config.mjs`
- Scripts (difuminado, OG) = `SIGMA_OMEGA/CORE/dev/scripts/`
- Paths `src/lib/r2-client.ts` de ZENTINEK = mothership, no este repo

Si una task de este shot todavía dice `src/content` a secas, es `apps/web/src/content`.
`npm run verify` falla si hay suciedad de producto en la raíz.
