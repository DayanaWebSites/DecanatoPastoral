# 03 · Snapshot del stack

```
Astro            5.18.2   output: static
TailwindCSS      4.3.3    vía @tailwindcss/vite, tokens en src/styles/global.css
TypeScript       5.8.x    astro/tsconfigs/strict
@astrojs/sitemap 3.3.x
sharp            0.34.x   optimización de imágenes en build
Fuentes          @fontsource-variable/inter + @fontsource/source-serif-4 (self-hosted)
```

## Árbol relevante
```
src/
├── assets/
│   ├── comedores/     12 fotos .webp con rostros difuminados
│   ├── decanato/      logo claro, logo oscuro, cartel Carlo Acutis
│   └── logos/         12 imágenes de parroquia (falta Santa Teresita)
├── content/
│   ├── comedores/     3 JSON
│   └── parroquias/    13 JSON
├── content.config.ts  esquemas Zod
├── data/
│   ├── decanato.json  decano, encargado, contacto (contacto PENDIENTE)
│   └── textos.json    todos los textos institucionales
├── components/{layout,ui}
├── layouts/Base.astro
├── pages/             index, comedores/, parroquias/, pastoral-social, ayudar, aviso, 404
└── styles/global.css  tokens del logo del decanato
```

## Paleta (muestreada del logo oficial)
verde `#04551F` · dorado `#DEAB33` · crema `#FCF9F2` · tinta `#1B1A17`

## Métricas de referencia del build actual
- 23 páginas, `dist/` ≈ 2.4 MB
- 0 archivos `.js` enviados al cliente
- Home ≈ 30 KB de HTML
