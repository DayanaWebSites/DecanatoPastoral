# 05 · Comandos

```bash
npm install              # dependencias
npm run dev              # servidor de desarrollo en :4321
npm run build            # build estático a dist/
npm run preview          # sirve dist/ en :4321
npx astro check          # tipos y validación de content collections
npm run verify           # auditoría del Shot
```

## Verificar que no se coló JavaScript
```bash
find dist -name "*.js" | wc -l     # debe dar 0
```

## Ver el peso real de una página
```bash
du -h dist/index.html && du -sh dist/_astro
```

## Re-procesar una foto nueva con difuminado de rostros
El script vive en `SIGMA_OMEGA/PROJECT/scripts/difuminar-rostros.py`.
```bash
python3 SIGMA_OMEGA/PROJECT/scripts/difuminar-rostros.py _source/ src/assets/comedores/
```
Siempre revisar el resultado a ojo antes de comitear.
