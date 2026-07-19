import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    eyebrow: z.string().default('Field note'),
    readingTime: z.string().default('4 min read'),
    faq: z.array(z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    })).optional(),
  }),
});

const journal = defineCollection({
  loader: glob({ base: './src/content/journal', pattern: '**/*.json' }),
  schema: z.object({
    generatedAt: z.string(),
    items: z.array(
      z.object({
        id: z.string(),
        source: z.enum(['bluesky', 'hackernews', 'reddit', 'github', 'arxiv', 'lobsters', 'devto']),
        title: z.string(),
        url: z.string(),
        author: z.string().optional(),
        publishedAt: z.string(),
        tags: z.array(z.string()).default([]),
        score: z.number(),
        domain: z.string().optional(),
        sources: z.array(z.enum(['bluesky', 'hackernews', 'reddit', 'github', 'arxiv', 'lobsters', 'devto'])).optional(),
        image: z.string().optional(),
        // arXiv subject classification (drives the custom SVG card in enrich-images.mjs).
        // Note: imageUrl is enrichment-internal (third-party CDN URL) and is stripped
        // by stripInternalFields() before digests are committed — never present here.
        category: z.string().optional(),
      })
    ),
  }),
});

export const collections = { blog, journal };
