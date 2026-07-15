/**
 * Gate/score regression tests — fixtures are real items from the
 * 2026-07-15 digest run that exposed the failure modes (viral joke ranked
 * #1, off-topic politics passed, substance never checked). Run in CI
 * before every digest build: `node --test scripts/trends/pipeline.test.mjs`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalUrl,
  isArtifactUrl,
  engagementBonus,
  annotate,
  dedupeCandidates,
  gateCandidate,
  scoreCandidate,
  selectDigest,
  runPipeline,
} from './pipeline.mjs';

const NOW = Date.parse('2026-07-15T00:00:00Z');
const daysAgo = (n) => new Date(NOW - n * 864e5).toISOString();

const bsky = (rkey, over) => ({
  id: `bluesky-${rkey}`,
  source: 'bluesky',
  title: '',
  url: `https://bsky.app/profile/someone/post/${rkey}`,
  author: 'someone.bsky.social',
  publishedAt: daysAgo(2),
  text: '',
  engagement: 0,
  ...over,
});

// ── Real fixtures from the 2026-07-15 run ────────────────────────────────

const KEBAB = bsky('kebab', {
  text: 'found a guy on the local LLM subreddit who tests open source models running on his computer by asking the program to animate a doner kebab on a spit',
  engagement: 800, // scored 42 and ranked #1 under the old formula
});

const POLITICS = bsky('politics', {
  text: "just like they did when they stole TikTok, they're going to use xenophobia and a fake concern for national security to undermine on-device open source AI alternatives to protect the biggest companies' expensive walled gardens",
  engagement: 160,
});

const ANE_PAPER = bsky('anepaper', {
  text: 'Holy shit! A three-hundred-page paper about the Apple Neural Engine. arxiv.org/abs/2606.22283',
  externalUrl: 'https://arxiv.org/abs/2606.22283',
  engagement: 5,
});

test('viral joke post is gated (relevance floor, no substance)', () => {
  const c = annotate(KEBAB);
  assert.equal(c.hits, 1); // only "local llm"
  const gate = gateCandidate(c, NOW);
  assert.equal(gate.ok, false);
});

test('off-topic politics post with one incidental keyword is gated', () => {
  const c = annotate(POLITICS);
  assert.equal(c.hits, 1); // only "on-device"
  assert.equal(gateCandidate(c, NOW).ok, false);
});

test('substantive paper announcement passes and gets artifact bonus', () => {
  const c = annotate(ANE_PAPER);
  assert.ok(c.hits >= 2, `expected >=2 hits, got ${c.hits}`);
  assert.equal(gateCandidate(c, NOW).ok, true);
  // 2 hits * 3 + artifact 3 + engagement log2(6)|0 = 2  →  11
  assert.equal(scoreCandidate({ ...c, sources: ['bluesky'] }), 11);
});

test('joke post can never outrank the paper regardless of likes', () => {
  const paper = annotate(ANE_PAPER);
  const joke = annotate({ ...KEBAB, externalUrl: 'https://example.com/kebab', engagement: 1e9 });
  // even if the joke somehow passed gates, capped engagement keeps it below
  assert.ok(scoreCandidate(paper) > scoreCandidate(joke));
});

// ── Gates ────────────────────────────────────────────────────────────────

test('single keyword hit is enough for community-curated sources', () => {
  const c = annotate({
    id: 'hackernews-1',
    source: 'hackernews',
    title: 'Show HN: llama.cpp running a 3B model on Apple Watch',
    url: 'https://example.com/watch-llm',
    author: 'someone',
    publishedAt: daysAgo(1),
    text: 'Show HN: llama.cpp running a 3B model on Apple Watch',
    externalUrl: 'https://example.com/watch-llm',
    engagement: 40,
  });
  assert.equal(gateCandidate(c, NOW).ok, true);
});

test('long substantive bluesky thread passes without a link', () => {
  const c = annotate(bsky('longthread', {
    text: `Deep dive on CoreML quantization for on-device transformers: ${'x'.repeat(280)}`,
  }));
  assert.ok(c.hits >= 2);
  assert.equal(gateCandidate(c, NOW).ok, true);
});

test('stale items are dropped', () => {
  const c = annotate({ ...ANE_PAPER, publishedAt: daysAgo(20) });
  assert.deepEqual(gateCandidate(c, NOW), { ok: false, reason: 'stale' });
});

// ── Normalize + dedupe ───────────────────────────────────────────────────

test('canonicalUrl strips tracking params, hash, www, trailing slash', () => {
  assert.equal(
    canonicalUrl('https://www.example.com/a/?utm_source=x&id=2#frag'),
    'https://example.com/a/?id=2'.replace('/?', '/?'),
  );
  assert.equal(canonicalUrl('https://example.com/a/'), 'https://example.com/a');
  assert.equal(canonicalUrl('not a url'), 'not a url');
});

test('same link across sources merges into one corroborated item', () => {
  const a = annotate(ANE_PAPER);
  const b = annotate({
    id: 'hackernews-2',
    source: 'hackernews',
    title: 'Apple Neural Engine: a 300-page reverse-engineering study',
    url: 'https://arxiv.org/abs/2606.22283?utm_source=hn',
    author: 'tosh',
    publishedAt: daysAgo(1),
    text: 'Apple Neural Engine: a 300-page reverse-engineering study',
    externalUrl: 'https://arxiv.org/abs/2606.22283?utm_source=hn',
    engagement: 120,
  });
  const merged = dedupeCandidates([a, b]);
  assert.equal(merged.length, 1);
  assert.deepEqual([...merged[0].sources].sort(), ['bluesky', 'hackernews']);
  // corroboration adds +3 on top of hits/artifact/engagement
  const solo = scoreCandidate({ ...b, sources: ['hackernews'] });
  assert.equal(scoreCandidate(merged[0]), solo + 3);
});

// ── Scoring bounds ───────────────────────────────────────────────────────

test('engagement bonus is capped at 4', () => {
  assert.equal(engagementBonus(0), 0);
  assert.equal(engagementBonus(10), 3);
  assert.equal(engagementBonus(1e9), 4);
});

test('artifact domains match including subdomains', () => {
  assert.ok(isArtifactUrl('https://arxiv.org/abs/1'));
  assert.ok(isArtifactUrl('https://github.com/x/y'));
  assert.ok(!isArtifactUrl('https://notgithub.com/x'));
  assert.ok(!isArtifactUrl(undefined));
});

// ── Selection caps ───────────────────────────────────────────────────────

test('selection enforces per-pillar, per-author, and total caps', () => {
  const items = [];
  for (let i = 0; i < 10; i++) {
    items.push({
      id: `i${i}`,
      author: i < 4 ? 'prolific' : `author-${i}`,
      tags: i < 8 ? ['dsp-audio'] : ['ios-craft'],
      score: 20 - i,
      publishedAt: daysAgo(1),
    });
  }
  const picked = selectDigest(items, { maxTotal: 6, maxPerPillar: 4, maxPerAuthor: 2 });
  assert.equal(picked.length, 6);
  assert.equal(picked.filter((c) => c.author === 'prolific').length, 2);
  assert.ok(picked.filter((c) => c.tags[0] === 'dsp-audio').length <= 4);
});

// ── End to end ───────────────────────────────────────────────────────────

test('runPipeline: paper in, joke and politics out', () => {
  const { items, stats } = runPipeline([KEBAB, POLITICS, ANE_PAPER], NOW);
  assert.equal(items.length, 1);
  assert.equal(items[0].id, ANE_PAPER.id);
  assert.equal(stats.selected, 1);
  assert.equal(Object.values(stats.dropped).reduce((a, b) => a + b, 0), 2);
  // output stays in the TrendItem shape trends.ts expects
  assert.deepEqual(
    Object.keys(items[0]).sort(),
    ['author', 'domain', 'id', 'publishedAt', 'score', 'source', 'sources', 'tags', 'title', 'url'],
  );
  assert.equal(items[0].domain, 'arxiv.org');
});
