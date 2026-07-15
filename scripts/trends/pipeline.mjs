/**
 * Trend digest pipeline — normalize → dedupe → gate → score → select.
 * Pure functions over fetcher candidates so every stage is unit-testable
 * (pipeline.test.mjs runs in CI before the digest builds). Deterministic
 * heuristics only; the human PR review stays the final gate.
 *
 * Candidate shape (from fetch-*.mjs):
 *   { id, source, title, url, author?, publishedAt, text, externalUrl?, engagement }
 */
import { scoreText } from './keywords.mjs';

export const MAX_TOTAL = 24;
export const MAX_PER_PILLAR = 6;
export const MAX_PER_AUTHOR = 2;
export const MAX_AGE_DAYS = 14;

/** Bluesky search is raw firehose; HN/Reddit results are already community-curated. */
const MIN_HITS = { bluesky: 2, hackernews: 1, reddit: 1 };

/** Primary sources you can actually cite in a field note. */
const ARTIFACT_DOMAINS = ['arxiv.org', 'github.com', 'developer.apple.com', 'huggingface.co'];

const TRACKING_PARAM = /^(utm_.*|fbclid|gclid|ref|ref_src|si)$/;

export function canonicalUrl(raw) {
  try {
    const u = new URL(raw);
    u.hash = '';
    u.hostname = u.hostname.replace(/^www\./, '');
    for (const key of [...u.searchParams.keys()]) {
      if (TRACKING_PARAM.test(key)) u.searchParams.delete(key);
    }
    const s = u.toString();
    return s.endsWith('/') ? s.slice(0, -1) : s;
  } catch {
    return raw;
  }
}

export function isArtifactUrl(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return ARTIFACT_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/** Engagement is a capped, log-damped tie-breaker — it can never outvote relevance. */
export function engagementBonus(n) {
  return Math.min(4, Math.floor(Math.log2(1 + Math.max(0, n || 0))));
}

/** Attach pillar tags + raw keyword hit count. */
export function annotate(candidate) {
  const { tags, score: hits } = scoreText(`${candidate.title ?? ''} ${candidate.text ?? ''}`);
  return { ...candidate, tags, hits };
}

/**
 * Merge candidates pointing at the same canonical URL. The same link
 * surfacing on multiple sources is corroboration, not duplication.
 */
export function dedupeCandidates(candidates) {
  const byUrl = new Map();
  for (const c of candidates) {
    const key = canonicalUrl(c.externalUrl ?? c.url);
    const prev = byUrl.get(key);
    if (!prev) {
      byUrl.set(key, { ...c, sources: [c.source] });
      continue;
    }
    const base = (c.engagement ?? 0) > (prev.engagement ?? 0) ? c : prev;
    byUrl.set(key, {
      ...base,
      tags: [...new Set([...(prev.tags ?? []), ...(c.tags ?? [])])],
      hits: Math.max(prev.hits ?? 0, c.hits ?? 0),
      externalUrl: prev.externalUrl ?? c.externalUrl,
      sources: [...new Set([...prev.sources, c.source])],
    });
  }
  return [...byUrl.values()];
}

/** Hard boolean drops, applied before any ranking. */
export function gateCandidate(c, now = Date.now()) {
  const age = now - new Date(c.publishedAt).getTime();
  if (!c.publishedAt || Number.isNaN(age) || age > MAX_AGE_DAYS * 864e5) {
    return { ok: false, reason: 'stale' };
  }
  const sources = c.sources ?? [c.source];
  const minHits = Math.min(...sources.map((s) => MIN_HITS[s] ?? 1));
  if ((c.hits ?? 0) < minHits) return { ok: false, reason: 'relevance-floor' };
  // Substance: a Bluesky-only post must link out to something writable-about,
  // or carry enough text to be a thread worth reading. Kills joke posts.
  if (sources.every((s) => s === 'bluesky') && !c.externalUrl && (c.text ?? '').length < 280) {
    return { ok: false, reason: 'substance' };
  }
  return { ok: true };
}

/** Relevance-dominant score: keyword hits lead, artifacts + corroboration help, engagement tie-breaks. */
export function scoreCandidate(c) {
  const corroboration = (c.sources?.length ?? 1) - 1;
  return (
    (c.hits ?? 0) * 3 +
    (isArtifactUrl(c.externalUrl) ? 3 : 0) +
    corroboration * 3 +
    engagementBonus(c.engagement)
  );
}

/** Diversity-capped selection so one viral pillar or prolific author can't flood the digest. */
export function selectDigest(candidates, opts = {}) {
  const {
    maxTotal = MAX_TOTAL,
    maxPerPillar = MAX_PER_PILLAR,
    maxPerAuthor = MAX_PER_AUTHOR,
  } = opts;
  const sorted = [...candidates].sort(
    (a, b) => b.score - a.score || new Date(b.publishedAt) - new Date(a.publishedAt),
  );
  const perPillar = new Map();
  const perAuthor = new Map();
  const picked = [];
  for (const c of sorted) {
    if (picked.length >= maxTotal) break;
    const pillar = c.tags?.[0] ?? 'untagged';
    if ((perPillar.get(pillar) ?? 0) >= maxPerPillar) continue;
    if (c.author && (perAuthor.get(c.author) ?? 0) >= maxPerAuthor) continue;
    perPillar.set(pillar, (perPillar.get(pillar) ?? 0) + 1);
    if (c.author) perAuthor.set(c.author, (perAuthor.get(c.author) ?? 0) + 1);
    picked.push(c);
  }
  return picked;
}

/** Strip pipeline-internal fields down to the TrendItem shape trends.ts expects. */
export function toTrendItem(c) {
  return {
    id: c.id,
    source: c.source,
    title: c.title,
    url: c.url,
    author: c.author,
    publishedAt: c.publishedAt,
    tags: c.tags,
    score: c.score,
  };
}

export function runPipeline(candidates, now = Date.now()) {
  const annotated = candidates.map(annotate);
  const deduped = dedupeCandidates(annotated);
  const dropped = {};
  const gated = [];
  for (const c of deduped) {
    const { ok, reason } = gateCandidate(c, now);
    if (ok) gated.push(c);
    else dropped[reason] = (dropped[reason] ?? 0) + 1;
  }
  const scored = gated.map((c) => ({ ...c, score: scoreCandidate(c) }));
  const selected = selectDigest(scored);
  return {
    items: selected.map(toTrendItem),
    selected,
    stats: {
      fetched: candidates.length,
      deduped: deduped.length,
      gated: gated.length,
      selected: selected.length,
      dropped,
    },
  };
}
