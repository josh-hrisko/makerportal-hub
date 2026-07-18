/**
 * Bluesky post search — official AT Protocol endpoints.
 * https://docs.bsky.app/docs/api/app-bsky-feed-search-posts
 *
 * The unauthenticated public appview 403s searchPosts from datacenter IPs
 * (GitHub Actions, cloud sandboxes — verified 2026-07-15), so when
 * BLUESKY_IDENTIFIER / BLUESKY_APP_PASSWORD are set we create a session
 * against bsky.social and search authenticated. Unauthenticated public
 * endpoint remains the fallback for local/residential runs.
 *
 * (Uses the stateless search endpoint rather than the Jetstream firehose —
 * Jetstream is a long-lived stream meant for a persistent consumer; a
 * daily batch job that runs and exits fits a one-shot search query better.)
 */
import { SEARCH_QUERIES } from './keywords.mjs';

const PUBLIC_ENDPOINT = 'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts';
const AUTH_ENDPOINT = 'https://bsky.social/xrpc/app.bsky.feed.searchPosts';
const SESSION_ENDPOINT = 'https://bsky.social/xrpc/com.atproto.server.createSession';

async function createSession(identifier, appPassword) {
  const res = await fetch(SESSION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password: appPassword }),
  });
  if (!res.ok) throw new Error(`createSession failed: ${res.status}`);
  const data = await res.json();
  return data.accessJwt;
}

export async function fetchBluesky() {
  const identifier = process.env.BLUESKY_IDENTIFIER;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;

  let endpoint = PUBLIC_ENDPOINT;
  let headers = {};
  if (identifier && appPassword) {
    try {
      const accessJwt = await createSession(identifier, appPassword);
      endpoint = AUTH_ENDPOINT;
      headers = { Authorization: `Bearer ${accessJwt}` };
      console.log('[bluesky] authenticated session');
    } catch (err) {
      console.warn(`[bluesky] auth failed (${err.message}) — falling back to public endpoint.`);
    }
  }

  const seen = new Map();

  for (const query of SEARCH_QUERIES) {
    const url = `${endpoint}?q=${encodeURIComponent(query)}&limit=50&sort=top`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`[bluesky] query "${query}" failed: ${res.status}`);
      continue;
    }
    const data = await res.json();
    for (const post of data.posts ?? []) {
      const uri = post.uri;
      if (!uri || seen.has(uri)) continue;
      const text = post.record?.text ?? '';
      const rkey = uri.split('/').pop();
      const handle = post.author?.handle;
      seen.set(uri, {
        id: `bluesky-${rkey}`,
        source: 'bluesky',
        title: text.slice(0, 220),
        url: handle ? `https://bsky.app/profile/${handle}/post/${rkey}` : uri,
        author: handle,
        publishedAt: post.record?.createdAt ?? post.indexedAt,
        text,
        externalUrl: extractExternalUrl(post),
        engagement: post.likeCount || 0,
      });
    }
  }
  return [...seen.values()];
}

/** First outbound link on the post — embed card first, then rich-text link facets. */
function extractExternalUrl(post) {
  const embedUri = post.record?.embed?.external?.uri;
  if (embedUri) return embedUri;
  for (const facet of post.record?.facets ?? []) {
    for (const feature of facet.features ?? []) {
      if (feature.$type === 'app.bsky.richtext.facet#link' && feature.uri) return feature.uri;
    }
  }
  return undefined;
}
