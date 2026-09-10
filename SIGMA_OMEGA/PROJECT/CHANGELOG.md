# Changelog

## 0.1.26090906 — 2026-09-09

### fix
- Login: la CSP del panel bloqueaba los scripts inline de Astro. Entrar ahora funciona sin JS (POST nativo) y con la isla.

## 0.1.26090905 — 2026-09-09

### fix
- Login: el `body` crema de `global.css` tapaba el canvas oscuro y el texto se perdía.

## 0.1.26090904 — 2026-09-09

### feat
- Login de familia SIGMA: canvas oscuro, logo arriba, tarjeta glass centrada (paleta del decanato).

## 0.1.26090903 — 2026-09-09

### feat
- Login en pantalla partida: marca a la izquierda, formulario a la derecha, sin tarjeta flotante ni CTA oro.

## 0.1.26090902 — 2026-09-09

### feat
- Panel de edición SSR (Astro `output: 'server'`) detrás de nginx con micro-cache.
- Login institucional (`/login`) con receta `auth-login` y paleta del logo, sin glass.
- Hero: fondo fotográfico y un solo logo que viaja al nav al hacer scroll.

### fix
- `/login` deja de ser el 404 del sitio estático cuando Coolify construye esta rama.

## 0.1.26090901 — 2026-09-09

### feat
- Infraestructura SIGMA: skills, rules, EurekaDesign, 12 agentes, 5 commands, GitNexus.
- Imagen OG 1200×630, JSON-LD de parroquia y breadcrumbs.
- Dockerfile nginx + cabeceras de seguridad para Coolify.
- Página `/gracias` y manejo de error `?error=1` para el formulario (el envío sigue bloqueado).

### fix
- Contraste AA: kickers `oro-700` sobre crema; logos a densidad 2x.
- CLS de fuentes (fallback metrics + `font-display: optional`).
- Lighthouse mobile home 98/100/100/100.
- nginx: `/comedores` 200, `/no-existe` 404 real y CSP en HTML (add_header no se heredaba).

### docs
- Contrato de contenido para el panel de edición de fase 2.
- Tasks 01 y 02 abiertas: faltan datos del cliente (destino del formulario, contactos, logo de Santa Teresita).
- Deploy: proyecto ZENTINEK creado; falta app Coolify y confirmar el dominio.
