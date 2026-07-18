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

/** Bluesky search is raw firehose; HN/Reddit/GitHub/arXiv/Lobsters/Dev.to are community-curated. */
const MIN_HITS = { bluesky: 2, hackernews: 1, reddit: 1, github: 1, arxiv: 1, lobsters: 1, devto: 1 };

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

/** Recency bonus — fresh signals outrank stale evergreen posts.
 *  Strong bias toward last 48h, gentle decay to 7d, penalty beyond 10d.
 *  This is the core fix for "all journal reports are identical" — without it,
 *  a high-scoring 10-day-old HN post would win every day for 14 days.
 */
export function recencyBonus(publishedAt, now = Date.now()) {
  if (!publishedAt) return 0;
  const ageMs = now - new Date(publishedAt).getTime();
  if (Number.isNaN(ageMs)) return 0;
  const ageDays = ageMs / 864e5;
  if (ageDays < 1) return 8;
  if (ageDays < 2) return 5;
  if (ageDays < 3) return 3;
  if (ageDays < 5) return 1;
  if (ageDays < 7) return 0;
  if (ageDays < 10) return -1;
  return -3;
}

/** Check if a candidate's canonical URL was recently published in the journal archive. */
export function isRecentlySeen(candidate, seenSet) {
  if (!seenSet || seenSet.size === 0) return false;
  const key = canonicalUrl(candidate.externalUrl ?? candidate.url);
  return seenSet.has(key);
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
      curated: prev.curated || c.curated || false,
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
  let minHits = Math.min(...sources.map((s) => MIN_HITS[s] ?? 1));
  if (c.curated) {
    minHits = 1; // curated feeds are high-signal, bypass strict search filters
  }
  if ((c.hits ?? 0) < minHits) return { ok: false, reason: 'relevance-floor' };
  // Substance: a Bluesky-only post must link out to something writable-about,
  // or carry enough text to be a thread worth reading. Kills joke posts.
  // Curated posts bypass this substance limit because they are already vetted sources.
  if (sources.every((s) => s === 'bluesky') && !c.externalUrl && (c.text ?? '').length < 280 && !c.curated) {
    return { ok: false, reason: 'substance' };
  }
  return { ok: true };
}

/** Relevance-dominant score: keyword hits lead, artifacts + corroboration help, engagement tie-breaks, recency boosts.
 *  Score = hits*3 + artifact +3 + corroboration*3 + engagement(0-4) + recency(-3..8) + (-100 if recently seen)
 */
export function scoreCandidate(c, now = Date.now(), opts = {}) {
  const corroboration = (c.sources?.length ?? 1) - 1;
  const seenSet = opts.seenSet ?? opts.recentlySeen;
  const seenPenalty = seenSet && isRecentlySeen(c, seenSet) ? -100 : 0;
  return (
    (c.hits ?? 0) * 3 +
    (isArtifactUrl(c.externalUrl) ? 3 : 0) +
    corroboration * 3 +
    engagementBonus(c.engagement) +
    recencyBonus(c.publishedAt, now) +
    seenPenalty
  );
}

/** Diversity-capped selection so one viral pillar or prolific author can't flood the digest. */
export function selectDigest(candidates, opts = {}) {
  const {
    maxTotal = MAX_TOTAL,
    maxPerPillar = MAX_PER_PILLAR,
    maxPerAuthor = MAX_PER_AUTHOR,
    maxPerSource = 6,
  } = opts;
  const sorted = [...candidates].sort(
    (a, b) => b.score - a.score || new Date(b.publishedAt) - new Date(a.publishedAt),
  );
  const perPillar = new Map();
  const perAuthor = new Map();
  const perSource = new Map();
  const picked = [];
  for (const c of sorted) {
    if (picked.length >= maxTotal) break;
    const pillar = c.tags?.[0] ?? 'untagged';
    if ((perPillar.get(pillar) ?? 0) >= maxPerPillar) continue;
    if (c.author && (perAuthor.get(c.author) ?? 0) >= maxPerAuthor) continue;
    const src = c.source ?? 'unknown';
    if ((perSource.get(src) ?? 0) >= maxPerSource) continue;
    perPillar.set(pillar, (perPillar.get(pillar) ?? 0) + 1);
    if (c.author) perAuthor.set(c.author, (perAuthor.get(c.author) ?? 0) + 1);
    perSource.set(src, (perSource.get(src) ?? 0) + 1);
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
    domain: hostOf(c.externalUrl ?? c.url),
    sources: c.sources ?? [c.source],
  };
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export function runPipeline(candidates, now = Date.now(), opts = {}) {
  // opts can be a Set directly (legacy) or { seenSet, ... }
  const seenSet = opts instanceof Set ? opts : opts.seenSet ?? opts.recentlySeen ?? null;
  const annotated = candidates.map(annotate);
  const deduped = dedupeCandidates(annotated);
  const dropped = {};
  const gated = [];
  for (const c of deduped) {
    const { ok, reason } = gateCandidate(c, now);
    if (ok) gated.push(c);
    else dropped[reason] = (dropped[reason] ?? 0) + 1;
  }
  // Score with recency + seen penalty — seen items get -100, so they only
  // surface if there is *no* fresh content (avoids skipping days, per user pref).
  const scored = gated.map((c) => ({ ...c, score: scoreCandidate(c, now, { seenSet }) }));
  // For stats, count how many were penalized as recently-seen
  let recentlySeenPenalized = 0;
  if (seenSet) {
    for (const c of gated) if (isRecentlySeen(c, seenSet)) recentlySeenPenalized++;
  }
  const selected = selectDigest(scored, opts);
  // Count how many selected were actually fresh vs repeat
  let repeatInSelected = 0;
  if (seenSet) {
    for (const c of selected) if (isRecentlySeen(c, seenSet)) repeatInSelected++;
  }
  return {
    items: selected.map(toTrendItem),
    selected,
    stats: {
      fetched: candidates.length,
      deduped: deduped.length,
      gated: gated.length,
      selected: selected.length,
      dropped,
      recentlySeenInPool: recentlySeenPenalized,
      repeatsInSelected: repeatInSelected,
    },
  };
}
