VERSION v2.1.260519 — SKILLS COMPLETAS SIGMA_OMEGA

== SKILLS POR PROYECTO (instalar en cada repo) ==

[1] IMPECCABLE — pbakaus/impeccable | 15k+ stars
npx skills add pbakaus/impeccable
Qué hace: vocabulario de dirección de diseño. 23 comandos, 7 refs de dominio, 27 anti-patterns.
Comandos clave: /impeccable audit (detecta anti-patterns) | /impeccable critique (review UX) | /impeccable polish (pase final) | /impeccable animate (mejora transiciones) | /impeccable bolder/quieter (jerarquía visual)
Modo brand (marketing/landing) vs product (app/dashboard) — ajusta reglas automáticamente.
CLI autónomo: npx impeccable detect src/ (sin LLM, sin API key)
CUÁNDO: /impeccable audit al terminar cada componente. /impeccable polish antes de entregar.

[2] TASTE-SKILL — Leonxlnx/taste-skill
npx skills add https://github.com/Leonxlnx/taste-skill
Qué hace: previene AI slop ANTES de generar. Un SKILL.md que el agente lee primero.
Variantes útiles: redesign-skill (proyectos existentes), image-to-code-skill (screenshot→código)
Activa: @SKILL.md en el prompt o "follow SKILL.md"
CUÁNDO: en cualquier task de UI nueva. Complementa Impeccable (Taste previene, Impeccable audita).

[3] WEB-DESIGN-GUIDELINES — vercel-labs/agent-skills | 26.8k stars
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
Qué hace: audita código UI contra 100+ reglas (accesibilidad, performance, UX). Descarga guidelines ACTUALES antes de cada review (no usa training data). Quality gate post-generación.
Activa: /web-design-guidelines src/ o "review my UI"
CUÁNDO: después de generar páginas completas, antes de PR. Pipeline: Taste→generar→Impeccable audit→web-design-guidelines review.

[4] COMPOSITION-PATTERNS — vercel-labs/agent-skills | 26.8k stars
npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns
Qué hace: elimina boolean prop proliferation en React. Compound components, context providers, state lifting, React 19 use() API.
Activa automáticamente cuando el agente toca componentes React con props complejas.
CUÁNDO: al crear componentes reutilizables, al refactorizar componentes con >3 boolean props.

[5] REACT-PERFORMANCE — vercel-labs/agent-skills
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
Qué hace: 40+ reglas de Next.js/React performance priorizadas por impacto. Server Components, bundle, data fetching.
CUÁNDO: en ShotBuild de módulos con listas grandes, dashboards, data-heavy pages.

== SKILLS GLOBALES (~/.claude/skills/ — aplican a todos los proyectos) ==

[6] GRILL-ME — mattpocock/skills
npx skills add mattpocock/skills --skill grill-me --global
Qué hace: entrevista relentlessly el plan antes de arrancar. Una pregunta a la vez, resuelve cada rama del decision tree.
OBLIGATORIO usar con /grill-me antes de cualquier ShotGenesis.
CUÁNDO: antes de SG, antes de SE complejos, antes de decisiones de arquitectura.

[7] CAVEMAN — JuliusBrussee/caveman
Qué hace: 65% menos output tokens. Elimina filler, artículos, hedging. Mantiene código intacto.
Activar: /caveman | Desactivar: "stop caveman" | Niveles: minimal/full/ultra
CUÁNDO: debug, backend rutinario, sesiones largas con HERMES. NO usar en docs, ShotGenesis, entregas.

[8] DIAGNOSE — mattpocock/skills
npx skills add mattpocock/skills --skill diagnose --global
Qué hace: loop disciplinado bug duro: reproducir→minimizar→hipótesis→instrumentar→fix→regresión.
Activa con /diagnose
CUÁNDO: bugs que no se resuelven en 1 intento. Complementa NO-PLACEBO-FIXES.

== CURSOR RULES CANÓNICAS (en .cursor/rules/ de cada repo) ==

[R1] sigma-always-on.mdc — alwaysApply:true
[R2] eureka-design-always.mdc — globs: tsx/jsx/css
[R3] model-routing.mdc — alwaysApply:true
[R4] gitnexus.mdc — auto-generado por GitNexus al instalar

== PIPELINE QA DISEÑO (orden de ejecución en ShotEvolution) ==
1. Taste-Skill activa → previene slop al generar
2. Generar componente/página
3. /impeccable audit → detecta anti-patterns
4. /web-design-guidelines → audita 100+ reglas accesibilidad+performance+UX
5. /impeccable polish → pase final tipografía+spacing
6. version bump + commit
