# 02 · Contexto CRONFIX

## Módulos que gobiernan este Shot
| Módulo | Qué aporta |
|---|---|
| `by-type-sitio-web-astro` v1.1.0 | Frontera con Next, reglas de SSR + panel, cache |
| `panel-edit` | Approach B: edición inline sobre la página |
| `roles` v2.0.0 | Jerarquía SUPERMASTER → MASTER → ADMIN → roles del proyecto |
| `auth-sesiones` | JWT + refresh rotativo, detección de reuse |
| `cruds-edit` | Patrón de edición inline y panel |
| **`cdn`** v2.1.0 | **R2 vía Eurekabase, expuesto como `cdn.{apex}`. Leer completo: trae la trampa de `allowSlugDefault`** |
| `forms-file-upload` v1.1.0 | Sólo la UI del dropzone. NO decide almacenamiento |
| `forms-validacion` | Zod compartido cliente/servidor |

## ADRs del proyecto
- `adr-001-astro-sobre-next` — por qué Astro
- `adr-002-panel-edicion` — SSR, Eurekabase, roles con scope, difuminado en cliente

## Al cerrar
- `adr-004-*` con el esquema final, la política de cache y las decisiones que
  cambiaron durante la ejecución.
- Registrar el Shot en `public.shots`.
- `public.proyectos`: actualizar `fase` y `proximo_hito`.
