import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.makerportal.ai',
  output: 'static',
  adapter: vercel({
    imageService: true,
    isr: false,
  }),
  trailingSlash: 'never',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    inlineStylesheets: 'always',
  },
  image: {
    domains: ['makerportal.ai', 'www.makerportal.ai'],
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: true,
    },
  },
  experimental: {
    contentIntellisense: true,
  },
});
