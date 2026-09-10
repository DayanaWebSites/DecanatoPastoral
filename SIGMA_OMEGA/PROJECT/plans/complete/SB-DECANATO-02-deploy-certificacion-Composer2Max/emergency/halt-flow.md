# HALT

## Cuándo detenerse en seco
- Un gate de ZENTINEK queda `PENDING` y Mario no está para aprobarlo.
- El deploy deja el sitio caído o sirviendo una versión vieja.
- `verify-produccion.mjs` falla contra el dominio público.
- Se detecta una foto publicada con un rostro identificable de persona atendida.
- Aparece la necesidad de inventar un dato del decanato para que algo avance.
- `_source/` aparece versionado en git.

## Qué hacer
1. Deja de escribir código. No intentes un parche.
2. Si el sitio está caído: **revierte primero** (`rollback-coolify.md`), investiga después.
3. Anota en `_shared/07-handoff-state.md`: qué bloque, qué task, el error textual.
4. Reporta a Mario con la salida completa, no con un resumen.

## Lo que NO se hace
- No se usa `force: true` para pasar un gate de producción.
- No se relaja la CSP para que deje de marcar una violación: se arregla el origen.
- No se declara certificado nada sin la salida del auditor en vivo.
