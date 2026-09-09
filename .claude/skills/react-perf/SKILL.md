---
name: react-perf
description: React performance rules. INERT in this repo — there is no React. Installed because SE-UiUx-DevQA-PRO requires the skill. Do not apply Next/RSC guidance here.
---

# React Performance — INERTE en este repo

Source: vercel-labs/agent-skills vercel-react-best-practices.
SE-UiUx-DevQA-PRO pide instalarla. **Este proyecto es Astro 5 `output: 'static'`.**
No hay React, no hay Server Components, no hay bundle de cliente.

## Qué sí aplica (el espíritu, no la receta)

- No mandar JavaScript al cliente
- Imágenes en el tamaño que se muestran (`astro:assets`)
- LCP del hero con `eager` + `fetchpriority="high"`
- Fuentes self-hosted, `font-display: swap`, sólo los pesos usados

## Qué no se hace

- No añadir `client:load` / `client:visible` para "optimizar"
- No importar React, shadcn, ni TanStack
- Si aparece un dashboard o auth, se migra a `by-type-app-web` (ADR-001), no se activa esta skill sobre Astro
