/**
 * Playground registry — interactive tools and math/physics toys.
 * Some are grounded in real shipped apps (isGrounded: true), while others
 * are built for shareability and visual payoff.
 */

export type PlaygroundStatus = 'live' | 'planned';

export interface PlaygroundEntry {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Key into pillarMeta (trends.ts) — reuses the same 6-pillar vocabulary as gear/trends. */
  pillarHint?: string;
  status: PlaygroundStatus;
  
  isGrounded?: boolean;
  relatedApp?: string;
  relatedAppUrl?: string;
  /** Blog post id in src/content/blog, if one exists yet. */
  relatedFieldNote?: string;
}

export const playground: PlaygroundEntry[] = [
  {
    slug: 'quaternion-euler-converter',
    title: 'Quaternion ↔ Euler Converter',
    tagline: 'The exact head-orientation math running inside MotionLink',
    description:
      'Convert between quaternion attitude and yaw/pitch/roll both directions, with a live orientation preview — the same round-trip-verified formulas (and the gimbal-lock clamp fix) from the CMHeadphoneMotionManager field note.',
    pillarHint: 'ios-craft',
    isGrounded: true,
    relatedApp: 'MotionLink',
    relatedAppUrl: 'https://makersportal.com/apps/motionlink',
    relatedFieldNote: 'motionlink-headphone-motion-api',
    status: 'live',
  },
  {
    slug: 'fourier-epicycles',
    title: 'Draw → Fourier Epicycles',
    tagline: 'Any shape, decomposed into spinning circles',
    description:
      'Draw anything. It gets decomposed into rotating circles (a discrete Fourier series) that trace your exact path — the same frequency-domain math behind spectral analysis, applied to a 2D drawing instead of an audio signal.',
    pillarHint: 'dsp-audio',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'globe',
    title: 'Live Earth',
    tagline: 'Real coastlines, real weather, real ISS orbit',
    description:
      'A rotating globe with three real-data modes: an astronomically accurate day/night terminator, real current weather across 16 cities (refreshed on a schedule), and the ISS tracked live via real orbital mechanics computed client-side from its actual TLE elements.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'double-pendulum',
    title: 'Double Pendulum + Phase Space',
    tagline: 'Chaotic motion, painted as pure geometry',
    description: 'A double pendulum you can perturb, with a live phase-space plot painting the chaos as geometry alongside it.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'biquad-filter-designer',
    title: 'Biquad Filter Designer',
    tagline: 'Hear a cascade, not just see a curve',
    description:
      'A multi-stage biquad chain with a live Web Audio preview on real audio, plus the Direct Form II Transposed code running in Biquadia’s DSP core.',
    pillarHint: 'dsp-audio',
    isGrounded: true,
    relatedApp: 'Biquadia',
    relatedAppUrl: 'https://biquadia.makerportal.ai',
    status: 'live',
  },
  {
    slug: 'head-tracked-stereo-pan',
    title: 'Head-Tracked Stereo Pan',
    tagline: 'Rotate a virtual head, hear the pan move',
    description:
      'Combines the quaternion converter’s yaw output with a live StereoPannerNode demo — spatial audio and head tracking in one shareable toy.',
    pillarHint: 'dsp-audio',
    isGrounded: true,
    relatedApp: 'MotionLink',
    relatedAppUrl: 'https://makersportal.com/apps/motionlink',
    status: 'live',
  },
  {
    slug: 'coreml-model-size-calculator',
    title: 'CoreML Model Size & Quantization Calculator',
    tagline: 'Exact on-device footprint math, no throughput guesswork',
    description:
      'Deterministic byte-size math across fp32/fp16/int8/int4 quantization — no fabricated latency numbers, just the arithmetic behind an on-device model’s real footprint.',
    pillarHint: 'on-device-ai',
    isGrounded: true,
    relatedApp: 'Notiary',
    relatedAppUrl: 'https://notiary.makerportal.ai',
    status: 'live',
  },
  {
    slug: 'ble-gatt-visualizer',
    title: 'BLE GATT / CSV Frame Visualizer',
    tagline: 'How raw serial bytes become a CSV row',
    description:
      'An interactive look at the HM-10/nRF52 UART bridge structure BLExAR talks to — services, characteristics, and the byte-level framing behind CSV export.',
    pillarHint: 'ios-craft',
    isGrounded: true,
    relatedApp: 'BLExAR',
    relatedAppUrl: 'https://blexar.makerportal.ai',
    status: 'live',
  },
  {
    slug: 'agentic-dsp-pipeline',
    title: 'Agentic DSP Pipeline Step-Through',
    tagline: 'Record → retrieve → generate → verify → iterate',
    description:
      'A clickable walk through AuraLinter’s real multi-agent loop: RAG retrieval over DSP textbooks, LangGraph codegen, and clang++ verification of the generated C++ kernel.',
    pillarHint: 'dsp-audio',
    isGrounded: true,
    relatedApp: 'AuraLinter',
    relatedAppUrl: 'https://auralinter.makerportal.ai',
    status: 'live',
  },
  {
    slug: 'chladni-cymatics',
    title: 'Chladni Cymatics',
    tagline: 'Sound made visible — standing wave sand patterns',
    description:
      'Thousands of sand grains flee the vibrating regions of a driven plate and settle along its nodal lines. Sweep the frequency through real modal resonances, drag the driver anywhere on the plate, and watch classic Chladni figures assemble live.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'n-body-choreography',
    title: 'N-Body Orbital Choreography',
    tagline: 'Gravity, three bodies, and a stable dance',
    description:
      'Three equal masses chasing each other around the proven figure-eight orbit, integrated with a 4th-order symplectic scheme — plus Lagrange’s unstable triangle, hierarchical systems, and a nudge button that races your perturbed system against an unperturbed ghost.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'conformal-mapping',
    title: 'Conformal Mapping Explorer',
    tagline: 'Watch a grid warp under a complex function',
    description: 'A grid on the complex plane, warped live under f(z), with a homotopy slider morphing between the two.',
    isGrounded: false,
    status: 'planned',
  },
];

export function livePlayground(): PlaygroundEntry[] {
  return playground.filter((p) => p.status === 'live');
}

export function plannedPlayground(): PlaygroundEntry[] {
  return playground.filter((p) => p.status === 'planned');
}
