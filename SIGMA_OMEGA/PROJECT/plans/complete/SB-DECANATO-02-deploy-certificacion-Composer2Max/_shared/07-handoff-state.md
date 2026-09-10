# 07 · Estado de entrega

## Bloques
| Bloque | Estado | Evidencia |
|---|---|---|
| A · Certificación | cerrado 2026-09-09 | build 24 páginas; verify SG-01 verde; docker `decanato:local`; `/` y `/comedores` 200; `/health` `ok`; `/no-existe` 404 + CSP; LH local 98/100/100/100 y 99/100/100/100 |
| B · Infra | cerrado 2026-09-10 | Repo `main` `defaeb6`. Proyecto ZENTINEK. App Coolify `nihyul3yga0ntudzvi0abxnm`. Zona CF `b8a625978b3933c9e34442fd6082c3fc` |
| C · Deploy | cerrado 2026-09-10 | Contenedor `running:healthy`. Apex/www/preview en HTTPS. `/health` `ok` |
| D · Verificación | cerrado 2026-09-10 | `verify-produccion.mjs` verde 0 avisos. LH prod 99/100/100/100 y 100/100/100/100 |

## Evidencia en vivo (2026-09-10)
- `https://pastoralsocialdecanatodulcenombre.org/` → 200 nginx, CSP sin `unsafe-inline`
- `https://www.pastoralsocialdecanatodulcenombre.org/` → 200
- `https://preview.pastoralsocialdecanatodulcenombre.org/` → 200
- `/health` → `ok`
- `/comedores` → 200
- `/no-existe` → 404
- Auditor: `node .../verify-produccion.mjs https://pastoralsocialdecanatodulcenombre.org` → certificado
- Lighthouse mobile apex: 99 / 100 / 100 / 100, LCP 1.9 s
- Lighthouse mobile San Bernardo: 100 / 100 / 100 / 100, LCP 1.3 s

## IDs
| Recurso | Valor |
|---|---|
| proyecto_id CRONFIX | `2335fb6d-3bbc-4f86-bb5d-09045e91b74c` |
| projectId ZENTINEK | `d697de05-d529-4fbb-8e13-63f69b1a0e3f` |
| appUuid Coolify | `nihyul3yga0ntudzvi0abxnm` |
| zoneId Cloudflare | `b8a625978b3933c9e34442fd6082c3fc` |
| commit desplegado | `defaeb6d30af6173564d3248c5d2309027ae9fe0` |

## Bitácora
| Fecha | Bloque | Qué quedó |
|---|---|---|
| 2026-09-09 | A | Certificación local cerrada. |
| 2026-09-10 | B–D | App arriba, DNS al VPS, sitio certificado en el apex. |
