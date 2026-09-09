VERSION v2.0.260519 | FUENTE DeltyFlow globals.css + faceticket + HEIMDAI

## Tokens canónicos SIGMA_OMEGA
- **Accent:** `#7144f5` → `accent-500` / `hsl(var(--accent))`
- **Font:** Inter (UI), jerarquía con weights 400/500/600/700
- **Grid:** sistema **4pt** estricto (4, 8, 12, 16, 24, 32, 48, 64)
- **Icons:** Phosphor Icons **outline** 16–24px (nunca lucide en UI nueva)

## Colores semánticos (dark-first)
- Background: `bg-background` / app canvas
- Foreground: `text-foreground`
- Muted: `text-muted-foreground` / `bg-muted`
- Border: `border-border/70`
- Error / success / warning: tokens del tema shadcn

## Tipografía
- Body: `text-sm` (14px) line-height ≥ 1.4
- Headings: escala clara (no Inter en todo el mismo peso)
- Tabular nums en métricas y tablas

## Spacing & layout
- Cards interactivas: padding ≥ 12px
- Gap entre controles relacionados: ≥ 8px
- Max width body copy: ~75ch

## Auth (referencia rápida)
- Canvas: `bg-[#040d23]` + blobs + `backdrop-blur-xl`
- Ver módulo `02-auth.md` para detalle

## Nota CRONFIX
El slug `eureka-design-01-tokens` en coach_brain está pendiente de contenido completo.
Este archivo materializa tokens operativos canónicos. **Este repo los overridea:**
paleta del logo del decanato en `src/styles/global.css` (`#04551F` `#DEAB33` `#FCF9F2` `#1B1A17`).
El accent `#7144f5` no se usa en un sitio de iglesia.
