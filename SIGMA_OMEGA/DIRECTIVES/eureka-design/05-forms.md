VERSION v2.0.260519 | FUENTE faceticket HEIMDAI LAURIER
INPUT BASE APP: rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-accent-500/30 disabled:opacity-50 transition-colors.
LABEL: siempre arriba, text-sm font-medium mb-1.5. Required: * en accent-500.
INPUT+ICON: div relative > PhIcon absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size=16 + input pl-9.
PASSWORD: toggle Eye/EyeOff Phosphor, tabIndex=-1, absolute right-2 top-1/2.
SELECT: Radix Select <20 items, Command/combobox para búsqueda dinámica. NO select nativo.
VALIDACIÓN ZOD+RHF: on blur no on-change. Error: text-xs text-error-500 mt-1 flex gap-1 items-center. Input error: border-error-500/50.
FILE UPLOAD: border-2 border-dashed rounded-lg p-8 text-center. isDragging: border-accent-500/50 bg-accent-500/5. Preview: thumbnail 56x56 + nombre + X.
WIZARD: progress bar h-1 bg-accent-500 transition-all. Anterior outline + Siguiente accent-600. trigger() por paso.
ANTI: NO placeholder-only, NO on-change validation, NO >8 campos sin grupos, NO upload sin preview, NO select nativo.

## Nota de este repo
El único formulario es `/ayudar` (voluntarios). Validación Zod compartida, honeypot `apellido2`,
cero JS en el cliente: errores y gracias por redirección, no toast. Select nativo está permitido
aquí porque no hay islas React.
