# 07 · Estado de entrega

## Bloques
| Bloque | Estado | Evidencia |
|---|---|---|
| A · Certificación | cerrado 2026-09-09 | build 24 páginas; verify SG-01 verde; docker `decanato:local` en :8080; `/` y `/comedores` 200; `/health` `ok`; `/no-existe` 404 + CSP; LH home 98/100/100/100; LH comedor 99/100/100/100; 12 fotos revisadas; `public/og.jpg` 57 KB |
| B · Infra | pendiente | — |
| C · Deploy | pendiente | — |
| D · Verificación | pendiente | — |

## Evidencia del bloque A
- Rama: `shot/sb-decanato-02-deploy`
- `npm run build`: 24 páginas (23 + `/gracias`), 0 JS
- `npm run verify`: auditoría superada, 3 avisos (correo, 10 parroquias, Santa Teresita sin imagen)
- Docker: `docker build -t decanato:local .` OK. Contenedor `decanato-test` :8080
  - `curl -I /` → 200 + CSP `default-src 'self'` sin `unsafe-inline`
  - `curl -I /comedores` → 200
  - `curl -s /health` → `ok`
  - `curl /no-existe` → 404 con la página del sitio
- nginx: se corrigió `try_files` (`=404` en vez de servir `/404.html` como 200) y se repitieron `add_header` en locations que pisan la herencia
- axe CLI: no corre (Chrome 152 vs ChromeDriver 153). Sustituto: Lighthouse accessibility 100 en home y ficha, 0 auditorías a11y en rojo
- Lighthouse mobile local (`127.0.0.1:4323`): home 98/100/100/100 LCP 2.3 s; comedor 99/100/100/100 LCP 2.0 s
- 12 fotos de comedores revisadas: rostros de personas atendidas difuminados. Voluntarios de cocina visibles en algunas tomas de servicio (no son personas atendidas)
- `public/og.jpg` / `dist/og.jpg`: 57 729 bytes, 1200×630, sin personas
- Enlaces internos del contenedor: 21 revisados, 0 rotos
- Formulario `/ayudar`: sigue el aviso de no conectado (sin Resend)

## Bloqueos conocidos al generar el Shot (2026-09-09)
- [x] Repo empujado a `origin/shot/sg-decanato-01` (SG-01). Falta empujar esta rama y `main` (B1)
- [ ] **El dominio no existe en ZENTINEK.** `domain_list` no lo trae. Hostinger MCP timeout. No se inventa el registrador: B3 confirma con Mario o publica en `*.zentinek.com`
- [x] `public/og.jpg` existe (57 KB)
- [ ] `src/data/decanato.json` sin correo: el aviso de privacidad sale con banner de pendiente. Se publica así y se reporta

## IDs
| Recurso | Valor |
|---|---|
| proyecto_id CRONFIX | `2335fb6d-3bbc-4f86-bb5d-09045e91b74c` |
| projectId ZENTINEK | `d697de05-d529-4fbb-8e13-63f69b1a0e3f` |
| env preview | `baf686fb-22a8-4835-8960-82e7368b1b4d` (staging) / `be55357e-74f5-4f9c-91af-5136f0f7b7f5` (preview) |
| env production | `1700e993-4b48-48bf-804a-c48de6aaa2e1` |
| appUuid Coolify | pendiente B2 |
| hostname preview | pendiente B3 |

## Bitácora
| Fecha | Bloque | Qué quedó |
|---|---|---|
| 2026-09-09 | — | Shot generado. Dockerfile, nginx.conf y CSP estricta escritos. |
| 2026-09-09 | A | Certificación local cerrada. nginx 404/CSP corregidos. OG lista. |
