/**
 * Lobste.rs API — free, no key, no auth. Similar to HN but smaller, tech-focused.
 * https://lobste.rs/help
 * Provides /hottest.json, /newest.json, and search via /search.json?q=...
 */

const BASE = 'https://lobste.rs';

export async function fetchLobsters() {
  const seen = new Map();
  // Fetch hottest + newest to get fresh pool
  const endpoints = [`${BASE}/hottest.json`, `${BASE}/newest.json`];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json', 'User-Agent': 'MakerPortal-Trends/1.0' },
      });
      if (!res.ok) {
        console.warn(`[lobsters] ${endpoint} failed: ${res.status}`);
        continue;
      }
      const data = await res.json();
      for (const item of data ?? []) {
        // item has short_id, title, url, created_at, comment_count, score, tags
        const id = `lobsters-${item.short_id}`;
        if (seen.has(id)) continue;
        const text = `${item.title} ${(item.tags ?? []).join(' ')}`;
        seen.set(id, {
          id,
          source: 'lobsters',
          title: item.title,
          url: item.url || `https://lobste.rs/s/${item.short_id}`,
          author: item.submitter_user?.username,
          publishedAt: item.created_at,
          text,
          externalUrl: item.url,
          engagement: item.score ?? item.comment_count ?? 0,
        });
      }
    } catch (err) {
      console.warn(`[lobsters] error ${endpoint}: ${err.message}`);
    }
  }
  return [...seen.values()];
}
