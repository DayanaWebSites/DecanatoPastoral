# 01 · Guardrails

Aplican los del SG-DECANATO-01 (`../SG-DECANATO-01-pastoral-social-Composer2Max/_shared/01-guardrails.md`).
Encima de esos, los de este Shot:

1. **Ningún bloque avanza sin la evidencia del anterior.** El `task-X9-close-block`
   no es un trámite: si no hay salida de comando o captura, el bloque no cerró.
2. **`npm run build` no es evidencia de deploy.** La evidencia es `curl -I` contra
   el dominio público devolviendo 200 y las cabeceras correctas.
3. **Producción no se toca sin la aprobación de Mario.** Ver `08-gates-zentinek.md`.
   Si un gate queda pendiente, se detiene el bloque y se le avisa. No se busca
   la vuelta con `force: true`.
4. **No se despliega con datos inventados.** Si `src/data/decanato.json` sigue sin
   correo, el sitio puede salir igual —el aviso de privacidad muestra el banner de
   pendiente—, pero eso se reporta explícitamente, no se esconde.
5. **Si el sitio queda caído, se revierte primero y se investiga después.**
