export type AppCategory = 'Productivity' | 'Dashboard' | 'Utility' | 'Lifestyle';

export interface AppEntry {
  title: string;
  description: string;
  url: string;
  icon: string;
  date: string;
  category: AppCategory;
  featured?: boolean;
}

export const apps: AppEntry[] = [
  {
    title: 'Thumb-Dash',
    description: 'High-visibility dynamic layouts for real-time portfolio tracking.',
    url: 'https://thumbdash.makerportal.ai',
    icon: '/assets/app-icons/thumbdash.svg',
    date: 'July 2026',
    category: 'Dashboard',
    featured: true,
  },
  {
    title: 'Notiary',
    description: 'An agile Markdown note-taking environment optimized for fast personal reference.',
    url: 'https://notiary.makerportal.ai',
    icon: '/assets/app-icons/notiary.svg',
    date: 'June 2026',
    category: 'Productivity',
  },
  {
    title: 'PopCloset',
    description: 'Visual wardrobe management for building and organizing a minimalist capsule closet.',
    url: 'https://popcloset.makerportal.ai',
    icon: '/assets/app-icons/popcloset.svg',
    date: 'May 2026',
    category: 'Lifestyle',
  },
];
