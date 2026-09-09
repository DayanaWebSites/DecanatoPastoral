# A3 · Imagen OG

## Por qué importa aquí
Este sitio va a circular por WhatsApp entre parroquias y grupos del decanato.
La tarjeta de enlace es lo primero que va a ver la gente. Hoy `Base.astro`
referencia `/og.jpg` y **el archivo no existe**: la tarjeta sale en blanco.

## Qué hacer
Crear `public/og.jpg`, 1200×630, bajo 200 KB.

Composición:
- Fondo verde `#04551F`.
- Escudo del decanato (`src/assets/decanato/logo-claro.webp`) a la izquierda,
  alto ~380 px, centrado vertical.
- A la derecha, en dos líneas: "Pastoral Social" en serif grande crema `#FCF9F2`,
  y "Decanato Dulce Nombre de Jesús" debajo, más chico, en dorado `#DEAB33`.
- Filete dorado de 8 px en el borde inferior.
- **Sin fotos de personas.**

Se puede generar con `sharp` y un SVG de texto, o a mano en Canva. Lo que no se
vale es dejarlo sin hacer.

## Verificar
```bash
npm run build
ls -la dist/og.jpg
```
Y probar el enlace real en WhatsApp una vez desplegado (task D1).

## Cierre
`dist/og.jpg` existe, pesa menos de 200 KB, y se ve bien a tamaño de tarjeta.
