---
name: SB-DECANATO-02-deploy-certificacion-Composer2Max
type: shot-build
proyecto: Decanato Dulce Nombre de Jesus - Pastoral Social
proyecto_id: 2335fb6d-3bbc-4f86-bb5d-09045e91b74c
empresa: DeltaTasker
repo: github.com/DayanaWebSites/DecanatoPastoral
dominio: pastoralsocialdecanatodulcenombre.org
modelo: Composer 2 + MAX
stack: [Astro 5, TailwindCSS 4, Docker, nginx, Coolify via ZENTINEK]
sigma_modulo: by-type-sitio-web-astro
adr: adr-001-astro-sobre-next
depende_de: SG-DECANATO-01-pastoral-social-Composer2Max
bloques: [A-certificacion, B-infra, C-deploy, D-verificacion]
version: 1.0.0
fecha: 2026-09-09
todos:
  - id: deccf594-64f4-4983-b4b8-500fb19f5e79
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-A-certificacion/task-A0-preflight.md — A0 · Pre-flight: build verde, verify del SG en verde, rama creada"
    status: pending
  - id: 86e2c8a5-57f0-4f64-97d6-8652c5d5c850
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-A-certificacion/task-A1-auditoria-local.md — A1 · Auditoria local completa: 0 JS, 0 terceros, SEO, Zod, sin datos hardcodeados"
    status: pending
  - id: bd58d7a0-bfb9-4954-840e-6a71f0709779
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-A-certificacion/task-A2-a11y-performance.md — A2 · Accesibilidad AA con axe y Lighthouse mobile 95+ contra el preview local"
    status: pending
  - id: 104418fb-903b-4d62-8ca2-cd2074f81740
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-A-certificacion/task-A3-imagen-og.md — A3 · Imagen OG propia: el sitio va a circular por WhatsApp"
    status: pending
  - id: 27e01818-5f7d-490e-b86d-f9aabb771609
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-A-certificacion/task-A9-close-block.md — A9 · Cierre del bloque A: sin evidencia no pasa a B"
    status: pending
  - id: b963d389-4df1-4f4e-82f8-287b6e5ad50e
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-B-infra/task-B1-repo-github.md — B1 · Commit y push a github.com/DayanaWebSites/DecanatoPastoral"
    status: pending
  - id: de2f54f9-d221-4bdb-a534-5a6c5398c179
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-B-infra/task-B2-proyecto-coolify.md — B2 · Crear proyecto y app en ZENTINEK apuntando al repo"
    status: pending
  - id: 1e80e42b-6f03-4b43-abb0-e35053c00426
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-B-infra/task-B3-dominio-dns-ssl.md — B3 · Alta del dominio, DNS en Cloudflare y SSL"
    status: pending
  - id: ae76ba7b-e126-4f2f-ade3-bef56cae2542
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-B-infra/task-B9-close-block.md — B9 · Cierre del bloque B: infra lista, todavia sin deploy"
    status: pending
  - id: 719d9258-863e-4d0a-9f8b-e4f3773dad2c
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-C-deploy/task-C1-deploy.md — C1 · Deploy del contenedor y health check en verde"
    status: pending
  - id: 1161ad4b-2e42-4fc6-a590-382c2f20c923
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-C-deploy/task-C2-cutover-dominio.md — C2 · Cutover del dominio a produccion con la frase de autorizacion de Mario"
    status: pending
  - id: 22bece13-da97-46e1-8412-4a67d0f3b194
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-C-deploy/task-C9-close-block.md — C9 · Cierre del bloque C: el sitio responde en su dominio"
    status: pending
  - id: ac9266f7-ad61-487e-a37c-8b3e56877e32
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-D-verificacion/task-D1-probes-en-vivo.md — D1 · Probes HTTP reales contra produccion, no contra localhost"
    status: pending
  - id: ca4b0b3e-1558-439e-9f61-05d725f160a5
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-D-verificacion/task-D2-lighthouse-produccion.md — D2 · Lighthouse mobile contra el dominio real"
    status: pending
  - id: 9a7e9ae6-f83d-4949-b699-b2c2e8dfabaa
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-D-verificacion/task-D3-seguridad-headers.md — D3 · CSP, cabeceras, 404, sitemap y robots verificados en vivo"
    status: pending
  - id: c765f233-09a0-49dd-8546-11593d429b7d
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/block-D-verificacion/task-D9-close-block.md — D9 · Cierre del bloque D: certificacion con evidencia"
    status: pending
  - id: f9d1c703-4b9e-4a08-8628-e5be2a376cb4
    content: "Ejecuta SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/tasks/task-Z9-final-audit.md — Z9 · Auditoria final, registro en CRONFIX y mover el plan a complete/"
    status: pending
---

# SB-DECANATO-02-deploy-certificacion-Composer2Max

Certificar el sitio y ponerlo en produccion en su dominio. Con evidencia en vivo,
no con un reporte.

## Antes de empezar
1. `_shared/00-pre-flight.md`
2. `_shared/01-guardrails.md`
3. `_shared/08-gates-zentinek.md`  ← los gates de aprobacion de PRODUCTION

## Bloques
- **A · Certificacion** — el sitio esta bien ANTES de exponerlo.
- **B · Infra** — repo empujado, proyecto y app en Coolify, dominio dado de alta.
- **C · Deploy** — contenedor arriba y cutover del dominio.
- **D · Verificacion** — probes reales contra el dominio publico.

Cada bloque cierra con su `task-X9-close-block.md`. Si un bloque falla, los
anteriores quedan estables. **Ningun bloque avanza sin la evidencia del anterior.**

## Los dos bloqueos conocidos al generar este Shot (2026-09-09)
1. `pastoralsocialdecanatodulcenombre.org` NO aparece en ZENTINEK: ni en
   `domain_list` (20 dominios), ni en `apps_list` (39 apps), ni como proyecto.
   El bloque B lo da de alta desde cero.
2. El repo tiene los archivos en el disco de Mario pero **no esta empujado a
   GitHub**. Coolify jala del repo remoto: sin push no hay deploy. Es lo primero
   del bloque B.

## Regla de este Shot
Nada se marca hecho con un log de build. Se marca hecho con una URL publica
respondiendo, un header leido con `curl -I`, y una captura.
