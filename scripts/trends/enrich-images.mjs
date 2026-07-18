/**
 * Thumbnail enrichment — fetches each selected item's page at digest build
 * time, extracts its og:image / twitter:image, downloads it, and resizes to
 * a small self-hosted webp in public/trends/. Self-hosting keeps the
 * "no tracking" promise on /resources honest: visitors' browsers never
 * request anything from third-party image hosts.
 *
 * Enhanced (Task 2 & 3):
 * - Bluesky items may carry a direct `imageUrl` (high-res embed from AT Protocol
 *   payload: post.embed?.images?.[0]?.fullsize or external.thumb). When present
 *   we download it directly, bypassing the page-scrape fallback that captured
 *   low-res og:image assets.
 * - arXiv items get custom high-fidelity SVG cards rendered via @resvg/resvg-js,
 *   showing wrapped title, subject tag (cs.LG, cs.SD, etc), and a technical
 *   graphic background (grid mesh + vector node path). Saved as
 *   public/trends/arxiv-{id}.webp.
 *
 * Every step degrades gracefully — no meta tag, oversized file, timeout, or
 * missing ImageMagick just means that item renders the pillar-color
 * fallback tile instead. The directory is NEVER wiped (journal archive pages
 * reference older days' thumbnails); growth is bounded by orphan pruning —
 * see pruneOrphanThumbs() and D-013.
 *
 * Ops notes (learned the hard way, see D-013 in docs/DECISIONS.md):
 * - GitHub ubuntu-latest runners do NOT ship ImageMagick anymore; the
 *   workflow apt-installs it. If the run log says "no ImageMagick found",
 *   thumbnails were silently skipped — the digest still succeeds.
 * - HN discussion pages have no og:image and 429 our fetches; expect
 *   ~15/22 real thumbnails, the rest fall back by design.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const OUT_DIR = join(process.cwd(), 'public', 'trends');
const JOURNAL_DIR = join(process.cwd(), 'src', 'content', 'journal');
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

// ── Direct high-res image path (Bluesky embed) ───────────────────────────

const CONTENT_TYPE_EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

async function downloadAndConvert(downloadUrl, itemId, converter) {
  const imgRes = await fetchWithTimeout(downloadUrl);
  if (!imgRes.ok) return null;
  const contentType = (imgRes.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  const ext = CONTENT_TYPE_EXT[contentType];
  // Allow CDN image URLs that omit content-type but look like images: fallback by URL extension
  let effectiveExt = ext;
  if (!effectiveExt) {
    const urlExt = downloadUrl.split('?')[0].split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(urlExt)) {
      effectiveExt = urlExt === 'jpeg' ? 'jpg' : urlExt;
    } else {
      return null;
    }
  }
  const buf = Buffer.from(await imgRes.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) return null;

  const rawPath = join(OUT_DIR, `${itemId}.src.${effectiveExt}`);
  const outPath = join(OUT_DIR, `${itemId}.webp`);
  writeFileSync(rawPath, buf);
  try {
    if (converter) {
      execFileSync(
        converter,
        [`${rawPath}[0]`, '-resize', `${THUMB_WIDTH}x>`, '-strip', '-quality', '78', outPath],
        { stdio: 'ignore', timeout: 30_000 },
      );
    } else {
      // No ImageMagick — write raw buffer directly as fallback (may be PNG but named webp; still renders)
      writeFileSync(outPath, buf);
    }
  } catch {
    try {
      if (existsSync(rawPath) && !existsSync(outPath)) writeFileSync(outPath, buf);
    } catch {}
  } finally {
    try {
      unlinkSync(rawPath);
    } catch {}
  }
  if (!existsSync(outPath) || statSync(outPath).size === 0) return null;
  return `/trends/${itemId}.webp`;
}

async function directImageThumbnail(item, converter) {
  if (!item.imageUrl) return null;
  try {
    return await downloadAndConvert(item.imageUrl, item.id, converter);
  } catch {
    return null;
  }
}

// ── OG scrape path (original behaviour) ──────────────────────────────────

async function ogThumbnail(item, converter) {
  if (!converter) return null; // OG path requires ImageMagick
  const pageUrl = item.url;
  let pageRes;
  try {
    pageRes = await fetchWithTimeout(pageUrl);
  } catch {
    return null;
  }
  if (!pageRes.ok || !(pageRes.headers.get('content-type') ?? '').includes('text/html')) return null;
  let html;
  try {
    html = await pageRes.text();
  } catch {
    return null;
  }
  const imageUrl = extractOgImage(html, pageRes.url ?? pageUrl);
  if (!imageUrl) return null;
  try {
    return await downloadAndConvert(imageUrl, item.id, converter);
  } catch {
    return null;
  }
}

// ── arXiv custom SVG card generator ──────────────────────────────────────

function escapeXml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapTitle(title, maxChars = 34, maxLines = 4) {
  const words = title.trim().split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length <= maxChars) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      // Very long single word: hard-split
      if (w.length > maxChars) {
        let remainder = w;
        while (remainder.length > maxChars) {
          lines.push(remainder.slice(0, maxChars));
          remainder = remainder.slice(maxChars);
          if (lines.length >= maxLines) break;
        }
        cur = remainder;
      } else {
        cur = w;
      }
      if (lines.length >= maxLines) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);

  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    const last = truncated[maxLines - 1];
    truncated[maxLines - 1] = last.length > maxChars - 1 ? `${last.slice(0, maxChars - 1)}…` : `${last}…`;
    return truncated;
  }
  // If last line too long, ellipsis
  if (lines.join(' ').length > maxChars * maxLines) {
    const lastIdx = lines.length - 1;
    if (lines[lastIdx].length > maxChars - 1) {
      lines[lastIdx] = `${lines[lastIdx].slice(0, maxChars - 1)}…`;
    }
  }
  return lines;
}

function estimateTextWidth(text, charW = 7) {
  // Rough monospace-esque estimate for pill sizing
  return Math.max(32, text.length * charW + 22);
}

function generateArxivSvg(item) {
  const rawTitle = (item.title || 'arXiv Paper').trim();
  const lines = wrapTitle(rawTitle, 36, 4);
  const arxivId = (item.id || '').replace(/^arxiv-/, '');
  const rawCat = item.category || item.tags?.[0] || 'cs.LG';
  // Normalize category display: keep dot notation, limit length
  const category = rawCat.length > 14 ? rawCat.slice(0, 14) : rawCat;
  const catW = estimateTextWidth(category, 7);
  const titleLineHeight = 32;
  const titleStartY = 92;

  // Build tspans with escaped content
  const tspans = lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : titleLineHeight;
      return `<tspan x="32" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('\n      ');

  const safeId = escapeXml(arxivId);
  const safeCat = escapeXml(category);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="640" height="360" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(rawTitle)}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="translate(0 0)">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.32"/>
    </pattern>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
    <radialGradient id="glow" cx="76%" cy="18%" r="68%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.14"/>
      <stop offset="55%" stop-color="#818cf8" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <rect width="640" height="360" rx="0" fill="url(#bg)"/>
  <rect width="640" height="360" fill="url(#grid)"/>
  <rect width="640" height="360" fill="url(#glow)"/>

  <!-- technical graphic background: grid mesh + vector node path -->
  <g opacity="0.38">
    <!-- faint diagonal mesh -->
    <g stroke="#1e293b" stroke-width="0.6" opacity="0.6">
      <path d="M -20 80 L 660 40" stroke="#334155" stroke-dasharray="2 14"/>
      <path d="M -20 140 L 660 100" stroke="#334155" stroke-dasharray="2 14" opacity="0.7"/>
      <path d="M -20 200 L 660 160" stroke="#334155" stroke-dasharray="2 14" opacity="0.5"/>
    </g>
    <!-- main vector path with nodes -->
    <path d="M 416 38 Q 470 74 498 128 T 598 190" fill="none" stroke="#38bdf8" stroke-width="1.6" stroke-dasharray="7 5" stroke-linecap="round" opacity="0.9"/>
    <path d="M 388 298 Q 452 262 518 278 T 622 224" fill="none" stroke="#818cf8" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
    <circle cx="416" cy="38" r="3.4" fill="#38bdf8" stroke="#0f172a" stroke-width="1"/>
    <circle cx="498" cy="128" r="4.6" fill="#e2e8f0" stroke="#38bdf8" stroke-width="1.4"/>
    <circle cx="598" cy="190" r="3.2" fill="#38bdf8"/>
    <circle cx="388" cy="298" r="3" fill="#818cf8"/>
    <circle cx="518" cy="278" r="3.8" fill="#1e293b" stroke="#818cf8" stroke-width="1.2"/>
    <circle cx="622" cy="224" r="2.8" fill="#818cf8" opacity="0.9"/>
  </g>

  <!-- subtle vignette top fade for text legibility -->
  <rect y="200" width="640" height="160" fill="url(#vignette)" opacity="0.85"/>

  <!-- badges -->
  <g transform="translate(28, 24)">
    <!-- arXiv badge -->
    <g>
      <rect x="0" y="0" width="62" height="24" rx="7" fill="rgba(56,189,248,0.14)" stroke="rgba(56,189,248,0.28)" stroke-width="0.9"/>
      <text x="31" y="15.5" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#7dd3fc" letter-spacing="0.07em">arXiv</text>
    </g>
    <!-- category pill -->
    <g transform="translate(70, 0)">
      <rect x="0" y="0" width="${catW}" height="24" rx="7" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)" stroke-width="0.9"/>
      <text x="${catW / 2}" y="15.5" text-anchor="middle" font-family="JetBrains Mono, ui-monospace, monospace" font-size="11" font-weight="600" fill="#e2e8f0" letter-spacing="0.02em">${safeCat}</text>
    </g>
  </g>

  <!-- title -->
  <text x="32" y="${titleStartY}" font-family="Plus Jakarta Sans, Inter, ui-sans-serif, system-ui, sans-serif" font-size="27" font-weight="800" fill="#f1f5f9" letter-spacing="-0.025em" line-height="1.15">
    ${tspans}
  </text>

  <!-- bottom meta -->
  <g transform="translate(32, 312)">
    <text font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="500" fill="#94a3b8" letter-spacing="0.01em">arxiv.org • ${safeId}</text>
  </g>
  <rect x="32" y="334" width="88" height="3" rx="1.5" fill="url(#accent)" opacity="0.85"/>
  <rect x="128" y="334" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.18)"/>
</svg>`;
}

async function arxivThumbnail(item, converter) {
  try {
    const svg = generateArxivSvg(item);
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: THUMB_WIDTH },
      background: 'rgba(15,23,42,1)',
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    const rawPath = join(OUT_DIR, `${item.id}.src.png`);
    const outPath = join(OUT_DIR, `${item.id}.webp`);
    writeFileSync(rawPath, pngBuffer);
    try {
      if (converter) {
        execFileSync(
          converter,
          [`${rawPath}[0]`, '-resize', `${THUMB_WIDTH}x>`, '-strip', '-quality', '78', outPath],
          { stdio: 'ignore', timeout: 30_000 },
        );
      } else {
        // No ImageMagick: write PNG buffer directly to .webp path as fallback
        writeFileSync(outPath, pngBuffer);
      }
    } finally {
      try {
        unlinkSync(rawPath);
      } catch {}
    }
    if (!existsSync(outPath) || statSync(outPath).size === 0) return null;
    return `/trends/${item.id}.webp`;
  } catch (err) {
    console.warn(`[images] arXiv card failed for ${item.id}: ${err.message}`);
    return null;
  }
}

// ── Main orchestrator ──────────────────────────────────────────────────────

async function thumbnailFor(item, converter) {
  // Task 3: arXiv custom card — bypasses all scraping
  if (item.source === 'arxiv') {
    const r = await arxivThumbnail(item, converter);
    if (r) return r;
    // fallback to og scraping if SVG generation failed
  }

  // Task 2: direct high-res embed URL from Bluesky
  if (item.imageUrl) {
    const direct = await directImageThumbnail(item, converter);
    if (direct) return direct;
  }

  // Original OG scraping path
  return await ogThumbnail(item, converter);
}

/**
 * Retention policy (D-013): the directory is never wiped (archive 404 fix), so
 * growth is bounded by pruning *orphans* instead — any *.webp not referenced by
 * a journal JSON and not in the current batch is deleted. Referenced history is
 * kept forever; files left behind by renamed/removed items are reclaimed.
 * Conservative by design: only *.webp files are ever touched.
 */
function pruneOrphanThumbs(currentItems) {
  const referenced = new Set(currentItems.map((it) => `${it.id}.webp`));
  try {
    for (const file of readdirSync(JOURNAL_DIR).filter((f) => f.endsWith('.json'))) {
      try {
        const data = JSON.parse(readFileSync(join(JOURNAL_DIR, file), 'utf-8'));
        for (const item of data.items ?? []) {
          if (typeof item.image === 'string') referenced.add(item.image.split('/').pop());
        }
      } catch { /* unreadable file — keep its thumbs */ }
    }
  } catch { /* no journal dir yet — only current batch counts */ }

  let pruned = 0;
  try {
    for (const file of readdirSync(OUT_DIR)) {
      if (!file.endsWith('.webp') || referenced.has(file)) continue;
      try {
        unlinkSync(join(OUT_DIR, file));
        pruned++;
      } catch { /* leave it */ }
    }
  } catch { /* OUT_DIR missing — nothing to prune */ }
  if (pruned > 0) console.log(`[images] pruned ${pruned} orphan thumbnails (not referenced by any journal entry)`);
}

/** Returns items with an `image` field where a thumbnail could be built. */
export async function enrichWithImages(items) {
  const converter = findConverter();
  // Preserve historic thumbnails: do NOT wipe OUT_DIR (fix for journal archive 404s).
  // Previously this wiped the dir each run, leaving only the latest day's images and
  // breaking /journal/<old-date> pages that still reference their thumbnails.
  mkdirSync(OUT_DIR, { recursive: true });

  if (!converter) {
    console.warn('[images] no ImageMagick (magick/convert) found — arXiv cards will use PNG fallback, other thumbnails skipped.');
    // Still proceed: arXiv path works without converter, direct images can still write raw fallback
  }

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
  pruneOrphanThumbs(enriched);
  return enriched;
}
