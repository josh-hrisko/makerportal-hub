/**
 * Amazon Associates picks — SSOT is affiliate-links.json (hand-edited; the
 * "Gear" section and disclosure only render when it has entries — no
 * placeholder/fake listings shipped). Live title/image/price come from
 * amazon-catalog.json, a committed cache built by
 * scripts/amazon/build-catalog.mjs (Creators API GetItems, human-reviewed
 * PR, see docs/DECISIONS.md D-012). Which ASINs exist here is still 100%
 * human-curated — only the display data for a chosen ASIN is automated.
 */
import affiliateLinksData from './affiliate-links.json';
import amazonCatalog from './amazon-catalog.json';

export const AMAZON_ASSOCIATE_TAG = 'engineersport-20';

export function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

export type AffiliateLink = {
  id: string;
  label: string;
  asin: string;
  note: string;
  category: string;
  /** Related content, e.g. blog post slugs — for editorial placement, not routing. */
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
};

export const affiliateLinks: AffiliateLink[] = affiliateLinksData as AffiliateLink[];

/**
 * Merges a curated pick with its live catalog entry (if the cache has one
 * yet). Falls back to the hand-typed label/note and a statically-built URL
 * when live data is missing — pre-first-run stub, a throttled/failed
 * lookup, or a discontinued ASIN should never break the page or show stale
 * data.
 */
export function resolveAffiliateLink(link: AffiliateLink): ResolvedAffiliateLink {
  const live = (amazonCatalog.items as Record<string, AmazonCatalogEntry>)[link.asin];
  return {
    ...link,
    title: live?.title ?? link.label,
    image: live?.image,
    price: live?.price,
    currency: live?.currency,
    url: live?.detailPageURL ?? buildAmazonUrl(link.asin),
  };
}
