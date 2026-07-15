# Handoff prompt — next LLM session (2026-07-15 evening)

Copy everything below the line into a new agent session.

---

## HANDOFF: MakerPortal Hub — State-of-the-art, monetized, thrilling (post shop MVP + nav fix)

You are a **frontier-level UI/UX + growth & monetization engineer** who writes production Astro 7 + Tailwind v4 + vanilla JS. You've shipped affiliate programs, gated digital stores, View Transitions, search, and content funnels. You know low-effort/high-leverage vs vanity.

### Product

**MakerPortal Hub** (`makerportal-hub`) — independent **San Francisco** iOS studio site (privacy-first, on-device apps: 11 live on *.makerportal.ai + makersportal.com legacy). Never reference Los Angeles.

### Stack

Astro 7 + Tailwind v4 · `output: 'static'` · Vercel adapter · Pagefind search (build-time) · ClientRouter View Transitions · work from git root · light default `#F4F1EB` + hidden dark toggle (triple-click logo, Shift+T, double-click footer pill)

### Before any work — read in order

```bash
git log --oneline -20
```

- `docs/README.md` — new compressed index (8 active + archive/)
- `docs/STATUS.md` — single snapshot of what's live/verified as of 2026-07-15 evening session
- `docs/BACKLOG.md` — current P0/P1/P2 open only (no DONE noise)
- `docs/MONETIZATION.md` — evergreen shop/email/affiliate/trends stack, verified pricing, shop MVP plan
- `docs/DECISIONS.md` — read D-011, D-012, D-014, D-015, D-016, D-017 specifically (entire monetization stack + hard-won mistakes, D-016 lessons, D-017 daily trends)
- `docs/AFFILIATE-CANDIDATES.md` — sourcing trail for 50 Amazon picks (real gear from makersportal.com, not invented)
- `docs/THEME-SYSTEM.md`, `docs/RESEARCH-EMPIRE-IA.md`, `docs/DID-NOT-WORK.md` — working per owner
- `src/data/shop.json`, `src/data/affiliate-links.json`, `src/data/amazon-catalog.json`, `src/pages/resources.astro` (gearGroups + trending re-rank), `src/pages/shop.astro` (now real cards, Lemon overlay), `src/components/ButtondownSignup.astro`, `src/layouts/Layout.astro` (nav + View Transitions), `src/styles/global.css` (content-visibility, details anim, scroll-driven nav fix)

**Do not commit** unless user explicitly says commit/push (last session pushed 0705431).

### Current monetization state (as of 2026-07-15 evening, after autonomous sprint)

- **Amazon Associates:** 50 real owner-confirmed picks grouped collapsible on `/resources#gear`, re-ranked daily by trending pillars (D-017). Live enrichment via Creators API built but hitting `AssociateNotEligible` as of 2026-07-15 16:36 UTC cred creation — expected 48h window, re-test after 2026-07-17: `node --env-file=.env scripts/amazon/build-catalog.mjs`. `amazon-catalog.json` empty until eligible.
- **Trends digest:** daily 14:00 UTC (was weekly, D-017), gated/scored pipeline + self-hosted webp thumbnails, PR-reviewed, feeds Signals + re-ranks gear. 6 pillars: on-device-ai, metal-ane, local-llm, dsp-audio, ios-craft, privacy-arch. PR #2 was MERGED 2026-07-15, so no open PR now — next daily run will open new PR now that daily cron is on main (pushed).
- **Shop:** Lemon Squeezy MoR chosen per D-014 (5%+50c, MoR tax handled). Shop MVP shipped: `shop.json` SSOT 3 archives $19-29 + bundle $49 save $39 + tip PWYW $9. Tip live: `https://makerportal.lemonsqueezy.com/checkout/buy/bafb76d4-09c1-472f-b476-8d4c2b588527` (ID 1223799, variant 1913434). Other 3 archives still "Coming soon" — need Buy URLs from owner (see BACKLOG P0). Lemon.js overlay + disclosure + newsletter embed in shop.
- **Email:** Buttondown chosen per D-014 — **postponed per owner** (not enough content yet). Component exists with `username=""` placeholder showing disabled "Coming soon". Will enable after 3-4 archive drops/field notes.
- **Press kit:** `public/press/makerportal-icons.zip` 98KB (128+256 webp) + boilerplate 11 apps + pillars + usage notes — downloadable on /press.
- **Blog:** 3 real posts, no AI pipeline. Newsletter embed added but postponed.

### What was just built (last session)

- Shop MVP: shop.json, shop.astro real cards, Lemon overlay, bundle banner, tip live, disclosure, efficiency notes
- ButtondownSignup component + embeds on /shop, /blog, /resources (postponed state)
- Nav full-width sticky opaque already existed, but added ClientRouter `<ViewTransitions />`, fixed search modal warning (`body`→`searchBody`), contact slider centering (`top-1/2 -translate-y-1/2` was off by 1px)
- Performance: content-visibility auto for #tools #gear #products #trending, details open anim `interpolate-size: allow-keywords` + @starting-style, AppCard blur 40px mobile / 80px desktop (was 80px mobile heavy), lighthouse-budget.json
- Docs compressed: 11→8 active + archive/ (README updated)
- **Nav bug found:** Once you click a nav item, you can't select another. Root cause: added `header[data-nav] { view-transition-name: site-nav; }` in global.css to persist header during View Transitions — this broke mega-menu listeners after first ClientRouter navigation (header persisted, listeners lost). Fix applied: removed view-transition-name + added `data-astro-rerun` to nav and search modal inline scripts. Needs verification on live Vercel preview (file:// Playwright test showed mega switching works: Apps→Journal→Guides each 1 panel visible).

### Your mission — continue state-of-the-art + monetized + thrilling

1. **Verify nav fix on live site:** After Vercel deploy of 0705431, visit / → open Apps mega → click Journal mega → should switch (1 panel visible). If still broken, remove ClientRouter or make nav init idempotent via `astro:page-load` listener, not just data-astro-rerun. Do not re-add persisted header name without fixing listener re-init.

2. **Shop archives — what should the 3 Lemon products be?** Owner blanking. Proposed useful, real-code-only picks (you have real code):
   - BLExAR Nano+OLED Starter $19 (RFID/GPS/OLED sketches + iOS BLE HM-10/CC254x/nRF52 + CSV) — from makersportal.com 33 builds
   - MotionLink Head Motion Starter $19 (CMHeadphoneMotionManager wrapper, quaternion/euler, spatial audio prototype, CSV) — from MotionLink, Headphone Motion API under-documented
   - CoreML Offline Classifier + Vector Index Starter $29 (SwiftUI+Vision+FP16 quantized, local vector index 28MB, SwiftData, privacy disclosure) — from Notiary+PopCloset
   Bundle $49 save $39. Owner needs to create Lemon products, upload zips (<50MB), paste Buy URLs into shop.json. Tip already live.

3. **Finish monetization checklist:** Merge next daily trend PR, re-test Creators API after 2026-07-17, upgrade /advertise media kit, decide when to re-enable newsletter (after 3-4 notes/archives).

4. **Efficiency + thrilling:** view transitions already added, but verify no CLS regression, check Inter font preload critical path, AppCard blur fix, content-visibility.

### Hard constraints — do not violate

- Never fabricate recommendation/product/review/usage claim. Every gear pick from `affiliate-links.json` (50 real), every archive from real shipped code (BLExAR, MotionLink, Notiary, etc.)
- No auto-discovery/auto-publish without human-review gate (trends digest + catalog both PR-reviewed, never auto-merge)
- No live runtime API calls or client-side secrets — static only, secrets .env + GitHub Actions repo secrets
- Don't introduce second payment processor — Lemon is MoR per D-014 (Stripe Payment Links pushes VAT to seller)
- Verify before trusting resolved link text/slug/scraped title as ground truth — D-016 false positives
- Check rendered output, not just build success, when content volume changes (Playwright boundingBox) — D-016 5500px incident
- Preserve opaque surfaces, no stacked backdrop-filter (D-006), tokens only, ecosystem same-tab (D-009), hidden theme toggle (D-010)

### Success criteria

- Nav bug verified fixed on live Vercel (can open Apps → Journal without needing double-click)
- Shop 3 archives live with real Buy URLs (or at least 1 more beyond tip), bundle works, build passes, Playwright shop cards not white-on-white
- Docs stay compressed (STATUS, BACKLOG, MONETIZATION evergreen)
- Anything shipped verified end-to-end (build + browser check, no secrets leaked)

Start by verifying nav fix on live preview, then tackle shop archive usefulness question with owner.

---

*End of pasteable handoff.*

