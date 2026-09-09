# 04 · Archivos que NO se tocan sin pedirlo

| Ruta | Por qué |
|---|---|
| `src/data/textos.json` | Textos institucionales aprobados por el decanato. Sólo se corrigen erratas. |
| `src/styles/global.css` (bloque `@theme`) | La paleta viene del logo oficial. Cambiarla desalinea la marca. |
| `src/assets/comedores/*` | Fotos ya procesadas con rostros difuminados. Sustituir una implica re-procesar. |
| `src/pages/aviso-de-privacidad.astro` | Texto legal. Cambios sólo para llenar los campos PENDIENTE. |
| `.gitignore` (línea `_source/`) | Impide comitear los originales sin difuminar. |

## Nunca comitear
- Originales de fotos sin difuminar (van en `_source/`, ignorado).
- `.env` con claves reales.
- `dist/`, `.astro/`, `node_modules/`.
