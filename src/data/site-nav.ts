/**
 * Single source of truth for MakerPortal hub information architecture.
 * Distilled from large content properties (Smashing, Verge-class media, Wirecutter,
 * Substack/Medium hubs, SaaS mega-navs): ≤6 primary items, mega panels for density,
 * footer as full sitemap, socials/legal secondary, CTAs isolated.
 *
 * 2026-07-22 IA (D-024): Apps · Lab · Library · Blog · Shop · Studio
 * - Lab elevates /playground (32 instruments)
 * - Library owns daily engines (Edge AI Radar + Signals Journal) + gear/tools
 * - Signals demoted from primary (was peer of Resources — unclear job)
 * - Watch demoted to Studio/footer until real video series ship
 * URLs stable: /resources, /journal, /playground, /watch unchanged.
 *
 * Full research write-up: docs/RESEARCH-EMPIRE-IA.md
 * Decisions: docs/DECISIONS.md (D-002, D-005, D-024)
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
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/makerportal', external: true },
  { label: 'Instagram', href: 'https://www.instagram.com/makerportal/', external: true },
  { label: 'Reddit', href: 'https://www.reddit.com/user/Makerportal/', external: true },
  { label: 'Facebook', href: 'https://www.facebook.com/makerportal/', external: true },
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

/**
 * Top bar — 6 job-named primaries (NN/g scanability). D-024.
 * Order: product → try → learn → read → buy → company.
 *
 * Link integrity rules (prevent dead mega/footer links):
 * 1. Every internal href here must resolve to a real page or in-page hash that exists.
 * 2. New public routes: add page → hubRoutes → footer and/or mega → SearchModal
 *    category if needed → scripts/generate-llms.ts — same commit.
 * 3. Changing a primary `id` requires Layout.astro routeOwner update same commit.
 * 4. Do not re-add Signals or Watch as primaries without reversing D-024 in DECISIONS.md.
 * 5. Content roots stay put: /resources, /journal, /playground, /watch — only chrome moves.
 */
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
    id: 'lab',
    label: 'Lab',
    href: '/playground',
    columns: [
      {
        title: 'Instruments',
        links: [
          { label: 'All 32 instruments', href: '/playground', description: 'DSP · physics · edge AI' },
          { label: 'Live Earth', href: '/playground/globe', description: 'Weather · ISS · day/night' },
          { label: 'Biquad designer', href: '/playground/biquad-filter-designer', description: 'RBJ · DF2T core' },
          { label: 'CoreML size calc', href: '/playground/coreml-model-size-calculator', description: 'Quant math only' },
        ],
      },
      {
        title: 'Deployment labs',
        links: [
          { label: 'ElevenLabs DSP', href: '/playground/elevenlabs-dsp-sandbox', description: 'TTS → Web Audio rack' },
          { label: 'Vector recall lab', href: '/playground/vector-retrieval-recall-lab', description: 'Local Float32 ANN' },
          { label: 'WebGPU matmul', href: '/playground/modal-gpu-benchmarker', description: 'Whisper-tiny scale' },
          { label: 'Fly edge DB', href: '/playground/fly-edge-db-lab', description: 'LiteFS multi-region' },
        ],
      },
    ],
    featured: {
      kicker: '32 live · Zero install',
      title: 'Open the lab',
      description: 'Frontier research instruments — grounded app math where we ship it, rigorous physics elsewhere. No account, no cloud runtime tax.',
      href: '/playground',
      cta: 'Enter playground →',
    },
  },
  {
    id: 'library',
    label: 'Library',
    href: '/resources',
    columns: [
      {
        title: 'Daily engines',
        links: [
          { label: 'Edge AI Radar', href: '/resources/edge-ai-radar', description: 'GGUF × board ceilings', badge: 'Daily' },
          { label: 'Signals Journal', href: '/journal', description: 'Trend backlog archive', badge: 'Daily' },
          { label: 'Latest signals', href: '/journal/latest', description: 'Today’s scan' },
        ],
      },
      {
        title: 'Reference',
        links: [
          { label: 'Library hub', href: '/resources', description: 'Radar · gear · tools' },
          { label: 'Curated gear', href: '/resources#gear', description: 'Hardware picks' },
          { label: 'Tools we use', href: '/resources#tools', description: 'Studio toolchain' },
          { label: 'Agent map', href: '/llms', description: 'llms.txt index' },
        ],
      },
    ],
    featured: {
      kicker: 'Daily · Deterministic',
      title: 'Edge AI Radar',
      description: 'Fresh Hugging Face GGUF/ONNX releases sized against real board memory ceilings — verified file bytes × 1.25, datasheet constants only.',
      href: '/resources/edge-ai-radar',
      cta: 'Open radar matrix →',
    },
  },
  {
    id: 'blog',
    label: 'Blog',
    href: '/blog',
    columns: [
      {
        title: 'Field notes',
        links: [
          { label: 'All posts', href: '/blog', description: 'Building in public' },
          { label: 'RSS feed', href: '/rss.xml', description: 'Subscribe in any reader' },
          { label: 'Studio journal', href: 'https://makersportal.com', description: 'Longer essays', external: true },
        ],
      },
      {
        title: 'Formats',
        links: [
          { label: 'Articles', href: '/blog#articles', description: 'Essays & craft notes' },
        ],
      },
    ],
    featured: {
      kicker: 'Human-authored',
      title: 'Thinking in public',
      description: 'CoreML experiments, SwiftUI edges, shipping discipline — field notes, not automated digests.',
      href: '/blog',
      cta: 'Read blog →',
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
          { label: 'Archives', href: '/shop#products', description: 'Code packs & templates' },
        ],
      },
      {
        title: 'Partners',
        links: [
          { label: 'Advertise', href: '/advertise', description: 'Sponsor the hub' },
        ],
      },
    ],
    featured: {
      kicker: 'First-party archives',
      title: 'Shop the archive',
      description: 'Real code from real builds — MoR tax via Lemon Squeezy. Affiliate gear lives under Library with full disclosure.',
      href: '/shop',
      cta: 'Open shop →',
    },
  },
  {
    id: 'studio',
    label: 'Studio',
    href: '/about',
    columns: [
      {
        title: 'Company',
        links: [
          { label: 'About', href: '/about', description: 'SF studio · ethos' },
          { label: 'Team', href: '/team', description: 'People & roles' },
          { label: 'Contact', href: '/contact', description: 'Human inbox' },
          { label: 'Press / kit', href: '/press', description: 'Logos & facts' },
        ],
      },
      {
        title: 'Media & connect',
        links: [
          { label: 'Watch', href: '/watch', description: 'Video surface (scaffold)' },
          { label: 'YouTube', href: 'https://www.youtube.com/@MakerPortal', description: 'Demos & ship logs', external: true },
          { label: 'GitHub', href: 'https://github.com/makerportal', external: true },
          { label: 'X / Twitter', href: 'https://x.com/maker_portal', external: true },
        ],
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
      { label: 'Lab', href: '/playground' },
      { label: 'Library', href: '/resources' },
      { label: 'Edge AI Radar', href: '/resources/edge-ai-radar' },
      { label: 'Signals Journal', href: '/journal' },
      { label: 'Blog', href: '/blog' },
      { label: 'Shop', href: '/shop' },
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
      { label: 'Watch', href: '/watch' },
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
  { path: '/playground', priority: '0.95', changefreq: 'weekly' },
  { path: '/resources', priority: '0.95', changefreq: 'daily' },
  { path: '/resources/edge-ai-radar', priority: '0.95', changefreq: 'daily' },
  { path: '/blog', priority: '0.95', changefreq: 'weekly' },
  { path: '/journal', priority: '0.85', changefreq: 'daily' },
  { path: '/playground/agentic-dsp-pipeline', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/biquad-filter-designer', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/ble-gatt-visualizer', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/coreml-model-size-calculator', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/head-tracked-stereo-pan', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/quaternion-euler-converter', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/elevenlabs-dsp-sandbox', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/vector-retrieval-recall-lab', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground/fourier-epicycles', priority: '0.75', changefreq: 'monthly' },
  { path: '/playground/globe', priority: '0.8', changefreq: 'daily' },
  { path: '/playground/double-pendulum', priority: '0.75', changefreq: 'monthly' },
  { path: '/playground/chladni-cymatics', priority: '0.75', changefreq: 'monthly' },
  { path: '/playground/n-body-choreography', priority: '0.75', changefreq: 'monthly' },
  { path: '/shop', priority: '0.9', changefreq: 'weekly' },
  { path: '/watch', priority: '0.5', changefreq: 'monthly' },
  { path: '/about', priority: '0.85', changefreq: 'monthly' },
  { path: '/team', priority: '0.85', changefreq: 'monthly' },
  { path: '/contact', priority: '0.85', changefreq: 'monthly' },
  { path: '/press', priority: '0.7', changefreq: 'monthly' },
  { path: '/advertise', priority: '0.75', changefreq: 'monthly' },
  { path: '/llms', priority: '0.7', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms', priority: '0.5', changefreq: 'yearly' },
];
