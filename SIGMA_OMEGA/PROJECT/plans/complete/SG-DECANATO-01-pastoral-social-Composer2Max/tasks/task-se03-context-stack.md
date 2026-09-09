# task-se03 · ShotSkill Context Stack

## Cargar
```sql
SELECT file FROM sigma_omega.cursor_prompts WHERE slug='shotskill-context-stack' AND activo=true;
```

## Decisión
Este proyecto es chico: ~40 archivos fuente y sin documentación técnica pesada.
**Graphify no se instala.** GitNexus (ya instalado en SE-01) es suficiente.

Lo que sí se hace:
- Registrar el namespace del proyecto en EurekaBrain / HERMES para que las consultas
  futuras sobre "decanato" o "pastoral social" encuentren este repo.
- Verificar que el índice de GitNexus incluye `src/content/` y `src/data/`: ahí vive
  el contenido y es lo que más se va a consultar.

Si más adelante el sitio crece a decenas de parroquias con documentación propia,
se reevalúa Graphify en un ShotSkill aparte.

## Criterio de cierre
Namespace registrado, índice de GitNexus cubriendo `src/content/` y `src/data/`,
y una línea en `_shared/07-handoff-state.md` explicando por qué no se instaló Graphify.
