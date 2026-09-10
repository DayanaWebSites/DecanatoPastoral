# A2 · Migrar el contenido a la base

## Qué se migra
`apps/web/src/content/comedores/*.json` (3), `apps/web/src/content/parroquias/*.json` (13),
`apps/web/src/data/decanato.json` y `apps/web/src/data/textos.json`.

## Cómo
Script `SIGMA_OMEGA/CORE/dev/scripts/migrar-contenido.mjs`:
1. Lee cada JSON.
2. **Lo valida contra el esquema Zod existente.** Si algo no valida, HALT: significa
   que el JSON y el esquema ya estaban desalineados y hay que arreglarlo antes.
3. Lo desdobla en filas de `contenido` con claves estables:
   `comedor.<slug>.<campo>`, `parroquia.<slug>.<campo>`, `sitio.<seccion>.<campo>`.
4. `valor_publicado` = lo que hay. `valor_borrador` = NULL.
5. Las 12 fotos existentes entran en `imagenes` con `procesada = true`
   (ya pasaron por el difuminado) y su `alt` actual.

## Idempotente
Correrlo dos veces no debe duplicar nada. `ON CONFLICT (clave) DO NOTHING`.

## Verificación
Cuenta de filas contra cuenta de campos en los JSON. Y una comparación página por
página: lo que renderiza desde la base tiene que ser **idéntico** a lo que renderiza
hoy desde los JSON. Diff del HTML, no a ojo.

## Qué pasa con los JSON
Se quedan en el repo como respaldo del estado inicial, marcados en el README como
"congelados: la fuente de verdad es la base". No se borran en este Shot.

## Cierre
Diff del HTML vacío entre la versión JSON y la versión base.
