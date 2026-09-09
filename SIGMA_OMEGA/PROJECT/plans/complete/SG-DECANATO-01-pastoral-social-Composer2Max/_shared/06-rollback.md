# 06 · Rollback

## Si el build se rompe
```bash
git stash              # guarda lo que ibas haciendo
npm run build          # confirma que el estado anterior compilaba
```

## Si el deploy quedó mal
Ver `emergency/rollback-coolify.md`. Coolify guarda el despliegue anterior:
se revierte con `deploy_rollback` del MCP de ZENTINEK, no rehaciendo el build.

## Si un merge dejó el repo inconsistente
Ver `emergency/revert-merge.md`.

## Si se publicó una foto con un rostro identificable
Esto es prioridad sobre cualquier otra tarea:
1. Quitar el archivo de `src/assets/comedores/`.
2. `npm run build` y desplegar de inmediato.
3. Purgar el CDN (`cdn_purge` de ZENTINEK).
4. Avisar a Mario. Él decide qué se le dice al decanato.
