/**
 * Daily trend digest orchestrator — fetches Bluesky + Hacker News candidates
 * (Reddit is disabled, D-023 — no API credentials, self-service access closed),
 * runs them through the gate/score/select pipeline (pipeline.mjs), writes
 * src/content/journal/YYYY-MM-DD.json plus a markdown summary surfaced as the
 * GitHub Actions run step summary. Runs from .github/workflows/trends-digest.yml,
 * which commits the entry directly to main so that day auto-publishes to
 * /journal/YYYY-MM-DD (D-022) — the gate tests, not a human PR, are the
 * pre-publish safety net. Build-time static data, no runtime fetch on the hub.
 */
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchBluesky } from './fetch-bluesky.mjs';
import { fetchHackerNews } from './fetch-hn.mjs';
import { fetchGitHub } from './fetch-github.mjs';
import { fetchArxiv } from './fetch-arxiv.mjs';
import { fetchLobsters } from './fetch-lobsters.mjs';
// Reddit disabled (D-023) — no API credentials (self-service access closed, D-011).
// fetch-reddit.mjs is retained; re-enable by restoring this import + the sources entry below.
// import { fetchReddit } from './fetch-reddit.mjs';
import { runPipeline, isArtifactUrl, engagementBonus, canonicalUrl } from './pipeline.mjs';
import { enrichWithImages } from './enrich-images.mjs';

const dateStr = new Date().toISOString().split('T')[0];
const OUT_DIR = join(process.cwd(), 'src', 'content', 'journal');
mkdirSync(OUT_DIR, { recursive: true });
const OUT_PATH = join(OUT_DIR, `${dateStr}.json`);
const SUMMARY_PATH = join(process.cwd(), 'trend-digest-summary.md'); // gitignored, Actions step summary

// ── Load recent journal history for deduplication ────────────────────────
// Collect canonical URLs from the last 7 days (or last 3 entries) to avoid
// republishing identical reports. This is the fix for "all 4 journal pages
// are almost identical" — the old pipeline had no memory.
function loadRecentSeen(days = 7) {
  const seen = new Set();
  try {
    const files = readdirSync(OUT_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse(); // newest first
    const cutoff = Date.now() - days * 864e5;
    let counted = 0;
    for (const file of files) {
      if (counted >= 3) break; // also cap to last 3 entries to allow churn after a week gap
      const fileDate = file.replace('.json', '');
      const fileTime = Date.parse(`${fileDate}T12:00:00Z`);
      if (!Number.isNaN(fileTime) && fileTime < cutoff) {
        // If we already have at least one file, keep going until we have 3,
        // otherwise stop when older than cutoff
        if (counted > 0) {
          // still allow up to 3 even if beyond cutoff, to avoid empty set on sparse history
        } else {
          continue;
        }
      }
      try {
        const raw = readFileSync(join(OUT_DIR, file), 'utf-8');
        const data = JSON.parse(raw);
        for (const item of data.items ?? []) {
          // Use both id and canonical URL forms for robustness
          if (item.id) seen.add(item.id);
          const u = item.url || item.id;
          if (u) {
            try {
              seen.add(canonicalUrl(u));
            } catch {}
            seen.add(u);
          }
          // Also add external canonical if we can infer from url host
          // (trend items store domain but not raw externalUrl separately)
        }
        counted++;
      } catch {
        // ignore unreadable file
      }
    }
  } catch {
    // OUT_DIR may not exist on first run
  }
  return seen;
}

const recentSeen = loadRecentSeen(7);
if (recentSeen.size > 0) {
  console.log(`[history] ${recentSeen.size} URLs/ids seen in recent journal entries (last 3 files / 7d) will be excluded`);
}

const sources = [
  { name: 'bluesky', run: fetchBluesky },
  { name: 'hackernews', run: fetchHackerNews },
  { name: 'github', run: fetchGitHub },
  { name: 'arxiv', run: fetchArxiv },
  { name: 'lobsters', run: fetchLobsters },
  // { name: 'reddit', run: fetchReddit }, // disabled — see D-023 / note above
];

const results = await Promise.allSettled(sources.map((s) => s.run()));

const candidates = [];
results.forEach((result, i) => {
  if (result.status === 'fulfilled') {
    console.log(`[${sources[i].name}] ${result.value.length} candidates`);
    candidates.push(...result.value);
  } else {
    console.error(`[${sources[i].name}] failed:`, result.reason?.message ?? result.reason);
  }
});

const { items: bareItems, selected, stats } = runPipeline(candidates, Date.now(), { seenSet: recentSeen });
const items = await enrichWithImages(bareItems);

const generatedAt = new Date().toISOString();
// Auto-publish (D-022): never create an empty journal day. If gating left nothing,
// write only the summary and skip OUT_PATH — the workflow's porcelain check then
// sees no change and publishes nothing, rather than shipping a blank /journal/<date>.
if (items.length > 0) {
  writeFileSync(OUT_PATH, `${JSON.stringify({ generatedAt, items }, null, 2)}\n`);
}
writeFileSync(SUMMARY_PATH, renderSummary(selected, stats, generatedAt));

const droppedNote = Object.entries(stats.dropped)
  .map(([reason, n]) => `${n} ${reason}`)
  .join(', ');
console.log(
  `Funnel: ${stats.fetched} fetched → ${stats.deduped} deduped → ${stats.gated} gated` +
    `${droppedNote ? ` (dropped: ${droppedNote})` : ''} → ${stats.selected} selected`,
);
console.log(
  items.length > 0
    ? `Wrote ${items.length} items to ${OUT_PATH}`
    : 'No items after gating — nothing published today (empty day skipped).',
);

function mdSafe(text) {
  return text.replace(/\s+/g, ' ').replace(/[[\]]/g, '').trim();
}

function scoreBreakdown(c) {
  const parts = [`relevance ${(c.hits ?? 0) * 3}`];
  if (isArtifactUrl(c.externalUrl)) parts.push('artifact +3');
  const corroboration = (c.sources?.length ?? 1) - 1;
  if (corroboration > 0) parts.push(`corroborated +${corroboration * 3}`);
  const eng = engagementBonus(c.engagement);
  if (eng > 0) parts.push(`engagement +${eng}`);
  return parts.join(', ');
}

function renderSummary(picked, funnel, timestamp) {
  const lines = [
    'Automated daily trend scan (Bluesky, Hacker News) — **auto-published** to the ',
    '/journal archive and surfaced as the latest entry on /resources "Signals we\'re tracking". ',
    'To remove anything the gates missed, edit or revert `src/content/journal/YYYY-MM-DD.json` on main.',
    '',
    `**Funnel:** ${funnel.fetched} fetched → ${funnel.deduped} after dedupe → ${funnel.gated} passed gates` +
      `${Object.keys(funnel.dropped).length ? ` (dropped: ${Object.entries(funnel.dropped).map(([r, n]) => `${n} ${r}`).join(', ')})` : ''} → ${funnel.selected} selected`,
    '',
  ];

  const byPillar = new Map();
  for (const c of picked) {
    const pillar = c.tags?.[0] ?? 'untagged';
    if (!byPillar.has(pillar)) byPillar.set(pillar, []);
    byPillar.get(pillar).push(c);
  }

  for (const [pillar, group] of byPillar) {
    lines.push(`### ${pillar}`, '');
    for (const c of group) {
      const via = (c.sources ?? [c.source]).join(' + ');
      lines.push(
        `- [${mdSafe(c.title)}](${c.url}) — ${via} · **${c.score}** (${scoreBreakdown(c)})${c.author ? ` · ${c.author}` : ''}`,
      );
    }
    lines.push('');
  }

  lines.push(`_Generated ${timestamp}. Gates and scoring: \`scripts/trends/pipeline.mjs\`._`);
  return `${lines.join('\n')}\n`;
}
