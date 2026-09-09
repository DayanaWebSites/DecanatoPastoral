# Contrato de contenido — fase 2

El esquema Zod de `src/content.config.ts` es la única fuente de verdad.
Un panel que escriba esos JSON respetando el esquema no toca ningún componente.

## Collections

### `src/content/comedores/*.json`
Campos: `nombre`, `parroquia`, `orden`, `resumen`, `direccion`, `ciudad`,
`horario.{dias,inicio,fin}`, `cifras[]`, `jornada[]`, `notas[]`, `comoAyudar[]`,
`fotos[{archivo,alt}]`. Opcionales: `mapaUrl`, `telefono`.

### `src/content/parroquias/*.json`
Campos: `nombre`, `orden`, `estado` (`publicada` | `en_construccion`).
Opcionales: `imagen`, `nota`, `comedor`, `direccion`, `servicios[]`,
`horariosMisa[]`, `contacto.{telefono,whatsapp,correo,facebook}`.

### `src/data/decanato.json`
Nombre, decano, encargado, sitio, `contacto.{correo,whatsapp,telefono}`.
Sin dato: `null`. No se inventa.

### `src/data/textos.json`
Copy institucional aprobado. Sólo se corrigen erratas.

## Verificación
Ningún `.astro` puede contener nombres, direcciones o teléfonos del decanato.
`npm run verify` lo comprueba.

## Arquitectura candidata del panel (no implementada)

**Opción A (recomendada).** Panel en el mismo Coolify, un usuario, commit por
API de GitHub y rebuild. Contenido versionado en git. Sin base de datos.

**Opción B.** Supabase como fuente + build programado. Añade dependencia y
desvía el contrato JSON.

Se elige A: el contenido cambia unas cuantas veces al mes, no cada hora.
Cuando Angie entregue un dato, el panel escribe el JSON y dispara el deploy.
Hoy eso lo hace un commit de Mario; no se sostiene.

Si el panel necesita auth de varios roles o CRUD complejo, el módulo
`by-type-sitio-web-astro` manda migrar a `by-type-app-web` (ADR-001).
No se improvisa un admin encima de Astro estático.
