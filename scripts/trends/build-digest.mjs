/**
 * Weekly trend digest orchestrator — fetches Bluesky/HN/Reddit candidates,
 * runs them through the gate/score/select pipeline (pipeline.mjs), writes
 * src/data/trends.json plus a markdown summary used as the review PR body.
 * Runs from .github/workflows/trends-digest.yml; a human merges the PR
 * before anything reaches /resources (build-time static data, no runtime
 * fetch on the hub itself).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fetchBluesky } from './fetch-bluesky.mjs';
import { fetchHackerNews } from './fetch-hn.mjs';
import { fetchReddit } from './fetch-reddit.mjs';
import { runPipeline, isArtifactUrl, engagementBonus } from './pipeline.mjs';
import { enrichWithImages } from './enrich-images.mjs';

const dateStr = new Date().toISOString().split('T')[0];
const OUT_DIR = join(process.cwd(), 'src', 'content', 'journal');
mkdirSync(OUT_DIR, { recursive: true });
const OUT_PATH = join(OUT_DIR, `${dateStr}.json`);
const SUMMARY_PATH = join(process.cwd(), 'trend-digest-summary.md'); // gitignored, PR body only

const sources = [
  { name: 'bluesky', run: fetchBluesky },
  { name: 'hackernews', run: fetchHackerNews },
  { name: 'reddit', run: fetchReddit },
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

const { items: bareItems, selected, stats } = runPipeline(candidates);
const items = await enrichWithImages(bareItems);

const generatedAt = new Date().toISOString();
writeFileSync(OUT_PATH, `${JSON.stringify({ generatedAt, items }, null, 2)}\n`);
writeFileSync(SUMMARY_PATH, renderSummary(selected, stats, generatedAt));

const droppedNote = Object.entries(stats.dropped)
  .map(([reason, n]) => `${n} ${reason}`)
  .join(', ');
console.log(
  `Funnel: ${stats.fetched} fetched → ${stats.deduped} deduped → ${stats.gated} gated` +
    `${droppedNote ? ` (dropped: ${droppedNote})` : ''} → ${stats.selected} selected`,
);
console.log(`Wrote ${items.length} items to ${OUT_PATH}`);

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
    'Automated weekly trend scan (Bluesky, Hacker News, Reddit). **Review before merging** — ',
    'merging publishes these to the /resources "Signals we\'re tracking" section. Prune anything ',
    'the gates missed by editing `src/data/trends.json` in this PR, then merge.',
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
