/**
 * Interactive tool registry — "Lab" section. Same SSOT pattern as apps.ts/trends.ts.
 * Every tool is grounded in a real shipped app; `status: 'planned'` entries exist so
 * the roadmap is visible in the data layer, not just docs/BACKLOG.md. See the plan at
 * docs/BACKLOG.md Phase 1/5 notes for sequencing.
 */

export type ToolStatus = 'live' | 'planned';

export interface ToolEntry {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Key into pillarMeta (trends.ts) — reuses the same 6-pillar vocabulary as gear/trends. */
  pillar: string;
  relatedApp: string;
  relatedAppUrl: string;
  /** Blog post id in src/content/blog, if one exists yet. */
  relatedFieldNote?: string;
  status: ToolStatus;
}

export const tools: ToolEntry[] = [
  {
    slug: 'quaternion-euler-converter',
    title: 'Quaternion ↔ Euler Converter',
    tagline: 'The exact head-orientation math running inside MotionLink',
    description:
      'Convert between quaternion attitude and yaw/pitch/roll both directions, with a live orientation preview — the same round-trip-verified formulas (and the gimbal-lock clamp fix) from the CMHeadphoneMotionManager field note.',
    pillar: 'ios-craft',
    relatedApp: 'MotionLink',
    relatedAppUrl: 'https://makersportal.com/apps/motionlink',
    relatedFieldNote: 'motionlink-headphone-motion-api',
    status: 'live',
  },
  {
    slug: 'biquad-filter-designer',
    title: 'Biquad Filter Designer',
    tagline: 'Hear a cascade, not just see a curve',
    description:
      'A multi-stage biquad chain with a live Web Audio preview on real audio, plus the Direct Form II Transposed code running in Biquadia’s DSP core.',
    pillar: 'dsp-audio',
    relatedApp: 'Biquadia',
    relatedAppUrl: 'https://biquadia.makerportal.ai',
    status: 'planned',
  },
  {
    slug: 'head-tracked-stereo-pan',
    title: 'Head-Tracked Stereo Pan',
    tagline: 'Rotate a virtual head, hear the pan move',
    description:
      'Combines the quaternion converter’s yaw output with a live StereoPannerNode demo — spatial audio and head tracking in one shareable toy.',
    pillar: 'dsp-audio',
    relatedApp: 'MotionLink',
    relatedAppUrl: 'https://makersportal.com/apps/motionlink',
    status: 'planned',
  },
  {
    slug: 'coreml-model-size-calculator',
    title: 'CoreML Model Size & Quantization Calculator',
    tagline: 'Exact on-device footprint math, no throughput guesswork',
    description:
      'Deterministic byte-size math across fp32/fp16/int8/int4 quantization — no fabricated latency numbers, just the arithmetic behind an on-device model’s real footprint.',
    pillar: 'on-device-ai',
    relatedApp: 'Notiary',
    relatedAppUrl: 'https://notiary.makerportal.ai',
    status: 'planned',
  },
  {
    slug: 'ble-gatt-visualizer',
    title: 'BLE GATT / CSV Frame Visualizer',
    tagline: 'How raw serial bytes become a CSV row',
    description:
      'An interactive look at the HM-10/nRF52 UART bridge structure BLExAR talks to — services, characteristics, and the byte-level framing behind CSV export.',
    pillar: 'ios-craft',
    relatedApp: 'BLExAR',
    relatedAppUrl: 'https://makersportal.com/apps/blexar',
    status: 'planned',
  },
  {
    slug: 'agentic-dsp-pipeline',
    title: 'Agentic DSP Pipeline Step-Through',
    tagline: 'Record → retrieve → generate → verify → iterate',
    description:
      'A clickable walk through AuraLinter’s real multi-agent loop: RAG retrieval over DSP textbooks, LangGraph codegen, and clang++ verification of the generated C++ kernel.',
    pillar: 'dsp-audio',
    relatedApp: 'AuraLinter',
    relatedAppUrl: 'https://auralinter.makerportal.ai',
    status: 'planned',
  },
];

export function liveTools(): ToolEntry[] {
  return tools.filter((t) => t.status === 'live');
}

export function plannedTools(): ToolEntry[] {
  return tools.filter((t) => t.status === 'planned');
}
