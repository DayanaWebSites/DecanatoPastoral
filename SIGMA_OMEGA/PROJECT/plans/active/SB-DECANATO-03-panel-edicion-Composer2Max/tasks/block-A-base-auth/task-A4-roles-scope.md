# A4 · Roles con scope por parroquia

## Jerarquía (módulo `roles` v2.0.0)
| Rol | Nivel | Alcance |
|---|---|---|
| SUPERMASTER | 100 | todo. Auto-asignado por dominio de correo de DeltaTasker |
| MASTER | 80 | todo el contenido. El sacerdote encargado |
| ADMIN | 60 | todo el contenido, crea e invita usuarios. Angie |
| EDITOR_PARROQUIA | 40 | sólo las parroquias de `usuario_parroquias` |
| SOLO_LECTURA | 20 | ve borradores, no guarda ni publica |

## Lo que hay que construir
- `middleware.ts`: resuelve sesión, carga rol y scope, y **rechaza antes de renderizar**.
- Helper `puedeEditar(usuario, clave)`: deriva la parroquia de la clave del contenido
  y la compara contra el scope. Una sola función, usada por el front y por el back.
- `<PermissionGate>` para no pintar botones sin permiso.
- Pantalla de usuarios (sólo ADMIN+): alta, baja, asignar rol y parroquias.

## La regla que más se rompe
**El backend valida en CADA endpoint.** Que el frontend no pinte el botón no es
seguridad. Un EDITOR_PARROQUIA de San Bernardo que hace un PUT a mano contra
`parroquia.el-tepeyac.servicios` tiene que recibir 403, no un 200.

Eso se prueba en la task E1, a propósito, con curl.

## Contenido global
Home, `/pastoral-social`, aviso de privacidad y los datos del decanato: sólo ADMIN
o superior. Un editor de parroquia no toca la portada.

## Cierre
La matriz de permisos probada rol por rol, incluyendo los intentos que deben fallar.
