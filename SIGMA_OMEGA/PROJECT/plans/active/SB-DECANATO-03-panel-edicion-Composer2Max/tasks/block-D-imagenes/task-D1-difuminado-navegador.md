# D1 · Difuminado de rostros en el navegador

**Lee `_shared/09-difuminado-obligatorio.md` antes de escribir una línea.**
Esta es la task más importante del Shot. Si sale mal, publicamos la cara de una
persona en situación de calle en internet.

## El flujo
```
suelta la foto
   ↓  (nada se ha subido)
detección de rostros en el navegador
   ↓
vista previa CON el difuminado ya aplicado
   ↓
puede pintar zonas extra a mano, o quitar el difuminado de un voluntario
   ↓
confirma  →  se sube SOLO el canvas difuminado
```
El original nunca sale de su computadora.

## Detector
Corre client-side. Opciones razonables: `face-api.js` (TinyFaceDetector, ~190 KB de
modelo) o MediaPipe Face Detection para web. **Los pesos se sirven desde el propio
dominio**, no desde un CDN: la CSP del sitio es estricta y no se afloja.

Se carga sólo en `/editar`, con `client:load` en esa isla.

## El difuminado
El mismo criterio que en `SIGMA_OMEGA/CORE/dev/scripts/difuminar-rostros.py`:
elipse con borde emplumado, pixelado más gaussiano fuerte. Sutil, no un recuadro
negro. Que la foto siga sirviendo para conmover, que es para lo que está.

Padding de ~34% sobre la caja detectada, y feather proporcional al lado menor.

## Pintar a mano
Brocha circular sobre la vista previa para difuminar lo que el detector no vio.
Y lo inverso: seleccionar un rostro ya difuminado y quitarle el difuminado, para
voluntarios y sacerdotes. **Quitarlo es una acción deliberada por rostro, nunca el
default.**

## Los cuatro controles (del documento 09)
1. El **presigned PUT** de `storage_presign_upload` se emite sólo al terminar el
   difuminado. Expira en 300s y vale para un objeto. Sin él no se escribe en R2.
   La subida va directa del navegador a R2: el original nunca toca tu infra.
2. `imagenes.procesada = false` no se puede publicar. Ya está en el esquema (A1).
3. **Si el detector no encuentra rostros, no se asume que no hay**: confirmación
   explícita "¿confirmas que no aparece la cara de ninguna persona atendida?",
   que se guarda en `sin_rostros_confirmado`. El detector falla con perfiles y
   contraluz — lo comprobamos.
4. Se registra en `audit_log` cuántos rostros detectó y si hubo intervención manual.

## Cómo se prueba que sirve
Toma 5 fotos del material original en `_source/` que **sí tienen rostros claros**,
súbelas por el panel y verifica que ninguna cara queda identificable en el resultado.
Después intenta pedir un presign sin haber pasado por el difuminado y confirma que
se rechaza. Y verifica que un presign ya usado no sirve una segunda vez.

## Cierre
Las 5 fotos procesadas y revisadas a ojo, el POST directo rechazado, y la
confirmación explícita apareciendo cuando el detector no ve nada.
