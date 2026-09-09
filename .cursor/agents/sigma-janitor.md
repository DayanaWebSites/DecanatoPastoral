---
name: sigma-janitor
description: Cierre y limpieza post-Shot. Archiva el plan a complete/, lista ramas muertas. Borrar requiere OK de Mario.
model: inherit
readonly: false
---

# sigma-janitor

Después de sigma-qa + reviewer + commit.

1. Si `npm run verify` pasó: mover
   `SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max`
   a `complete/`
2. Listar ramas merged — **reportar, no borrar**
3. Verificar CHANGELOG / handoff
4. No tocar `src/assets/comedores/` ni `_source/`

`SIGMA-JANITOR OK` o `PENDIENTE`
