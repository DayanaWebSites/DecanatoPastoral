# D2 · Lighthouse contra producción

## Por qué otra vez
El bloque A midió contra el preview local. Producción añade TLS, Cloudflare,
compresión de nginx y latencia real. Los números cambian.

```bash
URL=https://pastoralsocialdecanatodulcenombre.org
npx lighthouse $URL --form-factor=mobile --output=html --output-path=./lh-prod-home.html
npx lighthouse $URL/comedores/san-bernardo --form-factor=mobile --output=html --output-path=./lh-prod-comedor.html
```

Objetivo: **95+ en las cuatro categorías** en ambas.

## Si baja respecto del local
| Síntoma | Dónde mirar |
|---|---|
| Performance cae | ¿gzip activo? `curl -H "Accept-Encoding: gzip" -I $URL` |
| LCP alto | ¿la foto del hero se sirve como WebP y con `fetchpriority=high`? |
| Best Practices cae | suele ser una cabecera faltante o contenido mixto |
| SEO cae | canonical apuntando al dominio equivocado (ver C2) |

## Cierre
Los dos reportes HTML guardados y los ocho números anotados.
