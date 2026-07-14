/**
 * Amazon Associates picks — SSOT. Empty until real gear is added; the
 * "Gear" section and disclosure only render when this has entries (no
 * placeholder/fake listings shipped). PA-API/Creators API are not wired
 * up (PA-API sunset May 2026, Creators API needs a qualified-sales history
 * we don't have on this property yet) — static links only, no live price.
 */
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
};

export const affiliateLinks: AffiliateLink[] = [
  {
    id: 'behringer-umc1820',
    label: 'Behringer UMC1820',
    asin: 'B01EXI8Y9S',
    note: 'Audio interface used building Biquadia — 8-preamp USB I/O for real-time DSP testing.',
    category: 'Audio interface',
    relatedTo: ['inside-biquadia'],
  },
];
