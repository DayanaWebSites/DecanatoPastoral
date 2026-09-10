# A3 · Login y sesiones

Sigue `auth-sesiones` al pie de la letra. Lo de abajo son las particularidades.

## Lo que dice el módulo y aquí no se negocia
- Access token JWT, **15 minutos**, cookie httpOnly + sameSite=lax + secure.
- Refresh token opaco (UUID), 30 días rolling, cookie con `path=/auth/refresh`.
- **Rotación**: cada uso emite uno nuevo y marca el viejo con `replaced_by_id`.
- **Detección de reuse**: si llega un refresh ya usado → revocar toda la cadena del
  usuario, log crítico, force logout. Defense in depth.
- Endpoints: login, refresh, logout, logout-all, sessions, delete session.

## Particularidades de este proyecto
- **Sin registro público.** Los usuarios los crea un ADMIN o superior. No hay
  "crear cuenta" en ninguna parte.
- Login con correo y contraseña. Hash con argon2id o bcrypt con cost alto.
  **Nada de criptografía a mano.**
- Rate limit en `/auth/login`: 5 intentos por IP cada 15 min. Es un sitio de iglesia,
  no necesita más, pero sin esto queda abierto a fuerza bruta.
- Recuperación de contraseña por correo. Angie va a olvidar la suya: asumilo desde
  el diseño, no como parche después.
- La cookie de sesión y la CSP tienen que convivir. Si el editor necesita inline
  scripts, se usan nonces. **No se afloja la CSP del sitio público.**

## Cierre
Login, logout, expiración a los 15 min con renovación transparente, rotación
verificada, y la detección de reuse **probada a propósito**: reusar un refresh viejo
y confirmar que revoca la cadena.
