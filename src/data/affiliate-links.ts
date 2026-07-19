/**
 * Affiliate picks — SSOT is affiliate-links.json (hand-edited; the
 * "Gear" section and disclosure only render when it has entries — no
 * placeholder/fake listings shipped). Live title/image/price for Amazon
 * ASINs come from amazon-catalog.json, a committed cache built by
 * scripts/amazon/build-catalog.mjs (Creators API GetItems, human-reviewed
 * PR, see docs/DECISIONS.md D-012). Which products exist here is still 100%
 * human-curated — only the display data for a chosen ASIN is automated.
 *
 * Non-Amazon merchants (SparkFun, PCB houses, …) use merchant + path/sku
 * with optional static image/price on the link row.
 */
import affiliateLinksData from './affiliate-links.json';
import amazonCatalog from './amazon-catalog.json';

export const AMAZON_ASSOCIATE_TAG = 'engineersport-20';

/** SparkFun Amasty Affiliate code — public referral id (appended as ?ref=). */
export const SPARKFUN_AFFILIATE_CODE = 'rOtrc44SZw';

export const SPARKFUN_BASE = 'https://www.sparkfun.com';

/** PCB fabrication partners: PCBWay referral is live; JLCPCB remains an empty, owner-gated stub. */
export const PCBWAY_BASE = 'https://www.pcbway.com';
export const JLCPCB_BASE = 'https://jlcpcb.com';

/**
 * PCBWay referral / Shared Project param.
 * Referral LIVE 2026-07-19: https://pcbway.com/g/VJp6Xm (5% first order + $10 coupon).
 * Shared Projects (10% PCB + 10% SMT) still pending — needs real boards, roadmap docs/FAB-ROADMAP-SHARED.md.
 * JLCPCB shelved — same audience, low ROI until traffic.
 */
export const PCBWAY_REFERRAL_CODE: string = 'https://pcbway.com/g/VJp6Xm';
export const PCBWAY_SHARED_PROJECTS: Record<string, string> = {
  // Shared Projects pending — roadmap, not fake URLs
  // 'signal-integrity-lab': 'https://www.pcbway.com/project/shareproject/SI_50_Ohm_Coupon_...',
  // 'antenna-em-sandbox': 'https://www.pcbway.com/project/shareproject/Patch_2.4GHz_...',
  // 'verilog-live-sculptor': 'https://www.pcbway.com/project/shareproject/FPGA_Carrier_...',
};

/** JLCPCB Brand Advocate / referral. Empty until owner approval lands. */
export const JLCPCB_REFERRAL_CODE: string = ''; // coupon / referral param — owner to fill
export const JLCPCB_SPONSORSHIP_URL: string = ''; // brand advocate page if exists

/**
 * SaaS / GPU-cloud partners (docs/SAAS-GPU-MONETIZATION.md).
 * Same integrity rule as PCB fab: no fake IDs shipped. An empty constant makes
 * that provider render as a clean informational link (rel="noopener noreferrer",
 * no "sponsored"); a verified destination flips only that provider to
 * rel="sponsored noopener noreferrer" via buildSaasPartnerUrl.
 *
 * - ElevenLabs: PartnerStack, 22% recurring 12 mo (commission to us, NOT a
 *   user-facing discount — never phrase it as "22% off" in UI copy).
 * - Pinecone: official creator/educator affiliate application exists, but the
 *   public page does not disclose a rate. Keep empty until MakerPortal is
 *   accepted and receives its own URL; never state a commission percentage.
 * - Modal / Fly.io: no public affiliate program — permanently informational;
 *   monetized via DevRel credit-grant pitches instead.
 */
export const ELEVENLABS_PARTNER_URL: string = 'https://try.elevenlabs.io/jzowx8mw6p6b'; // approved PartnerStack destination
export const PINECONE_PARTNER_URL: string = ''; // approval pending; accept only the issued destination URL, never an API key
export const MODAL_REFERRAL_URL: string = ''; // no public program; keep '' unless one appears
export const FLY_REFERRAL_URL: string = ''; // no public program; keep '' unless one appears

export function buildSaasPartnerUrl(
  partnerUrl: string,
  fallbackUrl: string
): { url: string; isAffiliate: boolean; rel: string } {
  const isAffiliate = Boolean(partnerUrl);
  return {
    url: partnerUrl || fallbackUrl,
    isAffiliate,
    rel: isAffiliate ? 'sponsored noopener noreferrer' : 'noopener noreferrer',
  };
}

export type AffiliateMerchant =
  | 'amazon'
  | 'sparkfun'
  | 'pcbway'
  | 'jlcpcb'
  | 'digikey'
  | 'mouser'
  | 'dfrobot'
  | 'other';

export function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

/**
 * Build a tracked SparkFun URL. `path` is a product slug like
 * `raspberry-pi-5-8gb.html` or a full https URL on sparkfun.com.
 * Commission is 10% on SparkFun Originals only (third-party SKUs still get
 * the referral cookie but may pay $0).
 */
export function buildSparkFunUrl(path: string): string {
  const base = path.startsWith('http')
    ? path
    : `${SPARKFUN_BASE}/${path.replace(/^\//, '')}`;
  const url = new URL(base);
  url.searchParams.set('ref', SPARKFUN_AFFILIATE_CODE);
  return url.toString();
}

export function buildPcbWayUrl(pathOrUrl: string): string {
  // If full shared-project URL already provided (owner), return as-is
  if (!pathOrUrl) {
    if (PCBWAY_REFERRAL_CODE) {
      // Generic referral landing — if inviteid style
      if (PCBWAY_REFERRAL_CODE.startsWith('http')) return PCBWAY_REFERRAL_CODE;
      return `${PCBWAY_BASE}/setinvite.aspx?inviteid=${PCBWAY_REFERRAL_CODE}`;
    }
    return `${PCBWAY_BASE}/`;
  }
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  const base = `${PCBWAY_BASE}/${pathOrUrl.replace(/^\//, '')}`;
  if (PCBWAY_REFERRAL_CODE && !PCBWAY_REFERRAL_CODE.startsWith('http')) {
    const url = new URL(base);
    url.searchParams.set('from', PCBWAY_REFERRAL_CODE);
    return url.toString();
  }
  return base;
}

export function buildJlcUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) {
    if (JLCPCB_SPONSORSHIP_URL) return JLCPCB_SPONSORSHIP_URL;
    if (JLCPCB_REFERRAL_CODE) {
      if (JLCPCB_REFERRAL_CODE.startsWith('http')) return JLCPCB_REFERRAL_CODE;
      return `${JLCPCB_BASE}/?from=${JLCPCB_REFERRAL_CODE}`;
    }
    return `${JLCPCB_BASE}/`;
  }
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  const base = `${JLCPCB_BASE}/${pathOrUrl.replace(/^\//, '')}`;
  if (JLCPCB_REFERRAL_CODE && !JLCPCB_REFERRAL_CODE.startsWith('http')) {
    const url = new URL(base);
    url.searchParams.set('ref', JLCPCB_REFERRAL_CODE);
    return url.toString();
  }
  return base;
}

export function isFabLive(): { pcbway: boolean; jlcpcb: boolean } {
  const pcbway = Boolean(PCBWAY_REFERRAL_CODE || Object.keys(PCBWAY_SHARED_PROJECTS).length > 0);
  const jlcpcb = Boolean(JLCPCB_REFERRAL_CODE || JLCPCB_SPONSORSHIP_URL);
  return { pcbway, jlcpcb };
}

export type AffiliateLink = {
  id: string;
  label: string;
  /** Amazon ASIN / ISBN-10. Optional when merchant !== amazon. */
  asin?: string;
  note: string;
  category: string;
  /** Defaults to amazon when asin is present. */
  merchant?: AffiliateMerchant;
  /**
   * SparkFun product path (e.g. `teensy-4-0.html`) or full partner URL.
   * For sparkfun merchant, prefer path + buildSparkFunUrl at resolve time.
   */
  externalUrl?: string;
  /** Partner SKU / part number for display. */
  sku?: string;
  /** True when SparkFun pays Originals commission on this SKU. */
  sparkfunOriginal?: boolean;
  /** Static display fields for non-Amazon merchants (hand-curated). */
  image?: string;
  price?: string;
  currency?: string;
  /** Related content, e.g. blog post slugs or simulator ids — editorial placement only. */
  relatedTo?: string[];
  /** Shared vocabulary with src/data/trends.ts pillarMeta — soft link only, no pipeline coupling. */
  pillars?: string[];
};

export type AmazonCatalogEntry = {
  title: string;
  image?: string;
  features?: string[];
  detailPageURL: string;
  price?: string;
  currency?: string;
};

export type ResolvedAffiliateLink = AffiliateLink & {
  title: string;
  image?: string;
  price?: string;
  currency?: string;
  url: string;
  merchant: AffiliateMerchant;
};

export const affiliateLinks: AffiliateLink[] = affiliateLinksData as AffiliateLink[];

function resolveMerchant(link: AffiliateLink): AffiliateMerchant {
  if (link.merchant) return link.merchant;
  if (link.externalUrl && !link.asin) return 'other';
  return 'amazon';
}

function formatMoney(price?: string): string | undefined {
  if (!price) return undefined;
  if (price.startsWith('$')) return price;
  const n = parseFloat(price);
  if (!Number.isFinite(n)) return price;
  return `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
}

/**
 * Merges a curated pick with its live catalog entry (if the cache has one
 * yet). Falls back to the hand-typed label/note and a statically-built URL
 * when live data is missing — pre-first-run stub, a throttled/failed
 * lookup, or a discontinued ASIN should never break the page or show stale
 * data.
 */
export function resolveAffiliateLink(link: AffiliateLink): ResolvedAffiliateLink {
  const merchant = resolveMerchant(link);

  if (merchant === 'sparkfun') {
    const path = link.externalUrl ?? link.sku ?? '';
    return {
      ...link,
      merchant: 'sparkfun',
      title: link.label,
      image: link.image,
      price: formatMoney(link.price),
      currency: link.currency ?? 'USD',
      url: path ? buildSparkFunUrl(path) : `${SPARKFUN_BASE}/?ref=${SPARKFUN_AFFILIATE_CODE}`,
    };
  }

  if (merchant === 'pcbway') {
    const path = link.externalUrl ?? '';
    return {
      ...link,
      merchant: 'pcbway',
      title: link.label,
      image: link.image,
      price: formatMoney(link.price),
      currency: link.currency ?? 'USD',
      url: path ? buildPcbWayUrl(path) : buildPcbWayUrl(''),
    };
  }

  if (merchant === 'jlcpcb') {
    const path = link.externalUrl ?? '';
    return {
      ...link,
      merchant: 'jlcpcb',
      title: link.label,
      image: link.image,
      price: formatMoney(link.price),
      currency: link.currency ?? 'USD',
      url: path ? buildJlcUrl(path) : buildJlcUrl(),
    };
  }

  if (merchant !== 'amazon') {
    return {
      ...link,
      merchant,
      title: link.label,
      image: link.image,
      price: formatMoney(link.price),
      currency: link.currency ?? 'USD',
      url: link.externalUrl ?? '#',
    };
  }

  const asin = link.asin ?? '';
  const live = asin
    ? (amazonCatalog.items as Record<string, AmazonCatalogEntry>)[asin]
    : undefined;

  return {
    ...link,
    merchant: 'amazon',
    title: live?.title ?? link.label,
    image: live?.image ?? link.image,
    price: live?.price ?? formatMoney(link.price),
    currency: live?.currency ?? link.currency,
    url: live?.detailPageURL ?? (asin ? buildAmazonUrl(asin) : (link.externalUrl ?? '#')),
  };
}
