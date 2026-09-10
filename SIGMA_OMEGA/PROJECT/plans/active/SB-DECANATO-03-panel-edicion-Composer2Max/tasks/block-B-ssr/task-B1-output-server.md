# B1 · Astro a `output: 'server'`

## Por qué
Con autosave, disparar un rebuild por guardado es inviable: 90 segundos por edición.
SSR permite que publicar sea instantáneo. Ver ADR-002.

## Cambios
1. `npm i @astrojs/node`, adapter en modo `standalone`.
2. `apps/web/astro.config.mjs`: `output: 'server'`, `adapter: node({ mode: 'standalone' })`.
3. **Las rutas públicas siguen prerenderizadas donde se pueda.** Astro permite
   `export const prerender = true` por ruta: úsalo en las que no dependen de la base
   (404, aviso de privacidad si su texto queda fijo).
4. `apps/web/src/lib/db/` con el acceso a datos. Una función por entidad, tipada, que
   **valida la salida contra el mismo esquema Zod**. La base puede tener basura;
   el componente no se entera.
5. Los componentes no cambian. Reciben los mismos objetos que recibían de las
   Content Collections. Si un componente hay que reescribirlo, la capa de datos
   está mal hecha.
6. El Dockerfile cambia: ya no es nginx sirviendo `dist/`, es node corriendo el
   server **detrás** de nginx. nginx queda como reverse proxy + cache + cabeceras.

## Lo que no se toca
El diseño, los textos, la paleta, la CSP. Este paso es de plomería.

## Verificación
Diff del HTML renderizado antes y después, página por página. **Tiene que ser
idéntico.** Si cambió una coma, algo se rompió en la migración de datos.

## Cierre
Las 23 rutas respondiendo, diff de HTML vacío, y el contenedor levantando en local
con `docker build && docker run`.
