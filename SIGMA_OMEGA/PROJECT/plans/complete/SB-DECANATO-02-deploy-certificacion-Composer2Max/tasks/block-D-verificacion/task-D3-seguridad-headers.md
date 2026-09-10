# D3 · Seguridad y cabeceras en vivo

```bash
URL=https://pastoralsocialdecanatodulcenombre.org
curl -sI $URL/ | grep -iE "content-security-policy|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy"
```

## Lo que tiene que estar
| Cabecera | Valor esperado |
|---|---|
| `Content-Security-Policy` | `default-src 'self'` … **sin `unsafe-inline`** |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | geolocation, micrófono y cámara en `()` |

## La prueba que importa
Abre la consola del navegador en producción y recorre las páginas.
**Cero violaciones de CSP.** Si aparece una, significa que algo está cargando
de un tercero o metiendo un `<style>` inline, y eso contradice el estándar del
proyecto. Se arregla en el origen, no relajando la CSP.

## Cache
```bash
curl -sI $URL/_astro/<algún-archivo-con-hash>.css | grep -i cache-control
# public, max-age=31536000, immutable
curl -sI $URL/ | grep -i cache-control
# public, max-age=0, must-revalidate
```

## Otras rutas
```bash
curl -s $URL/robots.txt
curl -s $URL/sitemap-index.xml | head
curl -s -o /dev/null -w "%{http_code}\n" $URL/no-existe   # 404
```
El sitemap debe listar las 23 URLs **con el dominio final**, no con localhost.

## Cierre
Tabla de cabeceras con la salida real de `curl` y consola sin violaciones de CSP.
