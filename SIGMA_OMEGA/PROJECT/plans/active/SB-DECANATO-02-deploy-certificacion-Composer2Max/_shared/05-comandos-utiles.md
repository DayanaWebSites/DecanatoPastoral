# 05 · Comandos

## Local
```bash
npm run build && npm run verify       # auditoría del SG-01
docker build -t decanato:local .      # imagen
docker run --rm -p 8080:80 decanato:local
curl -I http://localhost:8080/                    # 200 + cabeceras
curl -I http://localhost:8080/comedores           # 200, no 404
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/no-existe   # 404
curl -s http://localhost:8080/health              # ok
```

## Auditoría de este Shot contra producción
```bash
node SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/verifications/verify-produccion.mjs https://pastoralsocialdecanatodulcenombre.org
```

## Lighthouse contra producción
```bash
npx lighthouse https://pastoralsocialdecanatodulcenombre.org \
  --form-factor=mobile --output=html --output-path=./lh-prod.html
```
