# SB-DECANATO-03 · Panel de edición

Convertir el sitio en editable por el propio decanato. Documento para leer; el que
Cursor Build ejecuta es `.cursor/plans/SB-DECANATO-03-panel-edicion-Composer2Max.plan.md`.

| | |
|---|---|
| Depende de | `SB-DECANATO-02` cerrado (sitio publicado y certificado) |
| Base | Eurekabase — Postgres self-hosted del cluster Hermes |
| Módulos | `by-type-sitio-web-astro` v1.1.0 · `panel-edit` · `roles` v2.0.0 · `auth-sesiones` · `cruds-edit` · `forms-file-upload` |
| ADR | `adr-002-panel-edicion` |
| Modelo | Composer 2 + MAX |

## El problema que resuelve
Angie va a conseguir la información de las 13 parroquias por goteo durante meses.
Hoy cada dato nuevo es un commit de Mario. Eso no se sostiene.

## Los cinco bloques

| Bloque | Qué hace |
|---|---|
| **A · Base y auth** | Esquema en Eurekabase, migración del contenido, sesiones, roles con scope |
| **B · SSR y cache** | Astro a `output: server`, micro-cache en nginx, verificar que el público no se degradó |
| **C · Editor de textos** | Modo edición sobre la página real, autosave a borrador, publicar, audit log |
| **D · Imágenes** | Difuminado en el navegador, subida al volumen, galería con drag&drop |
| **E · Certificación** | Intentar romperlo, y ver a Angie usarlo sin ayuda |

## Las tres decisiones de fondo (ADR-002)

**1. El sitio pasa a SSR.** Con autosave, un rebuild por guardado es inviable.
SSR + micro-cache en nginx da lo mismo que un archivo estático para el visitante.
**El público sigue en 0 KB de JavaScript**: el editor carga sólo en `/editar`.

**2. Autosave guarda borrador. Publicar es un botón aparte.** Una voluntaria no
puede publicar media frase sin querer, puede irse y volver, y "Descartar borrador"
regresa a lo que está en vivo.

**3. El difuminado de rostros corre en el navegador, antes de subir.** El original
nunca llega al servidor, y publicar queda bloqueado hasta que la foto pasó por ahí.
Es la decisión más importante del Shot: ver `_shared/09-difuminado-obligatorio.md`.

## Roles
| Rol | Quién | Alcance |
|---|---|---|
| SUPERMASTER | DeltaTasker, por dominio de correo | todo |
| MASTER | sacerdote encargado de Pastoral Social | todo el contenido |
| ADMIN | Angie | todo el contenido, invita editores |
| EDITOR_PARROQUIA | encargado por parroquia | sólo sus parroquias |
| SOLO_LECTURA | revisión | ve borradores, no publica |

## Corrección al estándar
`by-type-sitio-web-astro` v1.0.0 decía que la aparición de auth o roles obligaba a
migrar a Next. Estaba mal trazada. Se corrigió en **v1.1.0**: la frontera es si el
*visitante anónimo* necesita estado por usuario. Un back-office editorial no cambia
lo que recibe quien entra desde la calle.

## El criterio de éxito
No es que el código compile. Es que **Angie mantenga el sitio sola**, sin poder
romperlo ni publicar algo que exponga a alguien.

Por eso la task `E2` es sentarse a verla usarlo sin ayudarla. Si falla en algo,
se arregla el panel, no se le explica mejor.
