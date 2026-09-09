# C1 · Deploy

## Pasos
1. `deploy_app` con el `appUuid` de B2, `envClass: PREVIEW` primero.
2. `deploy_status` con el `deploymentId` hasta que termine. Si falla, leer
   `deploy_logs` completos — el error suele estar en el `npm ci` del build stage,
   no en nginx.
3. `runtime_probe` para confirmar que el contenedor responde.

## Verificación inmediata, antes de cantar victoria
```bash
URL=https://preview.pastoralsocialdecanatodulcenombre.org   # el que aplique
curl -I  $URL/
curl -I  $URL/comedores
curl -s  $URL/health
curl -s -o /dev/null -w "%{http_code}\n" $URL/no-existe
```

## Fallos esperables y qué significan
| Síntoma | Causa probable |
|---|---|
| `/` da 200 pero `/comedores` da 404 | `try_files` mal en `nginx.conf` |
| Build falla en `npm ci` | `package-lock.json` desincronizado |
| Contenedor arranca y muere | el health check no encuentra `/health` |
| 502 desde Traefik | puerto expuesto distinto de 80 |

## Cierre
URL de preview respondiendo 200 con las cuatro rutas verificadas por `curl`.
