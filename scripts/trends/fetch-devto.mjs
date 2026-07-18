/**
 * Dev.to API — free, no key, no auth. https://developers.forem.com/api
 * Provides /api/articles with tag filtering, top sorting.
 * Perfect for iOS craft + on-device AI content that HN might miss.
 */

const BASE = 'https://dev.to/api/articles';

const TAGS = [
  'swift',
  'ios',
  'machinelearning',
  'ai',
  'webdev', // some DSP/web audio overlap
  'javascript', // for playground-adjacent tools
];

export async function fetchDevto() {
  const seen = new Map();
  for (const tag of TAGS.slice(0, 6)) {
    const url = `${BASE}?tag=${encodeURIComponent(tag)}&top=7&per_page=20`;
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MakerPortal-Trends/1.0 (https://makerportal.ai)',
        },
      });
      if (!res.ok) {
        console.warn(`[devto] tag ${tag} failed: ${res.status}`);
        continue;
      }
      const articles = await res.json();
      for (const art of articles ?? []) {
        const id = `devto-${art.id}`;
        if (seen.has(id)) continue;
        // Basic relevance pre-filter: must have at least one pillar keyword in title/desc?
        // Let pipeline handle scoring, just collect
        seen.set(id, {
          id,
          source: 'devto',
          title: art.title,
          url: art.url,
          author: art.user?.username,
          publishedAt: art.published_at,
          text: `${art.title} ${art.description ?? ''} ${(art.tag_list ?? []).join(' ')}`,
          externalUrl: art.url,
          engagement: (art.public_reactions_count ?? 0) + (art.comments_count ?? 0),
        });
      }
    } catch (err) {
      console.warn(`[devto] tag ${tag} error: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return [...seen.values()];
}
