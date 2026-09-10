# C2 · Autosave contra borrador

## La regla que no se toca
**Autosave escribe en `valor_borrador`. Nunca en `valor_publicado`.**

## Comportamiento
- Se dispara al salir del bloque (blur) y cada 3 segundos de inactividad mientras
  se escribe. No en cada tecla: eso satura la base sin ganar nada.
- Indicador honesto en la barra: "Guardando…" → "Guardado" con la hora.
  **Nada de fingir**: si el guardado falló, dice que falló.
- Si se pierde la conexión: se acumula en memoria, se reintenta, y se avisa
  claramente "Sin conexión — no se ha guardado". Nunca se le dice guardado a algo
  que no se guardó.
- `beforeunload` si hay cambios sin guardar.

## Bloqueo optimista
Cada guardado manda el `updated_at` que tenía al cargar. Si en la base cambió:
> "Alguien más editó esto mientras trabajabas. [Ver lo que hay ahora] [Sobrescribir]"

No se pisa en silencio. Con editores por parroquia las colisiones son raras por
construcción, pero en el contenido global (home, pastoral social) dos ADMIN sí
pueden chocar.

## Descartar borrador
Botón en la barra. Confirma, borra `valor_borrador`, vuelve a lo publicado.
Es la red de seguridad que hace que el autosave no dé miedo.

## Cierre
- Editar, cerrar el navegador, volver: el borrador sigue ahí.
- Publicar: el borrador se vacía y lo público cambia.
- Colisión provocada a propósito entre dos sesiones: avisa, no pisa.
- Guardado con la red caída: dice que no guardó.
