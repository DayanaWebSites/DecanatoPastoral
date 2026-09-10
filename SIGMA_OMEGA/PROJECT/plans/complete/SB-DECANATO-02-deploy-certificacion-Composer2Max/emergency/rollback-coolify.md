# Rollback en Coolify

## El sitio está caído o sirviendo algo roto
```
deploy_list       → id del despliegue anterior estable
deploy_rollback   → ese id
deploy_status     → confirmar que quedó activo
runtime_probe     → confirmar que responde
cdn_purge         → obligatorio si el rollback cambió contenido
```
**No se revierte rehaciendo el build.** Tarda más y puede reintroducir el problema.

Si no levanta al primer `container_restart`, se hace rollback. El sitio no se
deja caído mientras se investiga.

## El dominio quedó apuntando mal
```
domain_status         → a dónde resuelve
domain_doctor         → diagnóstico de DNS y SSL
domain_cutover_status → estado del cutover
```
Si el cutover quedó a medias, revertir el registro DNS antes de tocar la app.

## Se publicó una foto con un rostro identificable
Prioridad sobre todo lo demás:
1. Quitar el archivo de `apps/web/src/assets/comedores/`, build y deploy inmediato.
2. `cdn_purge`.
3. Avisar a Mario. Él decide qué se le dice al decanato.
