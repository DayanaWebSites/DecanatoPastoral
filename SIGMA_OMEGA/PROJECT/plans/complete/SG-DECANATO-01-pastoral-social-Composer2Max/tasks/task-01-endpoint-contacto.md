# task-01 · Endpoint real del formulario de voluntarios

## Contexto
`src/pages/ayudar.astro` tiene el formulario completo y funcional en el HTML, apuntando a
`/api/contacto`, que **todavía no existe**. La página muestra un aviso al equipo del decanato
diciéndolo. Esta task lo conecta y quita el aviso.

## Bloqueo
Necesita el dato del cliente: **a qué correo o WhatsApp deben llegar los mensajes**.
Si Mario aún no lo tiene, NO inventes uno. Deja la task abierta, anótalo en
`_shared/07-handoff-state.md` y pasa a la siguiente.

## Implementación
1. El sitio es `output: 'static'`. Para un endpoint hay dos caminos; usa el primero:
   - **Elegido**: dejar el sitio estático y mandar el POST a una Edge Function de Supabase
     o a un endpoint pequeño en el mismo Coolify. Cero cambio en el modelo de render.
   - Descartado: pasar todo el sitio a `output: 'server'` sólo por un formulario.
2. Validación con Zod, el mismo esquema compartido entre cliente y servidor
   (ver `sigma_omega.core` slug `forms-validacion`).
3. Envío con Resend. `RESEND_API_KEY` y `CONTACTO_DESTINO` como variables de entorno en
   Coolify, nunca en el repo.
4. Honeypot: el campo `apellido2` ya está en el formulario. Si viene lleno, responde 200
   y descarta en silencio.
5. Rate limit por IP: máximo 5 envíos en 10 minutos.
6. Página de gracias `/gracias` y manejo de error visible sin JavaScript
   (redirección con query param, no un toast que requiera isla).
7. Quita el bloque `<Aviso titulo="Nota para el equipo del decanato">` de `ayudar.astro`.

## Criterio de cierre
Envío real de prueba recibido en el destino, honeypot probado, rate limit probado,
y el formulario funciona con JavaScript desactivado.
