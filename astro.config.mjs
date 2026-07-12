import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.makerportal.ai',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
