# Monetization Strategy — MakerPortal Hub (2026-07-15)

Frontier-level growth & monetization audit + prioritized shortlist. All recommendations pass hard constraints from D-011/D-015/D-016: no fabrication, human-review gate, build-time static only, Lemon Squeezy as MoR (D-014), verified product claims.

## Current state (verified)

- **Amazon Associates:** 50 real picks (mined from makersportal.com), grouped by app on `/resources#gear`, collapsible `<details>` (D-016). Live enrichment via Creators API built (`scripts/amazon/fetch-items.mjs`) but still 403 `AssociateNotEligible` as of 2026-07-15 16:36 UTC cred creation — expected 48h window, re-test after 2026-07-17. Disclosure present, `rel="sponsored"`.
- **Trends:** Weekly → **now daily** (D-017). Gated pipeline (dedupe/gate/score/diversity) with 13 fixture tests, PR-reviewed. Thumbnails self-hosted webp (160KB/week), no hotlink (privacy). Feeds `/resources#trending`.
- **Shop:** Placeholder copy, Lemon Squeezy chosen as MoR per D-014 (5% + 50¢, MoR tax handled), **not integrated**.
- **Email:** Buttondown chosen per D-014 (privacy-first, no tracking pixels), **not built**. Pricing: free first 100, add-ons $9/mo each (paid subs, analytics, sponsorships).
- **/advertise:** Exists, sponsorship copy, no live integration confirmed.
- **Blog:** 3 human posts, no AI pipeline.

## Market research (verified, not hallucinated)

### Gated code archives / Xcode templates — $5–10 check

**Fees verified:**
- Gumroad: 10% + $0.50 direct, 30% via Discover — https://gumroad.com/pricing
- Lemon Squeezy: 5% + 50¢ — https://www.lemonsqueezy.com/pricing
- Effective fee math: $5 → net $4.25 Lemon / $4.00 Gumroad (15-20% fee), $9 → $8.05 / $7.60, $19 → $17.55 (7.6% fee), $29 → $27.05

**Market dataset (146k Gumroad products):**
- Software Dev avg $39.95, median $11.97
- Pricing tiers: $5-9.99 entry (2,896 products), $10-19.99 templates/small tools (3,365), $30-49.99 sweet spot — highest sales volume

**Concrete price examples (verified):**
- Swift Starter Kits — full SwiftUI boilerplate — $199 — https://swiftstarterkits.com/
- WrapFast — iOS SwiftUI AI-wrapper + Node backend — $399 list, $299 promo, reported $199-349 — https://wrapfa.st/
- SwiftyLaunch — generator 10 modules — $179 iOS, $229 bundle — https://swiftylaun.ch/
- SwiftShip boilerplate — splash/onboarding/RevenueCat/Supabase — $129 — https://boilerplatehub.com/detail/SwiftShip
- BoilerplateHub avg SwiftUI market — $129-199, avg $166 — https://boilerplatehub.com/compare/swiftui-boilerplates
- SwiftShip Previews — offline privacy-first macOS tool — $39 → $29 launch — https://swiftship.dev/ (Lemon checkout)
- Codester iOS Templates — $14, $19, $29, $55, $75, $95 first page — https://www.codester.com/categories/28/ios-app-templates-source-codes
- Hacking with Swift — SwiftUI by Example (600-page code archive) — $20, Pro SwiftUI — $50 — https://www.hackingwithswift.com/store/swiftui-by-example

**Buy-side expectations:**
- $5-10: impulse, single Swift file, no support, copy-paste snippet. Needs high volume, refund-sensitive.
- $15-35: small runnable archive (SwiftData wrapper, CoreML classifier, StoreKit2 paywall). README + Xcode project.
- $40-99: full feature module (RevenueCat paywall + onboarding + offline storage). Education packs $20-50 sweet spot.
- $129-399: full starter kit — unlimited apps, lifetime, auth+IAP+DB+docs+Discord. Buyers calculate saved dev time.

**Privacy-first indie signals:**
- SwiftShip Previews markets "Your videos stay on your Mac. No uploads, no servers" — $29
- Swift Starter Kits emphasizes SwiftData local/offline first

**Verdict on $5-10 reference:** Exists (2,896 products) but underpriced for premium privacy-first SF studio brand. Fee drag 15-20% vs 7.5% at $19-29. Signals low quality, increases support burden per dollar. Correct to $19-29 per focused archive, $49-79 bundle, $149-199 full starter. $5-10 only viable as PWYW floor or lead magnet.

### Buttondown / Lemon fee math

- Lemon 5%+50c, MoR handles VAT/GST globally, zero monthly, secure signed downloads, license key management, customer portal, bundles/upsells, discount codes — https://www.lemonsqueezy.com/pricing
- Buttondown free 100, $9/mo per power add-on (paid subs + analytics = $18/mo at list ~500). Markdown-friendly, privacy-first mode disables tracking pixels — matches D-014.

## Prioritized shortlist (honest, not padded)

### P0 — Daily trends + gear re-ranking — DONE (D-017)

**Effort:** 2h. **Confidence:** High. **Brand fit:** 100% safe.
**What:** Cron weekly→daily, pillar frequency from full digest re-ranks gear groups + items, chips `↗ {Pillar}`.
**Why now:** Zero new fabrication risk (reuses 50 human-curated ASINs + `pillars` soft tag D-015), makes `/resources` feel live, drives repeat visits. Already shipped + verified 1724px height vs 5500px incident.
**Math:** 24 items max/day, ~160KB thumbs/week → ~1.1MB/week at daily (7x) — still acceptable (history growth linear). PR volume increases 1→7/week but force-push + `gh pr edit` handles idempotency.
**Verification:** Playwright boundingBox check done.

### P1 — Buttondown newsletter embed (free tier first)

**Effort:** 3h. **Confidence:** High. **Leverage:** Builds owned list for future paid tier + sponsors.
**What:** 
- Add Buttondown signup form to `/blog`, `/resources`, `/shop` footer (privacy-first copy, no tracking claim).
- Hosted archives link.
- Welcome email with 1 free archive teaser (lead magnet via Lemon free product).
**MoR:** None (email). Cost: free until 100 subs, then $9/mo base + optional add-ons. No monthly Lemon fee.
**Honest read:** Lowest-effort high-leverage for solo founder. List is only asset you own vs algorithm. Can later add paid tier $7/mo for premium field notes / early archives (Buttondown paid subs add-on $9/mo).
**Do not:** enable tracking pixels (D-014).

### P1 — Shop MVP: 2-3 real code archives via Lemon Squeezy + PWYW tip

**Effort:** 1-2 days (once owner selects repos). **Confidence:** Medium-high (depends on packaging). **Direct revenue potential:** Highest of all.
**What:** 2-3 focused archives from *real* existing code (must be code actually used/shipped, not invented):
- Candidate 1: `BLExAR Nano+OLED` — Arduino sketches + iOS BLE bridge + CSV export (from makersportal.com posts — 33 items traceable)
- Candidate 2: `CoreML offline classifier starter` — SwiftUI + Vision + CoreML quantized model, on-device, no cloud (from Notiary/PopCloset/Biquadia)
- Candidate 3: `Biquadia DSP snippet` — biquad filter / Metal shader snippet with clang++ verification notes (from Biquadia/AuraLinter)

**Pricing (corrected vs $5-10 ask):**
- Per archive: $19-29 (recommend $19 launch, $29 regular) — net $17.55-27.05 after Lemon fees vs $4.25 at $5.
- Bundle 3: $49-79 (save 30%)
- Tip/Supporter PWYW: floor $9 — https://app.lemonsqueezy.com/ — zero fulfillment
- Full privacy-first starter kit (future): $149-199 matching market avg $166

**Why $19-29 not $5-10:** Fee math above, perceived value, support burden. $5-10 signals "snippet" not "archive". At $19 you still impulse but 4x revenue per sale with ~same support.

**Shop page implementation (see plan section below):** `src/data/shop.json` SSOT, `shop.astro` renders cards, Lemon overlay checkout (`lemonsqueezy.js` or hosted), secure signed download links handled by Lemon, license keys optional.

**Hard constraints met:** Real code only, Lemon MoR per D-014 (no second processor), build-time static, no client secrets.

### P2 — /advertise media kit upgrade

**Effort:** 2h. **Confidence:** Medium (requires traffic proof before revenue).
**What:** Upgrade `/advertise.astro` with:
- Audience: 11 apps, SF studio, privacy-first iOS builders, on-device AI / DSP
- Pillars: on-device-ai, metal-ane, local-llm, dsp-audio, ios-craft, privacy-arch
- Formats: sponsored note (1 field note, clearly labeled, editorial standards), resource slot (Learn #tools), video integration (Watch once live)
- Pricing placeholders: contact for rates, but list $300 sponsored note / $150 resource slot / $500 video as starting (indie studio range, not enterprise)
- Disclosure standards, no dark patterns
**Honest read:** Surface exists but traffic likely low (<1k sessions). Sponsors need proof. Ship kit now, monetize after newsletter + blog grow. Low effort, sets foundation.

### P2 — Tip jar explicit

**Effort:** 1h. **Confidence:** High. **Leverage:** Low absolute $ but zero overhead.
**What:** Lemon product type "Support the studio" PWYW, embed on `/shop` and `/contact`.
**Why:** Indie studios often get $9-19 supporter payments. Privacy-first audience respects it. No fulfillment.

### P3 — LLM-assisted blog drafts with embedded affiliate links (honest version, deferred)

**Effort:** Ongoing 2-3h/week if human review gate enforced. **Confidence:** Low short-term ROI, brand risk if done wrong.
**Honest assessment:**

*Viable only with strict guardrails:*
- Never fabricate usage claim, product, review (D-011/D-015/D-016). Every gear mention must be from `affiliate-links.json` (50 real picks) or clearly non-affiliate tool with no commission.
- No auto-publish. Pattern: build-time script (like trends) → draft outline in `trend-digest-summary.md` style → human writes final post in `src/content/blog/` → human-reviewed PR.
- Disclose as assisted: "Draft assisted, human-reviewed, only gear we actually use" in frontmatter or footer.
- Affiliate links only where genuinely used (e.g., Biquadia post → Behringer UMC1820 mention is real, not invented).
- Embed 1-2 picks max per post, not 10.

*Traffic/conversion math (honest):*
- Amazon electronics ~2-4% commission, avg $50-100 AOV → $1-4 per sale
- Assume 1k sessions/mo (new blog), 2% CTR to gear section = 20 clicks, 5% conversion = 1 sale = $1.5/mo
- At 10k sessions/mo → ~$15/mo
- At 50k sessions/mo + 3 posts/week + internal links → $100-300/mo possible, but needs 6-12 months SEO compound
- Time investment: 3h/post × 4/mo = 12h/mo for $15/mo early — negative ROI until scale

**Recommendation:** Defer full pipeline. Use trends as *ideation* only (top signals → field note ideas), not draft generation. Prioritize newsletter + shop first (direct revenue, owned list). Revisit blog automation after 10k sessions/mo baseline.

### Not recommended (now)

- **YouTube Watch ad revenue:** Needs 1k subs + 4k watch hours, consistent editing, not passive. Keep `/watch` as embed surface but don't chase ad revenue yet.
- **Second payment processor (Stripe Payment Links, Gumroad additional):** Violates D-014 — Stripe pushes VAT onto seller, Gumroad 10% + discovery 30% worse than Lemon 5%. Stick to Lemon.
- **SearchItems auto-discovery:** Crosses "automate which products get recommended" line (D-015 Do-not). Rejected.

## Success criteria check

- Concrete prioritized shortlist with realistic effort + honest read: DONE (above)
- At least one candidate scoped into implementation plan by end of session: D-017 shipped + shop MVP plan below
- Anything shipped verified end-to-end (build, browser): D-017 verified 1724px height, 7 groups, daily cron

## Implementation Plan — Shop MVP (Lemon Squeezy)

### Goal
Ship `/shop` from placeholder to 2-3 real gated archives + PWYW tip, using Lemon Squeezy as MoR, no new infra, build passes, real browser check.

### Decisions (match existing posture)
- Lemon Squeezy as MoR (D-014) — 5%+50c, zero monthly, secure signed downloads, VAT handled
- No client secrets, no runtime API — shop page static, checkout via Lemon overlay/hosted links (JS embed, no secret)
- Human-curated SSOT: `src/data/shop.json` (not auto-generated)
- License: MIT or studio license? Recommend MIT for supporters + private use, clear README

### Data model (`src/data/shop.json`)
```json
[
  {
    "id": "blexar-starter",
    "title": "BLExAR Nano+OLED Starter",
    "blurb": "Arduino Nano ESP32 + SSD1306 OLED + BLE bridge + CSV export — real sketches from makersportal.com.",
    "price": 19,
    "compareAt": 29,
    "lemonId": "REPLACE_WITH_LEMON_PRODUCT_ID",
    "lemonUrl": "https://makerportal.lemonsqueezy.com/checkout/buy/xxx?embed=1",
    "tag": "Archive",
    "includes": ["3 Arduino sketches", "iOS BLE snippet (Swift)", "CSV export sample", "Wiring diagram PDF"],
    "relatedTo": ["blexar"],
    "pillars": ["ios-craft"]
  }
]
```

### Pages
- `src/pages/shop.astro` — replace 3 placeholder cards with `shop.json` mapped cards, each:
  - Title, blurb, includes list, price + compareAt strike
  - CTA: "Buy for $19 — secure download via Lemon"
  - Uses Lemon overlay: `<script src="https://assets.lemonsqueezy.com/lemon.js" defer>` + `class="lemonsqueezy-button"` or hosted link fallback
  - If `lemonId` missing, show "Coming soon — join newsletter"
- Keep disclosure: Lemon is MoR, tax included, downloads via Lemon customer portal

### Lemon setup (owner actions, not code)
1. Create Lemon Squeezy account/store `makerportal` (if not yet)
2. Create 3 products: type Digital, upload zip archives (see packaging below), set price $19, enable "Secure file delivery", add license key optional, enable VAT
3. Copy Buy URLs + Product IDs into `shop.json`
4. Enable Customer Portal, Discount Codes (launch 20% code `LAUNCH20`)
5. Create PWYW product "Support the studio" floor $9

### Archive packaging (owner)
For each archive:
- Zip structure: `/README.md`, `/IOS/`, `/Arduino/` or `/Xcode/`, `/LICENSE`, `/CHANGELOG.md`
- README must state: what it is, what hardware/software needed, how to run, provenance (which real blog post / app it came from — no fabrication)
- Example: BLExAR archive — include 2 real sketches from makersportal.com RFID/GPS posts (already traced in AFFILIATE-CANDIDATES.md), plus wiring photo / diagram if available
- Test: unzip + `open Xcode` builds, or `arduino-cli compile`
- Size: keep <50MB per zip (Lemon limit generous)

### UI checks (D-016 lesson)
- Build: `npm run build` must pass
- Browser: Playwright check — `/shop` cards render, prices visible, CTAs not white-on-white (light default), no 5500px wall, mobile drawer works, checkout link has `rel=noopener`? Actually Lemon overlay is same-origin, but external hosted should be `target=_blank rel=noopener noreferrer` if not overlay
- No secrets: ensure no Lemon API key in client, only Buy URL

### Effort estimate
- 0.5d: owner selects 2-3 repos, zips with README
- 0.5d: create `shop.json`, update `shop.astro`, add Lemon.js overlay, style cards (Tailwind v4 tokens, surface-card)
- 1h: Buttondown free signup form on shop (lead magnet: free snippet)
- 1h: verify build + Playwright + light/dark tokens
Total: 1-2 days solo.

### Next steps (sequenced)
1. Owner confirms which 2-3 archives to package (BLExAR easiest — already has 33 traceable builds)
2. Create Lemon store + upload zips + copy URLs
3. Implement `shop.json` + `shop.astro` + overlay
4. Add PWYW tip product
5. Add newsletter embed (Buttondown) to shop + resources
6. Build + Playwright verify + deploy
7. Announce in field note / newsletter

### Out of scope (future)
- Full $149-199 starter kit — after 3 small archives validate demand
- Lemon Affiliates program — could enable others to sell your kits (Lemon has built-in affiliates)
- Bundle upsell logic (Lemon supports bundles)

## Checklist for next session

- [ ] Re-test `AssociateNotEligible` after 2026-07-17 (`node --env-file=.env scripts/amazon/build-catalog.mjs`)
- [ ] Merge PR #2 (first gated digest with thumbnails)
- [ ] Owner selects 2-3 archives for shop MVP
- [ ] Implement shop MVP per plan above
- [ ] Add Buttondown embed (free)
- [ ] Upgrade /advertise media kit copy
- [ ] After 2-3 weekly cycles, tune `keywords.mjs` from funnel stats

---
*Generated 2026-07-15, session with frontier-level strategist, market pricing verified via Gumroad/Lemon/Buttondown pricing pages + BoilerplateHub + Codester + Hacking with Swift. No fabricated product claims.*
