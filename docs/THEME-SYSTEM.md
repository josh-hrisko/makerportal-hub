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

### Token roles

| Token | Dark | Light (intent) |
|-------|------|----------------|
| `--mp-canvas` | `#0F141C` | `#F4F1EB` |
| `--mp-card` | `#1A232E` | `#FFFFFF` |
| `--mp-elevated` | `#212D3A` | `#EBE6DE` |
| `--mp-text` | `#E8EEF6` | `#1A2330` |
| `--mp-muted` | `#A8B9CC` | `#5C6B7A` |
| `--mp-anchor` | `#71B9E3` | `#2A7AAB` |
| `--mp-cta` | `#F07A94` (display) / brand crimson `#CE445D` locked on App Grid | `#CE445D` |
| Paper | always warm `#F7F4EF` ink `#1A2330` | same |

Brand crimson **App Grid BR tile** stays `#CE445D` regardless of theme.

## Semantic helpers (prefer these)

```css
.surface-nav
.surface-card
.surface-elevated
.surface-footer
.surface-drawer
.reading-paper / .prose-paper / .reading-ink / .reading-muted / .reading-card
```

## Reading paper vs chrome theme

- **Chrome theme** (`data-theme`) recolors nav, footer, marketing pages.  
- **Reading paper** classes force a **paper reading environment** for long text (blog, privacy, terms).  
- Do not remove paper from long-form without an A/B; it was a deliberate polarity decision.

## Wordmark

`BrandLogo` wordmark paths use `fill="currentColor"`; `[data-brand-logo] { color: var(--mp-text) }` so light mode ink is dark.

## Known failure mode (open)

Many pages still use **dark-era hardcodes**:

- `text-white`, `text-primary-text/60` on white-ish surfaces  
- `border-white/[0.06]`, `bg-white/[0.03]`  
- literal `bg-[#1A232E]`, `bg-[#151D27]`

These look fine in dark mode and **fail WCAG / look washed or invisible in light mode**.

**Fix strategy for next agent:**

1. Audit with `data-theme="light"` on home, apps, contact, shop, team, mega menu, footer.  
2. Replace hardcodes with semantic tokens / Tailwind theme colors (`bg-canvas`, `bg-card-bg`, `text-primary-text`, `text-muted-text`, `border-border`, `bg-elevated`).  
3. Raise light-mode `--mp-muted` or border alpha if secondary text still fails 4.5:1.  
4. Re-check AppCard, ContactCard, orbit stage, ticker.  
5. Keep reading-paper independent.

See [HANDOFF-LIGHT-MODE.md](./HANDOFF-LIGHT-MODE.md).
