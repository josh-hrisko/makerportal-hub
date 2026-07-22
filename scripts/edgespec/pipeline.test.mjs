/**
 * EdgeSpec radar gate tests — the pre-publish safety net for
 * edgespec-digest.yml (same posture as scripts/trends/pipeline.test.mjs).
 * Every number the radar publishes must trace back to these deterministic
 * rules; fixtures are crafted, no network is touched.
 *
 * Run: `node --test scripts/edgespec/pipeline.test.mjs`
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  QUANT_BITS_PER_WEIGHT,
  QUANT_PREFERENCE,
  BOARDS,
  RUNTIME_OVERHEAD,
  FIT_HEADROOM,
  parseGgufFilename,
  pickRepresentativeGgufFile,
  estimateRuntimeBytes,
  estimateParams,
  flopsPerToken,
  fitVerdict,
  modelFamilyKey,
  selectRadarModels,
  computeRadar,
} from './radar-core.mjs';

const GIB = 1024 * 1024 * 1024;
const MIB = 1024 * 1024;

// ── Quant parsing ──────────────────────────────────────────────────────────

test('parseGgufFilename reads canonical quant tokens', () => {
  assert.equal(parseGgufFilename('Qwen2.5-0.5B-Instruct-Q4_K_M.gguf').quant, 'Q4_K_M');
  assert.equal(parseGgufFilename('model-q8_0.gguf').quant, 'Q8_0');
  assert.equal(parseGgufFilename('Llama-3.2-1B-IQ2_XXS.gguf').quant, 'IQ2_XXS');
  assert.equal(parseGgufFilename('model-F16.gguf').quant, 'F16');
});

test('parseGgufFilename rejects non-GGUF and unknown quants', () => {
  assert.equal(parseGgufFilename('README.md'), null);
  assert.equal(parseGgufFilename('model.onnx'), null);
  assert.equal(parseGgufFilename('model-Q9_ZZZ.gguf'), null);
  assert.equal(parseGgufFilename('model.gguf'), null); // no quant token at all
});

test('parseGgufFilename flags multi-part shards', () => {
  const shard = parseGgufFilename('big-model-Q4_K_M-00002-of-00005.gguf');
  assert.equal(shard.quant, 'Q4_K_M');
  assert.equal(shard.isShard, true);
  assert.equal(shard.shardIndex, 2);
  assert.equal(shard.shardCount, 5);
});

// ── Representative file selection ──────────────────────────────────────────

test('pickRepresentativeGgufFile prefers Q4_K_M, skips shards and sizeless files', () => {
  const files = [
    { path: 'm-Q8_0.gguf', size: 8 * GIB },
    { path: 'm-Q4_K_M-00001-of-00002.gguf', size: 3 * GIB }, // shard — excluded
    { path: 'm-Q4_K_M.gguf', size: 4.5 * GIB },
    { path: 'm-Q2_K.gguf', size: 2 * GIB },
    { path: 'm-F16.gguf', size: null }, // no verified size — excluded
  ];
  const rep = pickRepresentativeGgufFile(files);
  assert.equal(rep.path, 'm-Q4_K_M.gguf');
});

test('pickRepresentativeGgufFile falls back down the preference order, smallest first', () => {
  const files = [
    { path: 'm-Q5_K_M.gguf', size: 6 * GIB },
    { path: 'm-Q5_K_M-alt.gguf', size: 5 * GIB }, // same quant — smaller wins
  ];
  // Wait: both parse as Q5_K_M? '-alt' after quant still matches the token boundary.
  const rep = pickRepresentativeGgufFile(files);
  assert.equal(rep.path, 'm-Q5_K_M-alt.gguf');
});

test('pickRepresentativeGgufFile returns null when nothing is usable', () => {
  assert.equal(pickRepresentativeGgufFile([{ path: 'm-Q4_K_M-00001-of-00003.gguf', size: 1e9 }]), null);
  assert.equal(pickRepresentativeGgufFile([]), null);
});

// ── Deterministic math ─────────────────────────────────────────────────────

test('runtime estimate is file size × disclosed overhead', () => {
  assert.equal(estimateRuntimeBytes(1000), Math.round(1000 * RUNTIME_OVERHEAD));
});

test('params back-derivation: bytes × 8 ÷ bits-per-weight', () => {
  // 4.85 bpw for Q4_K_M → a 4.85e8-byte file ≈ 8e8 params
  const params = estimateParams(4.85e8, 'Q4_K_M');
  assert.equal(params, 8e8);
  assert.equal(estimateParams(1000, 'NOPE'), null);
});

test('flopsPerToken is 2×params and null-safe', () => {
  assert.equal(flopsPerToken(7e9), 1.4e10);
  assert.equal(flopsPerToken(null), null);
  assert.equal(flopsPerToken(0), null);
});

test('fit verdict boundaries at 80% / 100% of ceiling', () => {
  const board = { modelCeilingBytes: 1000 };
  assert.deepEqual(fitVerdict(800, board).verdict, 'fits');
  assert.deepEqual(fitVerdict(801, board).verdict, 'tight');
  assert.deepEqual(fitVerdict(1000, board).verdict, 'tight');
  const no = fitVerdict(1001, board);
  assert.equal(no.verdict, 'no');
  assert.equal(no.headroomBytes, -1);
});

test('every published quant token exists in exactly one preference slot', () => {
  for (const q of QUANT_PREFERENCE) {
    assert.ok(q in QUANT_BITS_PER_WEIGHT, `${q} missing bpw entry`);
  }
  assert.equal(new Set(QUANT_PREFERENCE).size, QUANT_PREFERENCE.length);
});

// ── Board table integrity ──────────────────────────────────────────────────

test('board ceilings never exceed total RAM and keep the 80% rule meaningful', () => {
  for (const b of BOARDS) {
    assert.ok(b.modelCeilingBytes <= b.ramBytes, `${b.id} ceiling > ram`);
    assert.ok(b.modelCeilingBytes > 0);
    assert.ok(b.id && b.name && b.note && b.ramLabel);
  }
});

test('every kit linkId a board recommends exists in the curated affiliate registry', () => {
  // Commercial integrity: the radar may only route buyers to hand-curated,
  // audited picks — never to an invented product URL.
  const registry = JSON.parse(
    readFileSync(join(process.cwd(), 'src', 'data', 'affiliate-links.json'), 'utf-8'),
  );
  const known = new Set(registry.map((l) => l.id));
  const linked = BOARDS.flatMap((b) => b.linkIds);
  assert.ok(linked.length > 0, 'radar monetization path vanished');
  for (const id of linked) {
    assert.ok(known.has(id), `board links unknown affiliate id: ${id}`);
  }
});

// ── Family dedupe & selection ──────────────────────────────────────────────

test('modelFamilyKey collapses version churn from one author', () => {
  assert.equal(modelFamilyKey('Fluxmire/Qwen3.6-27B-Omni-v5'), modelFamilyKey('Fluxmire/Qwen3.6-27B-Omni-v7'));
  assert.notEqual(modelFamilyKey('a/llama-1b'), modelFamilyKey('b/llama-1b'));
});

test('selectRadarModels dedupes families, gates junk, keeps most recent', () => {
  const rows = [
    { repoId: 'x/model-v5', lastModified: '2026-07-20T00:00:00Z', format: 'gguf', fileName: 'm-Q4_K_M.gguf', fileBytes: 1 * GIB, quant: 'Q4_K_M' },
    { repoId: 'x/model-v7', lastModified: '2026-07-21T00:00:00Z', format: 'gguf', fileName: 'm-Q4_K_M.gguf', fileBytes: 1 * GIB, quant: 'Q4_K_M' },
    { repoId: 'y/huge', lastModified: '2026-07-22T00:00:00Z', format: 'gguf', fileName: 'h-Q4_K_M.gguf', fileBytes: 40 * GIB, quant: 'Q4_K_M' }, // over cap
    { repoId: 'z/noquant', lastModified: '2026-07-22T00:00:00Z', format: 'gguf', fileName: 'h.gguf', fileBytes: 1 * GIB, quant: null }, // no quant
    { repoId: 'w/vision', lastModified: '2026-07-19T00:00:00Z', format: 'onnx', fileName: 'model.onnx', fileBytes: 90 * MIB, quant: null },
    { repoId: 'v/bad', lastModified: '2026-07-19T00:00:00Z', format: 'gguf', fileName: 'm-Q4_K_M.gguf', fileBytes: NaN, quant: 'Q4_K_M' }, // no size
  ];
  const selected = selectRadarModels(rows);
  const ids = selected.map((m) => m.repoId);
  assert.deepEqual(ids, ['x/model-v7', 'w/vision']);
  assert.ok(!ids.includes('y/huge'), 'over-cap model must be gated');
  assert.ok(!ids.includes('z/noquant'), 'quant-less GGUF must be gated');
  assert.ok(!ids.includes('v/bad'), 'size-less row must be gated');
});

test('selection sorts freshest-first and respects the slot cap', () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({
    repoId: `a/family-${i}`,
    lastModified: `2026-07-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
    format: 'gguf',
    fileName: 'm-Q4_K_M.gguf',
    fileBytes: GIB,
    quant: 'Q4_K_M',
  }));
  const selected = selectRadarModels(rows, { maxModels: 12 });
  assert.equal(selected.length, 12);
  assert.equal(selected[0].repoId, 'a/family-19');
});

// ── End-to-end payload shape ───────────────────────────────────────────────

test('computeRadar emits a full model × board matrix with no undefined fields', () => {
  const rows = [
    { repoId: 'x/tiny', lastModified: '2026-07-21T00:00:00Z', format: 'gguf', fileName: 't-Q4_K_M.gguf', fileBytes: 4 * MIB, quant: 'Q4_K_M', likes: 3, downloads: 10 },
    { repoId: 'x/small-llm', lastModified: '2026-07-20T00:00:00Z', format: 'gguf', fileName: 's-Q8_0.gguf', fileBytes: 2 * GIB, quant: 'Q8_0' },
    { repoId: 'x/vision', lastModified: '2026-07-19T00:00:00Z', format: 'onnx', fileName: 'yolo.onnx', fileBytes: 40 * MIB },
  ];
  const { boards, models, fits } = computeRadar(selectRadarModels(rows), BOARDS);

  assert.equal(boards.length, BOARDS.length);
  assert.equal(models.length, 3);
  assert.equal(fits.length, 3 * BOARDS.length);

  for (const m of models) {
    // Nothing undefined may reach the JSON payload — the page renders these raw.
    assert.ok(!Object.values(m).some((v) => v === undefined), `undefined field in ${m.id}`);
    assert.ok(m.url.startsWith('https://huggingface.co/'));
    assert.ok(m.runtimeBytes > m.fileBytes, 'runtime must include overhead');
    if (m.format === 'gguf') {
      assert.ok(m.approxParams > 0 && m.flopsPerToken === 2 * m.approxParams);
    } else {
      assert.equal(m.approxParams, null);
      assert.equal(m.flopsPerToken, null);
    }
  }

  // The 4 MiB Q4_K_M file (5 MiB runtime) fits every board incl. Coral's 8 MiB cache;
  // the 2 GiB Q8_0 fits nothing MCU-class.
  const tiny = fits.filter((f) => f.modelId === 'x/tiny');
  assert.ok(tiny.every((f) => f.verdict !== 'no'));
  const llmMcu = fits.filter(
    (f) => f.modelId === 'x/small-llm' && ['esp32-s3-n8r8', 'teensy-4-1', 'coral-edge-tpu'].includes(f.boardId),
  );
  assert.ok(llmMcu.every((f) => f.verdict === 'no'));

  // Payload must survive a JSON round-trip byte-identically (deterministic).
  const payload = { generatedAt: '2026-07-22T00:00:00.000Z', boards, models, fits };
  assert.equal(JSON.stringify(JSON.parse(JSON.stringify(payload))), JSON.stringify(payload));
});

test('headroom sign convention: negative only when the model cannot fit', () => {
  for (const b of BOARDS) {
    const fitsRes = fitVerdict(Math.floor(b.modelCeilingBytes * FIT_HEADROOM), b);
    assert.ok(fitsRes.headroomBytes > 0);
    const noRes = fitVerdict(b.modelCeilingBytes * 2, b);
    assert.ok(noRes.headroomBytes < 0 && noRes.verdict === 'no');
  }
});
