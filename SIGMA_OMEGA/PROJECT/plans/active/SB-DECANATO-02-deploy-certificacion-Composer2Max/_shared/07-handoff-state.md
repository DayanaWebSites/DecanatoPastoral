# 07 · Estado de entrega

## Bloques
| Bloque | Estado | Evidencia |
|---|---|---|
| A · Certificación | pendiente | — |
| B · Infra | pendiente | — |
| C · Deploy | pendiente | — |
| D · Verificación | pendiente | — |

## Bloqueos conocidos al generar el Shot (2026-09-09)
- [ ] **El repo no está empujado a GitHub.** Los archivos existen en el disco de
      Mario; Coolify jala del remoto. Bloquea todo el bloque B.
- [ ] **El dominio no existe en ZENTINEK.** Verificado contra `domain_list` (20
      dominios) y `apps_list` (39 apps): ninguna coincidencia con el decanato.
      Hay que darlo de alta. Antes de eso, confirmar con Mario dónde está
      registrado el dominio y en qué cuenta de Cloudflare.
- [ ] Falta `public/og.jpg` (task-A3).
- [ ] `src/data/decanato.json` sin correo: el aviso de privacidad sale con banner
      de pendiente. Se puede publicar así, pero se reporta.

## Bitácora
| Fecha | Bloque | Qué quedó |
|---|---|---|
| 2026-09-09 | — | Shot generado. Dockerfile, nginx.conf y CSP estricta escritos. |
