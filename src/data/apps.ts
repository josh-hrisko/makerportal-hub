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
  featured?: boolean;
}

export const apps: AppEntry[] = [
  {
    title: 'Biquadia',
    tagline: 'An audio laboratory in your pocket.',
    description: 'Professional DSP, spectral analysis, spatial audio, and neural enhancement—engineered to run privately on-device.',
    url: 'https://biquadia.makerportal.ai',
    icon: '/assets/app-icons/biquadia.svg',
    date: 'July 2026',
    category: 'Utility',
    platform: 'iPhone + iPad',
    sequence: '004',
    accent: 'signal',
    featured: true,
  },
  {
    title: 'Thumb-Dash',
    tagline: 'The market, readable at a glance.',
    description: 'High-visibility dynamic layouts for tracking a portfolio without drowning in financial noise.',
    url: 'https://thumbdash.makerportal.ai',
    icon: '/assets/app-icons/thumbdash.svg',
    date: 'July 2026',
    category: 'Dashboard',
    platform: 'Web',
    sequence: '003',
    accent: 'amber',
  },
  {
    title: 'Notiary',
    tagline: 'Notes that get out of your way.',
    description: 'A fast Markdown environment designed for personal knowledge, durable reference, and quiet focus.',
    url: 'https://notiary.makerportal.ai',
    icon: '/assets/app-icons/notiary.svg',
    date: 'June 2026',
    category: 'Productivity',
    platform: 'Web',
    sequence: '002',
    accent: 'violet',
  },
  {
    title: 'PopCloset',
    tagline: 'A calmer way to know what you own.',
    description: 'Visual wardrobe management for building, editing, and enjoying a more intentional capsule closet.',
    url: 'https://popcloset.makerportal.ai',
    icon: '/assets/app-icons/popcloset.svg',
    date: 'May 2026',
    category: 'Lifestyle',
    platform: 'Web',
    sequence: '001',
    accent: 'rose',
  },
];
