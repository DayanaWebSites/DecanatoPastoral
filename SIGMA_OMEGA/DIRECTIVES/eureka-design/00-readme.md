# EurekaDesign — Índice v2.0.260519

Sistema de diseño SIGMA_OMEGA. Leer SOLO el módulo que necesitas — no toda la carpeta.
Fuente: `coach_brain.guidelines` slugs `eureka-design-01` … `09`. CRONFIX es la fuente;
esta carpeta es la copia local materializada.

## Módulos
- 01-tokens.md → colores, tipografía, spacing, shadows
- 02-auth.md → login glassmorphism, magic link, OTP *(inerte en este repo: no hay auth)*
- 03-navigation.md → sidebar, topbar, tabs, mobile nav
- 04-data-grid.md → LTable TanStack, filtros, record panel *(inerte: no hay tablas de app)*
- 05-forms.md → inputs Zod, upload, wizard
- 06-feedback.md → Sonner toasts, modals, EmptyState, loading
- 07-motion.md → easings, duraciones, keyframes
- 08-anti-patterns.md → 27 reglas Impeccable, AI slop kills
- 09-skills-rules.md → skills instaladas, Cursor rules, pipeline QA

## Override de marca de ESTE proyecto

Este repo NO usa el accent canónico SIGMA `#7144f5` ni el glass de `02-auth.md`.
La paleta vive en `src/styles/global.css`, bloque `@theme`, muestreada del logo oficial:

| Token | Hex | Uso |
|---|---|---|
| verde | `#04551F` | fondos institucionales, header |
| dorado | `#DEAB33` | filetes, acentos |
| crema | `#FCF9F2` | canvas, texto sobre verde |
| tinta | `#1B1A17` | texto corrido |

Fuentes: `@fontsource-variable/inter` + `@fontsource/source-serif-4`, self-hosted.
Sitio estático Astro: cero JS al cliente, cero islas salvo justificación en una frase.

## Pipeline QA de diseño
1. Taste-Skill activa (previene slop al generar)
2. Generar con tokens de `src/styles/global.css` (no el accent morado)
3. /impeccable audit (al terminar cada componente)
4. /web-design-guidelines (al terminar cada página)
5. /impeccable polish (pase final)
