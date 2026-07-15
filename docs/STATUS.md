# Status — MakerPortal Hub (as of 2026-07-15)

Single snapshot of what's live, what's built but pending, what's placeholder. Replaces scattered state that was in `OPEN-ITEMS.md` and handoff docs.

## Hub

- **Stack:** Astro 7 + Tailwind v4, `output: 'static'`, Vercel adapter, Pagefind search (build-time index)
- **Apps:** 11 live — AuraLinter (2026-07-10), Biquadia, Thumb-Dash, nymic, Notiary, akous, PopCloset, itria, GridVerse, MotionLink, BLExAR. 5 on `*.makerportal.ai`, 6 legacy on `makersportal.com` (bridge, migrating)
- **Theme:** Light default `#F4F1EB` canvas / white cards, dark via hidden triggers (D-010). A11y AA: muted 6.8:1, anchor 5.9:1. Tokens in `global.css`, semantic helpers `surface-card` etc.
- **Nav:** Single source `site-nav.ts`, ≤7 primary items, mega panels, ecosystem same-tab / true external new-tab (D-009), opaque surfaces (D-006)
- **Blog:** 3 human posts in `src/content/blog/`, no AI pipeline
- **Build:** `npm run build` → astro check + build + pagefind + strip-dev-pages (brand prod-hidden)

## Monetization surfaces (actual)

- **Amazon Associates:** 50 real picks in `affiliate-links.json`, sourced from makersportal.com posts (see `AFFILIATE-CANDIDATES.md`), grouped by app `<details>` collapsible on `/resources#gear`. Disclosure + `rel="sponsored"`.
  - Live enrichment: `scripts/amazon/fetch-items.mjs` + `build-catalog.mjs` + workflow `amazon-catalog.yml` (monthly). Creators API cred v3.1, OAuth2. `amazon-catalog.json` currently empty (still `AssociateNotEligible` 48h window from 2026-07-15 16:36 UTC). Re-test after 2026-07-17. `resolveAffiliateLink()` merges live data over static fallback.
- **Trends digest:** Daily 14:00 UTC `trends-digest.yml` (was weekly, D-017). Pipeline `fetch → dedupe → gates → score → select` in `pipeline.mjs`, 13 fixture tests, PR with pillar-grouped summary + self-hosted webp thumbnails `public/trends/` (no hotlink, privacy). Feeds `/resources#trending` (featured + grid, signal bars). 6 pillars: on-device-ai, metal-ane, local-llm, dsp-audio, ios-craft, privacy-arch. `pillars` soft-tag reused on gear for re-ranking (D-017).
- **Gear re-ranking:** Daily pillar counts re-order gear groups + items, chips `↗ {Pillar}` + header `Re-ranked · trending`. Safe — same 50 ASINs, only sort. Verified 1724px height vs 5500px incident (D-016).
- **Shop:** Placeholder cards, MoR Lemon Squeezy chosen per D-014 (5%+50c, MoR tax handled, secure downloads), **not integrated**. See `MONETIZATION.md` for MVP plan ($19-29 per archive).
- **Email:** Buttondown chosen per D-014 (privacy-first, no tracking pixels), **not built**. Free first 100, $9/mo per addon.
- **/advertise:** Exists with format copy (sponsored note, resource slot, video integration), no live integration / pricing kit yet.
- **/watch:** Scaffold, no monetized channel yet.

## Pipelines

| Pipeline | Schedule | Input | Output | Secrets | State |
|----------|----------|-------|--------|---------|-------|
| `trends-digest.yml` | daily `0 14 * * *` | Bluesky (auth), HN Algolia, Reddit (optional) | `trends.json` + `public/trends/*.webp` + PR body | `BLUESKY_IDENTIFIER`, `BLUESKY_APP_PASSWORD`, `REDDIT_CLIENT_ID/SECRET` optional | Live, PR #2 pending merge |
| `amazon-catalog.yml` | monthly 1st + dispatch | `affiliate-links.json` ASINs | `amazon-catalog.json` + PR body | `AMAZON_CLIENT_ID`, `AMAZON_CLIENT_SECRET` | Built, empty cache until eligible |

No runtime API calls, no client secrets, no Vercel env vars for these — static data only.

## Open decisions

- D-014 (Lemon + Buttondown) still valid — Lemon acquired by Stripe 2024, future is Stripe Managed Payments (MoR persists, see Jan 2026 blog)
- D-015 (Creators API) pending 48h eligibility gate, batch size 10 untested
- D-017 (daily + re-ranking) shipped this session

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
- View Transitions: `ClientRouter` from `astro:transitions` in Layout head, 0.35s cubic-bezier(0.16,1,0.3,1), nav `view-transition-name: site-nav`
- Performance: `content-visibility: auto` for #tools #gear #products #trending (700px intrinsic), `details` open anim via `interpolate-size: allow-keywords` + `@starting-style`, AppCard blur 40px mobile / 80px desktop (was 80px mobile heavy), lighthouse-budget.json added (FCP 1.8s, LCP 2.5s, CLS 0.1, TBT 200, total 500KB)
- Creators API: re-tested 2026-07-15 — still 403 `AssociateNotEligible` expected (48h window from 16:36 UTC), cache untouched, will re-test after 2026-07-17
- Secrets only in `.env` + GitHub Actions repo secrets, no client-side secrets, no runtime API calls
- Light mode: no `text-white` on light canvas, badges primary-text + dot AA, AppCard iconDot + accent overrides verified
- Docs: compressed from 11 → 8 active + archive (README updated)
