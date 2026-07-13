# MakerPortal Hub

The root application directory for [makerportal.ai](https://makerportal.ai), built with Astro and Tailwind CSS. Each listed application is maintained and deployed from its own repository.

## Local development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

Vercel can deploy the repository with the Astro preset defaults. The production output is fully static in `dist/`.

## Add an application

Add one object to `src/data/apps.ts` and place its SVG icon in `public/assets/app-icons/`. The directory UI, structured data, and cross-domain sitemap all read from that single data source.

## Publish a field note

Add a Markdown file to `src/content/blog/` using the existing posts as a frontmatter reference. Published entries automatically appear on the homepage, the `/blog` index, their own generated route, and both sitemaps. Set `draft: true` to keep a note out of production.

## Internal docs (repo-only)

Engineering memory for agents and humans — **not** linked from the public site:

- [`docs/README.md`](docs/README.md) — index  
- [`docs/HANDOFF-LIGHT-MODE.md`](docs/HANDOFF-LIGHT-MODE.md) — next-session prompt (light-mode contrast)  
- [`docs/RESEARCH-EMPIRE-IA.md`](docs/RESEARCH-EMPIRE-IA.md) — empire IA / blog research learnings  
- [`docs/THEME-SYSTEM.md`](docs/THEME-SYSTEM.md) · [`docs/DECISIONS.md`](docs/DECISIONS.md) · [`docs/OPEN-ITEMS.md`](docs/OPEN-ITEMS.md) · [`docs/DID-NOT-WORK.md`](docs/DID-NOT-WORK.md)
