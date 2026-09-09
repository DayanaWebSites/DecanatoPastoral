# SG-DECANATO-01 · Pastoral Social del Decanato Dulce Nombre de Jesús

> **LAYOUT 2026-09-09:** el producto ya no está en raíz. Todo `src/`, `public/`, `astro.config.mjs` de este shot histórico = `apps/web/...`. Scripts = `SIGMA_OMEGA/CORE/dev/scripts/`. Ver `SIGMA_OMEGA/PROJECT/context/layout-lock.md`.

ShotGenesis del sitio web de la Pastoral Social. Documento para leer, no para ejecutar.
**El archivo que Cursor Build ejecuta es `.cursor/plans/SG-DECANATO-01-pastoral-social-Composer2Max.plan.md`.**

## Qué es este proyecto
El Decanato Dulce Nombre de Jesús (Arquidiócesis de Guadalajara) sostiene tres comedores
asistenciales. El sitio existe para que la gente los conozca: para sumar voluntarios y
bienhechores, y para que quien conoce a una persona en situación de calle sepa a dónde
mandarla y a qué hora.

Las 13 parroquias del decanato tienen ficha propia. La mayoría todavía sin información:
salen marcadas como *en construcción* y se van llenando conforme el cliente entrega datos.

| | |
|---|---|
| Cliente | Angie Rubio (Somos+), decanato Dulce Nombre de Jesús |
| Decano | Pbro. Juan Pablo López Ramos |
| Pastoral Social asistencial | Pbro. José David Padilla Lozano |
| Repo | github.com/DayanaWebSites/DecanatoPastoral |
| Dominio | pastoralsocialdecanatodulcenombre.org *(compra sin confirmar)* |
| Stack | Astro 5 estático · Tailwind 4 · TypeScript strict |
| Deploy | Coolify vía ZENTINEK |
| Módulo SIGMA | `by-type-sitio-web-astro` |
| ADR | `adr-001-astro-sobre-next` |
| Modelo | Composer 2 + MAX |

## Estado al generar el Shot
El sitio base ya existe y compila. Este Shot no lo reconstruye.

- 23 páginas, build verde, **0 KB de JavaScript** enviado al cliente
- Contenido en Content Collections con esquema Zod: 3 comedores, 13 parroquias
- Textos institucionales completos (incluida la exhortación *Dilexi te*)
- 12 fotos curadas con **rostros difuminados**
- Aviso de privacidad integral conforme LFPDPPP
- Paleta muestreada del logo oficial: verde `#04551F`, dorado `#DEAB33`, crema `#FCF9F2`

## Tareas

| # | Task | Qué hace | Bloqueada por |
|---|---|---|---|
| 00 | `task-00-preflight` | Build limpio, CRONFIX cargado, rama creada | — |
| SE-01 | `task-se01-uiux-devqa` | Skills, rules, EurekaDesign, GitNexus | 00 |
| SE-02 | `task-se02-leader-agents` | 12 agentes + 5 commands | SE-01 |
| SE-03 | `task-se03-context-stack` | Namespace en EurekaBrain (sin Graphify) | SE-02 |
| 01 | `task-01-endpoint-contacto` | Formulario real con Resend | **dato del cliente** |
| 02 | `task-02-datos-pendientes` | Contactos, logo faltante, servicios | **dato del cliente** |
| 03 | `task-03-seo-og` | Imagen OG, JSON-LD por parroquia, breadcrumbs | — |
| 04 | `task-04-a11y-performance` | AA real y Lighthouse mobile 95+ | 03 |
| 05 | `task-05-deploy-coolify` | Dockerfile nginx, dominio, SSL | 04 |
| 06 | `task-06-panel-edicion-fase2` | Contrato de datos y ADR-002 | — |
| Z9 | `task-Z9-close` | Auditoría, CRONFIX, mover a `complete/` | todas |

Las tasks 01 y 02 dependen de datos que el decanato aún no entregó. **No se inventan.**
Si el dato no llega, la task queda abierta y se anota en `_shared/07-handoff-state.md`.

## Las tres reglas que importan
1. **No inventar datos del decanato.** Ni un teléfono, ni un horario, ni un servicio.
2. **Ningún rostro identificable de una persona atendida.** Toda foto nueva pasa por
   `SIGMA_OMEGA/PROJECT/scripts/difuminar-rostros.py` y se revisa a ojo.
3. **Nada se cierra sin evidencia en vivo.** Build verde, URL respondiendo, captura.

## Cómo se ejecuta
1. Abre `.cursor/plans/SG-DECANATO-01-pastoral-social-Composer2Max.plan.md` con Cursor Build.
2. Cada todo abre su task en `tasks/`.
3. `task-Z9-close` corre `npm run verify`. Si falla → HALT, se corrige, se re-audita.
4. Si pasa → la carpeta se mueve a `SIGMA_OMEGA/PROJECT/plans/complete/`.

## Si algo se rompe
`emergency/halt-flow.md` · `emergency/rollback-coolify.md` · `emergency/revert-merge.md`
