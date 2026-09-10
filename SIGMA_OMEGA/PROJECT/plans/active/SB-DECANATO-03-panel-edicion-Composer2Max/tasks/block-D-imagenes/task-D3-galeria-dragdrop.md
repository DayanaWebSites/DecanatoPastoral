# D3 · Galería: agregar, reordenar, eliminar

## Dónde vive
Dentro del modo edición, en la sección de fotos de cada comedor y de cada parroquia.
No en una pantalla aparte: se ve la galería como queda publicada y se edita ahí.

## Reordenar
Drag & drop con handle visible. El orden se guarda en `imagenes.orden` **al soltar**,
no en cada movimiento del mouse.

Que funcione con teclado también: seleccionar y mover con flechas. Es un requisito de
accesibilidad y además es más rápido para reordenar diez fotos.

## Agregar
La dropzone de D2 (subida a R2), que dispara el difuminado de D1. **No hay otro camino de entrada.**

## Texto alternativo
Cada foto pide su `alt`. El esquema Zod ya exige mínimo 10 caracteres y que describa
la foto. La UI lo explica en una línea: *"Describe qué se ve, para quien no puede ver
la imagen."*

Sin `alt`, la foto no se publica. Es accesibilidad, y ya está en el contrato.

## Eliminar
Confirmación. Si la foto está publicada, avisar que va a desaparecer del sitio.

## Límite práctico
Máximo 12 fotos por comedor. Más que eso nadie las ve y pesan de más.
La UI lo dice antes de que suba la trece.

## Cierre
Agregar, reordenar arrastrando y con teclado, poner alt, eliminar. Todo reflejado en
la página pública después de publicar.
