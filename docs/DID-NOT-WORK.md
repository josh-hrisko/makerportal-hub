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
- **Signals as a primary-nav peer of Resources (pre-D-024)** — users could not tell
  “daily stuff” from “library.” Signals Journal is one *engine inside Library*, not a
  peer pillar. Re-adding it as top-level recreates the confusion. Keep under Library
  mega + footer Explore; URL `/journal` stays stable.
- **Watch as primary while scaffold-only** — empty top-level tabs train distrust.
  Watch lives under Studio mega + footer until real series ship. Do not re-promote.
- **Playground buried only under Resources** while 32 instruments were the strongest
  interactive differentiator — elevated to primary **Lab** (`/playground`) in D-024.
  Do not demote Lab back under Library-only without a decision.
- **Renaming nav IDs without updating `Layout.astro` `routeOwner`** — e.g. old map had
  `['/playground','resources']`; after Lab ownership, playground would still light
  Library if the pre-map is stale. First-claimant columns + pre-map must match D-024
  in the **same commit** as `site-nav.ts`.
- **Nav label change without `scripts/generate-llms.ts` + SearchModal** — agent/search
  surfaces drift from chrome. Fold llms regen + quick-link labels into the IA commit.
- **`name.split('(')[0]` board short names** — collides `Raspberry Pi 5 (8 GB)` and
  `(16 GB)` into identical labels in matrix headers, spider chips, kit cards.
  Always use `shortBoardLabel()` (`src/lib/edge-radar-labels.ts` /
  `radar-core.mjs`). Gate test asserts unique labels across BOARDS.
- **Future-dated `src/content/edge-radar/YYYY-MM-DD.json`** — TrendSparkline and
  “latest” sort treat lexical max as newest; a 2026-07-23 file on 2026-07-22 made
  history look ahead of wall clock. Filename date = actual UTC publish day only.
  One snapshot file per day; delete accidental futures.
- **SparkFun links for Raspberry Pi boards expecting commission** — Pi is third-party
  on SparkFun; program pays $0. Use Amazon ASINs + `engineersport-20` (already migrated).

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
- **Credit-grant / free-token DevRel path rejected 2026-07-19.** Owner wants
  established stable affiliate programs only (PartnerStack, Pinecone Affiliate).
  No Modal/Fly free compute token pitches, no billing-alert-less pilot with
  spend risk. Labs remain educational, not monetized. `DEVREL-PITCHES-SAAS-GPU.md`
  is marked deprecated so future agents do not re-open.

## Affiliate research

- **PartnerStack Network Marketplace swept 2026-07-19 (~50 programs) — do not
  re-sweep.** Only Kit, Thinkific, 1Password, and Brevo passed public-terms
  verification plus audience fit, and all four are deferred: Brevo/Webflow-style
  programs gate on existing traffic (recheck ~2026-07-29), Kit conflicts with the
  Buttondown choice unless framed as an honest comparison note, Thinkific needs a
  real course product first. Rejected categories — HR/payroll/fintech/accounting,
  sales/CRM, enterprise security, consumer antivirus/identity, proxy networks
  (Bright Data), off-pillar one-offs — have zero audience intent or clash with the
  privacy-first stance; re-researching them is wasted effort. Full verified-terms
  table, unverified list, and the go-forward rule live in
  `AFFILIATE-CANDIDATES.md` → "PartnerStack Network marketplace sweep (2026-07-19)".

## Hugging Face Hub API (EdgeSpec radar, learned 2026-07-22)

- **`?library=gguf` and `?tags=gguf&sort=lastModified` are spam-dominated.**
  The freshest-by-modified tag lists are mostly training-checkpoint repos that
  carry the tag but ship zero `.gguf` files (40 candidates → 1 usable). Do not
  tune keywords against this noise — the fix that worked is curated author
  feeds (`?author=bartowski&search=GGUF`, `?author=unsloth&search=GGUF`,
  `?author=onnx-community`) entering the candidate pool *before* the tag lists,
  verified 2026-07-22 to ship parseable artifacts daily.
- **`?files_metadata=true` returned `size: null` for LFS files** (observed on
  `bartowski/*` repos). The only reliable byte source is
  `/api/models/{repo}/tree/main?recursive=true` — every entry carries a real
  `size`. Treat the tree API as ground truth; never publish a byte count from
  any other field.
- **`sort=likes7d` list responses omit `lastModified`** (only `createdAt` is
  present). Radar needs a per-repo detail call for gated survivors to get
  `lastModified`; budget it (`DETAIL_BUDGET`) instead of fetching detail for
  every candidate.
- **Trending models tagged `gguf` are usually safetensors repos** with an
  incidental tag — the tree gate ("must contain a parseable quant `.gguf`
  file") is what actually filters them. The gate is the design, not a bug.
- **`i1-GGUF`-style repos ship only `imatrix.gguf`** files (no quant token in
  the name) — correctly rejected by `parseGgufFilename`; don't add a fallback
  that treats imatrix files as runnable models.
- **Repo names lie about parameter counts.** Observed: `prism-ml/Bonsai-27B-gguf`'s
  Q8_0 file is 600 MiB (≈0.6B params by bytes÷bpw), not 27B. The radar derives
  ≈params from verified bytes ÷ quant bpw and the page FAQ says so — never
  parse param counts from repo titles.

## Generated-page UX (Engine 1, learned 2026-07-22)

- **A wide table on mobile needs a sticky first column.** Plain
  `overflow-x-auto` on the fit matrix scrolled the model names out of view;
  `sticky left-0 z-10 bg-card-bg` on the first `th`/`td` (plus a subtle offset
  shadow) keeps row context while swiping. Verify with
  `wrapper.scrollLeft = N` in the QA script, not just document-level overflow.
- **Text-only kit link rows on auto-generated pages = zero external requests
  at load.** The radar renders curated buy links as compact text rows (no
  merchant `<img>`), which keeps the privacy boundary absolute (no IP/UA leak
  to image hosts) and CLS at zero. Product imagery stays on human-curated
  surfaces (`/resources#gear`, simulator GearCarousels) where it's already
  disclosed.
- **`astro check` lints `scripts/**/*.mjs` too** — an unused import in a
  pipeline test surfaced as a `ts(6133)` hint. Keep script imports exact;
  the bar is 0 errors / 0 warnings / 0 hints.
- **Playwright QA without polluting the repo:** `playwright-core` installed in
  a scratch dir outside the repo + system Chrome
  (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) as
  `executablePath` — no browser download, no package.json changes. Playwright
  browser builds are also already cached at `~/Library/Caches/ms-playwright`.
- **Every build regenerates `public/llms*.txt`** (date stamp + latest journal
  items). That's expected diff noise — fold it into the current commit rather
  than reverting or committing it separately.
