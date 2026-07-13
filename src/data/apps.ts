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

export type AppCategory = 'Productivity' | 'Dashboard' | 'Utility' | 'Lifestyle';
export type AppAccent = 'signal' | 'violet' | 'rose' | 'amber';

export interface AppEntry {
  title: string;
  tagline: string;
  description: string;
  url: string;
  icon: ImageMetadata;
  iconSet: { w64: ImageMetadata; w128: ImageMetadata; w256: ImageMetadata };
  date: string;
  category: AppCategory;
  platform: string;
  sequence: string;
  accent: AppAccent;
  techBadges: string[];
  featured?: boolean;
}

export const apps: AppEntry[] = [
  {
    title: 'Biquadia',
    tagline: 'Local Neural DSP & Sound Laboratory',
    description: 'Professional real-time digital signal processing, spatial audio rendering, and on-device neural enhancement models running privately on Apple Silicon.',
    url: 'https://biquadia.makerportal.ai',
    icon: biquadia128,
    iconSet: { w64: biquadia64, w128: biquadia128, w256: biquadia256 },
    date: 'July 2026',
    category: 'Utility',
    platform: 'iOS (iPhone + iPad)',
    sequence: '004',
    accent: 'signal',
    techBadges: ['CoreML', 'Neural Engine (ANE)', 'Metal Shaders', 'Native Swift'],
    featured: true,
  },
  {
    title: 'Thumb-Dash',
    tagline: 'AI-Driven Portfolio Intelligence',
    description: 'High-visibility dashboards featuring real-time financial tracking and on-device machine learning for anomaly detection and trend forecasting without data sharing.',
    url: 'https://thumbdash.makerportal.ai',
    icon: thumbdash128,
    iconSet: { w64: thumbdash64, w128: thumbdash128, w256: thumbdash256 },
    date: 'July 2026',
    category: 'Dashboard',
    platform: 'iOS + Web App',
    sequence: '003',
    accent: 'amber',
    techBadges: ['Local ML', 'Anomaly Detection', 'Metal Compute'],
  },
  {
    title: 'Notiary',
    tagline: 'Markdown space with a local semantic brain',
    description: 'A distraction-free markdown note-taking workspace equipped with local vector embeddings and semantic search that indexes your thoughts entirely offline.',
    url: 'https://notiary.makerportal.ai',
    icon: notiary128,
    iconSet: { w64: notiary64, w128: notiary128, w256: notiary256 },
    date: 'June 2026',
    category: 'Productivity',
    platform: 'iOS + Web App',
    sequence: '002',
    accent: 'violet',
    techBadges: ['Semantic Indexing', 'Vector Embeddings', 'Offline CoreML'],
  },
  {
    title: 'PopCloset',
    tagline: 'Intelligent wardrobe indexing & capsule design',
    description: 'Visual wardrobe tracking powered by on-device computer vision to auto-categorize apparel, extract color palettes, and build capsules.',
    url: 'https://popcloset.makerportal.ai',
    icon: popcloset128,
    iconSet: { w64: popcloset64, w128: popcloset128, w256: popcloset256 },
    date: 'May 2026',
    category: 'Lifestyle',
    platform: 'iOS + Web App',
    sequence: '001',
    accent: 'rose',
    techBadges: ['Computer Vision', 'Local Classifiers', 'CoreML Vision'],
  },
];

