# Things that didn’t work (do not re-learn)

## Mobile / perf

- **Stacked `backdrop-filter`** on fixed nav + menu + drawers → iOS Safari lag, menu open delay.  
- **Huge ATF `filter: blur(120–140px)` auras** → paint cost / LCP Element Render Delay.  
- **Hero text `opacity: 0` fade-up** → delayed LCP.  
- **Dual scroll listeners** → thrash under fixed header; use one rAF.  
- **Lockup autoplay on mobile load** → hurt LCP; desktop hover only.  
- **Chrome responsive mode ≠ real iOS Safari** for compositing.

## Brand / motion

- **Tailwind v4 `scale-*` / `translate-*`** set independent CSS properties, not `transform` — animate matching properties.  
- **CDP synthetic mouse** often fails `:hover`; use `CSS.forcePseudoState` for hover tests.  
- **Astro dev staleness** — kill/restart port 4321 if CSS doesn’t update.

## IA / SEO

- **Deep hub product pages** competing with subdomains — rejected.  
- **Prod `/brand` static shell as 200** — fixed with strip script; keep PROD 404 + strip.

## Theme

- **Inverting only `background` without tokenizing text/borders** → light mode contrast disaster (current debt).  
- **Pure black `#000` canvas** — avoid (OLED smear / harshness); we use near-black `#0F141C`.

## Testing

- **Lighthouse mobile simulation ≠ iPhone Safari** for blur/compositing.  
- **Prod-like:** `npm run build` → serve `.vercel/output/static`.
