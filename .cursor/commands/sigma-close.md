# /sigma-close

Cierre de sesión o de Shot en Decanato Pastoral Social.

Secuencia: sigma-qa → sigma-reviewer (si hubo UI) → sigma-commit → sigma-cronfix → sigma-janitor.

1. `npm run build && npm run verify`
2. Confirmar 0 JS en `dist/`
3. Commit en español si Mario lo pidió
4. ADR + handoff
5. Mover el plan a `complete/` sólo si la auditoría pasó

No mandar mensajes al decanato ni a Angie.
