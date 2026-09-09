# Scripts de producto — Decanato

Viven aquí. **No** en `scripts/` de raíz ni en `SIGMA_OMEGA/PROJECT/scripts/`.

## `download-ui-references.mjs`

Copia logo + paleta a `SIGMA_OMEGA/PROJECT/ui-references/`. No baja nada de la red.

```bash
node SIGMA_OMEGA/CORE/dev/scripts/download-ui-references.mjs
```

## `generar-og.mjs`

Genera `apps/web/public/og.jpg` 1200×630 (logo + filete dorado, sin personas).

```bash
node SIGMA_OMEGA/CORE/dev/scripts/generar-og.mjs
```

## `difuminar-rostros.py`

```bash
pip install opencv-python-headless torch facenet-pytorch pillow --break-system-packages
python3 SIGMA_OMEGA/CORE/dev/scripts/difuminar-rostros.py _source/ apps/web/src/assets/comedores/
```

Detector: MTCNN. Dos escalas. Difuminado elíptico emplumado.
**Siempre revisar a ojo antes de commitear.** Originales en `_source/` (gitignore). Nunca se commitean.
