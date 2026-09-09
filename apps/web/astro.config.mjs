// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SIGMA_OMEGA — by-type-sitio-web-astro v1.0.0 | ADR-001
export default defineConfig({
  site: 'https://pastoralsocialdecanatodulcenombre.org',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/gracias'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  image: { responsiveStyles: true },
  // 'never' hace determinista que no haya <style> inline, y eso permite
  // una CSP sin 'unsafe-inline' en style-src. Ver nginx.conf.
  build: { inlineStylesheets: 'never' },
});
