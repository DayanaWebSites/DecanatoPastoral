# D9 · Cierre del bloque D

- [ ] 5 fotos con rostros claros procesadas por el panel: **ninguna cara identificable**
- [ ] POST directo al endpoint con foto cruda: rechazado
- [ ] `procesada = false` no se puede publicar (constraint probado)
- [ ] Confirmación explícita cuando el detector no ve rostros
- [ ] EXIF eliminado (verificado con `exiftool`)
- [ ] Nombre original descartado
- [ ] Reordenar con mouse y con teclado
- [ ] `alt` obligatorio y validado
- [ ] Bucket `eb-{slug}` provisionado por Eurekabase
- [ ] CDN en `cdn.pastoralsocialdecanatodulcenombre.org` (o `deferred` documentado)
- [ ] **NO** quedó como `{slug}-cdn.eurekasigma.com` (Error 1014)
- [ ] Subida por presigned PUT directo del navegador
- [ ] `cdn_purge` probado
- [ ] Audit log registrando subidas, borrados y reordenamientos

## La pregunta de control
¿Existe alguna secuencia de clics, o algún request armado a mano, que publique una
cara sin difuminar? Si no puedes responder que no con una prueba, el bloque no cierra.

Actualiza `_shared/07-handoff-state.md`.
