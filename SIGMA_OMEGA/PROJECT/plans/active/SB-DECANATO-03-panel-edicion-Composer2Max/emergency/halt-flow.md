# HALT

## Detenerse en seco si
- Se publicó una foto con un rostro identificable → `foto-publicada.md`, es prioridad.
- Un intento de E1 que debía fallar, pasa. Hay un hueco de permisos abierto.
- La migración de contenido produce un diff distinto de vacío y no se explica por qué.
- Eurekabase no responde y el sitio empieza a servir errores.
- Aparece JavaScript del editor en una ruta pública.
- Hay que aflojar la CSP del sitio público para que el editor funcione.

## Qué hacer
1. Si el sitio público está afectado, revertir primero (`rollback-coolify.md` del SB-02).
2. `git stash` si hay cambios a medias.
3. Anotar en `_shared/07-handoff-state.md`: bloque, task, error textual.
4. Reportar a Mario con la salida completa.

## Lo que NO se hace
- No se afloja la CSP del sitio público para desbloquear el editor. Se usan nonces.
- No se desactiva el candado del difuminado "temporalmente para probar".
- No se declara certificado nada sin la evidencia del bloque E.
