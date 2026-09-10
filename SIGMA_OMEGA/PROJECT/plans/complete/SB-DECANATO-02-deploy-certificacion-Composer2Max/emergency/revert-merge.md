# Revertir un merge

## Si el merge ya está en main y rompió algo
```bash
git log --oneline --merges -5        # localiza el merge
git revert -m 1 <sha-del-merge>      # revierte manteniendo el historial
npm run build                        # confirma que el estado revertido compila
```
`-m 1` mantiene el primer padre (main). No uses `reset --hard` sobre `main`.

## Si el merge todavía no se empujó
```bash
git reset --hard ORIG_HEAD
```

## Después de revertir
1. `npm run build` verde.
2. Redesplegar (`deploy_trigger`) para que producción quede alineada con `main`.
3. Anotar en `_shared/07-handoff-state.md` qué se revirtió y por qué.
4. Volver a abrir la task que había cerrado ese merge.
