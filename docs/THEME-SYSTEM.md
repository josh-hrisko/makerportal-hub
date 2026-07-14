# Theme system — design & engineering notes

## Goals

1. **Light default (as of 2026-07-14)** — was dark studio brand (on-device / privacy), now light for broader appeal + a11y-verified contrast 6.8:1 / 5.9:1 / 5.82:1. Dark still available via hidden triggers.  
2. **Hidden toggle** — no visible chrome; secret triggers for power users (see D-010).  
3. **Reading paper** — warm light for long-form (blog, legal) for dwell/readability research — stays independent of chrome theme.  
4. **No pure `#000` / pure white glare** — near-black canvas `#0F141C`, warm paper `#F4F1EB`.

## Mechanism (2026-07-14 — light default + invisible toggle)

| Piece | Implementation |
|-------|----------------|
| Attribute | `html[data-theme="light" \| "dark"]` — now `light` default |
| Persistence | `localStorage['mp-theme']` + `?theme=dark|light` URL param |
| FOUC prevention | Inline script in `Layout.astro` `<head>` — light fallback, param-aware |
| Toggle UI | `.theme-toggle {display:none !important}` — hidden; secret triggers: triple-click `[data-brand-logo]` within 1.2s, `Shift+T` keyboard (ignores inputs), double-click `[data-theme-easter-egg]` footer pill, `?theme=` param. Original toggle kept in DOM for JS but hidden; easy restore via commenting out display:none |
| Tokens | CSS variables `--mp-*` in `src/styles/global.css` |
| Tailwind bridge | `@theme { --color-canvas: var(--mp-canvas); ... }` |

### Token roles (2026-07-13 — light contrast + a11y pass)

| Token | Dark | Light (actual) | Notes / Ratio vs canvas `#F4F1EB` + white |
|-------|------|----------------|-------------------------------------------|
| `--mp-canvas` | `#0F141C` | `#F4F1EB` | Warm paper-canvas; near-white but not glare |
| `--mp-card` | `#1A232E` | `#FFFFFF` | Pure white cards lift via border+shadow in light |
| `--mp-elevated` | `#212D3A` | `#E8DFD1` | Was `#EBE6DE`; darkened for visible separation from canvas. Badges, icon wells, chips |
| `--mp-nav` | `#151D27` | `#FFFFFF` | Opaque pill nav — no backdrop-filter (iOS perf lock) |
| `--mp-footer` | `#0C1118` | `#EAE2D4` | Slightly darker than elevated for footer grounding |
| `--mp-text` | `#E8EEF6` | `#16202E` | 14.5:1 canvas, 16.4:1 white |
| `--mp-muted` | `#A8B9CC` | `#4A5D6F` | Was `#5C6B7A` (~4.2:1 white, failed). Now 6.04:1 canvas, 6.8:1 white — AA for meaningful secondary |
| `--mp-border` | `rgba(255,255,255,0.08)` | `rgba(22,32,46,0.14)` | Was 0.10 faint; 0.14 visible separation |
| `--mp-border-strong` | `rgba(255,255,255,0.14)` | `rgba(22,32,46,0.22)` | Hover states |
| `--mp-anchor` | `#71B9E3` | `#256997` | Was `#2A7AAB` 4.17:1 canvas (just under). Now `#256997` 5.25:1 canvas, 5.92:1 white — AA |
| `--mp-cta` | `#F07A94` / brand crimson `#CE445D` locked BR | `#B8324F` | Was `#CE445D` 4.04:1 canvas. Now `#B8324F` 5.16:1 canvas, 5.82:1 white — AA. BR tile stays `#CE445D` locked |
| `--mp-shadow-*` | heavy black | soft ink `rgba(22,32,46,0.06-0.18)` | Theme-aware elevation |

Brand crimson **App Grid BR tile** stays `#CE445D` regardless of theme. Only `mp-cta` text is darkened to `#B8324F` for a11y (brand tile locked).

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

## Accent contrast (violet / amber / emerald) — a11y pass 2026-07-13

`AppCard` and ticker dots originally used pastel Tailwind:

- `text-violet-300` (#c4b5fd) ≈ 2:1 on white, `bg-violet-400` (#a78bfa) ≈ 2.2:1
- `text-amber-300` (#fcd34d yellow) ≈ 1.5:1 on white, `bg-amber-400` (#fbbf24) ≈ 1.6:1
- `bg-emerald-400` (#34d399 light green) ≈ 1.8:1 on white

All fail WCAG non-text 3:1, and text needs 4.5:1. Fix in `global.css` light overrides:

- Violet text: `text-violet-300` → `#5b21b6` (8.98:1 white, 7.97:1 canvas), `text-violet-400` → `#6b21a8` (6.5:1)
- Violet bg dots: `bg-violet-400/500` → `#7c3aed` (5.7:1) / `#6d28d9` (7.1:1)
- Amber text (yellow on white): `text-amber-300` → `#78350f` (9.07:1), `text-amber-400` → `#92400e` (7.09:1) — still reads amber/brown, not pure yellow which can't pass on white
- Amber bg dots: `bg-amber-400/500` → `#b45309` (5.02:1) / `#92400e` (7.09:1)
- Emerald status dots (shipping, ANE Active, live): `bg-emerald-400` → `#047857` (5.48:1), `bg-emerald-500` → `#065f46` (7.68:1)
- Badge washes `bg-*-500/10` boosted to 14% mix for visibility in bright sun
- Success/error in `ContactCard`: `text-emerald-200/300` (was ~1.2:1 white) → `#065f46`/`#047857`, `text-red-300` → `#991b1b` (8.31:1), backgrounds 10% → 10-12% mix of dark base

Why not keep pure yellow? Pure yellow #fcd34d on white is 1.5:1 — physically impossible to make readable. WCAG requires we darken to amber-brown but keep warm hue. Same for light purple — we darken to deep violet but keep purple family. This is standard a11y trade: hue preserved, lightness lowered.

Documented inline in `AppCard.astro` + `global.css:540+`.

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
- [ ] Accents violet/amber/emerald: verify `text-violet-300` → `#5b21b6` 8.9:1, `bg-violet-400` → `#7c3aed` 5.7:1, `text-amber-300` yellow → `#78350f` 9:1 (pure yellow impossible), `bg-emerald-400` light green → `#047857` 5.48:1, etc overridden in light — text ≥4.5:1, dots ≥3:1, visible in bright sun and low light
- [ ] `color-mix` preferred over `rgba(white,…)` for overlays — e.g., `from-[color-mix(in_srgb,var(--mp-text)_6%,transparent)]`
- [ ] Brand cta `#CE445D` stays locked for App Grid tile, but `mp-cta` text `#B8324F` and `mp-anchor` `#256997` give ≥5:1 canvas — kicker/links readable

Run `npm run build` — must pass `astro check` + static build + strip-dev-pages.
