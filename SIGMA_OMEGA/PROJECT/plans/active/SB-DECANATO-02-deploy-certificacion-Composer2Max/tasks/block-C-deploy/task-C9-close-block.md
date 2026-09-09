# C9 · Cierre del bloque C

## Checklist con evidencia
- [ ] Deploy exitoso. `deploymentId` y salida de `deploy_status`.
- [ ] `runtime_probe` en verde.
- [ ] Las cuatro rutas verificadas con `curl` contra la URL desplegada.
- [ ] Si hubo cutover: `cutoverStatus: live` y SSL válido.
- [ ] Si NO hubo cutover: anotado explícitamente por qué (dominio no comprado,
      gate sin aprobar) y en qué URL quedó publicado mientras tanto.

## Rollback
Si algo quedó mal: `emergency/rollback-coolify.md` del SG-01. Se revierte
primero, se investiga después. El sitio no se deja caído.

Actualiza `_shared/07-handoff-state.md`.
