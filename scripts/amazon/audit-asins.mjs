/**
 * Affiliate link integrity audit for affiliate-links.json + amazon-catalog.json.
 *
 * Fails (exit 1) when:
 *  - duplicate link ids
 *  - Amazon: same ASIN used by multiple link ids (1 ASIN → 1 link)
 *  - Amazon: invalid ASIN/ISBN shape or label/title mismatch
 *  - SparkFun / other: missing path/url
 *  - sim-linked Amazon SKU missing catalog entry (when --strict-catalog)
 *
 * Usage:
 *   node scripts/amazon/audit-asins.mjs
 *   node scripts/amazon/audit-asins.mjs --strict-catalog
 *   node scripts/amazon/audit-asins.mjs --sims-only
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const LINKS_PATH = join(ROOT, 'src', 'data', 'affiliate-links.json');
const CATALOG_PATH = join(ROOT, 'src', 'data', 'amazon-catalog.json');

const args = new Set(process.argv.slice(2));
const strictCatalog = args.has('--strict-catalog');
const simsOnly = args.has('--sims-only');

const SIMS = new Set([
  'pid-flight-arena',
  'signal-integrity-lab',
  'rf-microwave-bench',
  'fea-structural-lab',
  'rtos-scheduler',
  'slam-odometry-arena',
  'gan-foc-drive',
  'antenna-em-sandbox',
  'verilog-live-sculptor',
  'webgpu-pinn-studio',
]);

const STOP = new Set([
  'with', 'and', 'the', 'for', 'from', 'kit', 'board', 'module', 'usb', 'set',
  'pack', 'pcs', 'version', 'edition', 'black', 'white', 'new', 'pro', 'mini',
]);

function tokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9.+]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

export function labelCoverage(label, title) {
  const A = tokens(label);
  const B = new Set(tokens(title));
  if (!A.length || !B.size) return 0;
  let n = 0;
  for (const t of A) if (B.has(t)) n += 1;
  return n / A.length;
}

function isAsinOrIsbn(id) {
  return typeof id === 'string' && /^[A-Z0-9]{10}$/i.test(id);
}

function merchantOf(link) {
  if (link.merchant) return link.merchant;
  if (link.externalUrl && !link.asin) return 'other';
  return 'amazon';
}

const links = JSON.parse(readFileSync(LINKS_PATH, 'utf8'));
if (!Array.isArray(links)) {
  console.error('affiliate-links.json must be an array');
  process.exit(1);
}

const catalog = existsSync(CATALOG_PATH)
  ? JSON.parse(readFileSync(CATALOG_PATH, 'utf8'))
  : { items: {} };
const items = catalog.items ?? {};

const errors = [];
const warnings = [];
const byId = new Map();
const byAsin = new Map();
let amazonCount = 0;
let sparkfunCount = 0;
let otherCount = 0;

for (const link of links) {
  if (!link?.id || !link?.label) {
    errors.push(`Malformed link entry: ${JSON.stringify(link)?.slice(0, 120)}`);
    continue;
  }
  if (byId.has(link.id)) errors.push(`Duplicate link id: ${link.id}`);
  byId.set(link.id, link);

  const merchant = merchantOf(link);

  if (merchant === 'amazon') {
    amazonCount += 1;
    if (!link.asin) {
      errors.push(`${link.id}: amazon link missing asin`);
      continue;
    }
    if (!isAsinOrIsbn(link.asin)) {
      errors.push(`${link.id}: invalid ASIN/ISBN shape "${link.asin}"`);
    }
    if (!byAsin.has(link.asin)) byAsin.set(link.asin, []);
    byAsin.get(link.asin).push(link.id);
  } else if (merchant === 'sparkfun') {
    sparkfunCount += 1;
    const path = link.externalUrl || link.sku;
    if (!path) errors.push(`${link.id}: sparkfun link missing externalUrl/path`);
    if (link.asin) warnings.push(`${link.id}: sparkfun link should not set asin`);
  } else {
    otherCount += 1;
    if (!link.externalUrl) errors.push(`${link.id}: non-amazon link missing externalUrl`);
  }
}

for (const [asin, ids] of byAsin) {
  if (ids.length > 1) {
    errors.push(`ASIN ${asin} shared by ${ids.length} links: ${ids.join(', ')}`);
  }
}

const scoped = simsOnly
  ? links.filter((l) => (l.relatedTo ?? []).some((r) => SIMS.has(r)))
  : links;

for (const link of scoped) {
  const merchant = merchantOf(link);
  const simLinked = (link.relatedTo ?? []).some((r) => SIMS.has(r));

  if (merchant !== 'amazon') continue;

  const live = items[link.asin];
  if (!live) {
    const msg = `${link.id} (${link.asin}): missing catalog entry`;
    if (strictCatalog && simLinked) errors.push(msg);
    else if (simLinked) warnings.push(msg);
    continue;
  }

  const cov = labelCoverage(link.label, live.title);
  if (cov < 0.34) {
    errors.push(
      `${link.id}: label/title mismatch (coverage ${(cov * 100).toFixed(0)}%)\n` +
        `  label: ${link.label}\n` +
        `  live:  ${live.title}`,
    );
  } else if (cov < 0.5) {
    warnings.push(
      `${link.id}: weak label/title match (${(cov * 100).toFixed(0)}%) — "${live.title?.slice(0, 60)}"`,
    );
  }

  if (simLinked && !live.image) {
    warnings.push(`${link.id}: catalog entry has no image`);
  }
}

console.log(
  `Audited ${links.length} links (amazon ${amazonCount}, sparkfun ${sparkfunCount}, other ${otherCount}, unique ASINs ${byAsin.size})${simsOnly ? ' [sims-only]' : ''}`,
);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  for (const e of errors) console.error(`  ✖ ${e}`);
  process.exit(1);
}
console.log('Affiliate audit passed.');
