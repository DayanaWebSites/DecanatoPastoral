# B3 · Dominio, DNS y SSL

## Antes de tocar nada, confirmar con Mario
Al generar este Shot, `pastoralsocialdecanatodulcenombre.org` **no aparecía en
ZENTINEK**. Hay que saber, de su boca, dos cosas:
1. ¿El dominio ya está comprado? ¿En qué registrador?
2. ¿La zona ya está en la cuenta de Cloudflare de ZENTINEK, o hay que crearla?

**No se inventa la respuesta.** Si el dominio no está comprado, el bloque C
despliega en `preview.*` o en un subdominio de `zentinek.com` y el cutover
espera. Eso no es un fracaso: es publicar sin mentir sobre la URL.

## Si el dominio existe y la zona está en Cloudflare
1. **Primero preview**, que no pide frase de autorización:
   ```
   domain_attach_custom
     projectId: <el de B2>
     hostname: "preview.pastoralsocialdecanatodulcenombre.org"
     targetIp: "93.188.162.107"
   ```
   Ese es el IP al que apuntan los demás dominios de la org. Verifícalo contra
   `domain_list` antes de usarlo, no lo copies a ciegas de aquí.

2. `domain_status` y `domain_doctor` hasta que `dnsStatus` sea `active`/`ok` y
   `sslStatus` deje de estar `pending`.

3. El apex y el `www` se atacan en la task C2, con la frase de Mario.

## Cierre
`domainId` del preview anotado. DNS resolviendo. SSL emitido o en camino con
evidencia de `domain_status`.
