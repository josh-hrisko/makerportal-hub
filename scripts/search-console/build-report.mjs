/**
 * Search Console report — local-only. Fetches performance data and writes
 * a timestamped JSON + markdown report under analytics/reports/ (gitignored,
 * never committed — this repo is public and this is private business data).
 *
 * Run via: node --env-file=.env scripts/search-console/build-report.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchSearchPerformance } from './fetch-performance.mjs';

const OUT_DIR = join(process.cwd(), 'analytics', 'reports');

function pct(n) {
  return `${((n ?? 0) * 100).toFixed(2)}%`;
}

function pos(n) {
  return (n ?? 0).toFixed(1);
}

function buildSummary(payload) {
  const { dateRange, totals, topQueries, topPages } = payload;
  const lines = [
    `# Search Console report — ${dateRange.startDate} to ${dateRange.endDate}`,
    '',
    `**Totals:** ${totals.clicks} clicks · ${totals.impressions} impressions · ${pct(totals.ctr)} CTR · avg position ${pos(totals.position)}`,
    '',
    '## Top queries',
    topQueries.length
      ? topQueries.slice(0, 15).map((q) => `- **${q.query}** — ${q.clicks} clicks, ${q.impressions} impressions, pos ${pos(q.position)}`).join('\n')
      : '_No query data in this window yet._',
    '',
    '## Top pages',
    topPages.length
      ? topPages.slice(0, 15).map((p) => `- **${p.page}** — ${p.clicks} clicks, ${p.impressions} impressions, pos ${pos(p.position)}`).join('\n')
      : '_No page data in this window yet._',
    '',
  ];
  return lines.join('\n');
}

async function main() {
  const result = await fetchSearchPerformance();
  if (!result) {
    console.log('[search-console] No data fetched (missing credentials) — nothing written.');
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const payload = { generatedAt: new Date().toISOString(), ...result };
  const stamp = payload.generatedAt.replace(/[:.]/g, '-');

  writeFileSync(join(OUT_DIR, `search-performance-${stamp}.json`), `${JSON.stringify(payload, null, 2)}\n`);
  writeFileSync(join(OUT_DIR, `search-performance-${stamp}.md`), buildSummary(payload));
  // Convenience "latest" pointer so tooling/humans don't have to find the newest timestamp.
  writeFileSync(join(OUT_DIR, 'search-performance-latest.json'), `${JSON.stringify(payload, null, 2)}\n`);
  writeFileSync(join(OUT_DIR, 'search-performance-latest.md'), buildSummary(payload));

  console.log(
    `[search-console] ${payload.totals.clicks} clicks / ${payload.totals.impressions} impressions over ${payload.dateRange.startDate}..${payload.dateRange.endDate}. Wrote analytics/reports/search-performance-latest.{json,md}`,
  );
}

main().catch((err) => {
  console.error('[search-console] Failed:', err);
  process.exit(1);
});
