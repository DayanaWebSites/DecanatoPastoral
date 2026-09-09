VERSION v2.0.260519 | FUENTE faceticket (keyframes) + Emil Kowalski principles (animations.dev)
PRINCIPIOS: easings importan MÁS que durations. Entradas: ease-out. Salidas: ease-in. Micro: ease-in-out. Springs para respuesta a usuario.
DURACIONES: instant:100ms toggles | fast:150ms hover | base:200ms fade/scale | slow:250ms slide modals | page:300ms.
EASINGS: ease-out:cubic-bezier(0,0,.4,1) entradas. ease-in:cubic-bezier(.6,0,1,1) salidas. spring-snappy:cubic-bezier(.34,1.56,.64,1) botones. spring-soft:cubic-bezier(.22,1,.36,1) drawers.
KEYFRAMES CANÓNICOS (faceticket): fade-in opacity 0→1 200ms. slide-up opacity+translateY(8px)→0 250ms. slide-down translateY(-8px)→0 200ms. scale-in scale(.95)→1 200ms.
PATRONES: button active:scale-[0.97] duration-100. card hover:shadow-md duration-150. tab indicator transition-all duration-200.
FRAMER MOTION: solo para listas animadas drag&drop gestures. NO para hover simples → CSS es más eficiente. AnimatePresence para mount/unmount.
REDUCED MOTION: @media(prefers-reduced-motion:reduce) *.animation-duration:.01ms.
ANTI: NO bounce en UI negocio, NO >500ms en interacciones, NO animar width/height (usar scale), NO animar top/left (usar translate), NO olvidar reduced-motion.
