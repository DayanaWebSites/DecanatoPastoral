# task-se01 · Aplicar SE-UiUx-DevQA-PRO

Obligatorio por `shotgenesis-se-cascade-protocol`. Sin esta task el ShotGenesis está incompleto.

## Cargar el ShotEvolution
```sql
SELECT file FROM sigma_omega.cursor_prompts WHERE slug='se-uiux-devqa-pro' AND activo=true;
```
Sigue ese archivo al pie de la letra. Lo de abajo son sólo las particularidades de este repo.

## Qué instala
- 8 skills: Impeccable, Taste, WebDesignGuidelines, CompositionPatterns, ReactPerf, GrillMe, Caveman, Diagnose.
- 3 Cursor rules: `sigma-always-on`, `eureka-design-always`, `model-routing`.
- `SIGMA_OMEGA/DIRECTIVES/eureka-design/` con los 9 módulos materializados desde CRONFIX.
- GitNexus (`gitnexus index`).
- `CLAUDE.md` y `AGENTS.md` con el SIGMA Bootstrap.
- `SIGMA_OMEGA/PROJECT/scripts/download-ui-references.mjs`.

## Ajustes propios de este proyecto
- **ReactPerf no aplica**: aquí no hay React. Instala la skill igual (el estándar la pide),
  pero en `AGENTS.md` deja escrito que este repo es Astro estático y que la skill queda inerte.
- En `eureka-design-always` añade la nota de que la paleta canónica de ESTE proyecto es la del
  logo del decanato (`src/styles/global.css`, bloque `@theme`), no el accent `#7144f5` de
  `eureka-design-01-tokens`. El accent morado de SIGMA no se usa en un sitio de iglesia.
- `CLAUDE.md` debe abrir citando `by-type-sitio-web-astro` y `adr-001-astro-sobre-next`.

## Criterio de cierre
Las 3 rules existen, los 9 módulos de EurekaDesign están materializados, GitNexus indexó,
`CLAUDE.md` y `AGENTS.md` mencionan el módulo y el ADR. `npm run build` sigue verde.
