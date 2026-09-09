#!/usr/bin/env node
/**
 * Materializa las referencias visuales aprobadas de este repo.
 * No descarga nada de terceros: el sitio no puede depender de CDNs.
 *
 * Uso: node SIGMA_OMEGA/PROJECT/scripts/download-ui-references.mjs
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const dest = join(raiz, 'SIGMA_OMEGA/PROJECT/ui-references');
mkdirSync(dest, { recursive: true });

const logo = join(raiz, 'src/assets/decanato/logo-claro.webp');
if (existsSync(logo)) {
  copyFileSync(logo, join(dest, 'logo-claro.webp'));
}

writeFileSync(
  join(dest, 'README.md'),
  `# Referencias UI — Pastoral Social

Paleta canónica (logo oficial, no accent SIGMA \`#7144f5\`):

| Nombre | Hex |
|---|---|
| verde | \`#04551F\` |
| dorado | \`#DEAB33\` |
| crema | \`#FCF9F2\` |
| tinta | \`#1B1A17\` |

Fuente de tokens: \`src/styles/global.css\` bloque \`@theme\`.
Logo copiado: \`logo-claro.webp\`.

No añadir capturas de otros productos SIGMA como referencia visual:
este sitio es institucional, no un dashboard.
`,
);

console.log(`Referencias UI en ${dest}`);
