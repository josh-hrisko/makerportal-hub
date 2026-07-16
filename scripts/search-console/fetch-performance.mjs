/**
 * Google Search Console API (searchAnalytics.query) — standard OAuth2
 * refresh-token grant, reusing the same "Desktop App" OAuth client already
 * authorized against sc-domain:makerportal.ai (see analytics/gsc_dashboard.py,
 * the local-only dashboard from an earlier session). This is local-only by
 * design — output never gets committed (analytics/reports/ is gitignored)
 * and this script is never wired into a GitHub Actions workflow, because
 * this repo is public: performance data (queries, pages, click/impression
 * counts) is private business data, not something to publish to the repo.
 *
 * Run via: node --env-file=.env scripts/search-console/build-report.mjs
 * Needs GOOGLE_SC_CLIENT_ID / GOOGLE_SC_CLIENT_SECRET / GOOGLE_SC_REFRESH_TOKEN
 * in your local .env (gitignored) — values already sitting in
 * analytics/client_secret*.json and analytics/token.json. Skips cleanly
 * (returns null) if unset, same posture as fetch-reddit.mjs / fetch-items.mjs.
 *
 * Caveat: if the Google Cloud OAuth consent screen is still in "Testing"
 * publishing status, Google expires refresh tokens 7 days after issuance
 * regardless of use. Publish the consent screen (Testing -> In production;
 * no verification review needed for an internal single-user app on a
 * non-restricted scope) to stop the token from rotting — otherwise this
 * script (and gsc_dashboard.py) will start failing ~7 days after
 * token.json was last minted and need a fresh local browser re-auth.
 *
 * Data has a ~2-3 day processing lag in Search Console itself, so the query
 * window ends 3 days back rather than "today".
 */
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SITE_URL = 'sc-domain:makerportal.ai';

async function getAccessToken(clientId, clientSecret, refreshToken) {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    throw new Error(`token refresh failed: ${res.status} ${(await res.text().catch(() => '')).slice(0, 300)}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function queryPerformance(token, { startDate, endDate, dimensions, rowLimit }) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
    },
  );
  if (!res.ok) {
    throw new Error(`searchAnalytics query failed: ${res.status} ${(await res.text().catch(() => '')).slice(0, 300)}`);
  }
  const data = await res.json();
  return data.rows ?? [];
}

function dateRange(daysBack = 28, lagDays = 3) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - lagDays);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - daysBack);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

export async function fetchSearchPerformance() {
  const clientId = process.env.GOOGLE_SC_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SC_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SC_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('[search-console] GOOGLE_SC_CLIENT_ID/GOOGLE_SC_CLIENT_SECRET/GOOGLE_SC_REFRESH_TOKEN not set — skipping.');
    return null;
  }

  const token = await getAccessToken(clientId, clientSecret, refreshToken);
  const { startDate, endDate } = dateRange();

  const [totalsRows, queryRows, pageRows] = await Promise.all([
    queryPerformance(token, { startDate, endDate, dimensions: [], rowLimit: 1 }),
    queryPerformance(token, { startDate, endDate, dimensions: ['query'], rowLimit: 25 }),
    queryPerformance(token, { startDate, endDate, dimensions: ['page'], rowLimit: 25 }),
  ]);

  const totals = totalsRows[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const topQueries = queryRows.map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
  const topPages = pageRows.map((r) => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));

  return {
    dateRange: { startDate, endDate },
    totals: { clicks: totals.clicks ?? 0, impressions: totals.impressions ?? 0, ctr: totals.ctr ?? 0, position: totals.position ?? 0 },
    topQueries,
    topPages,
  };
}
