VERSION v2.0.260519 | FUENTE DeltyFlow (topbar/sidebar) faceticket (tabs)
TOPBAR: sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl pt-[env(safe-area-inset-top)]. PATH_LABELS para breadcrumb. UserAccountMenu+NotificationBell+PWAInstallButton.
SIDEBAR: grid layout (no overlay desktop). Item activo: bg-accent-500/10 border-l-2 border-accent-500 text-accent-400. Hover: bg-accent-500/5. Smart polling /api/me/pulse refreshInterval:30000.
TABS: border-b-2 border-[#7F77DD] text-[#7F77DD] activo. Container overflow-x-auto scrollbar-hide.
MOBILE BOTTOM NAV: fixed bottom-0 flex border-t bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]. Max 5 items. text-[10px] gap-0.5.
SCROLLBAR: 4px width, track transparent, thumb hsl(var(--border)).
ICONOS: Phosphor outline 20px activo:accent-400 inactivo:muted-foreground.
ANTI: NO sidebar fixed overlapping desktop, NO tabs sin scrollbar-hide mobile, NO bottom nav >5 items, NO lucide en nav.

## Nota de este repo
La nav es un header institucional + menú móvil con `<details>` nativo (cero JS).
`aria-current="page"` en el item activo. Skip-link en `Base.astro`.
No hay sidebar de app, ni bottom-nav, ni polling.
