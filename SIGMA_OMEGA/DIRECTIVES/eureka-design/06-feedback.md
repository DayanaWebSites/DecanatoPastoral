VERSION v2.0.260519 | FUENTE LAURIER (EmptyState mejor del stack) DeltyFlow (Sonner)
TOASTS: <Toaster position="bottom-right" richColors closeButton />. toast.success/error/loading/promise.
DIALOG SIZES: sm md lg xl(max-w-2xl). Footer sticky: Cancel ghost + Action accent-600. Escape cierra siempre.
CONFIRM DIALOG: LAURIER como referencia. Props: title description confirmLabel variant(danger|default) onConfirm.
EMPTY STATE: emoji|icon + title + description + action({label,href}|ReactNode). py-12 text-center. Presets por módulo.
LOADING: Skeleton h-8 en tablas. Loader2 animate-spin 14px inline 20px standalone. min-h-[200px] en page loader. Button: replace text con Loader2 mx-auto h-4 w-4.
ALERTS INLINE: rounded-lg border border-{color}/25 bg-{color}/10 px-3 py-2.5 text-sm. Colors: blue warning error success.
ANTI: NO alert() confirm() nativos, NO toasts >5s, NO modal sin cierre, NO empty sin acción cuando user puede crear, NO spinner sin min-height.

## Nota de este repo
Sin Sonner ni islas. El feedback es HTML: componente `Aviso.astro`, página `/gracias`,
query params de error. Empty states: parroquias `en_construccion` con texto honesto, no "no items".
