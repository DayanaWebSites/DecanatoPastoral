# AGENTS.md — Decanato Pastoral Social

Proyecto: **Pastoral Social del Decanato Dulce Nombre de Jesús**
Empresa: DeltaTasker (`2647e8f3-05ce-4f6c-a696-e8ec545e535f`)
Tipo: `SITIO_WEB_ASTRO` · Repo: https://github.com/DayanaWebSites/DecanatoPastoral
CRONFIX: `hmncwtyhofmobhjatpbv` / `sigma_omega`
proyecto_id: `2335fb6d-3bbc-4f86-bb5d-09045e91b74c`
Mario: `cb4c7c08-2e17-40f2-b38b-b8b697767c24`

## Qué gobierna

- Módulo canónico: `sigma_omega.core` slug **`by-type-sitio-web-astro`**
- ADR de stack: `sigma_omega.project_directives` slug **`adr-001-astro-sobre-next`**
- Shot vigente: `SG-DECANATO-01-pastoral-social-Composer2Max`

Consulta CRONFIX antes de tomar cualquier decisión técnica. No asumas Next, auth ni CRUD.

## Stack

| Capa | Decisión | Versión |
|------|----------|---------|
| Sitio | Astro 5 `output: 'static'` | 5.x |
| CSS | Tailwind 4 (`@tailwindcss/vite`) | 4.x |
| Contenido | Content Collections + Zod | — |
| Imágenes | `astro:assets` + sharp | 0.34.x |
| Fuentes | Inter variable + Source Serif 4, self-hosted | — |
| Deploy | Coolify vía ZENTINEK. Prohibido Vercel | — |

Cero JavaScript enviado al cliente. Si aparece auth real, roles o CRUD, se migra a
`by-type-app-web`. No se improvisa encima de Astro.

## Skills

Instaladas en `.claude/skills/`:

| Skill | Estado |
|-------|--------|
| impeccable | activa |
| taste | activa |
| web-design-guidelines | activa |
| composition-patterns | activa (espíritu Astro, no React) |
| react-perf | **inerte** — no hay React en este repo |
| grill-me | activa |
| caveman | activa (no usar en entregas ni docs) |
| diagnose | activa |

## God nodes

- `src/data/textos.json`
- `src/styles/global.css` (`@theme`)
- `src/assets/comedores/*`
- `src/pages/aviso-de-privacidad.astro`
- `.gitignore` (`_source/`)

## Versionado

`MAJOR.MINOR.YYMMDDBB`. BB reinicia en 01 cada día. CHANGELOG en español.

## Cierre

```bash
npm run build && npm run verify
```

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **DecanatoPastoral** (313 symbols, 319 relationships, 1 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/DecanatoPastoral/context` | Codebase overview, check index freshness |
| `gitnexus://repo/DecanatoPastoral/clusters` | All functional areas |
| `gitnexus://repo/DecanatoPastoral/processes` | All execution flows |
| `gitnexus://repo/DecanatoPastoral/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
