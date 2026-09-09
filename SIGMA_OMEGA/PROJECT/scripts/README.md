# Scripts del proyecto

## `download-ui-references.mjs`
Copia las referencias visuales aprobadas (logo + paleta) a
`SIGMA_OMEGA/PROJECT/ui-references/`. No baja nada de la red.

```bash
node SIGMA_OMEGA/PROJECT/scripts/download-ui-references.mjs
```

## `generar-og.mjs`
Genera `public/og.jpg` 1200×630 (logo + filete dorado, sin personas).

```bash
node SIGMA_OMEGA/PROJECT/scripts/generar-og.mjs
```


## `difuminar-rostros.py`
Difumina rostros en las fotos de los comedores antes de publicarlas.

```bash
pip install opencv-python-headless torch facenet-pytorch pillow --break-system-packages
python3 SIGMA_OMEGA/PROJECT/scripts/difuminar-rostros.py _source/ src/assets/comedores/
```

Detector: MTCNN (pesos incluidos en `facenet-pytorch`, sin descargas en runtime).
Corre en dos escalas para atrapar rostros pequeños del fondo. El difuminado es elíptico
y con borde emplumado: el rostro deja de ser identificable sin el recuadro negro que
arruina la foto.

**Siempre revisar el resultado a ojo antes de comitear.** El detector es bueno, no
infalible: en fotos a contraluz o con rostros de perfil muy cerrado puede fallar uno.
Para esos casos, el parámetro `extra` de `blur()` acepta cajas manuales en coordenadas
normalizadas `(x1, y1, x2, y2)`.

Los originales van en `_source/`, que está en `.gitignore`. **Nunca se comitean.**
