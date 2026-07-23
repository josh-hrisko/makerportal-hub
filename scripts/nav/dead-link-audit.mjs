/**
 * Dead-link audit — nav IA integrity gate (D-024, BACKLOG "nav/link integrity crawl").
 *
 * Verifies that every internal href in the SSOT surfaces resolves to a real
 * route, and that hash links point at anchors that actually exist:
 *   - src/data/site-nav.ts  → primaryNav (href, columns, featured) + footerColumns + hubRoutes
 *   - src/components/SearchModal.astro → hardcoded quick links
 *   - src/layouts/Layout.astro → routeOwner pre-map (stale owner ids / dead routes)
 *
 * Route inventory comes from src/pages/** plus content-collection instances
 * (blog slugs, journal dates). /brand is prod-stripped by strip-dev-pages.mjs,
 * so any chrome link to it is a failure. External URLs are skipped (no network).
 *
 * Run: node --experimental-strip-types scripts/nav/dead-link-audit.mjs
 * Wired into `npm run check`. Exits 1 when any dead link is found.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const PAGES_DIR = join(root, 'src', 'pages');
const CONTENT_DIR = join(root, 'src', 'content');

// --- Load nav SSOT (pure data module — strip-types handles the .ts import) ---
const navUrl = new URL('../../src/data/site-nav.ts', `file://${root}/scripts/nav/`);
const { primaryNav, footerColumns, hubRoutes } = await import(String(navUrl));

// --- Route inventory ---------------------------------------------------------
/** @type {Map<string, { file: string; astro: boolean }>} */
const staticRoutes = new Map();
/** @type {Set<string>} */
const dynamicInstances = new Set();
/** Routes that exist in src/pages but never in production output. */
const PROD_STRIPPED = new Set(['/brand']);

function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function fileToRoute(file) {
  let rel = relative(PAGES_DIR, file).split(sep).join('/');
  rel = rel.replace(/\.(astro|ts)$/, '');
  if (rel === 'index') return '/';
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length);
  return '/' + rel;
}

for (const file of walk(PAGES_DIR)) {
  if (!/\.(astro|ts)$/.test(file)) continue;
  const route = fileToRoute(file);
  if (route.includes('[')) continue; // dynamic pattern — instances come from content
  staticRoutes.set(route, { file, astro: file.endsWith('.astro') });
}

// Content-collection instances for dynamic page patterns
for (const f of readdirSync(join(CONTENT_DIR, 'blog'))) {
  if (f.endsWith('.md')) dynamicInstances.add('/blog/' + f.replace(/\.md$/, ''));
}
for (const f of readdirSync(join(CONTENT_DIR, 'journal'))) {
  if (f.endsWith('.json')) dynamicInstances.add('/journal/' + f.replace(/\.json$/, ''));
}

// --- Link collection ---------------------------------------------------------
/** @type {{ href: string; source: string }[]} */
const links = [];
const push = (href, source) => {
  if (typeof href === 'string' && href) links.push({ href, source });
};

for (const item of primaryNav) {
  push(item.href, `primaryNav/${item.id}`);
  for (const col of item.columns ?? []) {
    for (const l of col.links) push(l.href, `primaryNav/${item.id} mega "${col.title}"`);
  }
  if (item.featured) push(item.featured.href, `primaryNav/${item.id} featured`);
}
for (const col of footerColumns) {
  for (const l of col.links) push(l.href, `footer "${col.title}"`);
}
for (const r of hubRoutes) push(r.path, 'hubRoutes (sitemap)');

// SearchModal quick links are hardcoded (not derived from site-nav) — audit literals.
const searchModalSrc = readFileSync(join(root, 'src', 'components', 'SearchModal.astro'), 'utf-8');
for (const m of searchModalSrc.matchAll(/href:\s*'([^']+)'/g)) push(m[1], 'SearchModal quick links');
for (const m of searchModalSrc.matchAll(/href="(\/[^"]*)"/g)) push(m[1], 'SearchModal static');

// --- Anchor lookup -----------------------------------------------------------
/** @type {Map<string, string>} */
const fileCache = new Map();
const readCached = (f) => {
  if (!fileCache.has(f)) fileCache.set(f, readFileSync(f, 'utf-8'));
  return fileCache.get(f);
};
const anchorRe = (hash) => new RegExp(`id=["']${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);

/** Check the page file first, then components/layouts it may delegate sections to. */
function anchorExists(hash, pageFile) {
  const re = anchorRe(hash);
  if (re.test(readCached(pageFile))) return true;
  for (const scope of ['src/components', 'src/layouts']) {
    for (const f of walk(join(root, scope))) {
      if (f.endsWith('.astro') && re.test(readCached(f))) return true;
    }
  }
  return false;
}

// --- Validation --------------------------------------------------------------
const isExternal = (href) => /^(https?:)?\/\//.test(href) || href.startsWith('mailto:');

/** @type {string[]} */
const failures = [];
let internalChecked = 0;
let anchorsChecked = 0;

function validate(href, source) {
  if (isExternal(href)) return;
  const [rawPath, hash] = href.split('#');
  let path = rawPath || '/';
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  internalChecked++;

  if (PROD_STRIPPED.has(path)) {
    failures.push(`[${source}] ${href} — /brand is stripped from prod (strip-dev-pages.mjs); never link it from chrome`);
    return;
  }
  const rec = staticRoutes.get(path);
  if (!rec && !dynamicInstances.has(path)) {
    failures.push(`[${source}] ${href} — no matching page in src/pages or content collections`);
    return;
  }
  if (hash && rec?.astro) {
    anchorsChecked++;
    if (!anchorExists(hash, rec.file)) {
      failures.push(`[${source}] ${href} — anchor #${hash} not found in ${relative(root, rec.file)} or shared components`);
    }
  }
}

for (const { href, source } of links) validate(href, source);

// --- routeOwner pre-map sanity (Layout.astro) --------------------------------
// Stale pre-map entries highlight the wrong primary tab (D-024 trap). Every
// pre-mapped owner id must be a current primary, and every route must resolve.
const layoutSrc = readFileSync(join(root, 'src', 'layouts', 'Layout.astro'), 'utf-8');
const preMapBlock = layoutSrc.match(/const routeOwner = new Map<string, string>\(\[([\s\S]*?)\]\);/);
const primaryIds = new Set(primaryNav.map((i) => i.id));
if (!preMapBlock) {
  failures.push('[Layout.astro] routeOwner pre-map not found — has the routing structure changed?');
} else {
  for (const m of preMapBlock[1].matchAll(/\['([^']+)',\s*'([^']+)'\]/g)) {
    const [, route, ownerId] = m;
    if (!primaryIds.has(ownerId)) {
      failures.push(`[Layout.astro routeOwner] '${route}' → '${ownerId}' is not a primaryNav id (stale pre-map — wrong tab will highlight)`);
    }
    if (!staticRoutes.has(route) && !dynamicInstances.has(route)) {
      failures.push(`[Layout.astro routeOwner] '${route}' has no matching page`);
    }
  }
}

// --- Report ------------------------------------------------------------------
if (failures.length) {
  console.error(`✖ dead-link audit: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `✓ dead-link audit: ${links.length} chrome links (${internalChecked} internal, ${anchorsChecked} anchors), ` +
    `${staticRoutes.size} static routes, ${dynamicInstances.size} collection instances, routeOwner pre-map aligned — all resolve`,
);
