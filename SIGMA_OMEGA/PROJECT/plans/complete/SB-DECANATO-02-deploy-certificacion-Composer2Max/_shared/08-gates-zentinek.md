# 08 · Gates de aprobación en ZENTINEK

Las mutaciones sobre recursos PRODUCTION devuelven `status: PENDING` con un
`pendingActionId` y un `approvalToken`. **Eso no es un error.** Es el diseño.

## Comprobado el 2026-09-09
`domain_doctor` sobre `pastoralsocialdecanatodulcenombre.org` devolvió:
```
status: PENDING
risk: CONFIRM
resourceEnv: PRODUCTION
message: "Producción: espera aprobación de Mario."
```

## Las dos formas de pasar el gate
1. `safety_approve` con `pendingActionId` + `approvalToken`.
2. Mario dicta la frase de autorización → re-invocar con `authorizationPhrase`.

Los hostnames `preview.*` ejecutan sin frase. **Por eso el bloque C despliega
primero en preview y sólo después hace el cutover del apex.**

## Regla
Si un gate queda pendiente: se detiene, se le dice a Mario qué acción es y qué
`pendingActionId` tiene, y se espera. No se reintenta con `force`.
