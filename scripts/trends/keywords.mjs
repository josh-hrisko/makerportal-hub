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

/**
 * Curated list of high-signal Bluesky handles relevant to the MakerPortal pillars
 * (Swift/iOS craft, local-first, on-device AI/ML, and Audio/DSP).
 */
export const BLUESKY_CURATED_HANDLES = [
  'natpanferova.bsky.social',      // Swift/iOS
  'inside.com',                    // Tech/industry insights
  'centricular.com',               // GStreamer, Audio/Video DSP
  'chimeces.bsky.social',          // Web Audio/DSP
  'khronos.bsky.social',           // WebGL/Metal/GPU specs
  'dgregor.bsky.social',           // Swift Compiler
  'jckarter.bsky.social',          // Joe Groff (Swift compiler/language)
  'lapcatsoftware.bsky.social',    // Jeff Johnson (macOS/iOS craft)
  'dimsumthinking.bsky.social',    // Daniel Steinberg (Swift/SwiftUI)
  'twostraws.bsky.social',         // Paul Hudson (Hacking with Swift)
  'merowing.info.bsky.social',     // Krzysztof Zabłocki (iOS craft)
  'pathofleast.bsky.social',       // iOS/Swift performance
  'steipete.bsky.social',          // Peter Steinberger (iOS engine craft)
  'ctietze.bsky.social',           // Christian Tietze (macOS/iOS developer)
  'rhonabwy.bsky.social',          // iOS/macOS dev
  'mxcl.bsky.social',              // Max Howell (Homebrew/PromiseKit)
  'cocoaphony.bsky.social',        // Rob Napier (Swift/iOS architecture)
  'brentsimmons.bsky.social',      // Brent Simmons (NetNewsWire, RSS/iOS pioneer)
  'paranoiaparts.bsky.social',     // Hardware/Audio/DSP
  'sounddesign.bsky.social',       // Audio/DSP/sound design
  'audiotool.bsky.social',         // Web audio/synth engines
  'simonw.bsky.social',            // Simon Willison (LLMs, Datasette)
  'karpathy.bsky.social',          // Andrej Karpathy (Deep learning, LLMs)
  'clattner.bsky.social',          // Chris Lattner (LLVM, Swift, Mojo)
  'alexcrichton.bsky.social',      // Rust/Wasm compiler dev
  'swyx.bsky.social',              // Latent Space AI, LLM developer space
  'dhh.bsky.social',               // Rails, local-first advocate
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

