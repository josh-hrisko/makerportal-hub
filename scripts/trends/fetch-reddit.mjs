/**
 * Reddit official API (OAuth client_credentials, script-app grant) —
 * scoped to the subreddits that already cluster around studio pillars,
 * scored the same as other sources rather than trusted blindly.
 *
 * Needs REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET (repo secrets). Credentials
 * require approval under Reddit's Responsible Builder Policy (self-service
 * app creation closed Nov 2025) — apply via the request form linked from the
 * Reddit Data API Wiki. Skips cleanly (returns []) if the secrets are unset
 * so the rest of the digest still runs.
 */
const SUBREDDITS = ['iOSProgramming', 'LocalLLaMA', 'DSP', 'apple'];
const USER_AGENT = 'makerportal-hub-trends/1.0 (by /u/makerportal)';

async function getAccessToken(clientId, clientSecret) {
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export async function fetchReddit() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.warn('[reddit] REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET not set — skipping source.');
    return [];
  }

  const token = await getAccessToken(clientId, clientSecret);
  const seen = new Map();

  for (const subreddit of SUBREDDITS) {
    const url = `https://oauth.reddit.com/r/${subreddit}/new?limit=30`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': USER_AGENT },
    });
    if (!res.ok) {
      console.warn(`[reddit] r/${subreddit} failed: ${res.status}`);
      continue;
    }
    const data = await res.json();
    for (const child of data.data?.children ?? []) {
      const post = child.data;
      if (!post?.id || seen.has(post.id)) continue;
      seen.set(post.id, {
        id: `reddit-${post.id}`,
        source: 'reddit',
        title: post.title,
        url: `https://www.reddit.com${post.permalink}`,
        author: post.author,
        publishedAt: new Date(post.created_utc * 1000).toISOString(),
        text: `${post.title} ${post.selftext ?? ''}`,
        externalUrl: post.is_self ? undefined : post.url,
        engagement: post.ups || 0,
      });
    }
  }
  return [...seen.values()];
}
