# B9 · Cierre del bloque B

## Checklist con evidencia
- [ ] Repo empujado. URL del commit en GitHub.
- [ ] `_source/` confirmado fuera del remoto (`git ls-files _source/` → 0).
- [ ] Proyecto creado en ZENTINEK. `projectId` anotado.
- [ ] App creada en Coolify, build por Dockerfile, puerto 80, health `/health`.
      `appUuid` anotado.
- [ ] `PUBLIC_SITE_URL` seteada.
- [ ] Situación real del dominio confirmada **con Mario**, no supuesta.
- [ ] Si el dominio existe: preview attachado y DNS resolviendo.

## Todavía NO
En este punto no hay nada desplegado. La app existe, el repo existe, el dominio
está dado de alta. El contenedor se levanta en el bloque C.

Actualiza `_shared/07-handoff-state.md`.
