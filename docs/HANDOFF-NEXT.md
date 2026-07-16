# Handoff prompt — next LLM session (2026-07-15 evening, post nav verify + advertise + search console)

Copy everything below the line into a new agent session.

---

## HANDOFF: MakerPortal Hub — traffic reality check, then close the revenue loop

You are a **frontier-level UI/UX + growth & monetization engineer** who writes production Astro 7 + Tailwind v4 + vanilla JS. You've shipped affiliate programs, gated digital stores, View Transitions, search, and content funnels. You know low-effort/high-leverage vs vanity.

### Product

**MakerPortal Hub** (`makerportal-hub`) — independent **San Francisco** iOS studio site (privacy-first, on-device apps: 11 live on *.makerportal.ai + makersportal.com legacy). Never reference Los Angeles.

### Stack

Astro 7 + Tailwind v4 · `output: 'static'` · Vercel adapter · Pagefind search (build-time) · ClientRouter View Transitions · work from git root · light default `#F4F1EB` + hidden dark toggle (triple-click logo, Shift+T, double-click footer pill)

### Before any work — read in order

```bash
git log --oneline -20
```

- `docs/README.md` — compressed index (8 active + archive/)
- `docs/STATUS.md` — single snapshot, updated 2026-07-15 evening
- `docs/BACKLOG.md` — comprehensive phased plan (traffic visibility → content → distribution → backlinks → revenue → engineering), the single source of truth to check in on and burn down each session
- `docs/MONETIZATION.md` — evergreen shop/email/affiliate/trends stack, verified pricing
- `docs/DECISIONS.md` — read D-011, D-012, D-014, D-015, D-016, D-017
- `analytics/reports/search-performance-latest.md` — **read this first**, it's the ground truth on whether anything is working yet

### Ground truth as of 2026-07-15 (read before making priority calls)

A live Search Console pull (`node --env-file=.env scripts/search-console/build-report.mjs`) returned **1 click, 3 impressions over the trailing 28 days**, across `/`, `biquadia.makerportal.ai/`, and `www.makerportal.ai/`. Site was only indexed by Google ~1 day before this pull, so sparse numbers are expected right now, not a failure signal — re-check in 1-2 weeks before drawing conclusions. Still, don't build more monetization surface area (sponsorships, affiliate polish, advertise upgrades) as if there's an audience to sell yet — there isn't, provably, today. Growth-focused work (see mission below) is the actual lever right now.

### What was verified/shipped this session (826bc48 + uncommitted)

- **Nav fix verified live** on makerportal.ai: Apps→Journal→Guides mega switch works across repeated View Transition navigations. Also verified live: shop cards/bundle/CTA contrast, search modal (CmdK, live query, arrow nav, Esc), contact slider centering, press kit zip download. All checked off in BACKLOG.md.
- **`/advertise` upgraded** (`src/pages/advertise.astro`) — real audience stats pulled live from `apps.ts`/`trends.ts` (11 apps, 6 pillars, 0 trackers), rate cards ($300 note / $150 slot / $500 video), disclosure standards block. Build-verified, not committed yet.
- **Search Console pipeline built** (`scripts/search-console/fetch-performance.mjs` + `build-report.mjs`) — **local-only, deliberately not wired into GitHub Actions or `src/data/`**, because this repo is public and search performance is private business data. Reuses the OAuth refresh token already sitting in `analytics/token.json` / `analytics/client_secret*.json` (from an earlier session's `gsc_dashboard.py`, a manual Python dashboard tool that still exists and still works — this is the same credential, wired into a scriptable JSON/markdown output instead of only an HTML dashboard). Run it via:
  ```bash
  node --env-file=.env scripts/search-console/build-report.mjs
  ```
  Output lands in `analytics/reports/search-performance-latest.{json,md}` (gitignored). **Caveat:** if the Google Cloud OAuth consent screen is still "Testing" publishing status, the refresh token hard-expires 7 days after issuance (minted ~2026-07-12, so watch for auth failures after ~2026-07-19). Fix: publish the consent screen to "In production" (no verification review needed for a single-user internal tool on `webmasters.readonly`), or re-run `analytics/gsc_dashboard.py` locally to mint a fresh token.
- `.env` now has `GOOGLE_SC_CLIENT_ID` / `GOOGLE_SC_CLIENT_SECRET` / `GOOGLE_SC_REFRESH_TOKEN` (gitignored, local only).

### Your mission — in priority order, informed by the traffic data above

1. **Vercel Web Analytics (or Plausible/similar privacy-friendly option) — ship it now.** Search Console only tells you search-referred sessions; you have zero visibility into direct traffic, referrers, or on-site behavior. This is a 15-30 minute add (`@vercel/analytics` package + one component in `Layout.astro`) and every other decision on this site should be informed by it going forward. Keep it privacy-first (no fingerprinting, no cross-site tracking) per the studio's own positioning.

2. **Content cadence, not more monetization surface.** With 1 click in 28 days, the shop, affiliate links, and `/advertise` page have nothing to sell to yet. The highest-leverage work is real field notes from real shipped code — BLExAR launch note, MotionLink deep dive (`CMHeadphoneMotionManager` under-documented, genuine SEO opportunity per prior research), Notiary/PopCloset vector-index writeup. Aim for 1-2 real posts before revisiting any traffic-dependent feature. Cross-link every post into `/resources` pillars per existing IA.

3. **Lemon Squeezy store creation — still OWNER VISIT NEEDED, still blocking real revenue.** This has been sitting for 2+ sessions. It's the one revenue lever that doesn't need traffic — a single $19 sale doesn't care about impression counts. See `docs/BACKLOG.md` Phase 4 for the exact steps (create store `makerportal`, 3 products — BLExAR Nano+OLED $19, CoreML Offline Classifier $29, **Biquadia DSP Snippet Pack $19** — note: `src/data/shop.json` already ships Biquadia as the third pick, not the MotionLink starter an older handoff doc proposed; code is the source of truth). If you're an LLM session without hands to click through Lemon's UI, flag this clearly to the human rather than stalling on it.

4. **Re-check the Search Console numbers periodically**, not the Creators API or trend PRs — those are already on autopilot (daily cron, monthly cron) and don't need session-by-session attention. Traffic is the metric that actually needs a human/LLM checking in.

### Hard constraints — do not violate

- Never fabricate recommendation/product/review/usage claims. Every gear pick real, every archive from real shipped code.
- No auto-discovery/auto-publish without human-review PR gate (trends + catalog pipelines).
- No live runtime API calls or client-side secrets on the hub itself — static only.
- Don't introduce a second payment processor (Lemon is MoR per D-014).
- **Search Console / analytics data stays local-only and gitignored — this repo is public.** Do not commit `analytics/reports/`, do not wire search performance data into `src/data/` or any public page unless the owner explicitly asks for that tradeoff (it would make real traffic numbers public).
- Preserve opaque surfaces, no stacked backdrop-filter (D-006), tokens only, ecosystem same-tab (D-009), hidden theme toggle (D-010).
- Do not commit anything unless the user explicitly says commit/push.

### Success criteria

- Vercel Web Analytics (or equivalent) live and reporting real sessions
- At least 1 new field note published from real shipped code, cross-linked into `/resources`
- Lemon store either created (ideal) or clearly escalated to the owner as the single blocking item
- Search Console pipeline still authenticating cleanly (watch the ~2026-07-19 token-expiry risk)

Start by running `node --env-file=.env scripts/search-console/build-report.mjs` to get fresh numbers, then decide priorities from there — not from assumptions.

---

*End of pasteable handoff.*
