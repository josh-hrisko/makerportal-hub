#!/usr/bin/env node
/**
 * MakerPortal brand asset generator — App Grid
 *
 * Regenerates every static, non-Astro-processed brand asset in `public/` so they
 * match the single current brand identity implemented in:
 *   - src/components/BrandIconConcepts.astro (2x2 app grid, resting/default state)
 *   - src/components/BrandLogo.astro (wordmark path data + lockup dot)
 *   - src/styles/global.css (color tokens)
 *
 * Run with: node scripts/brand-assets/generate.mjs
 * (or `npm run brand:assets`)
 *
 * Outputs:
 *   public/favicon.svg
 *   public/apple-touch-icon.png   (180x180, full-bleed, no transparency)
 *   public/icon-512.png           (512x512, maskable-safe padding)
 *   public/icon-1024.png          (1024x1024, maskable-safe padding)
 *   public/social-card.png        (1200x630 Open Graph / Twitter card)
 *
 * If the mark's geometry ever changes in BrandIconConcepts.astro/BrandLogo.astro,
 * update GRID_CELLS / MAKER_PATH / AI_PATH below to match, then re-run this script.
 */
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../');
const pub = (...p) => path.join(root, 'public', ...p);
const here = (...p) => path.join(__dirname, ...p);

// ---------------------------------------------------------------------------
// Brand tokens — keep in sync with src/styles/global.css
// ---------------------------------------------------------------------------
const COLORS = {
  canvas: '#0F141C',
  cardBg: '#1A232E',
  primaryText: '#E8EEF6',
  mutedText: '#A8B9CC',
  brandAnchor: '#71B9E3',
  primaryCta: '#F07A94',
  brandDot: '#CE445D', // hardcoded brand-mark crimson used by BrandIconConcepts/BrandLogo
  ink: '#D7E3F2',
};

const FONT_FILES = [here('fonts/PlusJakartaSans-Bold.ttf'), here('fonts/PlusJakartaSans-Regular.ttf')];
const FONT_FAMILY = 'Plus Jakarta Sans';

function renderPng(svg, { width, height } = {}) {
  const resvg = new Resvg(svg, {
    fitTo: height ? { mode: 'height', value: height } : { mode: 'width', value: width },
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: FONT_FAMILY },
  });
  return resvg.render().asPng();
}

// ---------------------------------------------------------------------------
// App Grid mark — resting (default, non-hover) state, copied 1:1 from
// src/components/BrandIconConcepts.astro. BR is always crimson at rest
// (standalone + lockup). Native 32x32 grid: 2x2 tiles, 12px each, 2px gap,
// 3px margin — no rotation; bounding box is the flat 3..29 square below.
// ---------------------------------------------------------------------------
function gridMarkGroup({ mono = false } = {}) {
  const dot = mono ? 'currentColor' : COLORS.brandDot;
  const c1 = mono ? 'currentColor' : '#2A4A6B';
  const c2 = mono ? 'currentColor' : '#345E86';
  const c3 = mono ? 'currentColor' : '#3E6C99';
  return `
    <rect x="3" y="3" width="12" height="12" rx="3" fill="${c1}" />
    <rect x="17" y="3" width="12" height="12" rx="3" fill="${c2}" />
    <rect x="3" y="17" width="12" height="12" rx="3" fill="${c3}" />
    <rect x="17" y="17" width="12" height="12" rx="3" fill="${dot}" />`;
}

const markBBox = { minX: 3, maxX: 29, minY: 3, maxY: 29 };

/** Returns an SVG transform string that centers the grid mark's bbox within a
 * `canvasSize` square, leaving `paddingFraction` of empty space on each side. */
function centeredMarkTransform(canvasSize, paddingFraction) {
  const bw = markBBox.maxX - markBBox.minX;
  const bh = markBBox.maxY - markBBox.minY;
  const avail = canvasSize * (1 - paddingFraction * 2);
  const scale = avail / Math.max(bw, bh);
  const cx = (markBBox.minX + markBBox.maxX) / 2;
  const cy = (markBBox.minY + markBBox.maxY) / 2;
  const tx = canvasSize / 2 - scale * cx;
  const ty = canvasSize / 2 - scale * cy;
  return { transform: `translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(4)})`, scale };
}

// ---------------------------------------------------------------------------
// Wordmark path data — copied 1:1 from src/components/BrandLogo.astro so the
// OG/social card logo is pixel-identical to the live header lockup.
// ---------------------------------------------------------------------------
const MAKER_PATH =
  'M 4.61 22 L 1.46 22 L 1.46 8.94 L 4.42 8.94 L 4.42 10.58 Q 4.94 9.62 5.9 9.14 Q 6.86 8.66 8.06 8.68 L 8.06 8.68 Q 9.38 8.66 10.45 9.23 Q 11.52 9.81 12.1 10.77 L 12.1 10.77 Q 12.77 9.71 13.81 9.18 Q 14.86 8.66 16.15 8.66 L 16.15 8.66 Q 17.54 8.66 18.64 9.29 Q 19.73 9.93 20.35 11.03 Q 20.98 12.14 20.98 13.6 L 20.98 13.6 L 20.98 22 L 17.83 22 L 17.83 14.34 Q 17.83 13.05 17.15 12.29 Q 16.46 11.54 15.31 11.54 L 15.31 11.54 Q 14.18 11.54 13.49 12.3 Q 12.79 13.07 12.79 14.34 L 12.79 14.34 L 12.79 22 L 9.65 22 L 9.65 14.34 Q 9.65 13.05 8.96 12.29 Q 8.28 11.54 7.13 11.54 L 7.13 11.54 Q 5.98 11.54 5.29 12.3 Q 4.61 13.07 4.61 14.34 L 4.61 14.34 L 4.61 22 M 27.6 22.29 L 27.6 22.29 Q 25.56 22.29 24.34 21.28 Q 23.11 20.27 23.11 18.54 L 23.11 18.54 Q 23.11 16.91 24.22 15.83 Q 25.32 14.75 27.62 14.37 L 27.62 14.37 L 31.51 13.74 L 31.51 13.31 Q 31.51 12.47 30.85 11.91 Q 30.19 11.34 29.11 11.34 L 29.11 11.34 Q 28.08 11.34 27.31 11.88 Q 26.54 12.42 26.18 13.31 L 26.18 13.31 L 23.62 12.06 Q 24.19 10.53 25.73 9.59 Q 27.26 8.66 29.23 8.66 L 29.23 8.66 Q 30.84 8.66 32.05 9.26 Q 33.26 9.86 33.96 10.9 Q 34.66 11.94 34.66 13.31 L 34.66 13.31 L 34.66 22 L 31.68 22 L 31.68 20.63 Q 30.14 22.29 27.6 22.29 M 26.38 18.42 L 26.38 18.42 Q 26.38 19.1 26.88 19.49 Q 27.38 19.89 28.18 19.89 L 28.18 19.89 Q 29.66 19.89 30.59 18.96 Q 31.51 18.04 31.51 16.67 L 31.51 16.67 L 31.51 16.14 L 28.22 16.7 Q 26.38 17.03 26.38 18.42 M 40.7 22 L 37.56 22 L 37.56 3.83 L 40.7 3.83 L 40.7 14.13 L 45.65 8.94 L 49.56 8.94 L 44.74 14.2 L 49.66 22 L 46.06 22 L 42.41 16.19 L 40.7 18.04 L 40.7 22 M 57.36 22.29 L 57.36 22.29 Q 55.34 22.29 53.83 21.38 Q 52.32 20.46 51.48 18.92 Q 50.64 17.37 50.64 15.45 L 50.64 15.45 Q 50.64 13.5 51.49 11.97 Q 52.34 10.43 53.81 9.54 Q 55.27 8.66 57.12 8.66 L 57.12 8.66 Q 59.14 8.66 60.55 9.53 Q 61.97 10.41 62.72 11.85 Q 63.48 13.29 63.48 15.04 L 63.48 15.04 Q 63.48 15.4 63.44 15.75 Q 63.41 16.1 63.31 16.36 L 63.31 16.36 L 53.9 16.36 Q 54.05 17.82 55.01 18.68 Q 55.97 19.53 57.38 19.53 L 57.38 19.53 Q 58.46 19.53 59.22 19.07 Q 59.98 18.62 60.41 17.85 L 60.41 17.85 L 62.95 19.1 Q 62.35 20.49 60.85 21.39 Q 59.35 22.29 57.36 22.29 M 57.12 11.25 L 57.12 11.25 Q 55.94 11.25 55.09 11.96 Q 54.24 12.66 53.98 13.96 L 53.98 13.96 L 60.12 13.96 Q 60.02 12.76 59.2 12 Q 58.37 11.25 57.12 11.25 M 69 22 L 65.86 22 L 65.86 8.94 L 68.81 8.94 L 68.81 10.77 Q 69.31 9.69 70.22 9.24 Q 71.14 8.8 72.34 8.8 L 72.34 8.8 L 73.1 8.8 L 73.1 11.58 L 71.98 11.58 Q 70.66 11.58 69.83 12.41 Q 69 13.24 69 14.73 L 69 14.73 L 69 22 M 77.98 26.8 L 74.83 26.8 L 74.83 8.94 L 77.78 8.94 L 77.78 10.46 Q 78.48 9.62 79.56 9.14 Q 80.64 8.66 81.98 8.66 L 81.98 8.66 Q 83.83 8.66 85.32 9.57 Q 86.81 10.48 87.68 12.02 Q 88.56 13.55 88.56 15.47 L 88.56 15.47 Q 88.56 17.39 87.7 18.94 Q 86.83 20.49 85.34 21.39 Q 83.86 22.29 81.96 22.29 L 81.96 22.29 Q 80.76 22.29 79.73 21.89 Q 78.7 21.5 77.98 20.75 L 77.98 20.75 L 77.98 26.8 M 81.6 19.41 L 81.6 19.41 Q 82.68 19.41 83.51 18.9 Q 84.34 18.4 84.82 17.51 Q 85.3 16.62 85.3 15.47 L 85.3 15.47 Q 85.3 14.34 84.82 13.46 Q 84.34 12.57 83.51 12.05 Q 82.68 11.54 81.6 11.54 L 81.6 11.54 Q 80.54 11.54 79.73 12.05 Q 78.91 12.57 78.44 13.46 Q 77.98 14.34 77.98 15.47 L 77.98 15.47 Q 77.98 16.62 78.44 17.51 Q 78.91 18.4 79.73 18.9 Q 80.54 19.41 81.6 19.41 M 97.34 22.29 L 97.34 22.29 Q 95.42 22.29 93.85 21.4 Q 92.28 20.51 91.36 18.98 Q 90.43 17.44 90.43 15.47 L 90.43 15.47 Q 90.43 13.5 91.36 11.97 Q 92.28 10.43 93.84 9.54 Q 95.4 8.66 97.34 8.66 L 97.34 8.66 Q 99.24 8.66 100.8 9.54 Q 102.36 10.43 103.3 11.97 Q 104.23 13.5 104.23 15.47 L 104.23 15.47 Q 104.23 17.44 103.3 18.99 Q 102.36 20.54 100.8 21.41 Q 99.24 22.29 97.34 22.29 M 97.34 19.41 L 97.34 19.41 Q 98.38 19.41 99.19 18.9 Q 100.01 18.4 100.48 17.51 Q 100.94 16.62 100.94 15.47 L 100.94 15.47 Q 100.94 14.34 100.48 13.46 Q 100.01 12.57 99.19 12.05 Q 98.38 11.54 97.34 11.54 L 97.34 11.54 Q 96.26 11.54 95.45 12.05 Q 94.63 12.57 94.16 13.46 Q 93.7 14.34 93.7 15.47 L 93.7 15.47 Q 93.7 16.62 94.16 17.51 Q 94.63 18.4 95.45 18.9 Q 96.26 19.41 97.34 19.41 M 109.75 22 L 106.61 22 L 106.61 8.94 L 109.56 8.94 L 109.56 10.77 Q 110.06 9.69 110.98 9.24 Q 111.89 8.8 113.09 8.8 L 113.09 8.8 L 113.86 8.8 L 113.86 11.58 L 112.73 11.58 Q 111.41 11.58 110.58 12.41 Q 109.75 13.24 109.75 14.73 L 109.75 14.73 L 109.75 22 M 121.9 22.14 L 121.9 22.14 Q 119.69 22.14 118.48 20.93 Q 117.26 19.72 117.26 17.51 L 117.26 17.51 L 117.26 11.75 L 115.01 11.75 L 115.01 8.94 L 115.25 8.94 Q 116.21 8.94 116.74 8.44 Q 117.26 7.94 117.26 6.98 L 117.26 6.98 L 117.26 5.97 L 120.41 5.97 L 120.41 8.94 L 123.41 8.94 L 123.41 11.75 L 120.41 11.75 L 120.41 17.34 Q 120.41 18.33 120.94 18.86 Q 121.46 19.38 122.62 19.38 L 122.62 19.38 Q 122.98 19.38 123.46 19.31 L 123.46 19.31 L 123.46 22 Q 123.12 22.05 122.69 22.1 Q 122.26 22.14 121.9 22.14 M 129.77 22.29 L 129.77 22.29 Q 127.73 22.29 126.5 21.28 Q 125.28 20.27 125.28 18.54 L 125.28 18.54 Q 125.28 16.91 126.38 15.83 Q 127.49 14.75 129.79 14.37 L 129.79 14.37 L 133.68 13.74 L 133.68 13.31 Q 133.68 12.47 133.02 11.91 Q 132.36 11.34 131.28 11.34 L 131.28 11.34 Q 130.25 11.34 129.48 11.88 Q 128.71 12.42 128.35 13.31 L 128.35 13.31 L 125.78 12.06 Q 126.36 10.53 127.9 9.59 Q 129.43 8.66 131.4 8.66 L 131.4 8.66 Q 133.01 8.66 134.22 9.26 Q 135.43 9.86 136.13 10.9 Q 136.82 11.94 136.82 13.31 L 136.82 13.31 L 136.82 22 L 133.85 22 L 133.85 20.63 Q 132.31 22.29 129.77 22.29 M 128.54 18.42 L 128.54 18.42 Q 128.54 19.1 129.05 19.49 Q 129.55 19.89 130.34 19.89 L 130.34 19.89 Q 131.83 19.89 132.76 18.96 Q 133.68 18.04 133.68 16.67 L 133.68 16.67 L 133.68 16.14 L 130.39 16.7 Q 128.54 17.03 128.54 18.42 M 142.87 22 L 139.73 22 L 139.73 3.83 L 142.87 3.83 L 142.87 22';
const AI_PATH =
  'M 162.14 22.29 L 162.14 22.29 Q 160.1 22.29 158.87 21.28 Q 157.65 20.27 157.65 18.54 L 157.65 18.54 Q 157.65 16.91 158.75 15.83 Q 159.86 14.75 162.16 14.37 L 162.16 14.37 L 166.05 13.74 L 166.05 13.31 Q 166.05 12.47 165.39 11.91 Q 164.73 11.34 163.65 11.34 L 163.65 11.34 Q 162.62 11.34 161.85 11.88 Q 161.08 12.42 160.72 13.31 L 160.72 13.31 L 158.15 12.06 Q 158.73 10.53 160.26 9.59 Q 161.8 8.66 163.77 8.66 L 163.77 8.66 Q 165.38 8.66 166.59 9.26 Q 167.8 9.86 168.5 10.9 Q 169.19 11.94 169.19 13.31 L 169.19 13.31 L 169.19 22 L 166.22 22 L 166.22 20.63 Q 164.68 22.29 162.14 22.29 M 160.91 18.42 L 160.91 18.42 Q 160.91 19.1 161.42 19.49 Q 161.92 19.89 162.71 19.89 L 162.71 19.89 Q 164.2 19.89 165.12 18.96 Q 166.05 18.04 166.05 16.67 L 166.05 16.67 L 166.05 16.14 L 162.76 16.7 Q 160.91 17.03 160.91 18.42 M 175.24 7.48 L 172.1 7.48 L 172.1 4.12 L 175.24 4.12 L 175.24 7.48 M 175.24 22 L 172.1 22 L 172.1 8.94 L 175.24 8.94 L 175.24 22';
const WORDMARK_DOT = { x: 146.2, y: 19.1, r: 2.4 };

// ---------------------------------------------------------------------------
// 1. favicon.svg — scalable, keeps the rounded-card + glow "app tile" framing
// ---------------------------------------------------------------------------
function buildFavicon() {
  // White background (instead of the near-black canvas used elsewhere) so the
  // app grid + crimson accent keep definition at 16-32px browser-tab sizes,
  // across both light and dark tab bar chrome.
  const size = 64;
  const { transform } = centeredMarkTransform(size, 0.17);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none" role="img" aria-label="MakerPortal favicon">
  <rect width="${size}" height="${size}" rx="16" fill="#FFFFFF" />
  <rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="15.5" fill="none" stroke="#0F141C" stroke-opacity="0.08" />
  <g transform="${transform}">${gridMarkGroup()}</g>
</svg>`;
}

// ---------------------------------------------------------------------------
// 2. Full-bleed square PWA/touch icons (no rounding — OS applies its own mask;
//    maskable-safe padding keeps the mark inside the ~80% safe zone)
// ---------------------------------------------------------------------------
function buildSquareIcon(size) {
  const { transform } = centeredMarkTransform(size, 0.19);
  const glowR = size * 0.28;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" fill="${COLORS.canvas}" />
  <circle cx="${size / 2}" cy="${size / 2 - size * 0.03}" r="${glowR}" fill="${COLORS.brandDot}" opacity="0.2" style="filter:blur(${size * 0.05}px)" />
  <g transform="${transform}">${gridMarkGroup()}</g>
</svg>`;
}

// ---------------------------------------------------------------------------
// 3. Social / Open Graph card (1200x630)
// ---------------------------------------------------------------------------
function buildSocialCard() {
  const W = 1200;
  const H = 630;
  // Oversized, faint decorative mark bleeding off the top-right corner for depth
  const bigMark = centeredMarkTransform(1, 0); // unit mark, we scale manually below
  const decorScale = 26;
  const decorCx = markBBox.minX + (markBBox.maxX - markBBox.minX) / 2;
  const decorCy = markBBox.minY + (markBBox.maxY - markBBox.minY) / 2;
  const decorTx = W - 60 - decorCx * decorScale;
  const decorTy = 40 - decorCy * decorScale;

  const iconSize = 64;
  const { transform: iconTransform } = centeredMarkTransform(iconSize, 0.1);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none">
  <defs>
    <radialGradient id="augTop" cx="50%" cy="0%" r="75%">
      <stop offset="0%" stop-color="${COLORS.brandAnchor}" stop-opacity="0.10" />
      <stop offset="60%" stop-color="${COLORS.brandAnchor}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="augCta" cx="82%" cy="18%" r="55%">
      <stop offset="0%" stop-color="${COLORS.primaryCta}" stop-opacity="0.08" />
      <stop offset="60%" stop-color="${COLORS.primaryCta}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${COLORS.canvas}" />
  <rect width="${W}" height="${H}" fill="url(#augTop)" />
  <rect width="${W}" height="${H}" fill="url(#augCta)" />

  <!-- decorative oversized mark, bleeding off the top-right corner -->
  <g opacity="0.05" transform="translate(${decorTx.toFixed(1)} ${decorTy.toFixed(1)}) scale(${decorScale})">${gridMarkGroup()}</g>

  <!-- lockup: icon + wordmark, matching the live header exactly -->
  <g transform="translate(100 240)">
    <circle cx="${iconSize / 2}" cy="${iconSize / 2 - 2}" r="24" fill="${COLORS.brandDot}" opacity="0.18" style="filter:blur(12px)" />
    <g transform="${iconTransform}">${gridMarkGroup()}</g>
  </g>
  <g transform="translate(180 230) scale(2.05)" fill="white" fill-rule="evenodd">
    <path d="${MAKER_PATH}" />
    <g transform="translate(-8 0)"><path d="${AI_PATH}" /></g>
  </g>
  <circle cx="${180 + WORDMARK_DOT.x * 2.05}" cy="${230 + WORDMARK_DOT.y * 2.05}" r="${WORDMARK_DOT.r * 2.05}" fill="${COLORS.brandDot}" />

  <text x="100" y="345" font-family="${FONT_FAMILY}" font-weight="700" font-size="46" letter-spacing="-1.5" fill="white">Software with</text>
  <text x="100" y="400" font-family="${FONT_FAMILY}" font-weight="700" font-size="46" letter-spacing="-1.5" fill="${COLORS.primaryCta}">a point of view.</text>
  <text x="100" y="448" font-family="${FONT_FAMILY}" font-weight="400" font-size="15" letter-spacing="2.4" fill="${COLORS.mutedText}">ON-DEVICE &#8226; PRIVATE &#8226; CRAFTED IN SAN FRANCISCO</text>

  <g transform="translate(860 522)">
    <rect width="240" height="56" rx="28" fill="${COLORS.cardBg}" stroke="white" stroke-opacity="0.08" />
    <circle cx="28" cy="28" r="4" fill="${COLORS.brandDot}" />
    <text x="44" y="34" font-family="${FONT_FAMILY}" font-weight="400" font-size="14" letter-spacing="1.5" fill="white">makerportal.ai</text>
  </g>
</svg>`;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
function main() {
  console.log('Generating MakerPortal brand assets (App Grid)...\n');

  const faviconSvg = buildFavicon();
  fs.writeFileSync(pub('favicon.svg'), faviconSvg);
  console.log('✓ public/favicon.svg');

  const touchIconSvg = buildSquareIcon(180);
  fs.writeFileSync(pub('apple-touch-icon.png'), renderPng(touchIconSvg, { width: 180 }));
  console.log('✓ public/apple-touch-icon.png (180x180)');

  const icon512Svg = buildSquareIcon(512);
  fs.writeFileSync(pub('icon-512.png'), renderPng(icon512Svg, { width: 512 }));
  console.log('✓ public/icon-512.png (512x512)');

  const icon1024Svg = buildSquareIcon(1024);
  fs.writeFileSync(pub('icon-1024.png'), renderPng(icon1024Svg, { width: 1024 }));
  console.log('✓ public/icon-1024.png (1024x1024)');

  const socialSvg = buildSocialCard();
  fs.writeFileSync(pub('social-card.png'), renderPng(socialSvg, { width: 1200 }));
  console.log('✓ public/social-card.png (1200x630)');

  console.log('\nDone. Review the generated files, then `npm run build` to verify.');
}

main();
