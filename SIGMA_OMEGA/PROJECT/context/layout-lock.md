# Layout lock — DecanatoPastoral (SS-FLOTA-03e)

El sitio **nació mal** (Astro en raíz). Ya no.

| Cosa | Dónde | Si lo pones en otro lado |
|---|---|---|
| Astro (`src`, `public`, `astro.config.mjs`, `tsconfig.json`) | `apps/web/` | `npm run verify` **falla** |
| Changelog | `SIGMA_OMEGA/PROJECT/CHANGELOG.md` | Verify falla si hay `CHANGELOG.md` en raíz |
| HEFESTO | `SIGMA_OMEGA/CORE/scripts/` | Prohibido `scripts/` en raíz |
| OG / rostros / refs UI | `SIGMA_OMEGA/CORE/dev/scripts/` | Ya no existe `PROJECT/scripts/` |
| E2E | `SIGMA_OMEGA/PROJECT/test/` (cuando exista) | No `e2e/` en `apps/web` |

Paths viejos de SG-01 / SB-02 / SB-03 que dicen `src/content` = **`apps/web/src/content`**.  
No recrees la carpeta en raíz “porque el shot lo dice”. Actualizá el shot.

Rama del sitio: `shot/sb-decanato-02-deploy`. `main` remoto todavía no tiene el sitio.
Apex no se forja sin OK Mario. UUIDs Coolify se llenan en SB-02.
