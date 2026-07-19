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
