/**
 * Thumbnail enrichment — fetches each selected item's page at digest build
 * time, extracts its og:image / twitter:image, downloads it, and resizes to
 * a small self-hosted webp in public/trends/. Self-hosting keeps the
 * "no tracking" promise on /resources honest: visitors' browsers never
 * request anything from third-party image hosts.
 *
 * Every step degrades gracefully — no meta tag, oversized file, timeout, or
 * missing ImageMagick just means that item renders the pillar-color
 * fallback tile instead. The directory is wiped each run so only the
 * current digest's thumbnails are committed (~20 × ~25 KB per week).
 *
 * Ops notes (learned the hard way, see D-013 in docs/DECISIONS.md):
 * - GitHub ubuntu-latest runners do NOT ship ImageMagick anymore; the
 *   workflow apt-installs it. If the run log says "no ImageMagick found",
 *   thumbnails were silently skipped — the digest still succeeds.
 * - HN discussion pages have no og:image and 429 our fetches; expect
 *   ~15/22 real thumbnails, the rest fall back by design.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, unlinkSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = join(process.cwd(), 'public', 'trends');
const FETCH_TIMEOUT_MS = 10_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const THUMB_WIDTH = 640;
const CONCURRENCY = 5;
const USER_AGENT = 'makerportal-hub-trends/1.0 (build-time og:image fetch)';

function findConverter() {
  for (const bin of ['magick', 'convert']) {
    try {
      execFileSync(bin, ['-version'], { stdio: 'ignore' });
      return bin;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function fetchWithTimeout(url) {
  return fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
  });
}

const OG_PATTERNS = [
  /<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i,
  /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
];

export function extractOgImage(html, pageUrl) {
  for (const pattern of OG_PATTERNS) {
    const m = html.match(pattern);
    if (m?.[1]) {
      const raw = m[1].replaceAll('&amp;', '&');
      try {
        return new URL(raw, pageUrl).toString();
      } catch {
        return null;
      }
    }
  }
  return null;
}

async function thumbnailFor(item, converter) {
  const pageUrl = item.url;
  const pageRes = await fetchWithTimeout(pageUrl);
  if (!pageRes.ok || !(pageRes.headers.get('content-type') ?? '').includes('text/html')) return null;
  const imageUrl = extractOgImage(await pageRes.text(), pageRes.url ?? pageUrl);
  if (!imageUrl) return null;

  const imgRes = await fetchWithTimeout(imageUrl);
  if (!imgRes.ok) return null;
  // Extension must match the real format — ImageMagick trusts extensions,
  // and e.g. ".raw" would be read as headerless pixel data.
  const contentType = (imgRes.headers.get('content-type') ?? '').split(';')[0].trim();
  const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' }[contentType];
  if (!ext) return null;
  const buf = Buffer.from(await imgRes.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) return null;

  const rawPath = join(OUT_DIR, `${item.id}.src.${ext}`);
  const outPath = join(OUT_DIR, `${item.id}.webp`);
  writeFileSync(rawPath, buf);
  try {
    execFileSync(
      converter,
      [`${rawPath}[0]`, '-resize', `${THUMB_WIDTH}x>`, '-strip', '-quality', '72', outPath],
      { stdio: 'ignore', timeout: 30_000 },
    );
  } finally {
    unlinkSync(rawPath);
  }
  if (!existsSync(outPath) || statSync(outPath).size === 0) return null;
  return `/trends/${item.id}.webp`;
}

/** Returns items with an `image` field where a thumbnail could be built. */
export async function enrichWithImages(items) {
  const converter = findConverter();
  rmSync(OUT_DIR, { recursive: true, force: true });
  if (!converter) {
    console.warn('[images] no ImageMagick (magick/convert) found — skipping thumbnails.');
    return items;
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const enriched = [...items];
  let count = 0;
  for (let i = 0; i < enriched.length; i += CONCURRENCY) {
    const batch = enriched.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(batch.map((item) => thumbnailFor(item, converter)));
    settled.forEach((result, j) => {
      if (result.status === 'fulfilled' && result.value) {
        enriched[i + j] = { ...batch[j], image: result.value };
        count += 1;
      }
    });
  }
  console.log(`[images] ${count}/${items.length} thumbnails built in public/trends/`);
  return enriched;
}
