# D2 · OBSOLETO — no ejecutar

> **Esta tarea quedó anulada el 2026-09-09.** Proponía guardar las imágenes en un
> volumen de Coolify. Eso es incorrecto para esta operación.

## Qué hacer en su lugar

Ir a **`task-D2-upload-r2.md`**, en esta misma carpeta.

El almacenamiento de archivos va a **Cloudflare R2, aprovisionado por Eurekabase
y expuesto como CDN**. No a un volumen del contenedor.

## Por qué se anuló

Un volumen de Coolify:

- no sobrevive a un recrear del contenedor sin respaldo aparte,
- no se sirve por CDN, así que cada foto sale del VPS,
- no permite subida directa desde el navegador, y ese es justo el punto: el
  presigned PUT hace que el **original sin difuminar nunca toque la infra**.

La arquitectura correcta está en el módulo `cdn` v2.1.0 de CRONFIX y en
`task-D2-upload-r2.md`.

## Nota

Este archivo se queda como lápida en vez de borrarse porque no hay forma de
eliminarlo remoto. Si estás leyendo esto desde un agente: **ignora todo lo que
decía antes y usa `task-D2-upload-r2.md`.** Mario puede borrar este archivo a mano.
