import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { apps } from '../data/apps';

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
})[character] ?? character);

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const today = new Date().toISOString();

  const entries: SitemapEntry[] = [
    { url: 'https://www.makerportal.ai', lastmod: today, changefreq: 'weekly', priority: '1.0' },
    { url: 'https://www.makerportal.ai/blog', lastmod: today, changefreq: 'weekly', priority: '0.9' },
    ...posts.map((post) => ({
      url: `https://www.makerportal.ai/blog/${post.id}`,
      lastmod: (post.data.updatedAt ?? post.data.publishedAt).toISOString(),
      changefreq: 'monthly',
      priority: '0.8',
    })),
    ...apps.map((app) => {
      const date = new Date(app.date);
      const appLastmod = isNaN(date.getTime()) ? today : date.toISOString();
      return {
        url: app.url,
        lastmod: appLastmod,
        changefreq: 'monthly',
        priority: '0.8',
      };
    }),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}${entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ''}${entry.priority ? `\n    <priority>${entry.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
