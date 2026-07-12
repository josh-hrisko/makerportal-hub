# makerportal.ai — Brand System v0.2 (Signal Portal)

Implemented 2026-07-12

## Origin story
- Old: `MakerPortal` word + blue LED as `o` (dome + bar + 2 legs + 3 rays) • MP serif on #2E6D8A
- New: Same DNA, refined for AI software studio.

### Logo anatomy
```
     ^ ^ ^  ← 3 rays (inference emission, same 3 as old)
    ┌─────┐  ← dome = portal arch + LED bulb (fill #CE445D)
    ───────  ← threshold = ground plane (white #E2E8F0, no legs)
```
- Removed legs: no longer through-hole hardware
- Keeps blue #326C88 as secondary anchor color (Studio links)

## Components

### `src/components/BrandLogo.astro`
- `variant="icon"` • 32x32 standalone
- `variant="full"` • icon in rounded 11px square #0F141C border + wordmark tracking 0.12em
- `variant="wordmark"` • text only
- Props: `size sm|md|lg`, `mono`, `animated`
- **Motion:** rays idle pulse `ray-idle` 3.2s, glow pulse `portal-glow-pulse`, hover burst translate -2.5px outward, dome scale 1.06, glow intensify. Respects `prefers-reduced-motion`.

Usage:
```astro
<a href="/" class="group"><BrandLogo variant="full" /></a>
```
Header uses `group` so hover on anchor triggers ray burst.

### App Icons — portal system
All icons share:
- 64px canvas #0F141C, outer stroke white@6%, accent glow blur 10px radius 22
- Same dome + rays + threshold
- Inner glyph white 95% distinguishing app
- Dome fill = accent per app mapping:

| App | Accent | Dome Fill | Inner |
|-----|--------|-----------|-------|
| Biquadia | signal | #CE445D | waveform polyline |
| Notiary | violet | #8B5CF6 | 2 lines + dot (markdown + semantic) |
| Thumb-Dash | amber | #F59E0B | 4 bars (dashboard) |
| PopCloset | rose → brand-anchor | #326C88 | hanger |

Files: `public/assets/app-icons/*.svg` (replaced old green/blue/gray abstract icons)

### Favicons & PWA
- `public/favicon.svg` — 64px rounded 16px #0F141C with portal centered (glow + rays)
- `public/apple-touch-icon.png` 180px rasterized via @resvg/resvg-js
- `public/icon-512.png` / `icon-1024.png` — PWA
- `public/brand/icon-1024.png` • standalone icon export

### Social / OG
- `public/brand/og-template.svg` — 1200x630 #0F141C + grid + aura + large portal 4.2x + wordmark
  - Text: MAKERPORTAL / Software with a point of view.
- `public/social-card.png` — rasterized from og-template (114KB) via resvg
- Referenced in `SeoMeta.astro` as og:image

### Layout updates
- `src/layouts/Layout.astro`: header `<BrandLogo full>` with `group` hover, sticky, mobile drawer header `<BrandLogo icon>`, footer icon.
- `src/pages/index.astro`: hero orbit center previously `MP` text → portal SVG inline
- `public/favicon.svg` rebuilt, old green M removed

## Color tokens (unchanged, confirmed good)
- --color-canvas #0F141C
- --color-card-bg #1A232E
- --color-primary-text #E2E8F0
- --color-muted-text #5C6E7A
- --color-brand-anchor #326C88 (old LED blue lineage)
- --color-primary-cta #CE445D

## Next steps (optional)
- Animate threshold line on contact form submit success (slide fills #CE445D)
- Generate App Store 1024 PNGs for each app icon with same system + export to Xcode
- Create light variant `logo-full-light.svg` for white bg (dome crimson, text #0F141C)
