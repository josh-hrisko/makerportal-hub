/**
 * Weekly trend digest orchestrator — fetches Bluesky/HN/Reddit, scores
 * against studio pillars, writes src/data/trends.json. Runs from
 * .github/workflows/trends-digest.yml, output reviewed via PR before merge
 * (build-time static data, no runtime fetch on the hub itself).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchBluesky } from './fetch-bluesky.mjs';
import { fetchHackerNews } from './fetch-hn.mjs';
import { fetchReddit } from './fetch-reddit.mjs';

const OUT_PATH = join(process.cwd(), 'src', 'data', 'trends.json');
const MAX_ITEMS = 40;
const MAX_AGE_DAYS = 30;

const sources = [
  { name: 'bluesky', run: fetchBluesky },
  { name: 'hackernews', run: fetchHackerNews },
  { name: 'reddit', run: fetchReddit },
];

const results = await Promise.allSettled(sources.map((s) => s.run()));

let items = [];
results.forEach((result, i) => {
  if (result.status === 'fulfilled') {
    console.log(`[${sources[i].name}] ${result.value.length} relevant items`);
    items.push(...result.value);
  } else {
    console.error(`[${sources[i].name}] failed:`, result.reason?.message ?? result.reason);
  }
});

const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
items = items
  .filter((item) => new Date(item.publishedAt).getTime() >= cutoff)
  .sort((a, b) => b.score - a.score || new Date(b.publishedAt) - new Date(a.publishedAt))
  .slice(0, MAX_ITEMS);

const digest = {
  generatedAt: new Date().toISOString(),
  items,
};

writeFileSync(OUT_PATH, `${JSON.stringify(digest, null, 2)}\n`);
console.log(`Wrote ${items.length} items to ${OUT_PATH}`);
