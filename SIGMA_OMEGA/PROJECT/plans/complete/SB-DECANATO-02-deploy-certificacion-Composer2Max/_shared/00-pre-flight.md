# 00 · Pre-flight

## Estado esperado
- `npm run build` en 0, 23 páginas.
- `npm run verify` (auditor del SG-01) en verde.
- El SG-DECANATO-01 al menos con su cascada SE aplicada, o justificado por qué no.

## Datos del proyecto
| Campo | Valor |
|---|---|
| proyecto_id CRONFIX | `2335fb6d-3bbc-4f86-bb5d-09045e91b74c` |
| repo | github.com/DayanaWebSites/DecanatoPastoral |
| dominio objetivo | `pastoralsocialdecanatodulcenombre.org` |
| target IP de ZENTINEK | `93.188.162.107` (el que usan los demás dominios) |
| deploy | Coolify vía ZENTINEK |

## Contexto de CRONFIX
```sql
SELECT file FROM sigma_omega.core WHERE slug='by-type-sitio-web-astro' AND activo=true;
SELECT file FROM sigma_omega.project_directives
WHERE proyecto_id='2335fb6d-3bbc-4f86-bb5d-09045e91b74c';
```
