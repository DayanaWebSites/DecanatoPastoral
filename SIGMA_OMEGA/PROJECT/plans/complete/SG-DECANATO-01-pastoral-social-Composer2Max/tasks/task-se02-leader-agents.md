# task-se02 · Aplicar SE-Leader-Agents-IaDev-PRO

Obligatorio por `shotgenesis-se-cascade-protocol`.

## Cargar el ShotEvolution
```sql
SELECT file FROM sigma_omega.cursor_prompts WHERE slug='se-leader-agents-iadev-pro' AND activo=true;
SELECT slug, contenido FROM coach_brain.guidelines
WHERE (slug LIKE 'agent-sigma-%' OR slug='sigma-agents-commands-v1') AND activo=true ORDER BY slug;
```

## Qué crea
`.cursor/agents/`: sigma-frontend, sigma-backend, sigma-db-admin, sigma-security,
sigma-tester, sigma-deployer, sigma-reviewer, sigma-qa, sigma-commit, sigma-cronfix,
sigma-gitnexus, sigma-janitor.
`.cursor/commands/`: los 5 commands `sigma-*`.

## Ajustes propios de este proyecto
- `sigma-db-admin` queda declarado pero inerte: este sitio no tiene base de datos.
  Anótalo en el propio archivo del agente para que nadie lo invoque en falso.
- `sigma-deployer` apunta a **Coolify vía ZENTINEK**, no a Vercel. Su runbook debe usar
  las herramientas `deploy_app`, `deploy_status`, `deploy_rollback` y `domain_cutover`.
- `sigma-security` incluye una verificación específica de este proyecto: ninguna imagen en
  `src/assets/comedores/` puede tener un rostro identificable de una persona atendida.

## Criterio de cierre
Los 12 agentes y los 5 commands existen y son coherentes con un proyecto Astro estático
sin base de datos. `npm run build` sigue verde.
