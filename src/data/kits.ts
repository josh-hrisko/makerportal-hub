import kitsData from './kits.json';
import { affiliateLinks, resolveAffiliateLink, type ResolvedAffiliateLink } from './affiliate-links';

export type KitItemSpec = {
  linkId: string;
  qty: number;
  optional?: boolean;
};

export type KitSpec = {
  id: string;
  simulator: string;
  title: string;
  blurb: string;
  merchant: string;
  items: KitItemSpec[];
};

export type ResolvedKitItem = KitItemSpec & {
  link: ResolvedAffiliateLink;
  unitPrice: number | null;
};

export type ResolvedKit = Omit<KitSpec, 'items'> & {
  items: ResolvedKitItem[];
  requiredTotal: number | null;
  allTotal: number | null;
};

export const kits: KitSpec[] = kitsData as KitSpec[];

function parsePrice(price?: string): number | null {
  if (!price) return null;
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function resolveKit(spec: KitSpec): ResolvedKit | null {
  const items: ResolvedKitItem[] = [];
  for (const row of spec.items) {
    const raw = affiliateLinks.find((l) => l.id === row.linkId);
    if (!raw) continue;
    const link = resolveAffiliateLink(raw);
    items.push({
      ...row,
      link,
      unitPrice: parsePrice(link.price ?? raw.price),
    });
  }
  if (!items.length) return null;

  const sum = (rows: ResolvedKitItem[]) => {
    let total = 0;
    let ok = true;
    for (const r of rows) {
      if (r.unitPrice == null) {
        ok = false;
        break;
      }
      total += r.unitPrice * r.qty;
    }
    return ok ? total : null;
  };

  return {
    ...spec,
    items,
    requiredTotal: sum(items.filter((i) => !i.optional)),
    allTotal: sum(items),
  };
}

export function kitForSimulator(simulator: string): ResolvedKit | null {
  const spec = kits.find((k) => k.simulator === simulator);
  return spec ? resolveKit(spec) : null;
}

export function formatUsd(n: number | null): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
