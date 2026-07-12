export type AppCategory = 'Productivity' | 'Dashboard' | 'Utility' | 'Lifestyle';
export type AppAccent = 'signal' | 'violet' | 'rose' | 'amber';

export interface AppEntry {
  title: string;
  tagline: string;
  description: string;
  url: string;
  icon: string;
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
    icon: '/assets/app-icons/biquadia.svg',
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
    icon: '/assets/app-icons/thumbdash.svg',
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
    icon: '/assets/app-icons/notiary.svg',
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
    icon: '/assets/app-icons/popcloset.svg',
    date: 'May 2026',
    category: 'Lifestyle',
    platform: 'iOS + Web App',
    sequence: '001',
    accent: 'rose',
    techBadges: ['Computer Vision', 'Local Classifiers', 'CoreML Vision'],
  },
];

