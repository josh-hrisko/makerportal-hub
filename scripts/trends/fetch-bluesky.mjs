/**
 * Bluesky public post search — unauthenticated, official AT Protocol
 * appview endpoint, designed for exactly this kind of read.
 * https://docs.bsky.app/docs/api/app-bsky-feed-search-posts
 *
 * (Uses the stateless search endpoint rather than the Jetstream firehose —
 * Jetstream is a long-lived stream meant for a persistent consumer; a
 * weekly batch job that runs and exits fits a one-shot search query better.)
 */
import { SEARCH_QUERIES, scoreText } from './keywords.mjs';

const ENDPOINT = 'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts';

export async function fetchBluesky() {
  const seen = new Map();

  for (const query of SEARCH_QUERIES) {
    const url = `${ENDPOINT}?q=${encodeURIComponent(query)}&limit=25&sort=top`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[bluesky] query "${query}" failed: ${res.status}`);
      continue;
    }
    const data = await res.json();
    for (const post of data.posts ?? []) {
      const uri = post.uri;
      if (!uri || seen.has(uri)) continue;
      const text = post.record?.text ?? '';
      const { tags, score } = scoreText(text);
      if (score === 0) continue;
      const rkey = uri.split('/').pop();
      const handle = post.author?.handle;
      seen.set(uri, {
        id: `bluesky-${rkey}`,
        source: 'bluesky',
        title: text.slice(0, 220),
        url: handle ? `https://bsky.app/profile/${handle}/post/${rkey}` : uri,
        author: handle,
        publishedAt: post.record?.createdAt ?? post.indexedAt,
        tags,
        score: score + Math.round((post.likeCount || 0) / 20),
      });
    }
  }
  return [...seen.values()];
}
