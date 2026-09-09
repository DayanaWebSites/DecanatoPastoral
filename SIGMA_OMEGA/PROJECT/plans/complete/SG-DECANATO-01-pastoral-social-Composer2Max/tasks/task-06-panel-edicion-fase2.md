# task-06 · Preparar el panel de edición de fase 2

## Qué NO hace esta task
No implementa el panel. Sólo deja el terreno listo para que un ShotBuild posterior
lo construya sin tener que refactorizar el sitio.

## Por qué existe
Angie va a ir consiguiendo la información de las parroquias por goteo, durante meses.
Hoy cada dato nuevo implica que Mario haga un commit. Eso no se sostiene.

## Trabajo de esta task
1. **Documentar el contrato de datos** en `SIGMA_OMEGA/PROJECT/docs/contrato-contenido.md`:
   el esquema Zod de `src/content.config.ts` es la única fuente de verdad. Un panel que
   escriba esos JSON respetando el esquema no requiere tocar ningún componente.
2. **Verificar que el contrato se sostiene**: revisa que ningún `.astro` lea datos del
   decanato fuera de `src/content/` y `src/data/`. Si encuentras uno, muévelo. Este es
   el punto que hace o rompe la fase 2.
3. **Definir la arquitectura candidata** en el mismo doc, sin implementarla:
   - Opción A: panel en el mismo Coolify con auth simple de un usuario, que hace commit
     por API de GitHub y dispara el rebuild. Contenido versionado en git, sin base de datos.
   - Opción B: Supabase como fuente y un build programado. Añade una dependencia.
   - Recomendación: A. El contenido cambia unas cuantas veces al mes, no cada hora.
4. **Registrar un ADR** `adr-002-panel-edicion-fase2` en `sigma_omega.project_directives`
   con la opción elegida y por qué.

## Criterio de cierre
El doc existe, ningún componente lee contenido fuera de `src/content/` y `src/data/`,
y el ADR-002 está en CRONFIX.
