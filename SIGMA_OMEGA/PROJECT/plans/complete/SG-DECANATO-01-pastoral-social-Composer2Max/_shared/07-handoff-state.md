# 07 · Estado de entrega

Se actualiza al cerrar cada task. Es lo primero que lee quien retome el proyecto.

## Hecho antes de este Shot
- [x] Alta del proyecto en CRONFIX
- [x] Módulo `by-type-sitio-web-astro` en `sigma_omega.core`
- [x] ADR-001 (Astro sobre Next) en `sigma_omega.project_directives`
- [x] Sitio base Astro: 23 páginas de contenido + `/gracias`, build verde, 0 KB de JS
- [x] Contenido en Content Collections con Zod: 3 comedores, 13 parroquias
- [x] 12 fotos curadas con rostros difuminados
- [x] Aviso de privacidad integral redactado

## Pendiente del cliente (bloquea tasks, no inventar)
- [ ] Correo y teléfono oficiales del decanato → `src/data/decanato.json` *(task-02, 2026-09-09)*
- [ ] Logo o foto de la parroquia Santa Teresita del Niño Jesús *(task-02)*
- [ ] Teléfono de contacto por comedor *(task-02)*
- [ ] Servicios que ofrece cada parroquia (dispensario, despensas, etc.) *(task-02; 10 de 13 en_construccion)*
- [ ] A dónde deben llegar los mensajes del formulario de voluntarios *(task-01: CONTACTO_DESTINO)*
- [ ] Método de donativos, si el decanato quiere publicarlo
- [ ] Confirmación de que el dominio `pastoralsocialdecanatodulcenombre.org` ya está comprado y a nombre de quién *(task-05)*

## Pendiente técnico
- [x] Cascada SE-01 / SE-02 / SE-03
- [ ] Graphify: no se instaló. Repo ~40 fuentes, sin PDF/docs técnicas. GitNexus cubre `src/content/` (16 JSON) y `src/data/` (2 JSON). Reevaluar si el sitio crece.
- [ ] Endpoint real del formulario (bloqueado por CONTACTO_DESTINO). `/gracias` y `?error=1` ya existen. El aviso en `/ayudar` se queda.
- [x] Imagen OG propia (`public/og.jpg` 1200×630)
- [ ] App Coolify: el proyecto ZENTINEK `d697de05-d529-4fbb-8e13-63f69b1a0e3f` no tiene `coolifyProjectUuid` ni `appUuid`. No usar OneClick (traería DB+Redis).
- [ ] `PUBLIC_SITE_URL` y el subdominio `*.zentinek.com` quedaron PENDING de aprobación de Mario en ZENTINEK (2026-09-09). No se auto-aprueba.
- [ ] Cutover del apex: HALT hasta que Mario confirme la compra.

## Evidencia local (2026-09-09)
- `npm run build`: 24 HTML, 0 JS, OG presente
- `npx astro check`: 0 errores / 0 avisos / 0 hints
- `npm run verify`: auditoría superada (3 avisos de datos del cliente)
- Preview: `http://127.0.0.1:4322/` (el 4321 es Casa Alfareros, no este sitio)
- Lighthouse mobile:
  - `/` 98 / 100 / 100 / 100
  - `/comedores/san-bernardo` 100 / 100 / 100 / 100
  - `/ayudar` a11y 100 · SEO 100
  - `/parroquias/san-bernardo` a11y 100 · SEO 100
- axe-core CLI no corrió: ChromeDriver pide Chrome 153 y el instalado es 152.0.7977.83. La categoría Accessibility de Lighthouse quedó en 100.
- Reportes: `SIGMA_OMEGA/PROJECT/reports/lighthouse-*.report.json|html`
- Sitemap local: 22 URLs públicas (se excluye `/gracias`). robots.txt y `/og.jpg` 200.

## IDs útiles
| Qué | Id |
|---|---|
| proyecto CRONFIX | `2335fb6d-3bbc-4f86-bb5d-09045e91b74c` |
| empresa DeltaTasker | `2647e8f3-05ce-4f6c-a696-e8ec545e535f` |
| proyecto ZENTINEK | `d697de05-d529-4fbb-8e13-63f69b1a0e3f` |
| ADR sesión | `b1aa3771-8f85-4569-a84d-4d1510ff52e0` |
| ADR panel fase 2 | `47af51d2-a96e-43c6-b2fb-67fe33e89444` |
| Shot CRONFIX | `01a30eae-4293-46a6-a818-a0e164544810` |
| Namespace EurekaBrain | `afdf11fb-a20f-44e8-ad99-6adcdeec313b` |

## Bitácora
| Fecha | Task | Qué quedó |
|---|---|---|
| 2026-09-09 | — | Sitio base y Shot generados |
| 2026-09-09 | 00-preflight | Build 23 páginas, astro check 0 errores, 0 JS en dist/, rama `shot/sg-decanato-01`. CRONFIX leído (módulo + ADR-001 + 3 protocolos). Pre-registro `sg-decanato-01-pastoral-social-composer2max` (draft) y `adr-002-sg-decanato-01-sesion` (draft). |
| 2026-09-09 | SE-01 | 8 skills en `.claude/skills/` (react-perf inerte). 3 rules. EurekaDesign 01-09 desde CRONFIX + override de paleta. GitNexus 313 nodos, cubre `src/content/` y `src/data/`. CLAUDE.md + AGENTS.md citan módulo y ADR-001. |
| 2026-09-09 | SE-02 | 12 agentes (db-admin inerte; deployer = Coolify/ZENTINEK; security incluye rostros). 5 commands. |
| 2026-09-09 | SE-03 | Namespace `decanato-pastoral-social` en `coach_brain.knowledge_base` (hermes-contexts). Graphify no. Memoria HORUS no disponible (EUREKABASE_MEMORY_URL). |
| 2026-09-09 | 01-contacto | Bloqueado: no hay CONTACTO_DESTINO. Se añadió `/gracias` y el aviso de error `?error=1`. El `<Aviso>` de `/ayudar` se mantiene. |
| 2026-09-09 | 02-datos | Bloqueado: el cliente no entregó correo, teléfonos, logo de Santa Teresita ni servicios. Nada inventado. |
| 2026-09-09 | 03-seo | `public/og.jpg` 1200×630. JSON-LD PlaceOfWorship + BreadcrumbList. Sitemap 22 URLs. Rich Results Test de Google queda para cuando haya URL pública. |
| 2026-09-09 | 04-a11y | Contraste oro-700 sobre crema. Logos a 2x. Fuentes optional + fallback. Lighthouse mobile ≥95 en las cuatro categorías. |
| 2026-09-09 | 05-deploy | Dockerfile + nginx (gzip; brotli no viene en nginx:alpine). Proyecto ZENTINEK creado. Sin app Coolify. Dominio no confirmado. OneClick no. |
| 2026-09-09 | 06-panel | `contrato-contenido.md` + ADR-002 panel (opción A) en CRONFIX. Ningún .astro hardcodea datos del decanato. |
| 2026-09-09 | Z9-close | `npm run verify` superado. ADR de sesión y Shot pasados a active/completed en CRONFIX. Plan movido a `plans/complete/`. |
