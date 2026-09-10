# 00 · Pre-flight

## Requisito previo duro
**El SB-DECANATO-02 tiene que estar cerrado.** No se le monta un panel a un sitio
que todavía no está publicado y certificado. Si el bloque D de ese Shot no cerró,
este no arranca.

## Estado esperado
- Sitio respondiendo en su dominio, `verify-produccion.mjs` en verde.
- `npm run build` y `npm run verify` en verde.
- Acceso a Eurekabase confirmado. **Eurekabase está en producción**: aprovisiona
  las bases de 14 proyectos y es el módulo `databases/` de ZENTINEK. El campo `fase`
  de su registro en CRONFIX dice `desarrollo` porque el producto sigue en desarrollo
  activo, no porque no aguante producción. No usar `fase` como semáforo de nada.

## Datos del proyecto
| Campo | Valor |
|---|---|
| proyecto_id CRONFIX | `2335fb6d-3bbc-4f86-bb5d-09045e91b74c` |
| base | Eurekabase — Postgres self-hosted del cluster Hermes |
| repo | github.com/DayanaWebSites/DecanatoPastoral |

## Credenciales
La `DATABASE_URL` de Eurekabase se toma del vault de ZENTINEK y se inyecta como
variable de entorno en Coolify. **Nunca se pega completa en el chat ni se comitea.**
En conversación, sólo prefijo y últimos 4.

## Contexto de CRONFIX — obligatorio antes de tocar código
```sql
SELECT file FROM sigma_omega.core WHERE slug IN
  ('by-type-sitio-web-astro','panel-edit','roles','auth-sesiones','cruds-edit',
   'cdn','forms-file-upload','forms-validacion','data-grid-inline-edit') AND activo=true;

SELECT file FROM sigma_omega.project_directives
WHERE proyecto_id='2335fb6d-3bbc-4f86-bb5d-09045e91b74c' ORDER BY slug;
```
`by-type-sitio-web-astro` está en **v1.1.0**: la frontera con Next se corrigió
justamente por este Shot. Lee esa sección antes de proponer migrar nada.
