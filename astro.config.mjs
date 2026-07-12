import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.makerportal.ai',
  output: 'static',
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
