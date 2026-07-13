/**
 * App navigation helpers — for hub + future subdomain AppSwitcher.
 * Centralizes related-app logic so subdomains can import same graph.
 */
import { apps, type AppEntry } from './apps';

export type AppNavLink = {
  title: string;
  tagline: string;
  url: string;
  category: string;
  sequence: string;
  external?: boolean;
  iconDot?: { light: string; dark: string };
};

export function getAppBySlug(slug: string): AppEntry | undefined {
  return apps.find((a) => a.url.includes(slug) || a.title.toLowerCase() === slug.toLowerCase());
}

export function getRelatedApps(currentTitle: string, limit = 3): AppEntry[] {
  const current = apps.find((a) => a.title === currentTitle);
  if (!current) return apps.slice(0, limit);
  const sameCategory = apps.filter((a) => a.category === current.category && a.title !== currentTitle);
  const others = apps.filter((a) => a.title !== currentTitle && a.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
}

export function getAppNavLinks(): AppNavLink[] {
  return apps.map((a) => ({
    title: a.title,
    tagline: a.tagline,
    url: a.url,
    category: a.category,
    sequence: a.sequence,
    external: a.external,
    iconDot: a.iconDot,
  }));
}

export function getNextPrevApps(currentTitle: string): { prev?: AppEntry; next?: AppEntry } {
  const idx = apps.findIndex((a) => a.title === currentTitle);
  if (idx === -1) return {};
  return {
    prev: apps[(idx - 1 + apps.length) % apps.length],
    next: apps[(idx + 1) % apps.length],
  };
}

export const legacyBridgeNote = {
  message:
    'Legacy apps live on makersportal.com and are being migrated to *.makerportal.ai — same privacy-first stack, transparent transition.',
  hubUrl: '/apps',
  journalUrl: 'https://makersportal.com/apps',
};
