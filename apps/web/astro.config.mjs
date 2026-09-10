// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import react from '@astrojs/react';

// SIGMA_OMEGA — ADR-002: output server. El público sigue en 0 JS.
export default defineConfig({
  site: 'https://pastoralsocialdecanatodulcenombre.org',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'ignore',
  // Las escrituras del panel van con cookie httpOnly + SameSite=lax.
  // checkOrigin rompe el refresh en local (Host ≠ site) y los scripts E1.
  // El formulario público de contacto no usa cookie: honeypot + Zod.
  security: { checkOrigin: false },
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/gracias') &&
        !page.includes('/editar') &&
        !page.includes('/login') &&
        !page.includes('/auth') &&
        !page.includes('/api/'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  image: {
    responsiveStyles: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.pastoralsocialdecanatodulcenombre.org' },
    ],
  },
  build: { inlineStylesheets: 'never' },
});
