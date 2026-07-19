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

## Privacy / measurement

- **`@vercel/analytics` did not meet this repo's zero-third-party-runtime
  boundary.** Browser QA exposed a request to `va.vercel-scripts.com`; the
  component and package were removed in `234daa5`. Do not re-add it (or another
  hosted analytics SDK/pixel) without an explicit privacy-policy change.
- **`mp_analytics_log` is not aggregate analytics.** It is a 100-event
  per-browser localStorage log with no upload path. Turning its unlock/click
  count into visible “people used this” social proof would be fabricated.
- **A clean export must not imply newsletter consent.** The first ExportGate
  draft could POST when Buttondown was configured. It now requires a separate,
  unchecked opt-in; unlock/download works without the request.
- **Hotlinked merchant artwork is not network-silent.** `no-referrer` prevents
  referrer leakage, but the image host still sees IP/user-agent when a lazy card
  enters range. This is disclosed on `/privacy`; do not call it zero-network.

## SaaS / GPU labs

- **Separate “ping” and GPU benchmark functions gave misleading cold/warm
  comparisons.** Modal ping now POSTs to the same GPU function/container pool;
  endpoint-observed compute time and browser wall time stay distinct.
- **Prefilled benchmark bars are not acceptable evidence.** The Modal chart
  starts empty and displays only browser measurements or values returned by the
  visitor's endpoint. Nonpositive values must never enter a log scale.
- **Free-form comments appended to JSON break the export.** JSON watermarks now
  use a `_makerportal_watermark` field so both free and clean variants parse.
- **`projection.invert()` alone is insufficient map hit-testing.** Clicks in a
  rectangular canvas corner can fall outside the globe; reject points beyond
  the projected sphere and separate marker clicks from map placement.
- **Provider SDK snippets age quickly.** The Modal decorator was checked against
  current `modal.fastapi_endpoint` docs on 2026-07-19. Re-check official docs
  before future edits instead of trusting the handoff.
