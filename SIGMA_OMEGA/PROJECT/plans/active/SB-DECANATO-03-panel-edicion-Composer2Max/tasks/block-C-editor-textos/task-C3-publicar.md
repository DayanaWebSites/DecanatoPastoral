# C3 · Publicar y descartar

## Publicar
1. Valida el borrador contra el esquema Zod. Si no valida, no publica y dice qué campo.
2. `valor_publicado = valor_borrador`, `valor_borrador = NULL`, `publicado_en = now()`.
3. Registra en `audit_log`.
4. **Purga la cache** de las rutas afectadas (task B2).
5. Confirma con el enlace a la página pública: "Publicado. [Ver la página]".

## Alcance del botón
Publica **todos los borradores que el usuario puede publicar**, no sólo el bloque en
el que está. Angie va a editar cinco cosas de una parroquia y esperar que "Publicar"
publique las cinco.

La barra dice cuántos cambios se van a publicar antes de confirmar:
> "Vas a publicar 5 cambios en la parroquia San Bernardo. [Publicar] [Ver la lista]"

## Quién puede publicar
SOLO_LECTURA no. EDITOR_PARROQUIA sólo lo suyo. Se valida en el backend.

## Si algo falla a medias
La publicación va en una transacción. O se publican todos los bloques o ninguno.
Nada de dejar media parroquia publicada.

## Cierre
Publicar 5 cambios de una parroquia en un solo clic, verlos en la URL pública sin
esperar el vencimiento de la cache, y confirmar que el audit log los registró.
