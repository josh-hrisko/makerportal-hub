import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { apps } from '../data/apps';
import { hubRoutes } from '../data/site-nav';

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
  const journals = await getCollection('journal');
  const today = new Date().toISOString();

  const entries: SitemapEntry[] = [
    ...hubRoutes.map((route) => ({
      url: route.path === '/' ? 'https://www.makerportal.ai' : `https://www.makerportal.ai${route.path}`,
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
    ...posts.map((post) => ({
      url: `https://www.makerportal.ai/blog/${post.id}`,
      lastmod: (post.data.updatedAt ?? post.data.publishedAt).toISOString(),
      changefreq: 'monthly',
      priority: '0.8',
    })),
    ...journals.map((j) => ({
      url: `https://www.makerportal.ai/journal/${j.id}`,
      lastmod: (j.data.generatedAt ? new Date(j.data.generatedAt).toISOString() : today),
      changefreq: 'daily',
      priority: '0.7',
    })),
    // Product hosts (canonical on subdomains)
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
