# C9 · Cierre del bloque C

- [ ] Modo edición sobre la página real, no un formulario aparte
- [ ] Autosave a borrador, con indicador honesto
- [ ] Colisión entre dos sesiones: avisa, no pisa
- [ ] Descartar borrador regresa a lo publicado
- [ ] Publicar valida, es transaccional y purga cache
- [ ] EDITOR_PARROQUIA no puede publicar fuera de su scope (probado con curl)
- [ ] Audit log registrando, y **restauración de un texto borrado probada**
- [ ] Editor navegable con teclado

## La prueba que vale
Editar cinco campos de una parroquia, cerrar el navegador, volver, publicar, y ver
los cinco cambios en la URL pública. Sin ayuda de nadie y sin tocar la consola.

Actualiza `_shared/07-handoff-state.md`.
