VERSION v2.0.260519 | FUENTE faceticket (referencia primaria de auth)
LAYOUT: bg-[#040d23] + radial-gradient blobs + grid texture 42px. Card: rounded-2xl border-white/12 bg-white/5 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,.55)].
INPUT AUTH: rounded-xl border-white/12 bg-white/6 py-2.5 pl-9 text-white placeholder:text-white/35 focus:ring-accent-400/15. Icon left-3 absolute text-white/35.
FLUJO: normalizeIdentifier(email|telefono) → telefono /login/telefono → email password+magic link toggle → OTP 6 digitos tracking-[.35em].
BOTONES: primario bg-accent-600 rounded-xl; secundario border-white/10 bg-white/4 hover:bg-white/8.
DIVIDER: h-px bg-white/10 + span text-white/25.
VERSION BADGE siempre al fondo.
ANTI: NO fondo blanco, NO sin glassmorphism, NO inputs sin icono, NO sin normalizeIdentifier, NO sin VersionBadge.

## Nota de este repo
Este módulo es inerte. El sitio es `by-type-sitio-web-astro`: cero auth, cero usuarios.
Si aparece auth real, se migra a `by-type-app-web` (ADR-001). No se improvisa login encima de Astro.
