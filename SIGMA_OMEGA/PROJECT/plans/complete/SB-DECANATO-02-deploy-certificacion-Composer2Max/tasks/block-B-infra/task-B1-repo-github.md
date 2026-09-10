# B1 · Empujar el repo a GitHub

## Por qué es la primera task del bloque
Coolify construye desde el **repo remoto**. Los archivos existen en el disco de
Mario, pero al generar este Shot **nada estaba empujado**. Sin push no hay deploy.

## Pasos
```bash
git status                      # revisa qué va a entrar
git add -A
git status --short              # confirma que NO aparece _source/ ni .env
```

**Verificación obligatoria antes de commitear:**
```bash
git ls-files _source/ | wc -l   # tiene que dar 0
git ls-files | grep -i "\.env$" # no debe devolver nada
```
`_source/` guarda las fotos **sin difuminar**. Si alguna se cuela al repo
remoto, queda en el historial de git para siempre. Es el único error de esta
task que no se puede deshacer con un commit.

```bash
git commit -m "Sitio base de la Pastoral Social del Decanato Dulce Nombre de Jesús

Astro 5 estático, 23 páginas, cero JavaScript al cliente.
Contenido en Content Collections con esquema Zod: 3 comedores, 13 parroquias.
12 fotos con rostros de personas atendidas difuminados.
Aviso de privacidad integral conforme LFPDPPP.
Estructura SIGMA_OMEGA con el ShotGenesis SG-DECANATO-01."

git push -u origin main         # o abrir PR si la rama es shot/*
```

## Después del push
Verifica en `https://github.com/DayanaWebSites/DecanatoPastoral` que:
- Están las 23 páginas fuente y los assets.
- **No** está `_source/`.
- **No** hay ningún `.env` con valores reales.
- `Dockerfile` y `nginx.conf` están en la raíz.

## Cierre
URL del commit en GitHub. Confirmación de que `_source/` no está en el remoto.
