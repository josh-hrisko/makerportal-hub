/**
 * Relevance filter for the trend digest — keyword allowlist mapped to studio
 * pillars, not embeddings. Deterministic and explainable at this volume
 * (tens of items/week); revisit only if this demonstrably misses things.
 */
export const PILLARS = {
  'on-device-ai': ['on-device', 'on device', 'coreml', 'core ml', 'apple neural engine', ' ane ', 'quantiz', 'onnx runtime', 'edge inference'],
  'metal-ane': ['metal shader', 'metal performance shaders', 'mps ', 'apple silicon', 'neural engine'],
  'local-llm': ['llama.cpp', 'local llm', 'on-device llm', 'smollm', 'gguf', 'slm ', 'small language model'],
  'dsp-audio': [' dsp ', 'digital signal processing', 'audio plugin', 'biquad', 'real-time audio', 'spatial audio', 'vocoder', 'knn-vc', 'voice conversion', 'diffusion transformer audio', 'generative audio'],
  'ios-craft': ['swiftui', 'swift concurrency', 'xcode', 'app store review', 'indie ios', 'ios app performance'],
  'privacy-arch': ['privacy-first', 'zero telemetry', 'local-first', 'no cloud', 'offline-first'],
};

/** Query terms sent to each source's search endpoint — kept short/native, unlike the matcher phrases above.
 *  Expanded to 24 queries (was 10) to increase candidate diversity and avoid
 *  identical daily reports. Includes iOS craft, DSP, and on-device pillars.
 */
export const SEARCH_QUERIES = [
  'CoreML',
  'Apple Neural Engine',
  'llama.cpp',
  'on-device AI',
  'SwiftUI performance',
  'Metal shaders iOS',
  'local LLM',
  'spatial audio',
  'generative audio',
  'privacy-first app',
  // Added for freshness / broader coverage (2026-07-18 revamp)
  'CoreML quantization',
  'Swift concurrency',
  'on-device transcription',
  'Metal Performance Shaders',
  'voice conversion kNN',
  'biquad filter DSP',
  'ANE latency',
  'indie iOS shipping',
  'App Store review',
  'local-first sync',
  'Whisper on-device',
  'GGUF quantization',
  'real-time audio DSP',
  'on-device vision',
];

/** Returns matched pillar tags for a piece of text, empty array if irrelevant. */
export function scoreText(text) {
  const lower = ` ${text.toLowerCase()} `;
  const tags = [];
  let score = 0;
  for (const [tag, needles] of Object.entries(PILLARS)) {
    const hits = needles.filter((n) => lower.includes(n)).length;
    if (hits > 0) {
      tags.push(tag);
      score += hits;
    }
  }
  return { tags, score };
}
