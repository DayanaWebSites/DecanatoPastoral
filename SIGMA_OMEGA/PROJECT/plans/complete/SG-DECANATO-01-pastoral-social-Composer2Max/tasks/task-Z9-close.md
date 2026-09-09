# task-Z9 · Cierre del Shot

## 1. Auditoría
```bash
npm run verify
```
El script `verifications/verify-sg-decanato.mjs` revisa lo que no se puede dar por sentado.
Si alguna verificación falla → **HALT**. Se corrige y se vuelve a auditar. No se cierra a medias.

## 2. Evidencia en vivo
Un reporte no cierra nada. Se necesita:
- `npm run build` verde con el conteo de páginas.
- Captura de la home en producción (o en el subdominio temporal si el dominio no está listo).
- Reportes de Lighthouse y axe de la task-04.
- Confirmación de que `find dist -name "*.js" | wc -l` sigue dando 0.

## 3. Registrar en CRONFIX
```sql
-- ADR de lo decidido durante la ejecución
INSERT INTO sigma_omega.project_directives (proyecto_id, slug, titulo, tipo, status, version, file)
VALUES ('2335fb6d-3bbc-4f86-bb5d-09045e91b74c', 'adr-00N-...', '...', 'adr-local', 'active', '1.0.0', '...');

-- Actualizar el estado del proyecto
UPDATE public.proyectos
SET fase = '...', proximo_hito = '...', updated_at = now()
WHERE id = '2335fb6d-3bbc-4f86-bb5d-09045e91b74c';
```
Y registrar el Shot ejecutado en `public.shots`.

## 4. Actualizar el handoff
`_shared/07-handoff-state.md`: marcar lo hecho, mover lo que siguió bloqueado a la
sección de pendientes con fecha, y anotar la bitácora.

## 5. Mover el plan
Sólo si la auditoría pasó:
```bash
git mv SIGMA_OMEGA/PROJECT/plans/active/SG-DECANATO-01-pastoral-social-Composer2Max \
       SIGMA_OMEGA/PROJECT/plans/complete/SG-DECANATO-01-pastoral-social-Composer2Max
```

## 6. Commit
Un commit por task, mensaje en español, sin firma de herramienta.
Abrir PR contra `main` con el resumen y las capturas.

## 7. Lo que NO hace esta task
No manda ningún mensaje al decanato ni a Angie. El texto exacto lo aprueba Mario primero.
