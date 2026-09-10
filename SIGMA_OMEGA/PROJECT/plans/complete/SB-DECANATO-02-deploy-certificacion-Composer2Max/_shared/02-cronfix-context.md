# 02 · Contexto CRONFIX

## Ya registrado
| Tabla | Slug / id |
|---|---|
| `public.proyectos` | `2335fb6d-3bbc-4f86-bb5d-09045e91b74c` |
| `sigma_omega.core` | `by-type-sitio-web-astro` |
| `sigma_omega.project_directives` | `adr-001-astro-sobre-next` |

## Lo que este Shot debe registrar al cerrar
- ADR `adr-003-deploy-coolify` con la configuración final: app uuid de Coolify,
  hostname, estrategia de cache y CSP.
- `public.shots`: el registro de este Shot ejecutado.
- `public.proyectos`: `fase = 'produccion'`, `proximo_hito` actualizado.

## Herramientas de ZENTINEK que usa este Shot
`project_create` · `deploy_app` · `deploy_status` · `deploy_list` · `deploy_rollback`
`domain_attach_custom` · `domain_status` · `domain_doctor` · `domain_cutover`
`env_set` · `runtime_probe` · `cdn_purge` · `safety_approve`
