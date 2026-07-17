/**
 * Single source of truth for MakerPortal hub information architecture.
 * Distilled from large content properties (Smashing, Verge-class media, Wirecutter,
 * Substack/Medium hubs, SaaS mega-navs): 5–7 primary items, mega panels for density,
 * footer as full sitemap, socials/legal secondary, CTAs isolated.
 *
 * Full research write-up: docs/RESEARCH-EMPIRE-IA.md
 * Decisions: docs/DECISIONS.md (D-002, D-005)
 */

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  badge?: string;
};

export type NavColumn = {
  title: string;
  links: NavLink[];
};

export type PrimaryNavItem = {
  id: string;
  label: string;
  href: string;
  /** Optional mega panel; omit for simple link */
  columns?: NavColumn[];
  featured?: {
    kicker: string;
    title: string;
    description: string;
    href: string;
    cta: string;
  };
};

export type FooterColumn = {
  title: string;
  links: NavLink[];
};

export const socials: NavLink[] = [
  { label: 'GitHub', href: 'https://github.com/makerportal', external: true },
  { label: 'X / Twitter', href: 'https://x.com/maker_portal', external: true },
  { label: 'YouTube', href: 'https://www.youtube.com/@MakerPortal', external: true },
  // Ecosystem cluster — same-tab per D-009, not blank
  { label: 'Studio journal', href: 'https://makersportal.com', external: false },
  { label: 'RSS', href: '/rss.xml' },
];

/**
 * Product links — now 11 live. Keep in sync with src/data/apps.ts.
 * Future: generate dynamically from apps.ts import (requires Astro asset handling).
 * For now manual to keep site-nav.ts pure (no ImageMetadata deps).
 */
/**
 * Product links are part of the same ecosystem cluster (makerportal.ai + makersportal.com legacy).
 * They open same-tab (no new tab) — back button works, one tab per journey.
 * Truly external (GitHub, X, YouTube) remain target=_blank.
 */
export const productLinks: NavLink[] = [
  { label: 'AuraLinter', href: 'https://auralinter.makerportal.ai', description: 'Agentic DSP Orchestrator' },
  { label: 'Biquadia', href: 'https://biquadia.makerportal.ai', description: 'Neural DSP lab' },
  { label: 'Thumb-Dash', href: 'https://thumbdash.makerportal.ai', description: 'Speed-texting battleground' },
  { label: 'nymic', href: 'https://makersportal.com/apps/nymic', description: 'Vocal engine • kNN-VC' },
  { label: 'Notiary', href: 'https://notiary.makerportal.ai', description: 'Semantic notes' },
  { label: 'akous', href: 'https://makersportal.com/apps/akous', description: 'Generative audio • ANE' },
  { label: 'PopCloset', href: 'https://popcloset.makerportal.ai', description: 'Vision wardrobe' },
  { label: 'itria', href: 'https://makersportal.com/apps/itria', description: 'On-device LLM • Metal' },
  { label: 'GridVerse', href: 'https://makersportal.com/apps/gridverse', description: 'AI word game' },
  { label: 'MotionLink', href: 'https://makersportal.com/apps/motionlink', description: 'Head tracking • Spatial' },
  { label: 'BLExAR', href: 'https://makersportal.com/apps/blexar', description: 'BLE Arduino • CSV export' },
];

/** Top bar — keep ≤7 for scanability (NN/g + 2025–26 mega-menu research). */
export const primaryNav: PrimaryNavItem[] = [
  {
    id: 'apps',
    label: 'Apps',
    href: '/apps',
    columns: [
      {
        title: 'Studio catalog',
        links: [
          { label: 'Application matrix', href: '/apps', description: 'All live titles' },
          { label: 'On-device stack', href: '/#tech-title', description: 'ANE · CoreML · Metal' },
        ],
      },
      {
        title: 'Products',
        links: productLinks,
      },
    ],
    featured: {
      kicker: '11 products • Subdomains + legacy',
      title: 'Open the matrix',
      description: 'Hub indexes the studio. New products live on *.makerportal.ai, legacy apps on makersportal.com are migrating — transparent bridge, no hidden catalog.',
      href: '/apps',
      cta: 'View 11 apps →',
    },
  },
  {
    id: 'notes',
    label: 'Journal',
    href: '/blog',
    columns: [
      {
        title: 'Field notes',
        links: [
          { label: 'All notes', href: '/blog', description: 'Building in public' },
          { label: 'RSS feed', href: '/rss.xml', description: 'Subscribe in any reader' },
          { label: 'Studio journal', href: 'https://makersportal.com', description: 'Longer essays', external: true },
        ],
      },
      {
        title: 'Formats',
        links: [
          { label: 'Articles', href: '/blog#articles', description: 'Essays & craft notes' },
          { label: 'Sponsored', href: '/advertise', description: 'Partner placements', badge: 'Open' },
        ],
      },
    ],
    featured: {
      kicker: 'Content engine',
      title: 'Thinking in public',
      description: 'CoreML experiments, SwiftUI edges, shipping discipline — the fuel for SEO, AEO, and social.',
      href: '/blog',
      cta: 'Read notes →',
    },
  },
  {
    id: 'learn',
    label: 'Guides',
    href: '/resources',
    columns: [
      {
        title: 'Resources',
        links: [
          { label: 'Resource hub', href: '/resources', description: 'Guides & downloads' },
          { label: 'Agent map', href: '/llms', description: 'Human + AI index (llms.txt)' },
        ],
      },
      {
        title: 'On this page',
        links: [
          { label: 'Signals we’re tracking', href: '/resources#trending', description: 'Trend digest' },
          { label: 'Playground', href: '/playground', description: 'Interactive tools & toys' },
          { label: 'Tools we use', href: '/resources#tools', description: 'Studio toolchain' },
          { label: 'Gear', href: '/resources#gear', description: 'Hardware picks' },
        ],
      },
    ],
    featured: {
      kicker: 'Scale-ready library',
      title: 'Learn the stack',
      description: 'Topic hubs, downloads, and affiliate-ready tool guides — structured for millions of sessions.',
      href: '/resources',
      cta: 'Browse resources →',
    },
  },
  {
    id: 'shop',
    label: 'Shop',
    href: '/shop',
    columns: [
      {
        title: 'Store',
        links: [
          { label: 'All products', href: '/shop', description: 'Digital goods' },
          { label: 'Code packs', href: '/shop#products', description: 'Archives & starters' },
          { label: 'Templates', href: '/shop#products', description: 'UI & project kits' },
        ],
      },
      {
        title: 'Partners',
        links: [
          { label: 'Affiliate picks', href: '/resources#tools', description: 'Tools we use' },
          { label: 'Advertise', href: '/advertise', description: 'Sponsor the hub' },
        ],
      },
    ],
    featured: {
      kicker: 'Monetization surface',
      title: 'Shop the archive',
      description: 'Downloads, code packs, and curated gear — transparent affiliate disclosures where used.',
      href: '/shop',
      cta: 'Open shop →',
    },
  },
  {
    id: 'watch',
    label: 'Watch',
    href: '/watch',
  },
  {
    id: 'studio',
    label: 'About',
    href: '/about',
    columns: [
      {
        title: 'Company',
        links: [
          { label: 'About', href: '/about', description: 'SF studio · ethos' },
          { label: 'Team', href: '/team', description: 'People & roles' },
          { label: 'Contact', href: '/contact', description: 'Human inbox' },
          { label: 'Press / kit', href: '/press', description: 'Logos & facts' },
          { label: 'Advertise', href: '/advertise', description: 'Sponsorships' },
        ],
      },
      {
        title: 'Connect',
        links: socials,
      },
    ],
    featured: {
      kicker: 'MakerPortal',
      title: 'Independent, on-device',
      description: 'San Francisco studio shipping privacy-first iOS software — and a media layer around the craft.',
      href: '/about',
      cta: 'About the studio →',
    },
  },
];

export const footerColumns: FooterColumn[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Apps', href: '/apps' },
      { label: 'Journal', href: '/blog' },
      { label: 'Guides', href: '/resources' },
      { label: 'Shop', href: '/shop' },
      { label: 'Watch', href: '/watch' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Team', href: '/team' },
      { label: 'Contact', href: '/contact' },
      { label: 'Press kit', href: '/press' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Journal ↗', href: 'https://makersportal.com', external: true },
    ],
  },
  {
    title: 'Products',
    links: productLinks,
  },
  {
    title: 'Connect',
    links: socials,
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Affiliate disclosure', href: '/privacy#affiliates' },
      { label: 'Sitemap', href: '/sitemap.xml' },
    ],
  },
];

/** Hub routes for sitemap (internal only). */
export const hubRoutes: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/apps', priority: '0.95', changefreq: 'weekly' },
  { path: '/blog', priority: '0.95', changefreq: 'weekly' },
  { path: '/resources', priority: '0.9', changefreq: 'weekly' },
  { path: '/playground', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/quaternion-euler-converter', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/fourier-epicycles', priority: '0.75', changefreq: 'monthly' },
  { path: '/playground/globe', priority: '0.75', changefreq: 'daily' },
  { path: '/playground/double-pendulum', priority: '0.75', changefreq: 'monthly' },
  { path: '/playground/chladni-cymatics', priority: '0.75', changefreq: 'monthly' },
  { path: '/shop', priority: '0.9', changefreq: 'weekly' },
  { path: '/watch', priority: '0.85', changefreq: 'weekly' },
  { path: '/about', priority: '0.85', changefreq: 'monthly' },
  { path: '/team', priority: '0.85', changefreq: 'monthly' },
  { path: '/contact', priority: '0.85', changefreq: 'monthly' },
  { path: '/press', priority: '0.7', changefreq: 'monthly' },
  { path: '/advertise', priority: '0.75', changefreq: 'monthly' },
  { path: '/llms', priority: '0.7', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms', priority: '0.5', changefreq: 'yearly' },
];
