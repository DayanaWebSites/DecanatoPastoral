---
name: impeccable
description: Design-direction vocabulary and anti-pattern audit for UI. Use after generating a component (/impeccable audit), before delivery (/impeccable polish), or when reviewing visual hierarchy.
---

# Impeccable (Decanato Pastoral Social)

Quality gate for the static site. Source: pbakaus/impeccable. Adapted for `by-type-sitio-web-astro`.

## When

- After each new section or page: audit
- Before handing a page: polish
- Never as a substitute for EurekaDesign tokens or the paleta del logo

## Commands

- audit — detect AI slop and anti-patterns
- critique — UX review with concrete token/class fixes
- polish — typography and spacing pass
- animate — transitions only (respect reduced-motion)
- bolder / quieter — visual hierarchy

## Constraints of this repo

- Accent is the logo green `#04551F` and gold `#DEAB33`, never purple `#7144f5`
- Tokens live in `src/styles/global.css` `@theme`. No hex suelto in `.astro`
- Editable copy lives in `src/content/` or `src/data/`, never hardcoded
- Zero client JavaScript. Prefer `<details>`, CSS, and native forms over islands
- No identifiable faces of people being served. Photos go through `difuminar-rostros.py`
- Mode is **brand** (institutional site), not product/dashboard
