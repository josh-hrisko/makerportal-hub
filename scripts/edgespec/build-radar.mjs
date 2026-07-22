/**
 * EdgeSpec & TinyML Hardware Radar — daily orchestrator.
 *
 * Fetches trending + freshly-updated GGUF and ONNX models from the Hugging
 * Face Hub public API (build-time only — the hub site itself never makes a
 * runtime request), verifies real file bytes via each repo's file tree, runs
 * every candidate through the deterministic gates in radar-core.mjs, and
 * writes src/content/edge-radar/YYYY-MM-DD.json plus a markdown summary
 * surfaced as the GitHub Actions step summary.
 *
 * Mirrors the trends pipeline posture (D-022): the gate tests in
 * pipeline.test.mjs are the pre-publish safety net; if gating leaves zero
 * models, no radar file is written and the workflow publishes nothing.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  BOARDS,
  pickRepresentativeGgufFile,
  selectRadarModels,
  computeRadar,
} from './radar-core.mjs';

const dateStr = new Date().toISOString().split('T')[0];
const OUT_DIR = join(process.cwd(), 'src', 'content', 'edge-radar');
const OUT_PATH = join(OUT_DIR, `${dateStr}.json`);
const SUMMARY_PATH = join(process.cwd(), 'edgespec-radar-summary.md'); // gitignored, Actions step summary

const HF_API = 'https://huggingface.co/api/models';
const USER_AGENT = 'makerportal-hub-edgespec/1.0 (build-time digest; +https://makerportal.ai)';
const LIST_LIMIT = 40; // candidates per tag list
const CURATED_LIMIT = 10; // candidates per curated author feed
const TREE_BUDGET = 48; // per-run tree lookups (politeness budget), split by format
const DETAIL_BUDGET = 24; // lastModified lookups for gated survivors
const MAX_ONNX_BYTES = 512 * 1024 * 1024; // edge-relevant ONNX only (vision/audio/tinyML)

// Curated author feeds (verified 2026-07-22 to ship real parseable artifacts).
// Order matters: feeds enter the candidate pool before the noisy tag lists.
const CURATED_FEEDS = [
  { author: 'bartowski', search: 'GGUF', tag: 'gguf' },
  { author: 'unsloth', search: 'GGUF', tag: 'gguf' },
  { author: 'onnx-community', search: null, tag: 'onnx' },
];

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HF ${res.status} for ${url}`);
  return res.json();
}

/** A candidate list: trending this week (likes7d) or freshly updated. */
async function fetchRepoList(tag, sort) {
  const url = `${HF_API}?tags=${encodeURIComponent(tag)}&sort=${sort}&direction=-1&limit=${LIST_LIMIT}`;
  const list = await fetchJson(url);
  return Array.isArray(list) ? list : [];
}

/** Curated quantizer feeds — authors whose repos consistently ship parseable,
 *  edge-relevant artifacts (quality floor under the noisy tag lists). */
async function fetchAuthorList(author, search) {
  let url = `${HF_API}?author=${encodeURIComponent(author)}&sort=lastModified&direction=-1&limit=${CURATED_LIMIT}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const list = await fetchJson(url);
  return Array.isArray(list) ? list : [];
}

/** Real file tree (verified byte sizes) for one repo. */
async function fetchTree(repoId) {
  return fetchJson(`${HF_API}/${repoId}/tree/main?recursive=true`);
}

/** Model detail — lastModified + engagement for gated survivors. */
async function fetchDetail(repoId) {
  return fetchJson(HF_API + '/' + repoId);
}

/** Reduce a repo's verified tree to a gated radar row, or null. */
function treeToRow(repo, tree) {
  const ggufFiles = tree.filter((e) => e.type === 'file' && e.path.endsWith('.gguf'));
  if (ggufFiles.length > 0) {
    const rep = pickRepresentativeGgufFile(ggufFiles);
    if (!rep) return null; // only shards / unrecognized quants
    return {
      repoId: repo.id,
      author: repo.author ?? repo.id.split('/')[0] ?? null,
      lastModified: repo.lastModified ?? repo.createdAt ?? null,
      format: 'gguf',
      fileName: rep.path,
      fileBytes: rep.size,
      quant: rep.quant,
      likes: repo.likes ?? 0,
      downloads: repo.downloads ?? 0,
      pipelineTag: repo.pipeline_tag ?? null,
    };
  }
  const onnxFiles = tree.filter(
    (e) => e.type === 'file' && e.path.endsWith('.onnx') && Number.isFinite(e.size) && e.size > 0,
  );
  // Representative = the largest single .onnx under the edge-relevance cap.
  const rep = onnxFiles.filter((f) => f.size <= MAX_ONNX_BYTES).sort((a, b) => b.size - a.size)[0];
  if (!rep) return null;
  return {
    repoId: repo.id,
    author: repo.author ?? repo.id.split('/')[0] ?? null,
    lastModified: repo.lastModified ?? repo.createdAt ?? null,
    format: 'onnx',
    fileName: rep.path,
    fileBytes: rep.size,
    quant: null,
    likes: repo.likes ?? 0,
    downloads: repo.downloads ?? 0,
    pipelineTag: repo.pipeline_tag ?? null,
  };
}

// ── 1. Candidate pools: curated feeds first (quality floor), then trending
// (engagement signal), then fresh tag lists (novelty tail). First occurrence
// of a repo id wins, so pool order is the priority order.
const candidatesByTag = { gguf: new Map(), onnx: new Map() };
for (const feed of CURATED_FEEDS) {
  try {
    const repos = await fetchAuthorList(feed.author, feed.search);
    console.log(`[hf:author:${feed.author}] ${repos.length} candidates`);
    for (const repo of repos) {
      if (!candidatesByTag[feed.tag].has(repo.id)) candidatesByTag[feed.tag].set(repo.id, repo);
    }
  } catch (err) {
    console.error(`[hf:author:${feed.author}] list fetch failed:`, err?.message ?? err);
  }
}
const listSpecs = [
  ['gguf', 'likes7d'],
  ['gguf', 'lastModified'],
  ['onnx', 'likes7d'],
  ['onnx', 'lastModified'],
];
for (const [tag, sort] of listSpecs) {
  try {
    const repos = await fetchRepoList(tag, sort);
    console.log(`[hf:${tag}:${sort}] ${repos.length} candidates`);
    for (const repo of repos) {
      if (!candidatesByTag[tag].has(repo.id)) candidatesByTag[tag].set(repo.id, repo);
    }
  } catch (err) {
    console.error(`[hf:${tag}:${sort}] list fetch failed:`, err?.message ?? err);
  }
}

// ── 2. Tree verification (the ground truth for byte sizes) ─────────────────
// Budget split evenly across formats so a GGUF-heavy week can't starve ONNX.
const perFormat = Math.floor(TREE_BUDGET / 2);
const treeTargets = [
  ...[...candidatesByTag.gguf.values()].slice(0, perFormat),
  ...[...candidatesByTag.onnx.values()].slice(0, TREE_BUDGET - perFormat),
];
const treeSettled = await Promise.allSettled(treeTargets.map((repo) => fetchTree(repo.id)));
const rows = [];
treeSettled.forEach((r, i) => {
  if (r.status === 'fulfilled') {
    const row = treeToRow(treeTargets[i], r.value);
    if (row) rows.push(row);
  } else {
    console.error(`[tree] ${treeTargets[i].id} failed:`, r.reason?.message ?? r.reason);
  }
});
console.log(`[tree] ${rows.length}/${treeTargets.length} repos ship a usable edge-format file`);

// ── 3. lastModified for survivors missing it (trending lists omit it) ──────
let detailLookups = 0;
for (const row of rows) {
  if (row.lastModified || detailLookups >= DETAIL_BUDGET) continue;
  detailLookups++;
  try {
    const detail = await fetchDetail(row.repoId);
    row.lastModified = detail.lastModified ?? detail.createdAt ?? null;
  } catch (err) {
    console.error(`[detail] ${row.repoId} failed:`, err?.message ?? err);
  }
}
for (const row of rows) {
  row.lastModified ??= new Date().toISOString(); // snapshot day fallback — never undefined
}

const selected = selectRadarModels(rows, { maxModels: 12 });
console.log(`[select] ${rows.length} verified rows → ${selected.length} radar slots after family dedupe + gates`);

// ── 4. Publish (or abstain on an empty day, matching the trends posture) ───
const generatedAt = new Date().toISOString();
const GIB = 1024 * 1024 * 1024;
const MIB = 1024 * 1024;
const fmtSize = (n) => (n >= GIB ? `${(n / GIB).toFixed(2)} GiB` : `${(n / MIB).toFixed(1)} MiB`);

let summary = `# EdgeSpec Radar — ${dateStr}\n\n`;
if (selected.length === 0) {
  summary += 'No models passed the gates this run — no radar snapshot written.\n';
  console.log('[publish] 0 models after gating — skipping radar write');
} else {
  mkdirSync(OUT_DIR, { recursive: true });
  const { boards, models, fits } = computeRadar(selected, BOARDS);
  const payload = { generatedAt, boards, models, fits };
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n');
  console.log(`[publish] wrote ${OUT_PATH} (${models.length} models × ${boards.length} boards)`);

  summary += `| Model | Format | Quant | Size | Runtime est. | Fits |\n|---|---|---|---|---|---|\n`;
  for (const m of models) {
    const ok = fits.filter((f) => f.modelId === m.id && f.verdict !== 'no').length;
    summary += `| ${m.id} | ${m.format} | ${m.quant ?? '—'} | ${fmtSize(m.fileBytes)} | ${fmtSize(m.runtimeBytes)} | ${ok}/${boards.length} boards |\n`;
  }
  summary += `\nBoards: ${boards.map((b) => b.name).join(' · ')}\n`;
}

writeFileSync(SUMMARY_PATH, summary);
console.log('[done] summary written');
