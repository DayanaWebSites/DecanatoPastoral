# A9 · Cierre del bloque A

## Checklist con evidencia
- [ ] `npm run build` en 0, 23 páginas — pegar el conteo
- [ ] `npm run verify` en verde — pegar la salida
- [ ] `docker build` exitoso y contenedor levantando — pegar los `curl`
- [ ] `/comedores` devuelve 200 desde el contenedor, no 404
- [ ] `/health` devuelve `ok`
- [ ] `/no-existe` devuelve 404 con la página del sitio
- [ ] CSP presente en las cabeceras
- [ ] axe sin violaciones serias ni críticas
- [ ] Lighthouse mobile 95+ en las cuatro categorías
- [ ] Las 12 fotos revisadas: ningún rostro de persona atendida identificable
- [ ] `public/og.jpg` existe

## Regla
Si algo de esta lista no tiene evidencia, **el bloque A no cierra** y no se pasa
al bloque B. Exponer al público un sitio que no pasó su propia auditoría es
justo lo que este Shot existe para impedir.

Actualiza `_shared/07-handoff-state.md` con la evidencia antes de seguir.
