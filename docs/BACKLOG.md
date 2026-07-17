# Backlog — comprehensive plan (growth + revenue + engineering)

Restructured 2026-07-15 evening around a single growth thesis: **site was indexed by Google ~1 day ago, traffic is expected to be near-zero right now — that's normal, not a failure signal.** Phases below are ordered by leverage, not urgency-panic. Re-read the "Ground truth" line each session before reprioritizing; don't let one week's Search Console numbers overwrite the plan.

**Ground truth (2026-07-15, via `analytics/reports/search-performance-latest.md`):** 1 click, 3 impressions over trailing 28 days. Expected at 1 day post-index. Re-check in 1-2 weeks before drawing conclusions.

## Phase 0 — Visibility (do this before judging anything else)

- [x] Ship Vercel Web Analytics (or similar privacy-friendly option) — Search Console only covers search-referred sessions, zero visibility into direct/referrer/App-Store-driven traffic otherwise. `@vercel/analytics` + one `Layout.astro` component, ~30min. **Done 2026-07-15:** `<Analytics />` from `@vercel/analytics/astro` in `Layout.astro` `<head>`, verified in build output on every page. Starts collecting once deployed + Web Analytics toggled on in the Vercel dashboard (no code needed there).
- [ ] Audit whether the 11 live apps link back to `makerportal.ai` (About/Support screens, App Store listing "developer" link, in-app cross-promotion). This is free, compounding traffic independent of SEO — check each app's repo/App Store Connect listing. Not this repo's code, but worth a session to confirm.
- [x] Recurring: re-run `node --env-file=.env scripts/search-console/build-report.mjs` every 1-2 weeks, log the delta in `STATUS.md` Traffic section. Output stays local (`analytics/reports/`, gitignored) — never commit real numbers, this repo is public. **Re-run 2026-07-15:** still 1 click / 3 impressions (window 2026-06-15..2026-07-13) — unchanged from the first pull, expected this early. Next re-check ~2026-07-29.
- [ ] Watch for OAuth refresh-token expiry ~2026-07-19 (7-day Testing-mode cap) — if the search-console script starts failing auth, either publish the Google Cloud OAuth consent screen to "In production" or re-run `analytics/gsc_dashboard.py` locally to mint a fresh token. Still authenticating cleanly as of 2026-07-15.

## Phase 1 — Developer-SEO field notes (highest-leverage content lever)

Real code, under-documented APIs, near-zero competition for the specific queries. Each note doubles as free marketing for its matching shop archive.

- [x] **MotionLink field note:** `CMHeadphoneMotionManager` wrapper deep dive — quaternion/euler conversion, spatial audio prototype. Genuinely under-documented Apple API, real SEO opportunity. **Done 2026-07-15:** `src/content/blog/motionlink-headphone-motion-api.md` — quaternion→Euler conversion with the NaN-clamp gotcha, the relative-reference-frame reset (undocumented, found on-device), simulator/threading gotchas. Cross-linked to `/resources#gear` (AirPods Pro pick, the one gear item tied to `motionlink`) and `/resources#trending` (`ios-craft` pillar); no matching shop archive exists yet so none was force-linked. Build verified, 20 pages indexed.
- [ ] **Biquadia field note:** biquad filter + Metal shader DSP walkthrough, clang++ verification notes, LangGraph agentic generation loop.
- [ ] **BLExAR field note:** Arduino Nano ESP32 + SSD1306 OLED + BLE bridge wiring walkthrough (free version of the paid shop archive — teaches the pattern, archive sells the full sketch set).
- [ ] **Notiary/PopCloset field note:** on-device CoreML vector index pattern, SwiftData persistence, privacy disclosure approach.
- [ ] **AuraLinter launch note** + **nymic deep dive** (carried over from prior backlog, still open).
- [ ] Cross-link every new note into its `/resources` pillar and into the matching shop archive card — reinforces topical clusters, which is what Google actually rewards over raw volume.

**The Lab — interactive tools grounded in real shipped code (new, 2026-07-15):** owner asked for a plan to build "many of these" (referencing `earlevel.com`'s biquad calculator and `quaternions.online` as craft benchmarks, explicitly not to copy). Plan approved and tool #1 shipped this session. Full roadmap lives in `src/data/tools.ts` (registry, `status: 'live' | 'planned'`) — don't re-derive from scratch, extend that file. Differentiation principle: every tool must be app-grounded (real code, links to the app + field note it came from), have a dimension generic calculators lack (audio, device sensors, cascade view), or fill a genuine documentation gap — never just another implementation of a known calculator. IA: `/tools` index + `/tools/<slug>` pages, no new nav item (D-002 stays ≤7) — linked from the Guides mega panel and a new `/resources#lab` section.
- [x] **Quaternion ↔ Euler converter** — `src/pages/playground/quaternion-euler-converter.astro`. Bidirectional converter (round-trip verified), canvas 3D orientation preview built directly from its quaternion rotation matrix, copyable Swift both directions, gotchas callout reusing the MotionLink field note's clamp/reference-frame findings. Cross-linked from the field note. Moved into the unified Playground IA; build verified.
- [ ] **Biquad filter designer** (Biquadia, dsp-audio) — next in the roadmap. Live Web Audio `BiquadFilterNode` preview (hear it, not just see a curve), 2-3 stage cascade, real Direct-Form-II-Transposed code. Blocked on writing the Biquadia field note first (needed for the grounding link) — sequence together or field note first.
- [ ] **Head-tracked stereo pan demo** (MotionLink + Biquadia combo, dsp-audio) — reuses the quaternion tool's yaw output to drive a live `StereoPannerNode`. Build after the Biquad tool exists (reuses code from both).
- [ ] **CoreML model size / quantization calculator** (Notiary/itria/akous, on-device-ai) — pure deterministic byte-size arithmetic only, no throughput/latency claims (fabrication-risk boundary). No prerequisite, buildable any time.
- [ ] **BLE GATT / CSV frame visualizer** (BLExAR, ios-craft) — HM-10/nRF52 UART bridge structure + byte-level CSV framing. No prerequisite, buildable any time.
- [ ] **Agentic DSP pipeline step-through** (AuraLinter) — flagship, most effort, most unique. Hold until the Lab pattern is proven with 2-3 smaller tools.
- Noted but not planned for v1 (real gaps, higher fabrication/accuracy risk — don't build speculatively): Metal threadgroup/SIMD-occupancy visualizer, `MLComputeUnits` (ANE/GPU/CPU) decision-tree tool, local-LLM memory-footprint calculator (would need to stay scoped to deterministic KV-cache math, no tokens/sec claims).

**Playground — viral math/physics toys, deliberately separate from the Lab (new, 2026-07-15):** owner pushed for 5 more tools pitched for Reddit/HN-style virality (double pendulum + phase space, Fourier epicycles, Chladni cymatics, N-body choreography, conformal mapping). 4 of 5 have no real tie to any MakerPortal app — flagged that directly; owner's call was to build them anyway and accept the brand-dilution tradeoff, on the condition they stay structurally separate from the app-grounded Lab rather than diluting it. See D-018. Registry: `src/data/playground.ts`.
- [x] **Fourier epicycles** — `src/pages/playground/fourier-epicycles.astro`. Draw any closed shape, decomposed into rotating circles (discrete Fourier series) that reconstruct it live, term-count slider. The one idea of the 5 that's honestly groundable — same frequency-domain math as Biquadia's existing spectral-analysis copy, cross-linked from `/blog/inside-biquadia`. DFT/reconstruction math verified in Node before shipping; a real Canvas API bug (`var(--x)` isn't a valid `ctx.strokeStyle`) was caught in live browser testing and fixed. Build verified 2026-07-15, 24 pages indexed.
- [x] **Double pendulum + phase space** — chaotic motion with a live-painting phase-space plot alongside it. Shipped with draggable bobs and angle sliders, fixed-step RK4 integration, a 10⁻⁴-radian shadow trajectory, energy-drift diagnostics, damping/speed controls, four initial-condition presets, and revisit-safe animation lifecycle.
- [ ] **Chladni cymatics** — particle system settling on 2D standing-wave nodal lines as frequency sweeps.
- [ ] **N-body orbital choreography** — gravity sandbox with known stable figure-eight-orbit presets, perturbable into chaos.
- [ ] **Conformal mapping explorer** — complex-plane grid warped live under f(z), homotopy slider. Needs a safe (no `eval`) complex-expression parser if custom functions are supported — scope to presets first if that's a bigger lift than expected.
- [ ] **Distribution tactic (applies regardless of which Playground tools ship):** record a short GIF of the interaction (drawing → epicycles, chaotic trail → phase-space painting) and post directly to r/math, r/physics, Hacker News with a link — this is the actual traffic mechanism for this category of tool, not just hosting it and waiting.
- [x] **Live Earth** — `src/pages/playground/globe.astro`. Owner wanted geospatial/map/satellite/weather tools with **real data**, not simulated. Resolved via the same build-time-fetch → PR-review pattern the trends pipeline already uses (D-019) — not a live client-side API call. One unified globe, three modes: Day/Night (real astronomy, no fetch needed), Live Weather (real Open-Meteo data, `scripts/weather/`, refreshed every 6h), ISS Tracker (real Celestrak TLE, `scripts/satellite/`, refreshed every 12h, propagated client-side via a verified simplified two-body orbital model — altitude/period/inclination all checked against real ISS behavior before shipping). Real self-hosted Natural Earth coastline data (91KB). All three modes verified live in-browser: correct continent shapes, correct terminator position, real temps color-coded on real cities, ISS marker visibly moving in real time with correct lat/lon/alt/speed. Build verified 2026-07-16, 25 pages indexed.
- [ ] **New recurring maintenance (from Live Earth):** `weather-digest.yml` (every 6h) and `satellite-tle.yml` (every 12h) now join `trends-digest.yml` and `amazon-catalog.yml` as PRs needing periodic merge — same human-review posture, just two more feeds to check in on.

## Phase 2 — Distribution (earned attention, human-in-the-loop)

One well-timed post beats a dozen link-drops. These need the owner's voice/judgment, not automation.

- [ ] Pick **one** genuinely differentiated launch (AuraLinter agentic DSP orchestrator is the strongest candidate) for a single "Show HN" post — not per-app, not per-week. A front-page hit is both a traffic spike and a high-authority backlink.
- [ ] Share field notes (once written, Phase 1) in relevant communities as genuine value posts, not promotion: r/iOSProgramming, r/LocalLLaMA (matches `local-llm` pillar), r/SwiftUI, Bluesky dev circles.
- [ ] Before any Show HN attempt: sanity-check the target page's performance budget holds under a traffic spike (lighthouse-budget.json already in place — just confirm content-visibility/lazy patterns cover the specific page).

## Phase 3 — Backlinks (compounds SEO more than content volume)

- [ ] Submit 1-2 flagship apps to indie launch directories (Product Hunt, BetaList, or similar) — light touch, real backlink value, don't spam all 11 apps.
- [ ] Track inbound mentions via Search Console's Links report (UI-only, not exposed by the searchAnalytics API this pipeline uses) — manual check, not automatable.

## Phase 4 — Revenue unblocks (parallel track, not traffic-dependent)

These don't need an audience — a single sale doesn't care about impression counts. Keep moving independent of Phases 0-3.

- [ ] **Lemon Squeezy store creation — OWNER VISIT NEEDED:** https://app.lemonsqueezy.com/ → create store `makerportal` → create 3 digital products (BLExAR Nano+OLED $19, CoreML Offline Classifier $29, Biquadia DSP Snippet $19) + PWYW tip floor $9 → upload zips (<50MB, README with provenance) → enable Secure file delivery + Customer portal + Discount code `LAUNCH20` → copy Buy URLs + Product IDs into `src/data/shop.json` `lemonUrl`/`lemonId`. Shop page already has overlay `lemon.js` and bundle banner $49 save $39. After URLs added: build + Playwright verify + deploy. No second processor (D-014). **Sitting 3+ sessions — highest-priority owner action, this session (2026-07-15) has no browser/account access to do it.**
- [ ] After Lemon URLs added: add bundle upsell logic (Lemon supports bundles) + customer portal link in footer.
- [ ] **Buttondown newsletter — OWNER VISIT NEEDED:** https://buttondown.com/ → create newsletter (e.g., `makerportal`) → get embed form action / username → replace `username=""` prop in `ButtondownSignup.astro` instances on `/shop`, `/blog`, `/resources`. Privacy-first mode (no tracking pixels per D-014). Free first 100, $9/mo addon. Add welcome email with free BLExAR snippet lead magnet via Lemon free product. Hold until 3-4 field notes/archives exist (Phase 1) — nothing to email about yet.
- [ ] After Buttondown username added: test double opt-in, RSS-to-email support ($9/mo addon), archives on custom domain optional.
- [ ] **Re-test Creators API after 2026-07-17 — OWNER VISIT NEEDED:** `node --env-file=.env scripts/amazon/build-catalog.mjs` still 403 `AssociateNotEligible` as of 2026-07-15 (expected 48h from 16:36 UTC cred creation). After 2026-07-17 if still 403, check Associates Central eligibility directly (not just timer). Secrets already in Actions `AMAZON_CLIENT_ID/SECRET`. When succeeds, gear gets real hi-res images + price — lifts CTR.

## Phase 5 — Content ops (recurring maintenance, not one-time)

- [ ] **Trend-grounded content-engine revisit — NOT before trigger conditions met:** owner's brief (weekly trend→blog→affiliate posts, differentiated from generic trend-aggregation) examined 2026-07-15, argued recommendation + reasoning in `docs/MONETIZATION.md` P3. Verdict: defer active drafting — scaled-content-abuse risk (Google's March 2024 core update, actively enforced) outweighs the weak early ROI already documented in P3, and there's no traffic baseline yet to know if it'd even work. `scripts/trends/draft-post.mjs` landed as a manual, ungated-by-workflow CLI skeleton — structurally requires `--app <RealShippedApp>` before it'll write anything, `draft: true` always, no generation logic. **Trigger to revisit:** 3-4 Phase 1 field notes live AND next Search Console re-check (~2026-07-29) shows real crawl/impression activity. Don't build generation logic or a workflow before both are true.
- [ ] Trend keyword tuning: after 2-3 daily cycles, review `trend-digest-summary.md` funnel stats, adjust `keywords.mjs` needles, fixture tests guard regressions.
- [ ] Watch for HN-mirror bot in Bluesky: `bestofhn.bsky.social` — add author denylist only if pattern recurs.
- [ ] Google Trends signal: apply to official Trends API alpha waitlist (free) — don't automate evasion (D-011).
- [ ] Reddit source application: self-service closed (Responsible Builder Policy Nov 2025). Submit form via Data API Wiki if desired, don't block — digest runs Bluesky+HN.
- [ ] Recurring: merge daily trend PRs as they open; monthly Amazon catalog PR review.

## Phase 6 — Engineering polish (lower urgency, no growth/revenue dependency)

- [ ] Migrate legacy `makersportal.com/apps/*` to `*.makerportal.ai` subdomains + 302s.
- [ ] AppSwitcher island integration in AuraLinter, Biquadia, etc. subdomains (import from hub card variant).
- [ ] Verify light contrast for amber/orange/cyan icons in bright sun + low light (real device).
- [ ] Font payload audit: Inter preload only if critical (currently preloads Plus Jakarta + Inter latin — check if Inter used critically).
- [ ] Auto-generate iconDot via script (magick histogram -> apps.ts json) instead of manual.

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
- Backlog restructured 2026-07-15 into phased growth+revenue+engineering plan (this file) — replaces flat P0/P1/P2 to reflect traffic-first prioritization
- Vercel Web Analytics shipped (Phase 0), MotionLink field note shipped + cross-linked (Phase 1), content-engine idea examined with argued recommendation in `MONETIZATION.md` P3 + `draft-post.mjs` skeleton (Phase 5, gated behind trigger conditions) — all 2026-07-15
