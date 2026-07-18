/**
 * Generate historical backlog for Signals Journal — frontier-grade data mining + UX test harness.
 *
 * Purpose:
 * - Create 10 additional journal days to populate archive, test prev/next navigation,
 *   and make /journal index interesting with deduped previews.
 * - Uses live fetchers (HN, Bluesky curated, GitHub, arXiv, Lobsters, Dev.to) once,
 *   then simulates historical freshness by backdating publishedAt per target date.
 *   This avoids 10× API calls and preserves high-res Bluesky imageUrl extraction.
 *
 * Strategy (frontier-level):
 * - Fetch once: large candidate pool (~200-400) from all sources (high-res Bluesky embeds preserved)
 * - For each target date descending (newest backlog first), clone pool with publishedAt
 *   jittered to [targetDate - 0..4 days] so recencyBonus scores as fresh for that date.
 * - Run existing pipeline (gate → score → select) with seenSet = canonical URLs of all newer
 *   days (existing 2026-07-15, 2026-07-18 + already generated newer backlog days). This
 *   enforces -100 penalty for recently seen URLs, guaranteeing diversity and meaningful
 *   “X new today” badges on /journal index.
 * - Enrich with images via enrichWithImages (now preserves history, doesn't wipe):
 *   - Bluesky: direct CDN thumb/fullsize (bypass low-res scrape)
 *   - arXiv: custom SVG technical cards via Resvg
 *   - Others: og:image self-hosted webp
 * - Write src/content/journal/YYYY-MM-DD.json with generatedAt = target noon UTC
 *
 * CI/CD aware:
 * - Handles missing env (BLUESKY_IDENTIFIER, GITHUB_TOKEN) gracefully — public endpoints fallback
 * - Throttles, handles 429, 403, timeouts — never throws, degrades to available pool
 * - Preserves existing journal entries (won't overwrite 2026-07-15, 2026-07-18)
 * - Uses same pipeline thresholds (MAX_AGE_DAYS=14, MIN_HITS, etc) so historical data
 *   respects production gating
 *
 * Usage:
 *   node scripts/trends/generate-backlog.mjs
 *   # writes the default 10-day window (2026-07-07..14 + 16,17)
 *
 *   node scripts/trends/generate-backlog.mjs --from 2026-07-05 --to 2026-07-06
 *   # custom range: HN/GitHub/arXiv are queried with *historical* windows so
 *   # backfilled days contain items that genuinely trended around those dates
 *   # (HN Algolia created_at_i range, GitHub pushed:>x pushed:<y, arXiv
 *   # submittedDate range). Bluesky/Lobsters/Dev.to have no historical API —
 *   # those stay on the fetch-once + backdate-jitter simulation.
 */
import { writeFileSync, readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { fetchBluesky } from './fetch-bluesky.mjs';
import { fetchBlueskyCurated } from './fetch-bluesky-curated.mjs';
import { fetchHackerNews } from './fetch-hn.mjs';
import { fetchGitHub } from './fetch-github.mjs';
import { fetchArxiv } from './fetch-arxiv.mjs';
import { fetchLobsters } from './fetch-lobsters.mjs';
import { fetchDevto } from './fetch-devto.mjs';

import { runPipeline, canonicalUrl, stripInternalFields } from './pipeline.mjs';
import { enrichWithImages } from './enrich-images.mjs';

const OUT_DIR = join(process.cwd(), 'src', 'content', 'journal');
mkdirSync(OUT_DIR, { recursive: true });

// ── CLI: --from YYYY-MM-DD --to YYYY-MM-DD (optional) ──────────────────────
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--from' && DATE_RE.test(argv[i + 1] ?? '')) args.from = argv[++i];
    else if (argv[i] === '--to' && DATE_RE.test(argv[i + 1] ?? '')) args.to = argv[++i];
  }
  return args;
}
const cliArgs = parseArgs(process.argv.slice(2));
const useHistoricalWindow = Boolean(cliArgs.from && cliArgs.to);

function datesInRange(from, to) {
  const out = [];
  for (let t = Date.parse(`${to}T12:00:00Z`); t >= Date.parse(`${from}T12:00:00Z`); t -= 864e5) {
    out.push(new Date(t).toISOString().split('T')[0]);
  }
  return out; // newest-first
}

// ── Target dates ───────────────────────────────────────────────────────────
// Default: 10 days (fills gap + extends history around existing 07-15, 07-18).
// Sorted newest-first for seenSet accumulation (newer → older).
const TARGET_DATES = useHistoricalWindow
  ? datesInRange(cliArgs.from, cliArgs.to)
  : [
      '2026-07-17',
      '2026-07-16',
      '2026-07-14',
      '2026-07-13',
      '2026-07-12',
      '2026-07-11',
      '2026-07-10',
      '2026-07-09',
      '2026-07-08',
      '2026-07-07',
    ];

// Historical fetch windows: pool must cover items fresh at [from - jitter] .. to.
// backdatePool jitters publishedAt to target -0..4.5d, so pull ~6 extra days back.
const histWindow = useHistoricalWindow
  ? (() => {
      const fromMs = Date.parse(`${cliArgs.from}T00:00:00Z`);
      const toMs = Date.parse(`${cliArgs.to}T23:59:59Z`);
      const iso = (ms) => new Date(ms).toISOString().split('T')[0];
      return {
        hn: { sinceUnix: Math.floor((fromMs - 6 * 864e5) / 1000), untilUnix: Math.floor(toMs / 1000) },
        github: { pushedAfter: iso(fromMs - 7 * 864e5), pushedBefore: iso(toMs) },
        // arXiv cadence is slower (weekly batches) — widen to 14d back so the
        // pool has enough papers for the whole range.
        arxiv: { submittedAfter: iso(fromMs - 14 * 864e5), submittedBefore: iso(toMs) },
      };
    })()
  : null;

function loadExistingSeen() {
  const seen = new Set();
  try {
    const files = readdirSync(OUT_DIR).filter(f => f.endsWith('.json')).sort().reverse();
    for (const file of files) {
      try {
        const raw = readFileSync(join(OUT_DIR, file), 'utf-8');
        const data = JSON.parse(raw);
        for (const item of data.items ?? []) {
          if (item.id) seen.add(item.id);
          const url = item.url || item.id;
          if (url) {
            try { seen.add(canonicalUrl(url)); } catch {}
            seen.add(url);
          }
        }
      } catch {}
    }
  } catch {}
  return seen;
}

async function fetchAllCandidates() {
  const sources = [
    { name: 'bluesky', run: () => fetchBluesky() },
    { name: 'bluesky-curated', run: () => fetchBlueskyCurated() },
    { name: 'hackernews', run: () => fetchHackerNews(histWindow?.hn ?? {}) },
    { name: 'github', run: () => fetchGitHub(histWindow?.github ?? {}) },
    { name: 'arxiv', run: () => fetchArxiv(histWindow?.arxiv ?? {}) },
    { name: 'lobsters', run: () => fetchLobsters() },
    { name: 'devto', run: () => fetchDevto() },
  ];

  const results = await Promise.allSettled(sources.map(s => s.run()));
  const candidates = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log(`[${sources[i].name}] ${r.value.length} candidates`);
      candidates.push(...r.value);
    } else {
      console.warn(`[${sources[i].name}] failed: ${r.reason?.message ?? r.reason}`);
    }
  });
  console.log(`Total pool: ${candidates.length} candidates`);
  return candidates;
}

function backdatePool(pool, targetNow) {
  // Clone pool with publishedAt jittered to [targetNow - 0..4.5 days]
  // This simulates that these items were fresh around target date
  return pool.map(c => {
    const jitterMs = Math.random() * 4.5 * 864e5 + Math.random() * 12 * 3600e3; // 0-4.5d + 0-12h
    const newPub = new Date(targetNow - jitterMs).toISOString();
    return {
      ...c,
      publishedAt: newPub,
    };
  });
}

async function main() {
  const seenSet = loadExistingSeen();
  console.log(`[history] ${seenSet.size} URLs/ids already seen from existing journal (will be penalized for backlog)`);

  const basePool = await fetchAllCandidates();
  if (basePool.length === 0) {
    console.error('No candidates fetched — aborting backlog generation');
    process.exit(1);
  }

  // Generate newest-first so each older day avoids URLs seen in newer days
  for (const dateStr of TARGET_DATES) {
    const outPath = join(OUT_DIR, `${dateStr}.json`);
    // Don't overwrite existing (safety)
    try {
      readFileSync(outPath);
      console.log(`[skip] ${dateStr}.json already exists — skipping`);
      continue;
    } catch {}

    const targetNoon = Date.parse(`${dateStr}T12:00:00Z`);
    const backdated = backdatePool(basePool, targetNoon);

    const { items: bareItems, selected, stats } = runPipeline(backdated, targetNoon, { seenSet });

    if (bareItems.length === 0) {
      console.warn(`[${dateStr}] no items after gating — skipping (stats: ${JSON.stringify(stats)})`);
      continue;
    }

    console.log(`[${dateStr}] funnel ${stats.fetched} → ${stats.deduped} → ${stats.gated} → ${stats.selected} (dropped: ${JSON.stringify(stats.dropped)})`);

    // Enrich with images (preserves history now, doesn't wipe), then strip
    // enrichment-internal fields (imageUrl) before committing the JSON.
    const enriched = (await enrichWithImages(bareItems)).map(stripInternalFields);

    const generatedAt = new Date(targetNoon).toISOString();
    writeFileSync(outPath, `${JSON.stringify({ generatedAt, items: enriched }, null, 2)}\n`);
    console.log(`Wrote ${enriched.length} items to ${outPath}`);

    // Add this day's canonical URLs to seenSet for next older day
    for (const item of enriched) {
      try {
        seenSet.add(canonicalUrl(item.url));
      } catch {}
      seenSet.add(item.url);
      if (item.id) seenSet.add(item.id);
    }

    // Gentle throttle between days to avoid hammering image hosts
    await new Promise(r => setTimeout(r, 800));
  }

  console.log('Backlog generation complete. Current journal count:', readdirSync(OUT_DIR).filter(f => f.endsWith('.json')).length);
}

await main();
