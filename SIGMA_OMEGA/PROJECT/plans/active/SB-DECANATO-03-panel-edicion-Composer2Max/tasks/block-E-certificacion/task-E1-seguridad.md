# E1 · Intentar romperlo

No es una revisión de código. Es intentar romperlo a propósito, con `curl` en la mano.

## Scoping de roles
Con la sesión de un EDITOR_PARROQUIA de San Bernardo:
```bash
# debe dar 403
curl -X PUT https://<dominio>/api/contenido/parroquia.el-tepeyac.servicios \
     -H "Cookie: <sesión del editor>" -d '{"valor":"probando"}'
# debe dar 403
curl -X POST https://<dominio>/api/publicar -H "Cookie: <sesión del editor>" \
     -d '{"claves":["sitio.home.hero"]}'
# debe dar 403
curl https://<dominio>/api/usuarios -H "Cookie: <sesión del editor>"
```
Con sesión de SOLO_LECTURA: cualquier escritura debe dar 403.
Sin sesión: todo `/api/*` de escritura debe dar 401.

## Sesiones
- Reusar un refresh token ya rotado → revoca la cadena completa.
- Cambiar la contraseña → todas las sesiones se caen.
- Manipular el JWT (cambiar el rol dentro del payload) → rechazado por firma.
- Cookie sin `httpOnly` o sin `secure` en producción → falla.

## Subida
- POST con foto cruda sin token del editor → rechazado.
- Reusar un token de un solo uso → rechazado.
- Subir un `.php` o un `.svg` con script renombrado a `.jpg` → rechazado por MIME real.
- Archivo de 50 MB → rechazado por tamaño, sin tumbar el proceso.

## Inyección y XSS
- Guardar `<script>alert(1)</script>` en un texto → aparece escapado en la página
  pública, no se ejecuta.
- La CSP del sitio público sigue sin `unsafe-inline`.

## Rate limit
6 intentos de login fallidos desde la misma IP → bloqueado.

## Cierre
Cada intento documentado con el comando y la respuesta. Los que deben fallar,
fallando. **Si alguno pasa, se arregla antes de cerrar el bloque.**
