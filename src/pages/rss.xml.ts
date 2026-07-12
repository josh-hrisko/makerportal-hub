import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const blog = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: 'Field Notes — MakerPortal',
    description: 'Notes on independent software, product decisions, interface craft, and what we learn while shipping.',
    site: context.site ?? 'https://www.makerportal.ai',
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: `/blog/${post.id}`,
    })),
  });
};
