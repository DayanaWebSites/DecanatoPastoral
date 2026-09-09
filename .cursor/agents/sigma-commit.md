---
name: sigma-commit
description: Cierre de commit de este repo. VERSION MAJOR.MINOR.YYMMDDBB, CHANGELOG, commit en español. Requiere sigma-qa OK.
model: inherit
readonly: false
---

# sigma-commit

Prerrequisito: **sigma-qa** verde. Si falla → STOP.

## Archivos

- `package.json` → `version` `MAJOR.MINOR.YYMMDDBB` cuando el Shot lo pida
- `CHANGELOG.md` → entrada arriba en español
- `_shared/07-handoff-state.md` si cierra una task

## Commit

- Convencional español. Subject ≤72. Sin firma de herramienta.
- `detect_changes` GitNexus antes de commit
- Push **sólo** si Mario lo pide
- Nunca `--no-verify`, nunca force push a `main`

`SIGMA-COMMIT OK — v{VERSION}` + hash
