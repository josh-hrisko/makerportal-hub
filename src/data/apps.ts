import type { ImageMetadata } from 'astro';

import biquadia64 from '../assets/app-icons/biquadia-64.webp';
import biquadia128 from '../assets/app-icons/biquadia-128.webp';
import biquadia256 from '../assets/app-icons/biquadia-256.webp';
import notiary64 from '../assets/app-icons/notiary-64.webp';
import notiary128 from '../assets/app-icons/notiary-128.webp';
import notiary256 from '../assets/app-icons/notiary-256.webp';
import thumbdash64 from '../assets/app-icons/thumbdash-64.webp';
import thumbdash128 from '../assets/app-icons/thumbdash-128.webp';
import thumbdash256 from '../assets/app-icons/thumbdash-256.webp';
import popcloset64 from '../assets/app-icons/popcloset-64.webp';
import popcloset128 from '../assets/app-icons/popcloset-128.webp';
import popcloset256 from '../assets/app-icons/popcloset-256.webp';

// New suite
import auralinter64 from '../assets/app-icons/auralinter-64.webp';
import auralinter128 from '../assets/app-icons/auralinter-128.webp';
import auralinter256 from '../assets/app-icons/auralinter-256.webp';
import nymic64 from '../assets/app-icons/nymic-64.webp';
import nymic128 from '../assets/app-icons/nymic-128.webp';
import nymic256 from '../assets/app-icons/nymic-256.webp';
import akous64 from '../assets/app-icons/akous-64.webp';
import akous128 from '../assets/app-icons/akous-128.webp';
import akous256 from '../assets/app-icons/akous-256.webp';
import itria64 from '../assets/app-icons/itria-64.webp';
import itria128 from '../assets/app-icons/itria-128.webp';
import itria256 from '../assets/app-icons/itria-256.webp';
import gridverse64 from '../assets/app-icons/gridverse-64.webp';
import gridverse128 from '../assets/app-icons/gridverse-128.webp';
import gridverse256 from '../assets/app-icons/gridverse-256.webp';
import motionlink64 from '../assets/app-icons/motionlink-64.webp';
import motionlink128 from '../assets/app-icons/motionlink-128.webp';
import motionlink256 from '../assets/app-icons/motionlink-256.webp';
import blexar64 from '../assets/app-icons/blexar-64.webp';
import blexar128 from '../assets/app-icons/blexar-128.webp';
import blexar256 from '../assets/app-icons/blexar-256.webp';

export type AppCategory =
  | 'Productivity'
  | 'Dashboard'
  | 'Utility'
  | 'Lifestyle'
  | 'Developer Tool'
  | 'Audio'
  | 'Game';

export type AppAccent = 'signal' | 'violet' | 'rose' | 'amber' | 'emerald' | 'cyan';

export interface AppEntry {
  title: string;
  tagline: string;
  description: string;
  url: string;
  icon: ImageMetadata;
  iconSet: { w64: ImageMetadata; w128: ImageMetadata; w256: ImageMetadata };
  date: string;
  /** ISO-ish for sorting, but display uses date */
  dateIso?: string;
  category: AppCategory;
  platform: string;
  sequence: string;
  accent: AppAccent;
  techBadges: string[];
  featured?: boolean;
  /** Per-icon dot sampled via magick histogram, darkened for light-theme AA */
  iconDot?: { light: string; dark: string };
  /** Legacy external hosted on makersportal.com */
  external?: boolean;
}

export const apps: AppEntry[] = [
  {
    title: 'AuraLinter',
    tagline: 'Agentic DSP Orchestrator',
    description:
      'Agentic DSP Orchestrator: record high-fidelity audio, run multi-agent LangGraph DSP generation loops, query Production RAG over DSP textbooks, compiler-verified C++ kernels via clang++, SSE streaming — iOS 17+',
    url: 'https://auralinter.makerportal.ai',
    icon: auralinter128,
    iconSet: { w64: auralinter64, w128: auralinter128, w256: auralinter256 },
    date: 'July 2026',
    dateIso: '2026-07-10',
    category: 'Developer Tool',
    platform: 'iOS (iPhone + iPad)',
    sequence: '005',
    accent: 'violet',
    techBadges: ['LangGraph', 'Production RAG', 'clang++ Verified', 'FastAPI + SSE', 'On-device Capture'],
    featured: true,
    iconDot: { light: '#2B3C5E', dark: '#8AA0C6' }, // histogram #070B28/#4C6492/#4A4B5F dark navy/blue-gray
  },
  {
    title: 'Biquadia',
    tagline: 'Local Neural DSP & Sound Laboratory',
    description:
      'Professional real-time digital signal processing, spatial audio rendering, and on-device neural enhancement models running privately on Apple Silicon.',
    url: 'https://biquadia.makerportal.ai',
    icon: biquadia128,
    iconSet: { w64: biquadia64, w128: biquadia128, w256: biquadia256 },
    date: 'July 2026',
    dateIso: '2026-07-08',
    category: 'Utility',
    platform: 'iOS (iPhone + iPad)',
    sequence: '004',
    accent: 'signal',
    techBadges: ['CoreML', 'Neural Engine (ANE)', 'Metal Shaders', 'Native Swift'],
    featured: true,
    iconDot: { light: '#8C4A3A', dark: '#D98065' },
  },
  {
    title: 'Thumb-Dash',
    tagline: 'AI-powered speed-texting battleground',
    description:
      'AI-powered speed-texting battleground: local LLM pipeline SmolLM2-360M-Instruct, precision mach-time keystroke tracking, Levenshtein scoring — entirely through llama.cpp + Metal on-device. No cloud reads your input.',
    url: 'https://thumbdash.makerportal.ai',
    icon: thumbdash128,
    iconSet: { w64: thumbdash64, w128: thumbdash128, w256: thumbdash256 },
    date: 'July 2026',
    dateIso: '2026-07-05',
    category: 'Game',
    platform: 'iOS (iPhone + iPad)',
    sequence: '003',
    accent: 'amber',
    techBadges: ['SmolLM2-360M', 'llama.cpp', 'Metal on-device'],
    iconDot: { light: '#5E3A2F', dark: '#D49371' }, // new histogram #363130 / #D49371
  },
  {
    title: 'nymic',
    tagline: 'Real-time identity-shifting vocal engine',
    description:
      'Real-time identity-shifting vocal engine: kNN-VC neural pipeline, WavLM-Large feature extraction, cosine nearest-neighbor matching, HiFiGAN vocoding via ONNX Runtime on-device. Custom voice banks in under a minute.',
    url: 'https://makersportal.com/apps/nymic',
    icon: nymic128,
    iconSet: { w64: nymic64, w128: nymic128, w256: nymic256 },
    date: 'June 2026',
    dateIso: '2026-06-03',
    category: 'Audio',
    platform: 'iOS (iPhone + iPad)',
    sequence: '006',
    accent: 'amber',
    techBadges: ['kNN-VC', 'ONNX Runtime', 'HiFiGAN'],
    iconDot: { light: '#7A3410', dark: '#E69433' }, // histogram #C16223/#E69433 orange
    external: true,
  },
  {
    title: 'Notiary',
    tagline: 'Markdown space with a local semantic brain',
    description:
      'A distraction-free markdown note-taking workspace equipped with local vector embeddings and semantic search that indexes your thoughts entirely offline.',
    url: 'https://notiary.makerportal.ai',
    icon: notiary128,
    iconSet: { w64: notiary64, w128: notiary128, w256: notiary256 },
    date: 'June 2026',
    dateIso: '2026-06-01',
    category: 'Productivity',
    platform: 'iOS + Web App',
    sequence: '002',
    accent: 'violet',
    techBadges: ['Semantic Indexing', 'Vector Embeddings', 'Offline CoreML'],
    iconDot: { light: '#385348', dark: '#779589' },
  },
  {
    title: 'akous',
    tagline: 'Generative audio engine for ANE',
    description:
      'Professional-grade generative audio engine: Diffusion Transformer optimized for Apple Neural Engine, binaural focus-scapes, meditation frequencies, neural noise — all private prompt-to-soundscape on-device.',
    url: 'https://makersportal.com/apps/akous',
    icon: akous128,
    iconSet: { w64: akous64, w128: akous128, w256: akous256 },
    date: 'May 2026',
    dateIso: '2026-05-08',
    category: 'Audio',
    platform: 'iOS (iPhone + iPad)',
    sequence: '007',
    accent: 'rose',
    techBadges: ['Diffusion Transformer', 'ANE Optimized', 'Binaural Audio'],
    iconDot: { light: '#7A4744', dark: '#E7A6A2' }, // histogram #E7A6A2 rose
    external: true,
  },
  {
    title: 'PopCloset',
    tagline: 'Intelligent wardrobe indexing & capsule design',
    description:
      'Visual wardrobe tracking powered by on-device computer vision to auto-categorize apparel, extract color palettes, and build capsules.',
    url: 'https://popcloset.makerportal.ai',
    icon: popcloset128,
    iconSet: { w64: popcloset64, w128: popcloset128, w256: popcloset256 },
    date: 'May 2026',
    dateIso: '2026-05-01',
    category: 'Lifestyle',
    platform: 'iOS + Web App',
    sequence: '001',
    accent: 'rose',
    techBadges: ['Computer Vision', 'Local Classifiers', 'CoreML Vision'],
    iconDot: { light: '#424240', dark: '#B3AEB1' },
  },
  {
    title: 'itria',
    tagline: 'On-device LLM with Metal acceleration',
    description:
      'State-of-the-art on-device AI: Metal GPU + llama.cpp, local language models offline, zero data to cloud — debug code, brainstorm prose, solve problems on flights, all privately on iPhone + iPad.',
    url: 'https://makersportal.com/apps/itria',
    icon: itria128,
    iconSet: { w64: itria64, w128: itria128, w256: itria256 },
    date: 'April 2026',
    dateIso: '2026-04-17',
    category: 'Productivity',
    platform: 'iOS (iPhone + iPad)',
    sequence: '008',
    accent: 'signal',
    techBadges: ['llama.cpp', 'Metal GPU', 'Offline LLM'],
    iconDot: { light: '#8C2F2C', dark: '#E6524A' }, // histogram #E6524A coral
    external: true,
  },
  {
    title: 'GridVerse',
    tagline: 'AI word game — Spell Bound + Lexify + Crossword Dash',
    description:
      'AI-powered word game: Spell Bound, Lexify, Crossword Dash — endless vocabulary puzzles, brain training, AI-generated crosswords for all skill levels, 100% on-device.',
    url: 'https://makersportal.com/apps/gridverse',
    icon: gridverse128,
    iconSet: { w64: gridverse64, w128: gridverse128, w256: gridverse256 },
    date: 'April 2026',
    dateIso: '2026-04-04',
    category: 'Game',
    platform: 'iOS (iPhone + iPad)',
    sequence: '009',
    accent: 'violet',
    techBadges: ['AI Word Gen', 'Lexify Engine', 'Offline Puzzles'],
    iconDot: { light: '#4E1A9E', dark: '#B59CDC' }, // histogram #631FCB purple
    external: true,
  },
  {
    title: 'MotionLink',
    tagline: 'Headphone Motion API + Spatial Audio',
    description:
      'Leverage Headphone Motion API (iOS 16) for real-time AirPods Pro head tracking: Spatial Audio prototyping, head-controlled interfaces, researcher data capture — direct low-latency sensor access on-device.',
    url: 'https://makersportal.com/apps/motionlink',
    icon: motionlink128,
    iconSet: { w64: motionlink64, w128: motionlink128, w256: motionlink256 },
    date: 'March 2026',
    dateIso: '2026-03-03',
    category: 'Developer Tool',
    platform: 'iOS (iPhone + iPad)',
    sequence: '010',
    accent: 'cyan',
    techBadges: ['Headphone Motion', 'Spatial Audio', 'CoreMotion'],
    iconDot: { light: '#0F4F6B', dark: '#4FC3E8' }, // histogram #09A1D2 cyan
    external: true,
  },
  {
    title: 'BLExAR',
    tagline: 'BLE Arduino control — HM-10, nRF52, CSV export',
    description:
      'Bluetooth Low Energy Arduino control: real-time pin control, live data plotting, raw serial terminal, CSV export — HM-10/CC254x/nRF52 modules, iPhone to hardware with zero cloud dependency.',
    url: 'https://makersportal.com/apps/blexar',
    icon: blexar128,
    iconSet: { w64: blexar64, w128: blexar128, w256: blexar256 },
    date: 'March 2026',
    dateIso: '2026-03-02',
    category: 'Utility',
    platform: 'iOS (iPhone + iPad)',
    sequence: '011',
    accent: 'emerald',
    techBadges: ['BLE Control', 'Arduino Bridge', 'CSV Logging'],
    iconDot: { light: '#1F4E54', dark: '#7FB8BE' }, // histogram #3C888F teal
    external: true,
  },
];
