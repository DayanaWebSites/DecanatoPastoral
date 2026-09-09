# task-02 · Cargar los datos que faltan del decanato

## Qué falta (confirmado al 2026-09-09)
| Dato | Dónde va | Estado |
|---|---|---|
| Correo y teléfono del decanato | `src/data/decanato.json` → `contacto` | pendiente |
| Logo o foto de Santa Teresita del Niño Jesús | `src/assets/logos/santa-teresita-del-nino-jesus.webp` | pendiente |
| Teléfono por comedor | `src/content/comedores/*.json` → `telefono` | pendiente |
| Servicios por parroquia | `src/content/parroquias/*.json` → `servicios` | pendiente (10 de 13) |
| Horarios de misa | `src/content/parroquias/*.json` → `horariosMisa` | opcional |
| Links de Google Maps por comedor | `src/content/comedores/*.json` → `mapaUrl` | opcional, mejora mucho la utilidad |

## Reglas
1. **Nada se inventa.** Ni un teléfono, ni un horario, ni un servicio.
2. Cuando llegue el dato de una parroquia, cambia su `estado` de `en_construccion` a
   `publicada`. El esquema Zod y la UI ya soportan ambos estados.
3. El correo del decanato desbloquea además el aviso de privacidad: al llenarlo,
   el banner de "Pendiente antes de publicar" desaparece solo.
4. Imagen nueva de parroquia: 800×600, `cover`, WebP calidad 82, mismo tratamiento que
   las otras 12 (ver `_shared/05-comandos-utiles.md`).

## Criterio de cierre
Los datos que el cliente entregó están cargados y validando contra Zod.
Lo que siguió sin llegar queda anotado en `_shared/07-handoff-state.md` con fecha.
