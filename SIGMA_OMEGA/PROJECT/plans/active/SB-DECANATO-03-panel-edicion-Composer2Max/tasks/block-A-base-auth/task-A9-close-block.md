# A9 · Cierre del bloque A

- [ ] Esquema aplicado en Eurekabase y seed de roles corrido
- [ ] Constraint de `imagenes.procesada` probado: no deja publicar sin difuminar
- [ ] Contenido migrado, diff del HTML vacío contra la versión JSON
- [ ] Login, logout y renovación funcionando
- [ ] Rotación de refresh verificada
- [ ] **Detección de reuse probada a propósito**
- [ ] Rate limit del login probado
- [ ] Matriz de permisos probada rol por rol, con los 403 que deben ocurrir
- [ ] `DATABASE_URL` en el vault, no en el repo (`git ls-files | grep -i env`)

Sin la prueba de los 403 el bloque no cierra. Es la mitad del valor de esta task.

Actualiza `_shared/07-handoff-state.md`.
