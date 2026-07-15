/**
 * Amazon gear catalog builder — reads the curated ASIN list from
 * src/data/affiliate-links.json, fetches live product data via the
 * Creators API (fetch-items.mjs), writes src/data/amazon-catalog.json plus
 * a markdown summary used as the review PR body. Runs from
 * .github/workflows/amazon-catalog.yml; a human merges the PR before
 * anything reaches /resources (build-time static data, no runtime fetch on
 * the hub itself) — same posture as scripts/trends/build-digest.mjs.
 *
 * Which ASINs exist is still 100% human-curated (edit affiliate-links.json
 * directly) — this script only refreshes display data for ASINs already
 * chosen. On total fetch failure it leaves the existing cache untouched
 * rather than writing empty/partial data over good data.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fetchAmazonItems } from './fetch-items.mjs';

const LINKS_PATH = join(process.cwd(), 'src', 'data', 'affiliate-links.json');
const OUT_PATH = join(process.cwd(), 'src', 'data', 'amazon-catalog.json');
const SUMMARY_PATH = join(process.cwd(), 'amazon-catalog-summary.md'); // gitignored, PR body only

const links = JSON.parse(readFileSync(LINKS_PATH, 'utf8'));
const asins = [...new Set(links.map((l) => l.asin))];

if (!asins.length) {
  console.log('No ASINs in affiliate-links.json — nothing to fetch.');
  process.exit(0);
}

let fetched;
try {
  fetched = await fetchAmazonItems(asins);
} catch (err) {
  console.error('[amazon] fetch failed, leaving existing cache untouched:', err.message);
  process.exit(0);
}

if (!fetched.length) {
  console.warn('[amazon] no items returned (missing credentials or all lookups failed) — leaving existing cache untouched.');
  process.exit(0);
}

const previousItems = existsSync(OUT_PATH) ? (JSON.parse(readFileSync(OUT_PATH, 'utf8')).items ?? {}) : {};

const items = {};
const refreshed = [];
const missing = [];

for (const asin of asins) {
  const match = fetched.find((f) => f.asin === asin);
  if (match) {
    items[asin] = {
      title: match.title,
      image: match.image,
      features: match.features,
      detailPageURL: match.detailPageURL,
      price: match.price,
      currency: match.currency,
    };
    refreshed.push(asin);
  } else if (previousItems[asin]) {
    items[asin] = previousItems[asin]; // keep last-known-good if this run couldn't refresh it
    missing.push(asin);
  } else {
    missing.push(asin);
  }
}

const generatedAt = new Date().toISOString();
writeFileSync(OUT_PATH, `${JSON.stringify({ generatedAt, items }, null, 2)}\n`);
writeFileSync(SUMMARY_PATH, renderSummary(refreshed, missing, links, generatedAt));

console.log(`Refreshed ${refreshed.length}/${asins.length} ASINs. Wrote ${OUT_PATH}`);
if (missing.length) console.warn(`[amazon] no fresh data for: ${missing.join(', ')}`);

function renderSummary(refreshedAsins, missingAsins, allLinks, timestamp) {
  const labelFor = (asin) => allLinks.find((l) => l.asin === asin)?.label ?? asin;
  const lines = [
    'Automated Amazon Creators API catalog refresh. **Review before merging** — ',
    'merging updates the live title/image/price shown on `/resources#gear`.',
    '',
    `**Refreshed:** ${refreshedAsins.length}/${refreshedAsins.length + missingAsins.length} ASINs`,
    '',
  ];
  if (refreshedAsins.length) {
    lines.push('### Refreshed', '');
    for (const asin of refreshedAsins) lines.push(`- ${labelFor(asin)} (\`${asin}\`)`);
    lines.push('');
  }
  if (missingAsins.length) {
    lines.push('### No fresh data (kept previous cache or static fallback)', '');
    for (const asin of missingAsins) lines.push(`- ${labelFor(asin)} (\`${asin}\`)`);
    lines.push('');
  }
  lines.push(`_Generated ${timestamp}. Fetch logic: \`scripts/amazon/fetch-items.mjs\`._`);
  return `${lines.join('\n')}\n`;
}
