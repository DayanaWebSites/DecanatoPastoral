# HALT

## Cuándo detenerse en seco
- El build deja de compilar y no es evidente por qué.
- Una query a CRONFIX vuelve vacía cuando debería traer datos.
- Se detecta una foto publicada con un rostro identificable de una persona atendida.
- Aparece la necesidad de inventar un dato del decanato para que algo funcione.
- Un deploy deja el sitio caído.

## Qué hacer
1. Deja de escribir código. No intentes un parche.
2. `git stash` si hay cambios a medias.
3. Escribe en `_shared/07-handoff-state.md`: qué task, qué paso, qué error textual.
4. Reporta a Mario con el error completo, no con un resumen.
5. Espera instrucción.

## Lo que NO se hace
- No se sigue con la siguiente task "mientras tanto" si la que falló es bloqueante.
- No se inventa el dato faltante para desbloquear.
- No se declara nada resuelto sin evidencia.
