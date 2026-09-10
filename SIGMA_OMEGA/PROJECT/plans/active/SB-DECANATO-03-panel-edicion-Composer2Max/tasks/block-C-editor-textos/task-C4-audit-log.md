# C4 · Audit log

`panel-edit` lo pide explícitamente. No es opcional.

## Qué se registra
Toda escritura: guardado de borrador, publicación, descarte, subida y borrado de
imagen, reordenamiento, alta y baja de usuario, cambio de rol.

Por cada evento: usuario, acción, entidad, `valor_antes`, `valor_despues`, IP, fecha.

## Para qué sirve de verdad
1. **Recuperar un texto que alguien borró sin querer.** Va a pasar.
2. Saber quién cambió el horario de un comedor cuando alguien reclame.
3. Investigar si se publica una foto que no debía.

El punto 1 es el que justifica el trabajo: sin esto, un borrado accidental es
irrecuperable.

## Vista
Pantalla `/editar/historial`, sólo ADMIN o superior. Lista filtrable por usuario,
fecha y entidad, con un diff legible de antes y después. Y un botón **Restaurar**
que trae el valor anterior al borrador (no lo publica directo).

## Retención
Doce meses. Después se archiva. No es un sistema de versionado completo: es un
registro de quién tocó qué.

## Cierre
Borrar un texto a propósito, encontrarlo en el historial y restaurarlo.
