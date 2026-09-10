# A0 · Pre-flight

1. Lee `_shared/00-pre-flight.md`, `01-guardrails.md` y **`09-difuminado-obligatorio.md`**.
2. Confirma que el SB-DECANATO-02 cerró: sitio en su dominio y `verify-produccion.mjs`
   en verde. Si no, HALT.
3. Ejecuta las queries de CRONFIX de `00-pre-flight.md`. Lee `by-type-sitio-web-astro`
   **v1.1.0** completo: la frontera con Next se corrigió por este Shot.
4. Confirma acceso a Eurekabase. La `DATABASE_URL` sale del vault de ZENTINEK.
5. `git checkout -b shot/sb-decanato-03-panel`.

## Cierre
Los cinco puntos. Si Eurekabase no está listo para un proyecto de cliente en
producción, se detiene aquí y se le pregunta a Mario antes de seguir.
