import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      // Páginas con noindex: fuera del sitemap
      filter: (pagina) => !/\/(aviso-legal|privacidad|404)$/.test(pagina),
    }),
  ],
});
