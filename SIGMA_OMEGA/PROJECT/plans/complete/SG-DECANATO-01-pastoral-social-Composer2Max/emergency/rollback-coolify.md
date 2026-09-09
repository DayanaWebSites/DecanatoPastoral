# Rollback en Coolify

## Revertir el último despliegue
```
deploy_list      → id del despliegue anterior estable
deploy_rollback  → ese id
deploy_status    → confirmar que quedó activo
runtime_probe    → confirmar 200 en la URL pública
```
Coolify conserva el despliegue anterior. **No se revierte rehaciendo el build**:
eso tarda más y puede reintroducir el mismo problema.

## Si el dominio quedó apuntando mal
```
domain_status         → ver a dónde resuelve
domain_doctor         → diagnóstico de DNS y SSL
domain_cutover_status → estado del cutover
```
Si el cutover está a medias, revertir el registro DNS antes de tocar la app.

## Si es urgente y el sitio está caído
`container_restart` primero. Si no levanta en un intento, rollback.
No dejes el sitio caído mientras investigas: revierte y luego investiga.

## Purga de CDN
Después de cualquier rollback que cambie contenido: `cdn_purge`.
Obligatorio si el rollback fue por una foto que había que quitar.
