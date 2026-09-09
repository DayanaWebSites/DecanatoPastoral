# task-04 · Accesibilidad y performance

## Objetivo
Lighthouse mobile 95+ en las cuatro categorías y AA real, no "AA según el linter".

## Accesibilidad — qué revisar
1. **Contraste sobre verde oscuro.** Los textos en `text-crema/70` y `text-crema/60` del
   footer y los subtítulos están al límite. Mide cada uno; si no llega a 4.5:1, súbelo.
   Esto no es negociable: parte del público son adultos mayores.
2. Navegación completa con teclado, incluido el menú móvil `<details>`.
3. `alt` real en cada imagen. Las decorativas ya llevan `alt=""`.
4. `aria-current="page"` en el nav — ya está, verifícalo.
5. El skip-link funciona y es visible al enfocarlo.
6. Formulario: cada input con label asociado, errores anunciados, `fieldset`/`legend`
   en el grupo de radios. Ya está armado así; confírmalo con lector de pantalla.
7. `prefers-reduced-motion` respetado — ya está en `global.css`.

## Performance
- LCP objetivo < 2.0 s en 4G lento. El LCP de la home es la foto del hero (`eager` + `fetchpriority=high`).
- Confirmar que sigue habiendo **0 archivos `.js`** en `dist/`.
- Revisar que ninguna imagen se sirva más grande de lo que se muestra.
- Fuentes self-hosted con `font-display: swap` y sólo los pesos usados.

## Herramientas
```bash
npx lighthouse http://localhost:4321 --preset=perf --form-factor=mobile
npx @axe-core/cli http://localhost:4321
```

## Criterio de cierre
Lighthouse mobile 95+ en Performance, Accessibility, Best Practices y SEO.
axe sin violaciones serias ni críticas. Evidencia: capturas de los reportes.
