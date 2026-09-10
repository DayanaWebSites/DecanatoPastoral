# Z9 · Auditoría final

## 1. Los cinco bloques cerrados con evidencia
`_shared/07-handoff-state.md`. Si alguno quedó abierto, este Shot no cierra.

## 2. Auditores
```bash
npm run build && npm run verify
node .../SB-DECANATO-02.../verifications/verify-produccion.mjs https://<dominio>
```

## 3. Registrar en CRONFIX
```sql
INSERT INTO sigma_omega.project_directives
  (proyecto_id, slug, titulo, tipo, status, version, file)
VALUES ('2335fb6d-3bbc-4f86-bb5d-09045e91b74c','adr-004-panel-implementado',
        'ADR-004 — Panel de edicion: esquema final, cache y decisiones de ejecucion',
        'adr-local','active','1.0.0','<contenido>');

UPDATE public.proyectos
SET fase='mantenimiento',
    proximo_hito='El decanato mantiene su propio contenido',
    updated_at=now()
WHERE id='2335fb6d-3bbc-4f86-bb5d-09045e91b74c';
```
El ADR-004 debe dejar escrito: esquema final, mecanismo de purga de cache elegido,
detector de rostros usado y su tasa de acierto observada, y las fricciones que
Angie encontró.

## 4. Considerar un ShotSkill para el estándar
El difuminado en el navegador y el patrón de edición inline sobre Astro SSR sirven
para cualquier otro sitio de contenido tuyo. Si funcionaron, vale la pena subirlos
a `sigma_omega.core` como módulo propio en vez de dejarlos enterrados en este repo.

## 5. Mover el plan
```bash
git mv SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-03-panel-edicion-Composer2Max \
       SIGMA_OMEGA/PROJECT/plans/complete/SB-DECANATO-03-panel-edicion-Composer2Max
```

## 6. Lo que NO hace este Shot
No manda ningún mensaje al decanato. El texto de entrega y las credenciales los
aprueba Mario antes de que salgan.
