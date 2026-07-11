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
