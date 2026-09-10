# 01 · Guardrails

Aplican los del SG-01 y los del SB-02. Encima de esos:

1. **`09-difuminado-obligatorio.md` gana sobre todo lo demás.**
2. **El público no se degrada.** Si al terminar este Shot una ruta pública sirve un
   solo `.js`, o Lighthouse mobile baja de 95, el bloque no cierra. El panel no es
   excusa para arruinar el sitio.
3. **Autosave nunca escribe en publicado.** Escribe en borrador. Siempre.
4. **Backend valida el rol en CADA endpoint.** Que el frontend no pinte un botón no
   es seguridad. El módulo `roles` es explícito en esto.
5. **Nada de criptografía a mano.** Sesiones según `auth-sesiones`: JWT de 15 min,
   refresh rotativo, detección de reuse. Se usa una librería probada.
6. **Rich text sanitizado.** Si se acepta HTML, DOMPurify del lado del servidor.
   Nunca se ejecuta JS recibido del cliente.
7. **Las rutas del panel llevan `noindex` y nunca se cachean.**
8. **Los secretos viven en el vault de Eurekabase, no en el repo.** Las credenciales
   de R2 (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) las pone el
   provisioning solo — no las escribas a mano.
9. **El CDN cuelga del dominio del cliente**, nunca de eurekasigma.com ni de
   deltatasker.com. Ver la regla del Error 1014 en el módulo `cdn` v2.1.0.
9. **No se toca el diseño aprobado.** Este Shot agrega capacidad de edición, no
   rediseña. Los cambios de diseño van en su propio Shot.
