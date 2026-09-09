# CLAUDE.md · Decanato Pastoral Social

Contexto obligatorio antes de tocar este repo.

## Qué gobierna este proyecto
- Módulo canónico: `sigma_omega.core` slug **`by-type-sitio-web-astro`**
- Decisión de stack: `sigma_omega.project_directives` slug **`adr-001-astro-sobre-next`**
- proyecto_id en CRONFIX: `2335fb6d-3bbc-4f86-bb5d-09045e91b74c`

Consulta CRONFIX antes de tomar cualquier decisión técnica. No asumas.

## Qué es
Sitio estático de la Pastoral Social del Decanato Dulce Nombre de Jesús
(Arquidiócesis de Guadalajara). Tres comedores asistenciales, 13 parroquias.
Astro 5, `output: 'static'`, cero JavaScript enviado al cliente.

No es una app. No tiene auth, ni base de datos, ni CRUD. Si aparece esa necesidad,
el módulo dice que se migra a `by-type-app-web` (Next). No se improvisa encima de Astro.

## Reglas duras
1. **No inventar datos del decanato.** Teléfonos, correos, horarios y servicios sólo se
   publican si vinieron del cliente. Sin dato: `estado: en_construccion`.
2. **Ningún rostro identificable de una persona atendida.** Las fotos se difuminan antes
   de publicarse. Los originales viven en `_source/`, ignorado por git.
3. **Todo dato editable vive en `src/content/` o `src/data/`**, nunca hardcodeado en un
   `.astro`. El auditor lo verifica y falla si se rompe.
4. **Toda collection lleva esquema Zod.**
5. **Imágenes siempre por `astro:assets`.** Nunca `<img>` crudo.
6. **Islas sólo con interacción real** justificable en una frase. El menú móvil usa
   `<details>` nativo justamente para no meter una.
7. **Nada se declara listo sin evidencia en vivo.** Un reporte no cierra una tarea.

## Paleta
Muestreada del logo oficial del decanato, no del accent de EurekaDesign:
verde `#04551F` · dorado `#DEAB33` · crema `#FCF9F2` · tinta `#1B1A17`.
Definida en `src/styles/global.css`, bloque `@theme`. No se cambia sin pedirlo.

## Antes de dar por terminado
```bash
npm run build && npm run verify
```

## Deploy
Coolify vía ZENTINEK. `Dockerfile` multi-stage → nginx. `nginx.conf` trae el
`try_files` que Astro necesita (genera carpetas, no archivos sueltos), la cache por
tipo y una **CSP sin `unsafe-inline`**: `astro.config.mjs` tiene
`inlineStylesheets: 'never'` justamente para que eso se sostenga. Si algún día
aparece un `<style>` inline, la CSP lo bloquea. Se arregla el origen, no la CSP.

## Shots
| Shot | Qué hace | Estado |
|---|---|---|
| `SG-DECANATO-01-pastoral-social-Composer2Max` | Genesis: infra IA SIGMA, formulario, datos pendientes | activo |
| `SB-DECANATO-02-deploy-certificacion-Composer2Max` | Certificación y deploy en 4 bloques | activo |

Sus README están en `SIGMA_OMEGA/PROJECT/plans/active/<slug>/README.plan.md`.

## Auditores
```bash
npm run verify                                  # estructura del repo (SG-01)
node .../SB-DECANATO-02.../verifications/verify-produccion.mjs https://<dominio>
```
El segundo es el que certifica. El primero sólo dice que el repo está sano.
