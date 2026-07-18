/**
 * Amazon Creators API (OAuth2 / Login-with-Amazon client_credentials,
 * credential version 3.x, NA region) — fetches live product data for a
 * curated ASIN list. Needs AMAZON_CLIENT_ID / AMAZON_CLIENT_SECRET (repo
 * secrets). Skips cleanly (returns []) if unset, same posture as
 * fetch-reddit.mjs.
 *
 * Endpoints/flow per Amazon's own Creators API docs for credential version
 * 3.1 (NA — US/CA/MX/BR): token via api.amazon.com/auth/o2/token (JSON
 * body, not form-encoded — v3.x differs from the v2.x Cognito flow), then
 * Bearer-authenticated POSTs to creatorsapi.amazon/catalog/v1/*.
 *
 * PARTNER_TAG is duplicated here from src/data/affiliate-links.ts's
 * AMAZON_ASSOCIATE_TAG (scripts/ doesn't import from src/ elsewhere in this
 * repo) — keep both in sync if the Associates tag ever changes.
 */
const TOKEN_ENDPOINT = 'https://api.amazon.com/auth/o2/token';
const API_BASE = 'https://creatorsapi.amazon';
const MARKETPLACE = 'www.amazon.com';
const PARTNER_TAG = 'engineersport-20';
const BATCH_SIZE = 10; // assumed GetItems cap — unconfirmed by docs, verify on first real run

async function getAccessToken(clientId, clientSecret) {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'creatorsapi::default',
    }),
  });
  if (!res.ok) throw new Error(`token request failed: ${res.status} ${await res.text().catch(() => '')}`);
  const data = await res.json();
  return data.access_token;
}

function parseItem(raw) {
  if (!raw?.asin) return null;
  // Prefer large for modern gear grid (was medium → small). Large is ~500px, still fast with lazy loading.
  const image =
    raw.images?.primary?.large?.url ?? raw.images?.primary?.medium?.url ?? raw.images?.primary?.small?.url;
  const money = raw.offersV2?.listings?.[0]?.price?.money;
  return {
    asin: raw.asin,
    title: raw.itemInfo?.title?.displayValue ?? raw.asin,
    image,
    features: raw.itemInfo?.features?.displayValues ?? [],
    detailPageURL: raw.detailPageURL,
    price: money?.displayAmount,
    currency: money?.currency,
  };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getItemsBatch(asins, token, attempt = 0) {
  const res = await fetch(`${API_BASE}/catalog/v1/getItems`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-marketplace': MARKETPLACE,
    },
    body: JSON.stringify({
      itemIds: asins,
      itemIdType: 'ASIN',
      marketplace: MARKETPLACE,
      partnerTag: PARTNER_TAG,
      resources: [
        'images.primary.small',
        'images.primary.medium',
        'images.primary.large',
        'itemInfo.title',
        'itemInfo.features',
        'offersV2.listings.price',
        'offersV2.listings.availability',
      ],
    }),
  });
  if (!res.ok) {
    const body = (await res.text().catch(() => '')).slice(0, 500);
    // Retry on 429 / 5xx with exponential backoff
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      const delay = 1500 * Math.pow(2, attempt) + Math.random() * 500;
      console.warn(`[amazon] getItems ${res.status} — retry ${attempt + 1}/3 in ${Math.round(delay)}ms: ${body.slice(0, 120)}`);
      await sleep(delay);
      return getItemsBatch(asins, token, attempt + 1);
    }
    throw new Error(`getItems failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return (data.itemsResult?.items ?? []).map(parseItem).filter(Boolean);
}

export async function fetchAmazonItems(asins) {
  const clientId = process.env.AMAZON_CLIENT_ID;
  const clientSecret = process.env.AMAZON_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.warn('[amazon] AMAZON_CLIENT_ID/AMAZON_CLIENT_SECRET not set — skipping.');
    return [];
  }
  if (!asins.length) return [];

  const token = await getAccessToken(clientId, clientSecret);
  const items = [];
  for (let i = 0; i < asins.length; i += BATCH_SIZE) {
    const batch = asins.slice(i, i + BATCH_SIZE);
    if (i > 0) {
      // Gentle throttle — Amazon Creators API is rate-limited (docs say ~1 req/sec)
      await sleep(1200);
    }
    try {
      const batchItems = await getItemsBatch(batch, token);
      console.log(`[amazon] batch ${i / BATCH_SIZE + 1}: ${batchItems.length}/${batch.length} items`);
      items.push(...batchItems);
    } catch (err) {
      console.error(`[amazon] batch ${i / BATCH_SIZE + 1} failed after retries: ${err.message} — continuing with remaining`);
      // Continue to next batch rather than failing whole run
    }
  }
  return items;
}
