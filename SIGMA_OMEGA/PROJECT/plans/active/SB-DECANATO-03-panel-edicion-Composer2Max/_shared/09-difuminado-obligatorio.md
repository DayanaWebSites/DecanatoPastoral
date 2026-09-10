# 09 · El candado del difuminado

**Este documento gobierna sobre cualquier otra consideración de este Shot.**
Si algo aquí choca con una decisión de UX, de tiempo o de arquitectura, gana esto.

## El riesgo concreto
Le damos a Angie un botón de subir fotos. Ella sube, de buena fe, una foto donde se
ve la cara de una persona en situación de calle comiendo en el comedor. Queda
publicada en internet, indexada, compartida por WhatsApp.

Esa persona no puede dar consentimiento libre: está recibiendo asistencia de quien
le toma la foto. El aviso de privacidad **no cubre eso**.

## La regla
Ninguna imagen llega al servidor sin haber pasado por el difuminado en el navegador.

```
soltar foto
   ↓
detección de rostros EN EL NAVEGADOR (no se sube nada todavía)
   ↓
vista previa CON el difuminado aplicado
   ↓
la persona puede pintar zonas extra a mano si el detector falló
   ↓
confirma  →  se sube SOLO el canvas difuminado
```

El archivo original nunca sale de su computadora. No hay ventana en la que exista
sin difuminar en tu infraestructura. Eso es mejor que difuminarlo en el servidor.

## Los cuatro controles
1. **El presigned PUT de R2 es el token de un solo uso.** `storage_presign_upload`
   se emite ÚNICAMENTE después de que la imagen pasó por el difuminado, expira en
   300s y sirve para un solo objeto. Sin ese presign no hay forma de escribir en el
   bucket. Como la subida va directa del navegador a R2, **el original nunca toca
   tu infraestructura**: no existe la ventana.
2. La galería no permite publicar una imagen que no traiga la marca de procesada.
3. Si el detector no encuentra ningún rostro, **no se asume que no hay**: se le pide
   confirmación explícita ("¿confirmas que no aparece la cara de ninguna persona
   atendida?"). El detector falla con perfiles y contraluz.
4. Los rostros de voluntarios, servidores y sacerdotes se pueden dejar sin difuminar,
   pero eso es una acción deliberada por rostro, no el default.

## Lo que NO cuenta como control
- Un texto en el panel que diga "por favor no subas caras".
- Una casilla de "acepto la responsabilidad".
- Confiar en que la persona se acuerde.

Un instructivo no es un control. Si se puede hacer clic y publicar una cara, se va
a publicar una cara.

## Si aun así se publica una
Ver `emergency/foto-publicada.md`. Es prioridad sobre cualquier otra tarea.
