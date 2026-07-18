# Status — MakerPortal Hub (current state as of 2026-07-17; dated session logs below)

Single snapshot of what's live, what's built but pending, what's placeholder. Replaces scattered state that was in `OPEN-ITEMS.md` and handoff docs.

## Hub

- **Stack:** Astro 7 + Tailwind v4, `output: 'static'`, Vercel adapter, Pagefind search (build-time index)
- **Apps:** 11 live — AuraLinter (2026-07-10), Biquadia, Thumb-Dash, nymic, Notiary, akous, PopCloset, itria, GridVerse, MotionLink, BLExAR. 5 on `*.makerportal.ai`, 6 legacy on `makersportal.com` (bridge, migrating)
- **Theme:** Light default `#F4F1EB` canvas / white cards, dark via hidden triggers (D-010). A11y AA: muted 6.8:1, anchor 5.9:1. Tokens in `global.css`, semantic helpers `surface-card` etc.
- **Nav:** Single source `site-nav.ts`, ≤7 primary items, mega panels, ecosystem same-tab / true external new-tab (D-009), opaque surfaces (D-006)
- **Blog:** 8 posts in `src/content/blog/` — the 4 original + 4 developer-SEO field notes shipped 2026-07-17 (BLExAR, Notiary/PopCloset, AuraLinter, nymic), closing out every Phase 1 field note in `BACKLOG.md`. No AI pipeline. Trend-grounded draft scaffold (`scripts/trends/draft-post.mjs`) exists but is gated — see Trends digest entry below.
- **Playground:** `/playground` — one unified registry (`src/data/playground.ts`) for both app-grounded tools (`isGrounded: true`, "Lab" label, links back to the source app/field note) and exploratory math/physics toys (`isGrounded: false`), per D-018. **All 12 registry entries are `status: 'live'`** (last one, Conformal Mapping Explorer, shipped 2026-07-17 with a hand-written no-`eval` complex-expression parser — see BACKLOG.md Phase 1): quaternion ↔ Euler converter (cross-linked from the MotionLink field note; underwent a full critical-audit rewrite 2026-07-17, see D-020/D-021), Fourier epicycles, Live Earth (Day/Night + Live Weather + ISS Tracker), Double Pendulum + Phase Space, Chladni Cymatics, N-Body Orbital Choreography, Biquad Filter Designer, Head-Tracked Stereo Pan, CoreML Model Size Calculator, BLE GATT/CSV Frame Visualizer, Agentic DSP Pipeline Step-Through (AuraLinter's real LangGraph + `clang++` verification loop — not Biquadia's, despite consuming Biquadia-bound kernels), and Conformal Mapping Explorer.
- **Build:** `npm run build` → astro check + build + pagefind + strip-dev-pages (brand prod-hidden)

## Traffic (ground truth)

Search Console re-pull 2026-07-15 (evening): still **1 click, 3 impressions** (window 2026-06-15..2026-07-13) — unchanged from the first pull earlier the same day, expected at this stage, not a red flag. Vercel Web Analytics shipped this session (see Pipelines/Monetization below) — will add direct/referrer/App-Store visibility Search Console can't see, once deployed and toggled on in the Vercel dashboard. Re-check Search Console ~2026-07-29 before drawing conclusions; treat all monetization/audience claims as pre-traffic until then. Re-run via `node --env-file=.env scripts/search-console/build-report.mjs` (local-only, `analytics/reports/` gitignored — see below).

## Monetization surfaces (actual)

- **Amazon Associates:** 50 real picks in `affiliate-links.json`, sourced from makersportal.com posts (see `AFFILIATE-CANDIDATES.md`), grouped by app `<details>` collapsible on `/resources#gear`. Disclosure + `rel="sponsored"`.
  - Live enrichment: `scripts/amazon/fetch-items.mjs` + `build-catalog.mjs` + workflow `amazon-catalog.yml` (monthly). Creators API cred v3.1, OAuth2. `amazon-catalog.json` still empty — re-tested 2026-07-17 (past the 48h window), **still `AssociateNotEligible`**; this is no longer a timing issue, needs owner to check real eligibility status in Associates Central directly. `resolveAffiliateLink()` merges live data over static fallback.
- **Trends digest → Signals Journal:** Daily 14:00 UTC `trends-digest.yml` (was weekly, D-017). Pipeline `fetch → dedupe → gates → score → select` in `pipeline.mjs`, 13 fixture tests. **Auto-publishes (D-022):** commits that day's entry directly to `main` as `src/content/journal/YYYY-MM-DD.json` — no PR — so it goes live at `/journal/YYYY-MM-DD` (persistent per-day archive) and the latest entry surfaces on `/resources#trending`. Gate tests are the pre-publish safety net; the pillar-grouped summary is attached to the Actions run via `$GITHUB_STEP_SUMMARY`. Self-hosted webp thumbnails in `public/trends/` (no hotlink, privacy). Sources: Bluesky + Hacker News (**Reddit disabled, D-023** — no credentials). 6 pillars: on-device-ai, metal-ane, local-llm, dsp-audio, ios-craft, privacy-arch. `pillars` soft-tag reused on gear for re-ranking (D-017).
- **Trend-grounded blog draft (gated, not active):** `scripts/trends/draft-post.mjs` — manual-only CLI, not wired to any workflow/cron, takes a signal from the latest `src/content/journal/YYYY-MM-DD.json` entry + `--app <RealShippedApp>` and scaffolds a `draft: true` post. Refuses to run without a real app name (structural enforcement of the "shipped-app grounding" guardrail — the human-review gate for *blog content* stays, D-011). See `MONETIZATION.md` P3 for the full argued recommendation on why this stays dormant until 3-4 more Phase 1 field notes exist and the next Search Console check (~2026-07-29) shows real traffic.
- **Vercel Web Analytics:** `<Analytics />` from `@vercel/analytics/astro` in `Layout.astro` `<head>`, shipped 2026-07-15. Complements Search Console (search-referred only) with direct/referrer/App-Store visibility. Needs Web Analytics toggled on in the Vercel dashboard once deployed — no further code changes needed.
- **Gear re-ranking:** Daily pillar counts re-order gear groups + items, chips `↗ {Pillar}` + header `Re-ranked · trending`. Safe — same 50 ASINs, only sort. Verified 1724px height vs 5500px incident (D-016).
- **Shop:** Placeholder cards, MoR Lemon Squeezy chosen per D-014 (5%+50c, MoR tax handled, secure downloads), **not integrated**. See `MONETIZATION.md` for MVP plan ($19-29 per archive).
- **Email:** Buttondown chosen per D-014 (privacy-first, no tracking pixels), **not built**. Free first 100, $9/mo per addon.
- **/advertise:** Media kit shipped 2026-07-15 — live audience stats (11 apps, 6 pillars, 0 trackers from `apps.ts`/`trends.ts`), starting rates $300 note / $150 slot / $500 video, disclosure standards block. No booking/payment integration — inbound via `/contact` only. Low priority to push further given near-zero traffic (see Traffic section above) — nobody sponsors an unproven audience.
- **Search Console API:** `scripts/search-console/` (fetch-performance.mjs + build-report.mjs) — OAuth refresh-token grant reusing the credential from `analytics/gsc_dashboard.py` (an earlier session's manual Python dashboard, still present and still works). Deliberately local-only: not wired into GitHub Actions, output never touches `src/data/` or gets committed — this repo is public and search performance is private business data. Run via `node --env-file=.env scripts/search-console/build-report.mjs`, output in gitignored `analytics/reports/`. Watch for OAuth refresh-token expiry ~2026-07-19 if the consent screen is still "Testing" mode.
- **/watch:** Scaffold, no monetized channel yet.

## Pipelines

| Pipeline | Schedule | Input | Output | Secrets | State |
|----------|----------|-------|--------|---------|-------|
| `trends-digest.yml` | daily `0 14 * * *` | Bluesky (auth), HN Algolia | `src/content/journal/YYYY-MM-DD.json` + `public/trends/*.webp`, **committed directly to main** (auto-publish, D-022) | `BLUESKY_IDENTIFIER`, `BLUESKY_APP_PASSWORD` | Live, auto-publish verified 2026-07-17 |
| `amazon-catalog.yml` | monthly 1st + dispatch | `affiliate-links.json` ASINs | `amazon-catalog.json` + PR body | `AMAZON_CLIENT_ID`, `AMAZON_CLIENT_SECRET` | Built, empty cache until eligible; **still PR-gated** (human-curated ASINs, D-015) |
| `globe-data-digest.yml` | every 4h `0 */4 * * *` | Open-Meteo (16 cities) + Celestrak ISS TLE (both free, no key) | `weather.json` + `satellite.json`, **committed directly to main** | none | Combined weather+satellite (was two separate `weather-digest.yml`/`satellite-tle.yml`), direct-commit; feeds Live Earth |

No runtime API calls, no client secrets, no Vercel env vars for these — static data only. `globe-data-digest.yml` needs no secrets at all (both source APIs are free/keyless). Reddit is disabled in the trends pipeline (D-023) — no credentials, self-service access closed (D-011); `fetch-reddit.mjs` is retained dormant for a one-line re-enable.

## Open decisions

- D-014 (Lemon + Buttondown) still valid — Lemon acquired by Stripe 2024, future is Stripe Managed Payments (MoR persists, see Jan 2026 blog)
- D-015 (Creators API) pending 48h eligibility gate, batch size 10 untested
- D-017 (daily + re-ranking) shipped this session

## Last verifications (2026-07-17 session — doc/code reconciliation)

- Baseline re-verified clean: `npm run check` 0 errors/0 warnings/42 hints, `node --test scripts/trends/pipeline.test.mjs` 13/13, `npm run build` passes.
- Found and fixed significant doc drift: commit `19f8990` (2026-07-16 23:04) shipped 5 Playground tools (Biquad Filter Designer, Head-Tracked Stereo Pan, CoreML Model Size Calculator, BLE GATT/CSV Visualizer, Agentic DSP Pipeline Step-Through) that `BACKLOG.md`/`STATUS.md` still listed as unbuilt/blocked for almost a full day. Reconciled both docs against `src/data/playground.ts`'s actual `status` field rather than trusting prior doc text.
- Caught and corrected a fabrication risk before it shipped: the backlog's "Biquadia field note" item asked for clang++/LangGraph content that every real source in the repo attributes to **AuraLinter**, not Biquadia (Biquadia only consumes the kernels). Reworded the backlog item rather than writing a note that would've misattributed another app's pipeline.
- Caught an unimplemented claim: `BACKLOG.md` asserted the Fourier epicycles tool was "cross-linked from `/blog/inside-biquadia`" — it isn't; the page has no such link. Flagged in the doc, not yet fixed in code.
- `HANDOFF-NEXT.md`'s quaternion-page critical-audit brief was already fully executed (commits `a8b4a4c`, `5a185ac`, same day it was written) — the handoff doc itself was just never cleaned up after.
- Lesson for future sessions: treat `BACKLOG.md`/`STATUS.md` checkboxes as claims to verify against `git log`/registry `status` fields when a task looks suspiciously "already done" or "still blocked" — a fast multi-commit session can outrun doc updates within the same day.

## Last verifications (2026-07-15 evening session — backlog burn-down + content-engine review)

- Vercel Web Analytics shipped: `<Analytics />` from `@vercel/analytics/astro` in `Layout.astro`, verified present in build output on every page (`vercel-analytics` custom element).
- MotionLink field note shipped: `src/content/blog/motionlink-headphone-motion-api.md` — quaternion→Euler conversion (with the NaN-clamp gotcha), the undocumented relative-reference-frame reset, simulator/threading gotchas. Cross-linked to `/resources#gear` (AirPods Pro, the one gear pick tied to `motionlink`) and `/resources#trending`; live app linked directly.
- Content-engine idea (owner's trend-driven monetized blog framing) examined in full — argued recommendation landed in `MONETIZATION.md` P3: defer active drafting (scaled-content-abuse risk > weak early ROI, no traffic baseline yet), shipped-app grounding is the primary differentiator (not optional), real numbers/before-after is the strongest complement, named franchise and contrarian voice are situational not structural. `scripts/trends/draft-post.mjs` landed as a dormant, manually-invoked skeleton — tested (missing `--app` gate, invalid-app gate, valid run all verified, test artifact deleted before commit-worthy state).
- Search Console re-pull: still 1 click / 3 impressions, unchanged from morning pull — auth still working cleanly, no action needed before ~2026-07-19 expiry watch.
- Build: passes clean (exit 0), 20 pages indexed (was 19).
- Lemon Squeezy store + Buttondown newsletter: still not created — this session has no browser/account access, re-flagged in `BACKLOG.md` Phase 4 as the single highest-priority owner action, sitting 3+ sessions.

## Last verifications (2026-07-15 session — autonomous roadmap)

- Build: passes (astro check + pagefind + strip) — 19 pages indexed, 1956 words (up from 1824 after shop+newsletter)
- /resources#gear: 7 groups, 52 Amazon links, BLExAR 33 collapsed, trending groups open (≤6 items), 1724px bbox (D-016 fix)
- /shop: shop.json SSOT (3 archives $19-29 + tip PWYW $9 floor), Lemon.js overlay, bundle $49 save $39 banner, MoR VAT note, newsletter embed — needs Lemon Buy URLs (owner action)
- /blog + /resources + /shop: ButtondownSignup component (privacy-first, no pixels) — needs username prop (owner action)
- /press: icons zip `public/press/makerportal-icons.zip` 98KB (128+256 webp) + boilerplate 11 apps + pillars + usage notes — now downloadable
- Nav: full-width sticky opaque `bg-canvas/95` + border, active underlines `aria-current=page`, search glyph CmdK + focus trap (SearchModal), mobile drawer solid (no backdrop-filter per D-006), theme toggle hidden but triple-click logo / Shift+T / double-click footer pill still work (D-010)
- Hero: orbit randomizer with requestIdleCallback + batched rAF (deferred after LCP), Build/Learn/Ship center node 0.42rem mono, kickers removed per handoff (preserved easter-egg footer pills)
- Blog prev/next: `grid-cols-2` side-by-side on mobile (was stacked)
- Contact slider: fixed centering `top-1/2 -translate-y-1/2` (was `top-2` 1px off due to border-box)
- View Transitions: `ClientRouter` from `astro:transitions` in Layout head, 0.35s cubic-bezier(0.16,1,0.3,1). Nav `view-transition-name: site-nav` removed + `data-astro-rerun` added to nav/search inline scripts (826bc48) — verified live 2026-07-15 on makerportal.ai: Apps→Journal→Guides mega switch works across repeated ClientRouter navigations.
- Performance: `content-visibility: auto` for #tools #gear #products #trending (700px intrinsic), `details` open anim via `interpolate-size: allow-keywords` + `@starting-style`, AppCard blur 40px mobile / 80px desktop (was 80px mobile heavy), lighthouse-budget.json added (FCP 1.8s, LCP 2.5s, CLS 0.1, TBT 200, total 500KB)
- Creators API: re-tested 2026-07-15 — still 403 `AssociateNotEligible` expected (48h window from 16:36 UTC), cache untouched, will re-test after 2026-07-17
- Secrets only in `.env` + GitHub Actions repo secrets, no client-side secrets, no runtime API calls
- Light mode: no `text-white` on light canvas, badges primary-text + dot AA, AppCard iconDot + accent overrides verified
- Docs: compressed from 11 → 8 active + archive (README updated)
