/**
 * Bluesky curated actor feed ingestion.
 * Fetches recent posts for curated high-signal handles from app.bsky.feed.getAuthorFeed.
 * 
 * Works unauthenticated via the public AppView API by default, but supports
 * authenticated session calls if credentials are provided in the environment.
 * Filters out replies to keep conversational noise to a minimum.
 */
import { BLUESKY_CURATED_HANDLES } from './keywords.mjs';

const PUBLIC_ENDPOINT = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed';
const AUTH_ENDPOINT = 'https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed';
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

export async function fetchBlueskyCurated() {
  const identifier = process.env.BLUESKY_IDENTIFIER;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;

  let endpoint = PUBLIC_ENDPOINT;
  let headers = {};
  if (identifier && appPassword) {
    try {
      const accessJwt = await createSession(identifier, appPassword);
      endpoint = AUTH_ENDPOINT;
      headers = { Authorization: `Bearer ${accessJwt}` };
      console.log('[bluesky-curated] authenticated session initialized');
    } catch (err) {
      console.warn(`[bluesky-curated] auth failed (${err.message}) — falling back to public endpoint.`);
    }
  }

  const seen = new Map();

  for (const handle of BLUESKY_CURATED_HANDLES) {
    const url = `${endpoint}?actor=${encodeURIComponent(handle)}&limit=15`;
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.warn(`[bluesky-curated] actor "${handle}" failed: ${res.status}`);
        continue;
      }
      const data = await res.json();
      for (const item of data.feed ?? []) {
        const post = item.post;
        if (!post) continue;
        const uri = post.uri;
        if (!uri || seen.has(uri)) continue;

        // Skip replies to keep conversation noise out
        if (post.record?.reply) continue;

        const text = post.record?.text ?? '';
        const rkey = uri.split('/').pop();
        const authorHandle = post.author?.handle ?? handle;
        
        seen.set(uri, {
          id: `bluesky-${rkey}`,
          source: 'bluesky',
          title: text.slice(0, 220),
          url: authorHandle ? `https://bsky.app/profile/${authorHandle}/post/${rkey}` : uri,
          author: authorHandle,
          publishedAt: post.record?.createdAt ?? post.indexedAt,
          text,
          externalUrl: extractExternalUrl(post),
          engagement: post.likeCount || 0,
          curated: true, // Tag as curated so the pipeline drops strict filters
        });
      }
    } catch (err) {
      console.warn(`[bluesky-curated] error fetching ${handle}: ${err.message}`);
    }
    // Gentle throttle between actors to prevent rate limiting
    await new Promise((r) => setTimeout(r, 400));
  }
  return [...seen.values()];
}

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
