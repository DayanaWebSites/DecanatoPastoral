# task-03 · Cerrar SEO

## Ya está hecho
- `title` y `description` únicos por página.
- Canonical, OG y Twitter card en `Base.astro`.
- JSON-LD `NGO` global y `FoodEstablishment` por comedor.
- `sitemap-index.xml` por `@astrojs/sitemap` y `robots.txt`.
- H1 único por página, jerarquía real de encabezados.

## Falta
1. **Imagen OG propia** (`public/og.jpg`, 1200×630). Hoy la referencia existe pero el
   archivo no. Diseña una con el logo del decanato sobre verde `#04551F`, el texto
   "Pastoral Social · Decanato Dulce Nombre de Jesús" y el filete dorado.
   Sin fotos de personas.
2. **JSON-LD por parroquia**: añadir `Place` / `PlaceOfWorship` en `parroquias/[slug].astro`
   usando el mismo prop `jsonLd` que ya acepta `Base.astro`. Sólo con los campos que
   existan de verdad; nada de `address` inventada.
3. **Breadcrumbs estructurados**: `BreadcrumbList` en las dos páginas de detalle.
4. Verificar que `site` en `astro.config.mjs` coincide con el dominio final antes del deploy.

## Verificación
- Rich Results Test de Google sobre `/`, `/comedores/san-bernardo` y una parroquia.
- `curl -s <url>/sitemap-index.xml` devuelve las 23 URLs.

## Criterio de cierre
OG image existe y se ve bien al compartir en WhatsApp (es por donde va a circular).
Rich Results sin errores.
