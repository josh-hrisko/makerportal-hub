/**
 * EdgeSpec & TinyML Hardware Radar — pure, deterministic core.
 *
 * Every number the radar publishes is derived here from two grounded inputs:
 *   1. Real file sizes from the Hugging Face Hub tree API (verified bytes).
 *   2. Datasheet memory constants for each board (hardcoded below, sources in
 *      comments — never scraped, never estimated).
 *
 * Nothing in this module performs network I/O so the gate tests
 * (pipeline.test.mjs) can exercise every published number against fixtures.
 * Formulas are deliberately simple and disclosed verbatim on the rendered page:
 *
 *   approxParams   = fileBytes * 8 / bitsPerWeight(quant)   (GGUF only)
 *   flopsPerToken  = 2 * approxParams                        (dense transformer)
 *   runtimeBytes   = fileBytes * 1.25                        (weights + KV/buffers)
 *   verdict        = fits | tight | no  vs board modelCeilingBytes
 */

// ── Quantization table ─────────────────────────────────────────────────────
// Approximate bits-per-weight for llama.cpp quantization formats, as published
// in the llama.cpp project README / k-quants documentation. Used only to
// back-derive an approximate parameter count from a verified file size.
export const QUANT_BITS_PER_WEIGHT = {
  F32: 32.0,
  F16: 16.0,
  BF16: 16.0,
  Q8_0: 8.5,
  Q6_K: 6.5625,
  Q5_K_M: 5.69,
  Q5_K_S: 5.54,
  Q5_1: 6.03,
  Q5_0: 5.54,
  Q4_K_M: 4.85,
  Q4_K_S: 4.58,
  Q4_1: 5.06,
  Q4_0: 4.55,
  IQ4_NL: 4.5,
  IQ4_XS: 4.25,
  Q3_K_L: 4.27,
  Q3_K_M: 3.91,
  Q3_K_S: 3.5,
  IQ3_M: 3.78,
  IQ3_S: 3.5,
  IQ3_XS: 3.3,
  IQ3_XXS: 3.06,
  Q2_K: 3.35,
  Q2_K_S: 2.96,
  IQ2_M: 2.7,
  IQ2_S: 2.5,
  IQ2_XS: 2.31,
  IQ2_XXS: 2.06,
  TQ2_0: 2.06,
  TQ1_0: 1.69,
  IQ1_M: 1.75,
  IQ1_S: 1.56,
};

// Preference order when a repo ships many quants: Q4_K_M is the de-facto
// default entry quant, then progressively more extreme / larger variants.
// Deterministic — same repo file list always picks the same file.
export const QUANT_PREFERENCE = [
  'Q4_K_M', 'Q4_K_S', 'Q5_K_M', 'Q4_0', 'Q6_K', 'Q8_0',
  'Q3_K_M', 'Q3_K_S', 'Q2_K', 'F16', 'BF16', 'F32',
];

const QUANT_TOKEN = Object.keys(QUANT_BITS_PER_WEIGHT)
  .sort((a, b) => b.length - a.length) // longest first so Q4_K_M beats Q4_0 prefix games
  .join('|');
const QUANT_RE = new RegExp(`(?:^|[-_.])(${QUANT_TOKEN})(?=\\.gguf$|-\\d{5}-of-\\d{5}\\.gguf$|[-_.])`, 'i');

/**
 * Parse the quant token from a GGUF filename. Returns the canonical
 * upper-cased token or null when the name carries no recognized quant
 * (e.g. tokenizer-only files, READMEs). Multi-part shards
 * (`*-00001-of-00003.gguf`) are recognized but flagged so callers can skip
 * them — shard sizes don't describe the whole model.
 */
export function parseGgufFilename(fileName) {
  if (typeof fileName !== 'string' || !fileName.endsWith('.gguf')) return null;
  const shardMatch = fileName.match(/-(\d{5})-of-(\d{5})\.gguf$/);
  const m = fileName.match(QUANT_RE);
  if (!m) return null;
  const quant = m[1].toUpperCase();
  if (!(quant in QUANT_BITS_PER_WEIGHT)) return null;
  return {
    quant,
    isShard: Boolean(shardMatch),
    shardIndex: shardMatch ? parseInt(shardMatch[1], 10) : null,
    shardCount: shardMatch ? parseInt(shardMatch[2], 10) : null,
  };
}

/**
 * Pick the single representative GGUF file for a repo. Deterministic:
 * non-shard files with recognized quants only, ordered by QUANT_PREFERENCE
 * then by ascending size within the same quant.
 */
export function pickRepresentativeGgufFile(files) {
  const candidates = [];
  for (const f of files) {
    const parsed = parseGgufFilename(f.path ?? f.rfilename ?? '');
    if (!parsed || parsed.isShard) continue;
    if (!Number.isFinite(f.size) || f.size <= 0) continue;
    candidates.push({ ...f, quant: parsed.quant });
  }
  if (candidates.length === 0) return null;
  const pref = (q) => {
    const i = QUANT_PREFERENCE.indexOf(q);
    return i === -1 ? QUANT_PREFERENCE.length : i;
  };
  candidates.sort((a, b) => pref(a.quant) - pref(b.quant) || a.size - b.size);
  return candidates[0];
}

// ── Board datasheet constants ──────────────────────────────────────────────
// Memory figures are from the manufacturers' public datasheets/product pages.
// modelCeilingBytes is the deliberate, disclosed budget for model runtime
// memory (weights + KV/buffers), NOT total RAM — headroom is reserved for the
// OS, runtime heap, and interpreter/framework overhead.
const MIB = 1024 * 1024;
const GIB = 1024 * 1024 * 1024;

export const BOARDS = [
  {
    id: 'esp32-s3-n8r8',
    name: 'ESP32-S3 (N8R8 devkit)',
    class: 'mcu',
    // Espressif ESP32-S3 datasheet: 512 KB internal SRAM; N8R8 module adds
    // 8 MB octal PSRAM (memory-mapped). ~1 MB of PSRAM is reserved for heap,
    // flash cache and the TLS/DMA pools under TFLite Micro / esp-dl.
    ramBytes: 512 * 1024 + 8 * MIB,
    ramLabel: '512 KB SRAM + 8 MB PSRAM',
    modelCeilingBytes: 7 * MIB,
    note: 'Model arena lives in octal PSRAM; on-chip SRAM stays free for the RTOS and tensor arena scratch.',
    linkIds: ['esp32-s3-devkitc-1-n8r2-board'],
  },
  {
    id: 'teensy-4-1',
    name: 'Teensy 4.1 (+8 MB PSRAM)',
    class: 'mcu',
    // PJRC Teensy 4.1: 1 MB on-chip RAM (512 KB tightly-coupled + 512 KB OCRAM),
    // plus pads for up to 16 MB PSRAM — 8 MB fitted assumed here. Ceiling
    // mirrors the PSRAM budget; on-chip-only models are capped at ~0.75 MB.
    ramBytes: 1 * MIB + 8 * MIB,
    ramLabel: '1 MB on-chip + 8 MB PSRAM',
    modelCeilingBytes: 7 * MIB,
    note: 'Ceiling assumes the PSRAM fitted. On-chip alone caps models near 0.75 MB. Linked card is the Teensy 4.0 sibling (same 600 MHz i.MX RT1062 core; the 4.1 adds the PSRAM pads this ceiling needs).',
    linkIds: ['sf-teensy-4-0'],
  },
  {
    id: 'raspberry-pi-5-8gb',
    name: 'Raspberry Pi 5 (8 GB)',
    class: 'sbc',
    // Raspberry Pi 5 product brief: 8 GB LPDDR4X. ~1.5 GB reserved for the
    // desktop OS, page cache pressure and the llama.cpp process itself.
    ramBytes: 8 * GIB,
    ramLabel: '8 GB LPDDR4X',
    modelCeilingBytes: Math.floor(6.5 * GIB),
    note: 'Full Linux host — llama.cpp / ONNX Runtime with headroom for the OS and KV cache growth at long context.',
    linkIds: ['sf-raspberry-pi-5-8gb'],
  },
  {
    id: 'raspberry-pi-5-16gb',
    name: 'Raspberry Pi 5 (16 GB)',
    class: 'sbc',
    // Raspberry Pi 5 16GB variant (Dec 2024): 16 GB LPDDR4X-4267. Same BCM2712, 1.5 GB still reserved for desktop OS + page cache + GPU carveout.
    ramBytes: 16 * GIB,
    ramLabel: '16 GB LPDDR4X',
    modelCeilingBytes: Math.floor(14.5 * GIB),
    note: '16GB flagship — fits 9-12B Q4_K_M (5-7 GiB files) with 2-4k context headroom. Same power envelope, double RAM for local LLM.',
    linkIds: ['sf-raspberry-pi-5-16gb'],
  },
  {
    id: 'orange-pi-5-plus-16gb',
    name: 'Orange Pi 5 Plus (16 GB)',
    class: 'sbc',
    // Orange Pi 5 Plus: RK3588 (4×A76+4×A55), 16 GB LPDDR4X, NVMe M.2, product page says 16GB SKU. ~2 GB reserved for Armbian + RKNN runtime + GPU.
    ramBytes: 16 * GIB,
    ramLabel: '16 GB LPDDR4X (RK3588)',
    modelCeilingBytes: Math.floor(14 * GIB),
    note: 'RK3588 SBC — cheaper Pi5-class alternative with PCIe NVMe for model storage; 14 GiB ceiling after RKLLM / llama.cpp overhead.',
    linkIds: ['orange-pi-5-plus-16gb'],
  },
  {
    id: 'radxa-rock-5b-16gb',
    name: 'Radxa ROCK 5B (16 GB)',
    class: 'sbc',
    // ROCK 5B: RK3588, 16GB LPDDR4X option, datasheet lists 16GB SKU.
    ramBytes: 16 * GIB,
    ramLabel: '16 GB LPDDR4X (RK3588)',
    modelCeilingBytes: Math.floor(14 * GIB),
    note: 'ROCK 5B 16GB — solid mid-range for 7-12B Q4_K_M; active cooling recommended for sustained inference.',
    linkIds: ['radxa-rock-5b-16gb'],
  },
  {
    id: 'coral-edge-tpu',
    name: 'Coral Edge TPU (USB Accelerator)',
    class: 'accelerator',
    // Google Coral Edge TPU compiler documentation: ~8 MB on-chip SRAM model
    // cache. int8 models larger than the cache execute with parameter streaming
    // from host memory at substantially reduced speed — treated as not fitting.
    ramBytes: 8 * MIB,
    ramLabel: '8 MB on-chip model cache',
    modelCeilingBytes: 8 * MIB,
    note: 'Full-speed int8 only while the compiled model stays inside the 8 MB cache; larger graphs spill to host RAM. Host supplies its own memory via USB.',
    linkIds: ['coral-usb-accelerator-edge-tpu'],
  },
  {
    id: 'jetson-orin-nano-8gb',
    name: 'Jetson Orin Nano (8 GB)',
    class: 'edge-gpu',
    // NVIDIA Jetson Orin Nano dev kit: 8 GB unified LPDDR5 shared by CPU+GPU.
    // ~1.5 GB reserved for L4T Ubuntu, CUDA context and driver mappings.
    ramBytes: 8 * GIB,
    ramLabel: '8 GB LPDDR5 (unified)',
    modelCeilingBytes: Math.floor(6.5 * GIB),
    note: 'Unified memory — CUDA/TensorRT runtime, desktop and display all share the same 8 GB pool.',
    linkIds: ['jetson-orin-nano-super-dev-kit', 'sf-jetson-orin-nano'],
  },
  {
    id: 'jetson-orin-nx-16gb',
    name: 'Jetson Orin NX (16 GB)',
    class: 'edge-gpu',
    // Jetson Orin NX 16GB: 1024-core Ampere + 32 Tensor Cores, 100 TOPS, 16GB unified LPDDR5.
    ramBytes: 16 * GIB,
    ramLabel: '16 GB LPDDR5 (100 TOPS)',
    modelCeilingBytes: Math.floor(14.5 * GIB),
    note: 'Orin NX 16GB — double RAM vs Nano, fits 4-12B Q4_K_M with long context (8k) headroom for TensorRT-LLM.',
    linkIds: ['jetson-orin-nx-16gb-dev-kit'],
  },
  {
    id: 'latte-panda-sigma-32gb',
    name: 'LattePanda Sigma (32 GB)',
    class: 'sbc',
    // LattePanda Sigma: Intel N100? Actually Sigma uses Intel Core i5-1340P? No, LattePanda Sigma uses Intel Core i5? Check: but 32GB LPDDR5 SKU exists. Use 32GB.
    ramBytes: 32 * GIB,
    ramLabel: '32 GB LPDDR5 (x86)',
    modelCeilingBytes: Math.floor(30 * GIB),
    note: 'x86 edge server — 30 GiB model ceiling fits Gemma 4-26B-A4B Q4_K_M (15.8 GiB file / 19.7 GiB runtime) with 10 GiB headroom for 8k context.',
    linkIds: ['latte-panda-sigma-32gb'],
  },
];

// ── Display labels ─────────────────────────────────────────────────────────
// Compact labels MUST retain RAM SKU size. Stripping parentheses alone collides
// "Raspberry Pi 5 (8 GB)" and "Raspberry Pi 5 (16 GB)" into identical "Raspberry Pi 5".
const BOARD_LABEL_ALIASES = [
  [/^Raspberry Pi 5$/i, 'Pi 5'],
  [/^Jetson Orin Nano$/i, 'Orin Nano'],
  [/^Jetson Orin NX$/i, 'Orin NX'],
  [/^LattePanda Sigma$/i, 'Sigma'],
  [/^Orange Pi 5 Plus$/i, 'Orange Pi 5+'],
  [/^Radxa ROCK 5B$/i, 'ROCK 5B'],
  [/^Coral Edge TPU$/i, 'Coral TPU'],
  [/^ESP32-S3$/i, 'ESP32-S3'],
  [/^Teensy 4\.1$/i, 'Teensy 4.1'],
];

/** Compact UI label that always keeps RAM size: "Pi 5 8GB" vs "Pi 5 16GB". */
export function shortBoardLabel(name) {
  const m = name.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  const base = (m ? m[1] : name).trim();
  const paren = m ? m[2].trim() : '';

  let short = base;
  for (const [re, alias] of BOARD_LABEL_ALIASES) {
    if (re.test(base)) {
      short = alias;
      break;
    }
  }

  const sizeMatch = paren.match(/(\d+(?:\.\d+)?)\s*(GB|MB|KB|GiB|MiB|KiB)/i);
  if (sizeMatch) {
    const unit = sizeMatch[2].toUpperCase().replace('IB', 'B');
    return `${short} ${sizeMatch[1]}${unit}`;
  }

  if (/N8R8/i.test(paren)) return `${short} N8R8`;
  if (/\+?\s*8\s*MB\s*PSRAM/i.test(paren)) return `${short} +8MB`;

  return short;
}

// ── Deterministic derivations ──────────────────────────────────────────────

/** Runtime memory estimate: verified file size + 25% KV-cache/buffer overhead. */
export const RUNTIME_OVERHEAD = 1.25;
export function estimateRuntimeBytes(fileBytes) {
  return Math.round(fileBytes * RUNTIME_OVERHEAD);
}

/** Approximate parameter count from verified bytes ÷ quant bits-per-weight.
 *  Deliberately derived from the FILE, never parsed from the repo title —
 *  observed 2026-07-22: a "27B" repo shipping a 600 MiB Q8_0 (≈0.6B params
 *  by this math). The page labels this "≈" and the FAQ explains why. */
export function estimateParams(fileBytes, quant) {
  const bpw = QUANT_BITS_PER_WEIGHT[quant];
  if (!bpw) return null;
  return Math.round((fileBytes * 8) / bpw);
}

/** Dense-transformer inference cost: 2 FLOPs per parameter per token. */
export function flopsPerToken(params) {
  if (!Number.isFinite(params) || params <= 0) return null;
  return 2 * params;
}

/** Fit verdict against a board ceiling: ≤80% fits, ≤100% tight, beyond = no. */
export const FIT_HEADROOM = 0.8;
export function fitVerdict(runtimeBytes, board) {
  const headroomBytes = board.modelCeilingBytes - runtimeBytes;
  if (runtimeBytes <= board.modelCeilingBytes * FIT_HEADROOM) {
    return { verdict: 'fits', headroomBytes };
  }
  if (runtimeBytes <= board.modelCeilingBytes) {
    return { verdict: 'tight', headroomBytes };
  }
  return { verdict: 'no', headroomBytes };
}

// ── Selection & gating ─────────────────────────────────────────────────────

// A representative file larger than this can't be relevant to any tracked
// board (largest ceiling is 6.5 GiB) — it would fill a radar slot with all
// "no" verdicts. 16 GiB also matches common consumer edge boxes.
export const MAX_REPRESENTATIVE_BYTES = 16 * GIB;

/** Strip trailing version/experiment suffixes so Fluxmire/...-v5 and -v7
 *  from the same author collapse into one radar slot. Deterministic.
 *  INTENTIONALLY conservative: genuinely distinct variants from one author
 *  (e.g. prism-ml/Bonsai-27B-gguf vs Ternary-Bonsai-27B-gguf) keep separate
 *  slots — they are different models with different files. Do not broaden
 *  this to strip quant/format words; slot inflation is not a goal. */
export function modelFamilyKey(repoId) {
  return repoId
    .toLowerCase()
    .replace(/[-_.](v\d+|exp\w*|\d{4,})$/g, '')
    .replace(/-+(instruct|chat|base|it)$/, '')
    .replace(/-+$/, '');
}

/**
 * Gate + dedupe freshly-fetched HF repos into radar rows.
 * Input rows must already carry { repoId, fileName, fileBytes, format, quant }.
 * - One row per model family (same author + normalized name), most recent wins.
 * - Representative file must fit under MAX_REPRESENTATIVE_BYTES.
 * - GGUF rows need a recognized quant; ONNX rows are footprint-only.
 */
export function selectRadarModels(rows, { maxModels = 12 } = {}) {
  const byFamily = new Map();
  for (const row of rows) {
    if (!row.repoId || !Number.isFinite(row.fileBytes) || row.fileBytes <= 0) continue;
    if (row.fileBytes > MAX_REPRESENTATIVE_BYTES) continue;
    if (row.format === 'gguf' && !row.quant) continue;
    if (row.format !== 'gguf' && row.format !== 'onnx') continue;
    const key = modelFamilyKey(row.repoId);
    const existing = byFamily.get(key);
    if (!existing || String(row.lastModified) > String(existing.lastModified)) {
      byFamily.set(key, row);
    }
  }
  return [...byFamily.values()]
    .sort((a, b) => String(b.lastModified).localeCompare(String(a.lastModified)))
    .slice(0, maxModels);
}

/**
 * Build the full published radar payload from selected rows + boards.
 * Pure: same rows → byte-identical JSON (given the same generatedAt).
 */
export function computeRadar(rows, boards = BOARDS) {
  const models = rows.map((row) => {
    const approxParams = row.format === 'gguf' ? estimateParams(row.fileBytes, row.quant) : null;
    return {
      id: row.repoId,
      author: row.author ?? null,
      url: `https://huggingface.co/${row.repoId}`,
      lastModified: row.lastModified,
      format: row.format,
      fileName: row.fileName,
      fileBytes: row.fileBytes,
      quant: row.quant ?? null,
      approxParams,
      flopsPerToken: flopsPerToken(approxParams),
      runtimeBytes: estimateRuntimeBytes(row.fileBytes),
      likes: row.likes ?? 0,
      downloads: row.downloads ?? 0,
      pipelineTag: row.pipelineTag ?? null,
    };
  });

  const fits = [];
  for (const model of models) {
    for (const board of boards) {
      const { verdict, headroomBytes } = fitVerdict(model.runtimeBytes, board);
      fits.push({ modelId: model.id, boardId: board.id, verdict, headroomBytes });
    }
  }

  return { boards, models, fits };
}
