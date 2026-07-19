/**
 * Newsletter config — SSOT for Buttondown integration.
 * Privacy-first, telemetry-free: no tracking pixels, D-014 compliant.
 *
 * Owner action:
 * 1. Create account at https://buttondown.com
 * 2. Copy username (e.g. "makerportal") from dashboard URL or settings
 * 3. Set BUTTONDOWN_USERNAME below or via env PUBLIC_BUTTONDOWN_USERNAME
 *
 * When username is empty, signup forms render "Coming soon" placeholder
 * and ExportGate only uses localStorage (no Buttondown POST) — still compliant.
 */

export const BUTTONDOWN_USERNAME: string =
  // Allow env override for future Vercel integration without code change
  (typeof import.meta !== 'undefined' && (import.meta.env as any).PUBLIC_BUTTONDOWN_USERNAME) || '';

export const BUTTONDOWN_ENABLED = Boolean(BUTTONDOWN_USERNAME);

export const BUTTONDOWN_EMBED_URL = BUTTONDOWN_USERNAME
  ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`
  : '';

// Tags used for Buttondown subscriber segmentation
export const NEWSLETTER_TAGS = {
  general: 'makerportal-hub',
  blog: 'blog-reader',
  shop: 'shop-interest',
  resources: 'resources',
  exportGate: (simId: string) => `export-${simId}`,
} as const;

export const NEWSLETTER_CONFIG = {
  username: BUTTONDOWN_USERNAME,
  enabled: BUTTONDOWN_ENABLED,
  embedUrl: BUTTONDOWN_EMBED_URL,
  provider: 'buttondown',
  privacyNote: 'No tracking pixels, markdown-friendly, unsubscribe anytime — privacy-first per D-014',
  rss: '/rss.xml',
  freeLimit: 100,
  pricingNote: 'Free first 100, $9/mo per addon',
} as const;
