# D2 · Storage: R2 vía Eurekabase, expuesto como CDN

## La arquitectura real
No se habla con R2 directo. **Eurekabase conecta con R2 y lo expone como CDN.**
Eurekabase es la fuente de verdad del vault; ZENTINEK es el dueño de la infra.
Leído del código el 2026-09-09: `src/lib/r2-client.ts`, `src/lib/cdn-domain.ts`,
`src/lib/mcp/tools/{storage-*,cdn-*}.ts`.

Consulta el módulo `cdn` **v2.1.0** en CRONFIX antes de escribir código.

## Provisionar
1. `provisionStorage` → crea el bucket. Nombre derivado por `deriveBucketName`:
   **`eb-{slug}`**, minúsculas, sólo `[a-z0-9-]`, máx 63 chars.
2. `ensureR2CredentialsInVault` copia al vault del proyecto, idempotente:
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
   No las pongas a mano; deja que el provisioning las ponga.

## El CDN — aquí está la trampa
`cdn_attach` cuelga **`cdn.{apex-del-cliente}`** del bucket y escribe `R2_PUBLIC_CDN_URL`.

Para este proyecto el apex es `pastoralsocialdecanatodulcenombre.org`, así que el
CDN debe quedar en:
```
cdn.pastoralsocialdecanatodulcenombre.org
```

**`resolveProjectDomain` cae por default a `{slug}.com`.** Si no le pasas el apex,
va a inventar algo como `decanato-pastoral-social.com`, que no existe. Entonces:

```
cdn_attach
  projectId: <el de Eurekabase>
  domainHint: "pastoralsocialdecanatodulcenombre.org"
  allowSlugDefault: false      # que difiera antes que inventar
  ensureStorage: true
```

Con `allowSlugDefault: false`, si el dominio todavía no está listo responde
`deferred` en vez de inventar. Se adjunta en el cutover. **Eso es lo correcto.**

### Prohibido
`{slug}-cdn.eurekasigma.com`. Es el anti-patrón legacy de SB-62: CNAME cross-zone →
**Error 1014** de Cloudflare. Existe `cdn_remediate_legacy` para limpiar los que
quedaron así. El CDN cuelga del dominio del cliente, no de la plataforma.

## Subida — encaja con el difuminado
`storage_presign_upload` devuelve un **presigned PUT directo del navegador a R2**
(expira 300s, tope 900s). Eso refuerza el diseño del bloque D1:

```
el navegador difumina  →  pide el presign  →  sube el canvas difuminado directo a R2
```

**El servidor nunca ve el original.** No hay ventana en la que exista sin difuminar
en tu infra. El presign se emite sólo después de que la imagen pasó por el
difuminado — ése es el token de un solo uso del que habla `09-difuminado-obligatorio.md`.

## Antes de subir (módulo `cdn` v2.1.0)
- WebP con Sharp, calidad 80-85%. Máx 1600 px de lado mayor.
- Thumbnail ~200×200 además del original. Guardar ambas URLs.
- **Quitar EXIF.** Trae GPS: la ubicación exacta del comedor y de quien la tomó.
- Nombre: UUID. **Nunca el nombre del archivo original.**
- En la base sólo la key o la URL. Nunca binarios ni base64.

## URL pública y purga
`buildPublicCdnUrl(recordName, key)` para la URL. `cdn_purge` al despublicar una foto
— obligatorio en el flujo de `emergency/foto-publicada.md`.

## Cierre
Bucket provisionado, CDN en `cdn.pastoralsocialdecanatodulcenombre.org` (o `deferred`
documentado si el dominio aún no está), subida por presign funcionando desde el
navegador, EXIF confirmado como eliminado con `exiftool`, y `cdn_purge` probado.
