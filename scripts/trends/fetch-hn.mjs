/**
 * Hacker News via the official Algolia Search API — free, no key, no auth.
 * https://hn.algolia.com/api
 */
import { SEARCH_QUERIES, scoreText } from './keywords.mjs';

const ENDPOINT = 'https://hn.algolia.com/api/v1/search';
const SINCE_DAYS = 14;

export async function fetchHackerNews() {
  const sinceUnix = Math.floor(Date.now() / 1000) - SINCE_DAYS * 24 * 60 * 60;
  const seen = new Map();

  for (const query of SEARCH_QUERIES) {
    const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${sinceUnix}&hitsPerPage=20`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[hn] query "${query}" failed: ${res.status}`);
      continue;
    }
    const data = await res.json();
    for (const hit of data.hits ?? []) {
      if (!hit.title || seen.has(hit.objectID)) continue;
      const { tags, score } = scoreText(`${hit.title} ${hit._tags?.join(' ') ?? ''}`);
      if (score === 0) continue;
      seen.set(hit.objectID, {
        id: `hackernews-${hit.objectID}`,
        source: 'hackernews',
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        author: hit.author,
        publishedAt: hit.created_at,
        tags,
        score: score + Math.round((hit.points || 0) / 50),
      });
    }
  }
  return [...seen.values()];
}
