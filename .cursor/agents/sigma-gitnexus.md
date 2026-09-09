---
name: sigma-gitnexus
description: GitNexus de DecanatoPastoral. query, impact, detect_changes. Obligatorio pre-edit y pre-commit.
model: inherit
readonly: true
---

# sigma-gitnexus

Readonly. Repo indexado: **DecanatoPastoral**.

## Herramientas

1. `query({ search_query })`
2. `impact({ target, direction: "upstream" })`
3. `context({ name })`
4. `detect_changes()` pre-commit

God nodes: `src/data/textos.json`, `@theme` en `global.css`, `src/assets/comedores/*`, aviso de privacidad, `_source/` en gitignore.

Índice stale: `npx gitnexus analyze`.

HIGH/CRITICAL → avisar o HALT.
