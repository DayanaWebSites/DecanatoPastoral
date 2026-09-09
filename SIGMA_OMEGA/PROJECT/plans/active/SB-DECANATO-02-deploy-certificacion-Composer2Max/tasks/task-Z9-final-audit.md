# Z9 · Auditoría final del Shot

## 1. Los cuatro bloques cerrados
Revisa `_shared/07-handoff-state.md`: A, B, C y D con su evidencia.
Si alguno quedó abierto, este Shot **no cierra**. Se anota qué falta y por qué.

## 2. Auditorías
```bash
npm run build && npm run verify                    # auditor del SG-01
node .../verifications/verify-produccion.mjs https://pastoralsocialdecanatodulcenombre.org
```
Ambos en verde.

## 3. Registrar en CRONFIX
```sql
INSERT INTO sigma_omega.project_directives
  (proyecto_id, slug, titulo, tipo, status, version, file)
VALUES ('2335fb6d-3bbc-4f86-bb5d-09045e91b74c', 'adr-003-deploy-coolify',
        'ADR-003 — Deploy en Coolify: Dockerfile nginx, cache y CSP',
        'adr-local', 'active', '1.0.0', '<contenido>');

UPDATE public.proyectos
SET fase='produccion',
    proximo_hito='Conectar el formulario y cargar los datos que falten del decanato',
    updated_at=now()
WHERE id='2335fb6d-3bbc-4f86-bb5d-09045e91b74c';
```
Registrar también este Shot en `public.shots`.

El ADR-003 debe dejar escrito: `appUuid` de Coolify, hostname final, estrategia
de cache, la CSP exacta y por qué `inlineStylesheets: 'never'`.

## 4. Mover el plan
Sólo con todo lo anterior en verde:
```bash
git mv SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max \
       SIGMA_OMEGA/PROJECT/plans/complete/SB-DECANATO-02-deploy-certificacion-Composer2Max
```

## 5. Lo que este Shot NO hace
**No le manda nada a Angie ni al decanato.** El sitio queda listo y verificado;
el mensaje con el enlace lo aprueba Mario palabra por palabra antes de que salga.
Lo mismo con el cartel del aviso de privacidad.
