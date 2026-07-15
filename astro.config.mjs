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
  // Disable prefetch runtime to kill critical chain `page.*.js` (413ms) on mobile.
  // Hover prefetch added main-thread + network work right after load on mobile Safari
  // and shows up as "Avoid chaining critical requests" in PageSpeed.
  // Re-enable later with `hover` + `speculationRules` if needed for desktop.
  prefetch: false,
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
