# Theme system — design & engineering notes

## Goals

1. **Dark studio default** — matches on-device / privacy-first / App Grid brand.  
2. **Optional light chrome** — system preference + manual toggle.  
3. **Reading paper** — warm light for long-form (blog, legal) for dwell/readability research.  
4. **No pure `#000` / pure white glare** — near-black canvas, warm paper.

## Mechanism

| Piece | Implementation |
|-------|----------------|
| Attribute | `html[data-theme="dark" \| "light"]` |
| Persistence | `localStorage['mp-theme']` |
| FOUC prevention | Inline script in `Layout.astro` `<head>` before CSS paint |
| Toggle UI | `.theme-toggle` + `[data-theme-toggle]` (nav + mobile drawer) |
| Tokens | CSS variables `--mp-*` in `src/styles/global.css` |
| Tailwind bridge | `@theme { --color-canvas: var(--mp-canvas); ... }` |

### Token roles (2026-07-13 — light contrast pass)

| Token | Dark | Light (actual) | Notes |
|-------|------|----------------|-------|
| `--mp-canvas` | `#0F141C` | `#F4F1EB` | Warm paper-canvas; near-white but not glare |
| `--mp-card` | `#1A232E` | `#FFFFFF` | Pure white cards lift via border+shadow in light |
| `--mp-elevated` | `#212D3A` | `#E8DFD1` | Was `#EBE6DE`; darkened slightly for visible separation from canvas (`#F4F1EB` → `#E8DFD1` = ~9→15 L* delta). Used for badges, icon wells, secondary chips |
| `--mp-nav` | `#151D27` | `#FFFFFF` | Opaque pill nav — no backdrop-filter (iOS perf lock) |
| `--mp-footer` | `#0C1118` | `#EAE2D4` | Slightly darker than elevated for footer grounding |
| `--mp-text` | `#E8EEF6` | `#16202E` | Was `#1A2330`; darkened to `16202E` for extra headroom on canvas/card |
| `--mp-muted` | `#A8B9CC` | `#4A5D6F` | Was `#5C6B7A` (~4.2:1 on white, failed where opacity `/70` used). Now `#4A5D6F` ≈ 6.2:1 on white, 5.6:1 on canvas — passes AA for meaningful secondary text. Opacity variants (`/70`, `/80`) kept for decorative only |
| `--mp-border` | `rgba(255,255,255,0.08)` | `rgba(22,32,46,0.14)` | Was 0.10, too faint. 0.14 gives visible card separation without muddiness |
| `--mp-border-strong` | `rgba(255,255,255,0.14)` | `rgba(22,32,46,0.22)` | New token for hover states — replaces `hover:border-white/15` |
| `--mp-anchor` | `#71B9E3` | `#2A7AAB` | Brand blue flips |
| `--mp-cta` | `#F07A94` (display) / brand crimson `#CE445D` locked on App Grid | `#CE445D` | Crimson always locked for App Grid BR tile |
| `--mp-shadow-*` | heavy black | soft ink `rgba(22,32,46,0.06-0.18)` | Theme-aware elevation (see below) |

Brand crimson **App Grid BR tile** stays `#CE445D` regardless of theme.

### Theme-aware shadows (new)

Light mode pure white cards on warm canvas need **shadow + border** to separate — border alone felt muddy, shadow alone felt floating. Solution:

- `--mp-shadow-nav`: dark = `0 8px 32px -8px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.06)`; light = `0 8px 30px -12px rgba(22,32,46,0.14), 0 1px 2px rgba(22,32,46,0.06), inset 0 1px 0 rgba(255,255,255,0.9)`
- `--mp-shadow-card`: dark = heavy `0 10px 30px -10px rgba(0,0,0,0.5)…`; light = `0 1px 2px rgba(22,32,46,0.06), 0 6px 20px -8px rgba(22,32,46,0.12)`
- `--mp-shadow-card-hover`: light lifts to `0 2px 8px rgba(22,32,46,0.08), 0 12px 32px -10px rgba(22,32,46,0.18)`
- `.surface-*` classes now emit `box-shadow: var(--mp-shadow-*)` so nav / cards / drawer automatically adapt.

This satisfies optional stretch: "Theme-aware shadows/rings for light (softer elevation)" + `color-mix` over raw `rgba(white)` overlays (see global.css notes).

## Semantic helpers (prefer these)

```css
.surface-nav        /* bg-nav + border + nav-shadow */
.surface-card       /* bg-card + border + card-shadow (+ hover) */
.surface-elevated   /* bg-elevated + border + elevated-shadow */
.surface-footer
.surface-drawer     /* bg-nav + border + drawer shadow, light override softer */
.reading-paper / .prose-paper / .reading-ink / .reading-muted / .reading-card
```

**Rule:** Never use `text-white`, `border-white/*`, `bg-white/*`, `bg-[#1A232E]` etc on marketing/hub pages. Those are dark-era leftovers that become invisible in light. Use `bg-canvas`, `bg-card-bg`, `bg-elevated`, `text-primary-text`, `text-muted-text`, `border-border`, `border-[var(--mp-border-strong)]`.

## Reading paper vs chrome theme

- **Chrome theme** (`data-theme`) recolors nav, footer, marketing pages.  
- **Reading paper** classes force a **paper reading environment** for long text (blog, privacy, terms).  
- Do not remove paper from long-form without an A/B; it was a deliberate polarity decision.
- Paper uses its own tokens `--mp-paper-*` — intentionally independent of chrome light tokens so blog stays warm even when chrome is dark, and vice versa.

## Wordmark

`BrandLogo` wordmark paths use `fill="currentColor"`; `[data-brand-logo] { color: var(--mp-text) }` so light mode ink is dark.

## Accent contrast (violet / amber)

`AppCard` originally used `text-violet-300` and `text-amber-300` — pastel, great on dark `#1A232E` (≈ 8:1), fails on white (≈ 2:1). Fix:

- Global overrides in `global.css`: `html[data-theme="light"] .text-violet-300 { color:#6d28d9 }` (≈ 6.5:1 on white) etc.
- Dots switched from `bg-violet-400` (light) to `bg-violet-500` base then light override to `#7c3aed` / `#b45309` for visibility.
- Signal (`primary-cta`) and Rose (`brand-anchor`) already theme-aware via tokens — no override needed.

Documented inline in `AppCard.astro` + `global.css`.

## Fixed pages (2026-07-13 pass)

- `Layout.astro`: mobile drawer `text-white/90` → `text-primary-text`, `hover:bg-white/[0.04]` → `hover:bg-elevated`, nav shadow tokenized, drawer shadow via `.surface-drawer`, 404 CTAs `border-white/10 bg-white/[0.04]` → `border-border bg-elevated`
- `AppCard.astro`: `bg-[#1A232E]` → `bg-card-bg` via `surface-card`, `bg-[#0F141C]` icon well → `bg-canvas`, `border-white/*` → `border-border`, `bg-white/[0.03]` → `bg-elevated/70`, spotlight uses `color-mix(in srgb, var(--mp-text) 6%, transparent)` not raw `rgba(white)`, title `text-white` → `text-primary-text`, description `text-primary-text/75` → `text-muted-text` for AA
- `ContactCard.astro`: same tokenization, inputs `bg-[#0F141C] text-white border-white/10` → `bg-canvas text-primary-text border-border`, unlock track `bg-[#0F141C]` → `bg-canvas`, handle `bg-white text-canvas` → `bg-primary-text text-canvas` so knob stays visible in light (white on `#F4F1EB` disappeared), submit `bg-white` → `bg-primary-text`, JS `label.classList.add('text-white')` → `text-primary-text`
- `index.astro`: full sweep — hero `border-white/[0.06]` → `border-border`, `from-[#1A232E]/40` → `from-elevated/40`, hero `text-white` → `text-primary-text`, badges `border-white/5 bg-white/[0.03]` → `border-border bg-elevated`, CTA `bg-white` → `bg-primary-text`, orbit lines `border-white/[0.07]` → `border-border`, center node `bg-[#1A232E]` → `bg-card-bg`, orbit apps `bg-[#1E2C3A] border-white/10` → `bg-card-bg border-border` + shadow token, ticker `bg-[#151D27] border-white/[0.06]` → `bg-elevated border-border` + gradient `var(--mp-canvas)`, apps header `text-white` → `text-primary-text`, meta bar `bg-white/[0.02]` → `bg-elevated/60`, tech dashboard `bg-[#0C1118]/50 border-white/[0.06]` → `bg-elevated/40 border-border`, terminal `bg-[#151D27]/80 border-white/10` → `bg-card-bg border-border` + surface-card, operating principles + blog + closing similarly tokenized
- `apps.astro`, `contact.astro`, `shop.astro`, `resources.astro`, `watch.astro`, `advertise.astro`, `press.astro`, `404.astro`: all `border-white/[0.06]`, `bg-[#1A232E]`, `bg-[#151D27]`, `bg-white`, `text-white`, `hover:text-white` → `border-border`, `bg-card-bg`/`bg-elevated`, `text-primary-text`/`text-muted-text`, `hover:text-primary-text`

Remaining hardcodes intentionally kept:

- `src/pages/brand.astro` — prod-hidden `/brand` (strip script deletes output). Full dark showcase, not part of public IA. Left for dev reference.
- `src/pages/blog/index.astro` reading-paper hover `bg-white/40` / `bg-white/60` — on paper `#F7F4EF` white is close to `var(--mp-paper-card)` (#FFF). Decorative, not chrome contrast debt.

## Light mode QA checklist (new)

For any new page or component, force `html[data-theme="light"]` in DevTools and check:

- [ ] No invisible text: no `text-white` on light canvas/card, no `text-primary-text/60` where meaning lives (use `text-muted-text` which is 6:1+)
- [ ] Borders visible but not muddy: `border-border` (0.14) default, `border-[var(--mp-border-strong)]` (0.22) hover
- [ ] Cards clearly separated: `surface-card` gives `bg-card-bg` + `border-border` + `shadow-card`; elevated chips use `bg-elevated`
- [ ] CTAs: primary action `bg-primary-text text-canvas` (flips: light button dark text in dark, dark button light text in light). Never `bg-white text-canvas` on a card that is white in light
- [ ] Focus rings visible in both themes: uses `--mp-focus` token (dark blue light, darker blue light)
- [ ] Inputs: `bg-canvas border-border text-primary-text` — canvas darker than card in light gives well contrast
- [ ] Orbit / AppCard glow decorative still 0.12 opacity, not blinding
- [ ] Mega nav: `surface-card` panel, hover `bg-elevated/80`, not `bg-white/[0.04]`
- [ ] Mobile drawer: text `text-primary-text` not `text-white/90`, hover `bg-elevated` not `bg-white/[0.04]`, backdrop `bg-canvas/70` ok
- [ ] Blog/paper: keep `.reading-paper` independent — do not convert long-form to chrome tokens
- [ ] Shadows: light uses soft ink shadow, dark heavy — never raw `shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.06)]` hardcoded in component (use token)
- [ ] Accents violet/amber: verify `text-violet-300` etc overridden in light via global.css — contrast ≥4.5:1
- [ ] `color-mix` preferred over `rgba(white,…)` for overlays — e.g., `from-[color-mix(in_srgb,var(--mp-text)_6%,transparent)]`

Run `npm run build` — must pass `astro check` + static build + strip-dev-pages.
