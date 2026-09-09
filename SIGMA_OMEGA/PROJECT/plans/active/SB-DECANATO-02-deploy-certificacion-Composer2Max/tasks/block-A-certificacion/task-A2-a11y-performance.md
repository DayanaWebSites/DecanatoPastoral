# A2 · Accesibilidad y performance

Contra el preview local, antes de exponer nada.

## Accesibilidad
```bash
npx @axe-core/cli http://localhost:4321 \
  http://localhost:4321/comedores \
  http://localhost:4321/comedores/san-bernardo \
  http://localhost:4321/parroquias \
  http://localhost:4321/ayudar \
  http://localhost:4321/aviso-de-privacidad
```
**Cero violaciones serias o críticas.** Las moderadas se documentan.

### Lo que hay que medir a mano
El contraste sobre verde oscuro es el punto débil conocido. Mide con un
medidor real, no a ojo:
- `text-crema/70` y `text-crema/60` sobre `bg-verde-900` en el footer.
- `text-crema/80` en las entradas de los heroes.
- `text-oro-300` sobre `bg-verde-900`.

Si alguno queda por debajo de **4.5:1**, súbelo. Parte del público son adultos
mayores leyendo desde el celular en la calle. Esto no es un tecnicismo.

## Performance
```bash
npx lighthouse http://localhost:4321 --form-factor=mobile \
  --throttling-method=simulate --output=json --output-path=./lh-local.json
```
Objetivo: **95+ en las cuatro categorías**. LCP < 2.0 s.

Confirma que sigue habiendo 0 archivos `.js`:
```bash
find dist -name "*.js" | wc -l    # 0
```

## Cierre
Reporte de axe sin violaciones serias/críticas y los cuatro números de Lighthouse.
Si algo no llega, se corrige aquí. No se pasa a producción "a ver si allá sube".
