# 01 · Guardrails

## No negociables
1. **No inventar datos del decanato.** Teléfonos, correos, horarios de misa y servicios
   por parroquia sólo se publican si vienen del cliente. Si no hay dato, el campo queda
   vacío y la parroquia con `estado: en_construccion`.
2. **No publicar rostros identificables de personas atendidas.** Toda foto nueva pasa por
   el pipeline de difuminado antes de entrar a `src/assets/comedores/`.
   Los originales sin difuminar NO se comitean (ver `.gitignore`, carpeta `_source/`).
3. **No romper lo que ya está aprobado.** El diseño, la paleta y los textos institucionales
   ya pasaron por Mario. No se cambian sin pedirlo.
4. **Ningún mensaje al cliente sin aprobación de Mario.** Ni WhatsApp, ni correo, ni el
   texto del sitio que vaya a leer el decanato. Se muestra el borrador y se espera el OK.
5. **Nada se declara listo sin evidencia en vivo.** Un reporte no cierra una tarea:
   build verde + screenshot + URL respondiendo.

## Reglas de stack (de `by-type-sitio-web-astro`)
- Cero JavaScript enviado al cliente salvo isla justificada en una frase.
- Todo dato editable vive en `src/content/*.json` o `src/data/*.json`, nunca en un `.astro`.
- Toda collection lleva esquema Zod.
- Imágenes siempre por `astro:assets`, nunca `<img>` crudo.
- Fuentes self-hosted. Cero peticiones a terceros desde el HTML.

## Secretos
Las API keys (Resend, tokens de ZENTINEK) NUNCA se pegan completas en el chat ni se
comitean. Van a variables de entorno en Coolify. En conversación, sólo prefijo + últimos 4.
