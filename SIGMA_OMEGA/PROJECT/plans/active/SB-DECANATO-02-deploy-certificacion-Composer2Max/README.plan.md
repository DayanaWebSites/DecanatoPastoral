# SB-DECANATO-02 · Deploy y certificación

Poner el sitio en producción y **certificarlo con evidencia en vivo**.
Documento para leer. El que Cursor Build ejecuta es
`.cursor/plans/SB-DECANATO-02-deploy-certificacion-Composer2Max.plan.md`.

| | |
|---|---|
| Depende de | `SG-DECANATO-01-pastoral-social-Composer2Max` |
| Repo | github.com/DayanaWebSites/DecanatoPastoral |
| Dominio objetivo | pastoralsocialdecanatodulcenombre.org |
| Deploy | Coolify vía ZENTINEK |
| Modelo | Composer 2 + MAX |

## Los cuatro bloques

| Bloque | Qué hace | Cierra con |
|---|---|---|
| **A · Certificación** | El sitio está bien ANTES de exponerlo: auditoría, imagen Docker probada en local, axe, Lighthouse, imagen OG | `task-A9-close-block` |
| **B · Infra** | Push a GitHub, proyecto y app en Coolify, alta del dominio | `task-B9-close-block` |
| **C · Deploy** | Contenedor arriba y cutover del dominio | `task-C9-close-block` |
| **D · Verificación** | Probes reales contra el dominio público | `task-D9-close-block` |

Si un bloque falla, los anteriores quedan estables. **Ninguno avanza sin la
evidencia del anterior.**

## Lo que ya está resuelto al generar este Shot
- `Dockerfile` multi-stage (node:22-alpine → nginx:1.27-alpine) con health check.
- `nginx.conf` con el `try_files` que Astro necesita, cache por tipo de archivo y
  **CSP sin `unsafe-inline`** — se puso `inlineStylesheets: 'never'` en
  `apps/web/astro.config.mjs` para que sea determinista que no hay `<style>` inline.
  Verificado: 0 tags `<style>`, 0 scripts ejecutables (los 26 `<script>` del build
  son `application/ld+json`, que el navegador no ejecuta).
- `public/og.jpg` renderizada con las fuentes reales del sitio.
- `verifications/verify-produccion.mjs`: audita el sitio **en vivo**. Distingue
  modo local de producción, para no dar falsos positivos contra `astro preview`.

## Los dos bloqueos, verificados el 2026-09-09
1. **El repo no está empujado a GitHub.** Los archivos están en el disco de Mario.
   Coolify jala del remoto. Es la task B1 y bloquea todo lo demás.
2. **El dominio no existe en ZENTINEK.** Comprobado contra `domain_list`
   (20 dominios) y `apps_list` (39 apps): ninguna coincidencia con el decanato.
   Antes de darlo de alta hay que confirmar con Mario dónde está registrado.

## Gates de producción
Las mutaciones sobre PRODUCTION devuelven `PENDING` y esperan a Mario.
Ver `_shared/08-gates-zentinek.md`. **No se fuerzan.** Por eso el bloque C
despliega primero en `preview.*`, que no pide frase, y deja el apex para el final.

## Cómo se ejecuta
```bash
# 1. Abrir el .plan.md con Cursor Build
# 2. Al terminar, certificar:
node SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/verifications/verify-produccion.mjs https://pastoralsocialdecanatodulcenombre.org
```

## Lo que este Shot NO hace
No le manda nada a Angie ni al decanato. El sitio queda publicado y certificado;
el mensaje con el enlace lo aprueba Mario palabra por palabra antes de que salga.
