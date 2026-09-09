# 00 · Pre-flight

Se ejecuta antes de cualquier task. Si algo de aquí falla, HALT.

## Estado esperado del repo
- `npm run build` termina en 0 y genera 23 páginas en `dist/`.
- `npx astro check` sin errores de tipo.
- `git status` limpio o con cambios que entiendes.

## Contexto que hay que cargar de CRONFIX
```sql
-- Módulo canónico que gobierna este proyecto
SELECT file FROM sigma_omega.core WHERE slug='by-type-sitio-web-astro' AND activo=true;

-- ADR de la decisión de stack
SELECT file FROM sigma_omega.project_directives
WHERE proyecto_id='2335fb6d-3bbc-4f86-bb5d-09045e91b74c' AND slug='adr-001-astro-sobre-next';

-- Protocolos maestros de Shot (obligatorio antes de tocar el plan)
SELECT slug, contenido FROM coach_brain.guidelines
WHERE slug IN ('shot-taxonomy-master','shotcure-protocol-master','shotcure-dos-archivos') AND activo=true;
```

## Datos del proyecto
| Campo | Valor |
|---|---|
| proyecto_id | `2335fb6d-3bbc-4f86-bb5d-09045e91b74c` |
| empresa | DeltaTasker (`2647e8f3-05ce-4f6c-a696-e8ec545e535f`) |
| repo | github.com/DayanaWebSites/DecanatoPastoral |
| dominio | pastoralsocialdecanatodulcenombre.org |
| deploy | Coolify vía ZENTINEK |
| cliente | Angie Rubio (Somos+) — grupo de WhatsApp del decanato |
