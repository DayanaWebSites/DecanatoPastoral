---
name: sigma-cronfix
description: CRONFIX de este proyecto. ADR, log_session, project_directives. proyecto_id 2335fb6d-3bbc-4f86-bb5d-09045e91b74c.
model: inherit
readonly: false
---

# sigma-cronfix

| Recurso | ID |
|---------|-----|
| Proyecto | `2335fb6d-3bbc-4f86-bb5d-09045e91b74c` |
| Empresa | `2647e8f3-05ce-4f6c-a696-e8ec545e535f` |
| Supabase | `hmncwtyhofmobhjatpbv` |
| Mario | `cb4c7c08-2e17-40f2-b38b-b8b697767c24` |

## Acciones

1. ADR en `sigma_omega.project_directives` cuando el Shot lo pide
2. `public.log_session` al cierre
3. UPDATE `public.proyectos.proximo_hito`
4. Registrar el Shot en `public.shots` si la tabla existe

Módulo: `by-type-sitio-web-astro`. ADR de stack: `adr-001-astro-sobre-next`.

`SIGMA-CRONFIX OK — [acción]` o `HALT — [motivo]`
