VERSION v2.0.260519 | FUENTE LAURIER (LTable — mejor tabla del stack), FINANZALOR (excel inline)
LTABLE PROPS: data columns selectable emptyState isLoading maxHeightClassName expandable renderExpanded contextMenuItems sorting onSortingChange getRowId.
HTML: wrapper overflow-auto rounded-lg border. thead sticky top-0 z-10 bg-background/95 backdrop-blur-sm. th: px-3 py-2.5 text-xs font-medium text-muted-foreground. tr hover:bg-muted/40.
KPI BAR: flex gap-4 p-3 rounded-lg bg-muted/40 border mb-4. label text-xs muted, value text-lg font-semibold tabular-nums.
INLINE EDIT: click → input in-place, blur/Enter commit, Escape revert. ring-1 ring-accent-500/50.
RECORD PANEL: Sheet derecho w-[480px] desktop full-width mobile. Tabs: Detalle/Historial. Sticky footer acciones.
FILTROS: SearchInput max-w-xs + FilterDropdown + botón limpiar con X size=12.
LOADING: 6 skeleton rows h-8 con colSpan.
ANTI: NO paginación tradicional, NO sin emptyState, NO >8 cols sin hide/show, NO sort sin indicador, NO sin getRowId único.

## Nota de este repo
Módulo inerte. No hay data-grid ni CRUD. Las listas de comedores y parroquias son HTML estático
leído de Content Collections.
