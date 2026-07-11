import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://makerportal.ai',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      namespaces: {
        news: false,
        xhtml: false,
        image: false,
        video: false,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
