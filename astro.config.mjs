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
    // Hover/tap only — viewport prefetchAll was adding main-thread + network
    // work right after load on mobile Safari (page.*.js critical-path noise).
    prefetchAll: false,
    defaultStrategy: 'hover',
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
