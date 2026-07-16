# Backlog — current open items only

Compressed 2026-07-15 — previous verbose DONE history moved to `STATUS.md` + `DECISIONS.md`.

**Ground truth (2026-07-15, via `analytics/reports/search-performance-latest.md`):** 1 click, 3 impressions over trailing 28 days. Site was only indexed by Google ~1 day before this pull, so sparse numbers are expected, not a red flag — re-check in 1-2 weeks before drawing conclusions. Still: don't build more monetization surface area assuming an audience exists yet.

## P0 — traffic visibility (do this before more monetization surface)

- [ ] Ship Vercel Web Analytics (or similar privacy-friendly option) — Search Console only covers search-referred sessions, zero visibility into direct/referrer traffic otherwise. `@vercel/analytics` + one Layout.astro component, ~30min.
- [ ] Re-run `node --env-file=.env scripts/search-console/build-report.mjs` periodically to track whether content work is moving the needle. Output is local-only (`analytics/reports/`, gitignored) — this repo is public, never commit real traffic numbers.
- [ ] Watch for OAuth refresh-token expiry ~2026-07-19 (7-day Testing-mode cap) — if `search-console` script starts failing auth, either publish the Google Cloud OAuth consent screen to "In production" or re-run `analytics/gsc_dashboard.py` locally to mint a fresh token.

## P0 — needs owner site visit (external input)

- [ ] **Lemon Squeezy store creation — OWNER VISIT NEEDED:** Go to https://app.lemonsqueezy.com/ → create store `makerportal` → create 3 digital products (BLExAR Nano+OLED $19, CoreML Offline Classifier $29, Biquadia DSP Snippet $19) + PWYW tip floor $9 → upload zips (<50MB, README with provenance) → enable Secure file delivery + Customer portal + Discount code `LAUNCH20` → copy Buy URLs + Product IDs into `src/data/shop.json` `lemonUrl`/`lemonId`. Shop page already has overlay `lemon.js` and bundle banner $49 save $39. After URLs added, build + Playwright verify + deploy. No second processor (D-014).
- [ ] **Buttondown newsletter — OWNER VISIT NEEDED:** Go to https://buttondown.com/ → create newsletter (e.g., `makerportal`) → get embed form action / username → replace `username=""` prop in `ButtondownSignup.astro` instances on `/shop`, `/blog`, `/resources`. Privacy-first mode (no tracking pixels per D-014). Free first 100, $9/mo addon. Add welcome email with free BLExAR snippet lead magnet via Lemon free product.
- [ ] **Re-test Creators API after 2026-07-17 — OWNER VISIT NEEDED:** `node --env-file=.env scripts/amazon/build-catalog.mjs` still 403 `AssociateNotEligible` as of 2026-07-15 (expected 48h from 16:36 UTC cred creation). After 2026-07-17 if still 403, check Associates Central eligibility directly (not just timer). Secrets already in Actions `AMAZON_CLIENT_ID/SECRET`. When succeeds, gear gets real hi-res images + price — lifts CTR.

## P1 — Shop + Email polish (after owner creates accounts)

- [ ] After Lemon URLs added: add bundle upsell logic (Lemon supports bundles) + customer portal link in footer
- [ ] After Buttondown username added: test double opt-in, RSS-to-email support ($9/mo addon), archives on custom domain optional

## P1 — Content + Ops

- [ ] Google Trends signal: apply to official Trends API alpha waitlist (free) — don't automate evasion (D-011)
- [ ] Trend keyword tuning: after 2-3 daily cycles, review `trend-digest-summary.md` funnel stats, adjust `keywords.mjs` needles, fixture tests guard regressions
- [ ] Watch for HN-mirror bot in Bluesky: `bestofhn.bsky.social` — add author denylist only if pattern recurs
- [ ] More field notes + internal links: AuraLinter launch note, nymic deep dive, link to /resources pillars (improves internal cross-link + affiliate CTR honestly)
- [ ] Reddit source application: self-service closed (Responsible Builder Policy Nov 2025). Submit form via Data API Wiki if desired, don't block — digest runs Bluesky+HN.

## P2 — Migrations + Polish

- [ ] Migrate legacy `makersportal.com/apps/*` to `*.makerportal.ai` subdomains + 302s
- [ ] AppSwitcher island integration in AuraLinter, Biquadia, etc. subdomains (import from hub card variant)
- [ ] Verify light contrast for amber/orange/cyan icons in bright sun + low light (real device per P1 in old OPEN-ITEMS)
- [ ] Font payload audit: Inter preload only if critical (currently preloads Plus Jakarta + Inter latin — check if Inter used critically)
- [ ] Auto-generate iconDot via script (magick histogram -> apps.ts json) instead of manual

## Done — reference (details in STATUS/DECISIONS)

- App suite 4→11 + inter-app nav (AuraLinter + legacy bridge, AppSwitcher card/pill)
- Light mode contrast AA (tokens, shadows, violet/amber/emerald/cyan overrides)
- Empire IA + mega nav + hub pages, hybrid theme + reading paper, team org, name scrub, Safari glass purge (D-006)
- Amazon Associates 50 picks + grouped rendering (D-016) + Creators API pipeline built (D-015)
- Trend digest gating (D-012) + thumbnail redesign (D-013) + daily + gear re-ranking (D-017) — 1724px bbox verified, 7 groups, BLExAR collapsed
- Shop MVP SSOT `shop.json` + `shop.astro` Lemon overlay + tip + bundle banner + disclosure (needs Lemon URLs)
- ButtondownSignup component + embeds on /blog, /resources, /shop (needs username)
- Nav full-width sticky opaque + active underlines + search glyph CmdK + focus trap
- Hero orbit randomization (requestIdleCallback + batched rAF) + kickers removed (preserved easter-egg)
- Notes prev/next `grid-cols-2` side-by-side on mobile (was stacked)
- Contact slider centering `top-1/2 -translate-y-1/2`
- View Transitions `ClientRouter`, scroll-driven nav shrink, details open anim `interpolate-size`, content-visibility auto, AppCard blur 40px mobile / 80px desktop, lighthouse-budget.json
- Press kit zip 98KB (128+256 webp) + boilerplate 11 apps + pillars
- Docs compressed 11→8 active + archive (theme-system, research-empire-ia, readme, did-not-work, affiliate-candidates kept per owner)
- Nav fix (826bc48) verified live 2026-07-15 on makerportal.ai: Apps→Journal→Guides mega switch works across repeated ClientRouter navigations, no stuck listeners
- Shop cards/bundle/CTA contrast, search modal (CmdK, live query, arrow nav, Esc), contact slider centering, press kit zip download — all verified live 2026-07-15
- /advertise media kit upgraded: audience stats (11 apps, 6 pillars, 0 trackers pulled live from `apps.ts`/`trends.ts`), rate cards $300 note / $150 slot / $500 video, disclosure standards block — build passed, verified locally 2026-07-15
- Search Console pipeline (`scripts/search-console/`) built + tested live 2026-07-15 — local-only by design (repo is public), reuses existing OAuth refresh token from `analytics/`, writes `analytics/reports/search-performance-latest.{json,md}` (gitignored). First real pull: 1 click / 3 impressions over trailing 28 days.
