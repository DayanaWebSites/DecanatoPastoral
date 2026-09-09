# ADR-002 — Decisiones de sesión SG-DECANATO-01

Fecha: 2026-09-09
Estado: ACEPTADA
Proyecto: Decanato Dulce Nombre de Jesús — Pastoral Social
Shot: SG-DECANATO-01-pastoral-social-Composer2Max
Rama: `shot/sg-decanato-01`

## Decisiones

1. **Graphify no se instala.** El repo tiene ~40 fuentes. GitNexus (313 nodos) cubre `src/content/` y `src/data/`. Reevaluar si el sitio crece con documentación propia.
2. **El formulario permanece estático.** Sin `CONTACTO_DESTINO` no hay Resend. No se pasa el sitio a `output: 'server'`. Quedan `/gracias` y `?error=1` listos. El aviso en `/ayudar` se mantiene.
3. **Nada se inventa.** Correo, teléfonos, logo de Santa Teresita y servicios de 10 parroquias siguen `en_construccion` / `null`.
4. **Deploy = Coolify vía ZENTINEK, no Vercel.** `Dockerfile` + `nginx.conf` listos. OneClick no se usa: provisionaría DB+Redis y rompería `by-type-sitio-web-astro`.
5. **No hay app Coolify todavía.** El proyecto ZENTINEK `d697de05-d529-4fbb-8e13-63f69b1a0e3f` no tiene `coolifyProjectUuid` ni `appUuid`. El cutover del dominio espera confirmación de compra.
6. **Panel de edición = opción A** (ADR `adr-002-panel-edicion-fase2`): commit por GitHub + rebuild. No se implementa en este Shot.
7. **Fuentes:** latin only, `font-display: optional`, métricas de fallback. Lighthouse mobile home 98/100/100/100.

## Consecuencias

- El siguiente Shot (SB-DECANATO-02) debe: crear la app Coolify sin base de datos, empujar el repo, y montar el subdominio temporal.
- El endpoint de contacto se abre el día que llegue `CONTACTO_DESTINO`.
