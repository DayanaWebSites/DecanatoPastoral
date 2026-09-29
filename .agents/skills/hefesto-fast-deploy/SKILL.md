---
name: hefesto-fast-deploy
description: >-
  Deploy rápido vía HEFESTO: forja VULKANO → gate PUSHED_REGISTRY=1 → pull&run ZENITH.
  Usar cuando el usuario diga deploy, subir, forjar, preview, poner en línea, HEFESTO.
---

# HEFESTO Fast Deploy

**Modelo mental:** código nuevo = **forja obligatoria**. `--skip-build` = pull&run de imagen **ya** en `ZENITH:5000`.

## Comando canónico (código nuevo)

Desde la raíz del repo:

```bash
node SIGMA_OMEGA/CORE/scripts/hefesto-turbo.mjs --branch preview
# ZENTINEK: --branch main solo si Mario lo pidió explícito
```

Flujo: forja VULKANO → `PUSHED_REGISTRY=1` → pull&run ZENITH → health/versión renderizada.

**Importante (GIT=1, default):** VULKANO clona/fetch de GitHub y hace checkout de `origin/<branch>`. **Código local sin `git push` no entra en la forja.**

## Disciplina del agente (obligatorio)

1. **No compiles en la PC antes de forjar.** Nada de `pnpm build` ni `next build` local: VULKANO compila. Antes del push basta `tsc --noEmit` de la app, una vez (~40 s), porque la forja ya no revisa tipos.
2. **Un solo turbo, sin variables a mano.** No pongas `HEFESTO_DUAL_BRANCH`, `HEFESTO_DUAL_CHILD` ni `HEFESTO_FORGE_WAIT_SEC`. El deploy doble a main+preview lo hace turbo solo.
3. **Si la forja falla, lee el error.** No relances igual: el mismo commit queda bloqueado al 2º fallo (exit 80). Corrige, commit, push y forja otra vez.
4. **El commit no espera a GitNexus.** El hook reindexa en segundo plano; no uses `--no-verify` por eso.
5. **Un typecheck por ciclo, no por archivo.** Corre `tsc --noEmit` una vez al final, no tras cada edición (el incremental deja la 2ª corrida en ~30 s). Tests: solo los del módulo que tocaste (`vitest run <ruta>`), nunca la suite completa en cada commit.

## Receta FINANZALOR (~1–2 min hot)

1. **Una sola compilación.** Un solo turbo etiqueta esa imagen como `main` y `preview` y hace pull&run de las dos. `HEFESTO_DUAL_BRANCH=0` ya no apaga eso. Si otro chat lanza la otra rama de la misma versión, espera el candado y retagea: no vuelve a compilar Next.
2. No leer `buildcache` del registry (`HEFESTO_CACHE_REGISTRY_FROM` default OFF). Eso dispara `can't evaluate field Id`.
3. No reexportar caché local en el mismo buildx (`cache-to` off). `cache-from` local sí.
4. Si buildx sale ≠0 pero la imagen ya cargó → push igual.
5. No `docker pull` de regreso a VULKANO.
6. El Dockerfile guarda caché BuildKit: store de pnpm y `.next/cache` (como FINANZALOR). Sin eso el `next build` sigue tardando minutos.
7. Reportar sync, build, push y deploy en segundos (`[forge-vulkano] TIMINGS …`).

## Pull&run solo (~20–60 s)

**Qué hace:** pull remoto de `127.0.0.1:5000/<slug>:<branch>` en ZENITH + recreate contenedor. **No** exige imagen en Docker Desktop local. **No** valida `PUSHED_REGISTRY=1`.

```bash
node SIGMA_OMEGA/CORE/scripts/hefesto-turbo.mjs --branch preview --skip-build
```

| Caso | ¿`--skip-build`? |
|------|------------------|
| Código/commit nuevo | ❌ **Prohibido** — forja obligatoria |
| Recreate misma versión (Traefik, env, crash-loop) | ✅ emergencia |
| Drenar cola (`hefesto-drain-ready.mjs`) | ✅ imagen ya forjada |

Si la imagen no está en `:5000` → falla el `docker pull` remoto (no el check de imagen local).

## Gate verde (solo tras forja VULKANO)

| Señal | Cuándo |
|-------|--------|
| `PUSHED_REGISTRY=1` | Forja VULKANO OK — imagen en `:5000` |
| exit ≠ 0 / sin push | **STOP** — no pull&run, no botón Coolify, no build en ZENITH |

`--skip-build` **no** pasa por este gate.

**Emergencia:** `HEFESTO_ALLOW_NO_PUSH=1` omite la verificación `PUSHED_REGISTRY=1` tras forja. Solo si la forja terminó OK pero el marcador no apareció en logs — **no** usar con `--skip-build`.

## Knobs útiles

| Variable | Default | Uso |
|----------|---------|-----|
| `HEFESTO_FORGE` | `vulkano` | PC: `local` |
| `HEFESTO_VULKANO_GIT` | `1` | `=0` → archive/scp (HEAD local, sin push remoto) |
| `HEFESTO_VULKANO_REPO` | `git@github.com:EurekaSigma/<project>.git` | Override org/fork |
| `HEFESTO_FORGE_SLOTS` | `6` | Hasta 6 forjas en paralelo (picos → `/var/log/hefesto/forge-peak.log`) — **no serializa el mismo proyecto** |
| `HEFESTO_FORGE_WAIT_SEC` | `900` | Slots llenos: espera en cola |

## Telemetría (sin comando extra)

1. **Log** — `[HEFESTO-TURBO]` / `[forge-vulkano]` con timings.
2. **Panel Mission Control → HEFESTO** — feed en vivo.

## Cierre

Verificar versión en UI o `/health` con versión (HTML crudo no cuenta):

```text
✅ <proyecto> v<VERSION> en línea en <preview|main> (<mm:ss>)
```

## Prohibiciones

- ❌ Compilar en ZENTITH · botón Deploy Coolify
- ❌ `--skip-build` con código nuevo
- ❌ Forjar sin push (con GIT=1) · Vercel/Neon nuevos

Refs: `.cursor/commands/hefesto-deploy.md` · `.cursor/rules/hefesto-fast-deploy.mdc`
