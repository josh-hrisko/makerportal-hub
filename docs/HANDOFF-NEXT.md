# HANDOFF: Landing Page Overhaul — Collapse Apps Grid, Add Content Carousels, Reorder Sections

> Historical as of 2026-07-19. This brief was executed; use `STATUS.md`,
> `BACKLOG.md`, and `HANDOFF-FRONTIER-CHECK.md` for current work.

You are picking up `makerportal-hub` after a navigation overhaul and micro-animation polish pass. All pipeline tests and Astro checks are passing cleanly. Your mission is a **major landing page redesign** focused on information density, content diversity, and reducing scroll fatigue.

## Stack & Baseline
- Astro 7 + Tailwind v4 (`output: 'static'`, Vercel adapter).
- Run these verification commands first:
  ```bash
  node --test scripts/trends/pipeline.test.mjs
  node --experimental-strip-types --test src/lib/*.test.ts
  npx astro check
  npx astro build
  ```

---

## The Problem (Quantified)

The current landing page at `https://makerportal.ai/` is **~8,000px tall**. The critical scroll breakdown:

| Section | Position | Height |
|---|---|---|
| Hero (above fold) | 0–880px | ~880px |
| Ticker bar | 880–930px | ~50px |
| **Apps Grid (all 11 cards)** | **930–4,377px** | **~3,450px** |
| Technical Dashboard ("Engineered for Apple Silicon") | 4,377–5,150px | ~773px |
| Operating Principles ("A studio built for momentum") | 5,150–5,930px | ~780px |
| Blog ("Thinking in public") | 5,930–6,680px | ~750px |
| Closing CTA ("Make the thing you wish existed") | 6,680–7,400px | ~720px |
| Footer | 7,400–7,972px | ~572px |

**The apps grid alone consumes 3,450px (43% of the page).** Users must scroll through 11 full-sized app cards before reaching the studio identity, blog content, playground tools, or any other content type. This creates scroll fatigue and makes the page feel like a catalog instead of a premium studio landing page.

---

## Current Section Order (index.astro — 403 lines)

```
1. Hero ("Software with a point of view") + orbit visual
2. Ticker bar (studio principles)
3. Apps Grid — ALL 11 AppCard components in a 2-col grid
4. Technical Dashboard — "Engineered for Apple Silicon" + terminal mockup
5. Operating Principles — "A studio built for momentum, not meetings" (01/02/03 steps)
6. Blog — "Thinking in public" (3 latest posts)
7. Closing CTA — "Make the thing you wish existed" + directory card
```

---

## Your Mission: Redesign the Landing Page

### 1. Collapse the Apps Grid — Show 4, Reveal Rest

Replace the all-11-cards grid with a **compact showcase of 4 featured apps** (AuraLinter, Biquadia, Thumb-Dash, Notiary — the `featured` or first 4) plus a "See all 11 apps" expansion mechanism.

**Decision for you to make (pick one based on your frontier knowledge):**

- **Option A — "Show more" accordion/reveal:** Show 4 cards in the 2-col grid. Below, a styled "Show all 11 apps →" button that smoothly reveals the remaining 7 with a CSS `details`/`summary` or JS transition (the codebase already has `@supports (interpolate-size: allow-keywords)` for animated `<details>` in global.css).
- **Option B — Horizontal carousel/swiper:** Show all 11 as a horizontal scrollable row of compact cards (smaller than the current `AppCard` — icon + title + tagline only, no description/badges/related). "Swipe to explore" with snap scrolling and fade edges.
- **Option C — Hybrid:** Show 4 featured in the grid, then a horizontal mini-card carousel for the remaining 7 below with compact treatment.

> The goal: reduce the apps section from ~3,450px to ~800–1,200px max on first load.

### 2. Add New Content Carousels (3 new sections between apps and closing CTA)

After the collapsed apps grid, add these new content-rich sections to make the landing page feel like a living hub, not just an app catalog:

#### A. Playground Showcase Carousel
- Pull 4–6 featured playground tools from the 26 available tools.
- Suggested picks for maximum visual impact: **Fourier Epicycles**, **Double Pendulum**, **Optics Bench**, **Chladni Cymatics**, **Quantum Tunneling**, **Globe** (Live Earth).
- Display as a horizontal snap-scroll carousel with preview cards (tool name, 1-line description, a generated or thematic icon/illustration, and "Try it →" link to `/playground/{slug}`).
- The playground index page exists at [src/pages/playground/index.astro](file:///Users/josh/Documents/GitHub/makerportal-hub/src/pages/playground/index.astro) — reference it for tool listing data.
- Section title: something like "Interactive playground — built for curiosity"

#### B. Gear & Affiliate Picks Carousel
- Pull curated items from [src/data/affiliate-links.ts](file:///Users/josh/Documents/GitHub/makerportal-hub/src/data/affiliate-links.ts) (imports from `affiliate-links.json`).
- Use `resolveAffiliateLink()` to merge hand-curated picks with Amazon catalog cache (title, image, price from `amazon-catalog.json`).
- Suggested high-interest picks: **AirPods Pro 3** (ASIN `B0FQFB8FMG`), **Behringer UMC1820** (`B01EXI8Y9S`), **Shure MV7** (`B0CTJ8BSWN`), **Audio-Technica ATH-M50x** (`B00HVLUR86`), **Deep Learning book** (`0262035618`), **SanDisk SSD** (`B0GMWYYRQL`).
- Display as a compact horizontal carousel with product images (from `resolvedLink.image`), titles, prices, and affiliate CTA links.
- Section title: something like "Studio gear picks" or "What we use"
- Include affiliate disclosure link to `/privacy#affiliates`.

#### C. Trending Signals Strip
- Pull the top 3–5 highest-scored items from the **latest journal entry** (same pattern as journal index page — `getCollection('journal')`, sort descending, take `[0].data.items`).
- Display as a compact horizontal row of signal cards with title, source badge, pillar dot, score, and link.
- Data types are defined in [src/data/trends.ts](file:///Users/josh/Documents/GitHub/makerportal-hub/src/data/trends.ts) — `TrendItem`, `pillarMeta`, `sourceLabels`.
- Section title: "Trending in the studio's orbit" or "Today's signals"
- Link to `/journal` for full archive.

### 3. Reorder Sections for Impact

**Proposed new section order:**

```
1. Hero ("Software with a point of view") + orbit visual     ← keep
2. Ticker bar                                                  ← keep
3. Apps Showcase (4 featured + expand/carousel for rest)       ← SHRUNK
4. Playground Carousel (4–6 interactive tools)                 ← NEW
5. Trending Signals Strip (top 3–5 from latest journal)        ← NEW
6. Blog — "Thinking in public" (3 latest posts)                ← MOVED UP
7. Gear Picks Carousel (6 affiliate items)                     ← NEW
8. Operating Principles — "A studio built for momentum"        ← MOVED DOWN
9. Technical Dashboard — "Engineered for Apple Silicon"         ← MOVED DOWN
10. Closing CTA — "Make the thing you wish existed"             ← keep
```

**Rationale:** Lead with products (compact), then immediately show the hub is alive with interactive tools and trending content. Blog posts feel more natural before the studio ethos sections. The technical dashboard is interesting but appeals to a narrower audience — push it below the fold.

---

## Key Files to Modify

| File | What to do |
|---|---|
| [src/pages/index.astro](file:///Users/josh/Documents/GitHub/makerportal-hub/src/pages/index.astro) | Major restructure — all section reordering, new carousel sections |
| [src/styles/global.css](file:///Users/josh/Documents/GitHub/makerportal-hub/src/styles/global.css) | Snap-scroll carousel styles, card compact variants |
| [src/data/affiliate-links.ts](file:///Users/josh/Documents/GitHub/makerportal-hub/src/data/affiliate-links.ts) | Import `resolveAffiliateLink` for gear carousel |
| [src/data/apps.ts](file:///Users/josh/Documents/GitHub/makerportal-hub/src/data/apps.ts) | `apps` array, `AppEntry` type, `featured` boolean field |
| [src/data/trends.ts](file:///Users/josh/Documents/GitHub/makerportal-hub/src/data/trends.ts) | `TrendItem`, `pillarMeta`, `sourceLabels` for signals strip |
| [src/components/AppCard.astro](file:///Users/josh/Documents/GitHub/makerportal-hub/src/components/AppCard.astro) | Keep as-is for the 4 featured; optionally create a `AppCardCompact` for carousel |

## Key Data Available

### Apps (11 live)
```ts
import { apps } from '../data/apps';
// Each: title, tagline, description, url, icon, iconSet{w64,w128,w256},
//        category, platform, accent, techBadges, featured, sequence
```

### Affiliate Links (30+ curated picks)
```ts
import { affiliateLinks, resolveAffiliateLink } from '../data/affiliate-links';
// resolveAffiliateLink(link) → { title, image?, price?, currency?, url, note, category }
```

### Trends (from latest journal)
```ts
import { getCollection } from 'astro:content';
import { pillarMeta, sourceLabels } from '../data/trends';
const journals = await getCollection('journal');
const latest = journals.sort((a, b) => b.id.localeCompare(a.id))[0];
const topItems = (latest.data.items as TrendItem[]).sort((a,b) => b.score - a.score).slice(0, 5);
```

### Playground Tools (26 tools)
No structured data file exists — tools are individual `.astro` pages in `src/pages/playground/`. You'll need to create a small curated array inline or in a data file. Each tool page has a hero with title and description.

---

## Design Constraints & Standing Rules

- **Astro 7 static site** — all data fetching is build-time only. No client-side fetches.
- **Tailwind v4** — use `@theme` tokens and semantic classes from global.css (bg-canvas, text-primary-text, border-border, etc.).
- **No placeholder text/images.** Use existing assets, affiliate images from Amazon catalog, or generate high-fidelity elements.
- **Maintain zero warnings/errors.** `astro check` must stay at 0 errors, 0 warnings. All tests must pass.
- **Light mode is default** (data-theme="light"). Dark mode via easter egg (Shift+T, triple-click logo). Both must look premium.
- **Scroll-driven animations** are already established — use `.animate-on-scroll` class or the `@supports (animation-timeline: view())` pattern from global.css.
- **`content-visibility: auto`** is already applied to heavy sections (#gear, #tools, #apps, #playground) for paint optimization.
- **`font-display: optional`** on both fonts (Plus Jakarta Sans, Inter) — no CLS from font swap.
- **Horizontal carousels** should use CSS snap scroll (`scroll-snap-type: x mandatory`, `scroll-snap-align: start`) with fade edges via gradient masks — no JS swiper libraries.
- **Affiliate links** must include the Amazon Associate tag (`engineersport-20`) and link to the disclosure at `/privacy#affiliates`.

---

## What Shipped in the Last Two Sessions

1. **Navigation Overhaul:** Deterministic active-tab highlighting with `routeOwner` Map, hash guard, desktop mega-dropdown child highlighting, mobile accordion active tracking.
2. **Latest Signals Redirect:** [src/pages/journal/latest.astro](file:///Users/josh/Documents/GitHub/makerportal-hub/src/pages/journal/latest.astro) resolves latest date at build time + static redirect + noindex.
3. **Explainer Section Micro-Animations:** Scroll-driven staggered fade-up on pillar items, hover pulse on pillar dots, scoring card hover lift with gradient header bar, signal bar grow animation.
4. **Menu Cross-Link Purge:** Removed redundant Signals Journal from Resources, Sponsored from Blog, Advertise from About, Affiliate picks from Shop.
5. **Font Loading:** Self-hosted variable fonts with `font-display: optional` + `preload` — no CLS.

---

## Verification Plan

```bash
# Must all pass before and after changes
node --test scripts/trends/pipeline.test.mjs
node --experimental-strip-types --test src/lib/*.test.ts
npx astro check
npx astro build
```

Then visually verify at `http://localhost:4321/`:
- Page loads with compact apps section (not 3,450px of cards)
- New carousels scroll smoothly with snap points
- Affiliate images load from Amazon catalog cache
- Trending signals show real data from latest journal entry
- Total page height reduced by ~40-50%
- Both light and dark themes look premium
- Mobile responsive (carousels become full-width horizontal scroll)
