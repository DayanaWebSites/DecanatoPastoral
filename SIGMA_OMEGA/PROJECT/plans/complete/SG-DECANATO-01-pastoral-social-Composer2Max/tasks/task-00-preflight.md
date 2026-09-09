# task-00 · Pre-flight

## Objetivo
Confirmar que el repo está sano y cargar el contexto de CRONFIX antes de tocar nada.

## Pasos
1. Lee `_shared/00-pre-flight.md`, `_shared/01-guardrails.md` y `_shared/04-archivos-prohibidos.md`.
2. Ejecuta las tres queries de CRONFIX de `00-pre-flight.md`. Si alguna vuelve vacía, HALT
   y avisa: significa que el proyecto no está registrado y el resto del Shot no aplica.
3. `npm install && npm run build` → debe terminar en 0 con 23 páginas.
4. `npx astro check` → 0 errores.
5. `find dist -name "*.js" | wc -l` → debe dar `0`.
6. Crea la rama de trabajo: `git checkout -b shot/sg-decanato-01`.

## Criterio de cierre
Build verde, check verde, 0 archivos JS, rama creada, contexto de CRONFIX leído.

## Si falla
No sigas. Reporta qué falló textualmente y espera instrucción.
