---
name: SG-DECANATO-01-pastoral-social-Composer2Max
overview: ""
todos:
  - id: ea3a9e7b-651f-4642-b883-c64c18486f99
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-00-preflight.md — Pre-flight: verificar build limpio, leer CRONFIX y pre-registrar el ADR de la sesion"
    status: completed
  - id: 9e65c86d-12bb-433b-b43e-f12111c99608
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-se01-uiux-devqa.md — SE-01: aplicar SE-UiUx-DevQA-PRO (8 skills, 3 rules, EurekaDesign materializado, GitNexus)"
    status: completed
  - id: f9b591fb-7b54-4afc-be48-f7053dad4033
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-se02-leader-agents.md — SE-02: aplicar SE-Leader-Agents-IaDev-PRO (11 agentes .cursor/agents + 5 commands)"
    status: completed
  - id: 9803c0b5-ee57-4a32-b3af-f2862096180c
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-se03-context-stack.md — SE-03: aplicar shotskill-context-stack si el proyecto lo amerita"
    status: completed
  - id: a1f1e5b6-52d5-4979-970e-8be1bf297d98
    content: Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-01-endpoint-contacto.md — Conectar el formulario de /ayudar a un endpoint real con Resend, Zod y rate limit
    status: completed
  - id: 6c6bae81-bae4-4dc0-8328-f50ff9a5cecd
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-02-datos-pendientes.md — Cargar los datos que faltan del decanato: contactos, logo de Santa Teresita, servicios por parroquia"
    status: completed
  - id: 36029250-0f9a-4326-8f50-d26316204b87
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-03-seo-og.md — Cerrar SEO: imagen OG propia, JSON-LD por parroquia, sitemap y robots verificados"
    status: completed
  - id: f2d4d878-f2cc-4d9f-8395-428bd689e56d
    content: Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-04-a11y-performance.md — Auditar accesibilidad AA y Lighthouse mobile 95+ en las cuatro categorias
    status: completed
  - id: b394996b-731b-4cf8-8c62-7d732765ba6e
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-05-deploy-coolify.md — Desplegar en Coolify via ZENTINEK: Dockerfile nginx, dominio, SSL y health check"
    status: completed
  - id: bc0408ca-a665-404c-991c-ef50e4c7c21f
    content: Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-06-panel-edicion-fase2.md — Dejar preparada la estructura del panel de edicion de fase 2 sin implementarlo
    status: completed
  - id: 624c9f27-9a30-4f55-b0e4-15ef315f91ce
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/task-Z9-close.md — Cierre: auditoria con verify-sg-decanato.mjs, ADR final en CRONFIX y mover el plan a complete/"
    status: in_progress
isProject: false
---

# SG-DECANATO-01-pastoral-social-Composer2Max

ShotGenesis del sitio de la Pastoral Social del Decanato Dulce Nombre de Jesus.

## Antes de empezar — lectura obligatoria
1. `SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/_shared/00-pre-flight.md`
2. `SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/_shared/01-guardrails.md`
3. `SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/_shared/04-archivos-prohibidos.md`

## Estado del repo al generar este Shot
El sitio base ya existe y compila: 23 paginas, cero JavaScript enviado al cliente,
contenido en Content Collections con esquema Zod, 12 fotos con rostros difuminados.
Este Shot NO lo reconstruye. Lo que hace es montar la infraestructura IA SIGMA_OMEGA
encima y cerrar lo que quedo abierto.

## Regla de oro
Si una tarea depende de un dato del decanato que todavia no existe (telefonos,
correo, logo de Santa Teresita), NO se inventa. Se deja el campo con
`status: en_construccion`, se anota en `_shared/07-handoff-state.md` y se sigue.

## Ejecucion
Abre este archivo con Cursor Build. Cada todo abre su task en
`SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max/tasks/`.
