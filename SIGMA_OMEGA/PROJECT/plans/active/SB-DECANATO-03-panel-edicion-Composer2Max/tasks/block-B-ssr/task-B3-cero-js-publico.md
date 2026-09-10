# B3 · El público sigue en 0 KB de JavaScript

## Por qué es una task propia
Es el punto donde más fácil se arruina el sitio sin darse cuenta. Se agrega una isla
React para el editor, alguien la importa en un layout compartido, y de pronto todas
las páginas cargan 45 KB de React para nada.

## La regla
El bundle del editor carga **únicamente** en rutas bajo `/editar`. En ninguna otra.

- El layout público y el layout del panel son **archivos distintos**. No un layout
  con un `if (modoEdicion)`.
- `client:load` sólo aparece dentro de componentes bajo `apps/web/src/components/editor/`.
- Ningún componente de `apps/web/src/components/{sections,ui,layout}/` importa nada de
  `editor/`.

## Verificación automatizada
Extiende `verify-produccion.mjs` con un chequeo que recorra las rutas públicas y
falle si aparece cualquier `<script>` que no sea `application/ld+json`.
Ya existe la lógica; hay que asegurarse de que cubra las 23 rutas, no sólo la home.

## Medición
```bash
npx lighthouse https://<dominio> --form-factor=mobile
```
Comparar contra los números del SB-02. **Si bajó, no cerró.**

## Cierre
Auditor en verde sobre las 23 rutas públicas y Lighthouse igual o mejor que antes
del panel.
