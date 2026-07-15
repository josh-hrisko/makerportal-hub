# Monetization — evergreen

Replaces `HANDOFF-MONETIZATION.md` + `MONETIZATION-STRATEGY-2026-07-15.md` + ad-hoc notes in `OPEN-ITEMS.md`. Human-curated, verified pricing, no fabrication.

## Stack (D-014 still valid)

- **Shop:** Lemon Squeezy MoR — 5%+50¢, zero monthly, secure signed downloads, VAT/GST handled, customer portal, bundles, discount codes. Acquired by Stripe 2024, future is Stripe Managed Payments (MoR persists). Gumroad fallback (10%+50c direct) worse. Stripe Payment Links rejected — pushes tax to seller.
- **Email:** Buttondown — privacy-first mode (no tracking pixels), markdown-friendly. Free first 100, $9/mo per addon (paid subs, analytics, sponsorships). Substack rejected — tracking pixels + ecosystem lock-in.
- **Affiliate:** Amazon Associates tag `engineersport-20`, 50 real picks (mined from makersportal.com, audit trail `AFFILIATE-CANDIDATES.md`), disclosure + `rel="sponsored"`. Live enrichment via Creators API v3.1 (build-time → committed JSON → PR, D-015).
- **Trends:** Daily digest `trends-digest.yml` 14:00 UTC, gated pipeline + thumbnails self-hosted (D-012/D-013/D-017), re-ranks gear.

Hard constraints: never fabricate usage, no auto-discovery/auto-publish without human-review gate, no runtime API calls, no second payment processor without discussion, verify slugs/titles, check rendered output on volume changes (Playwright).

## Current state

- 50 gear items live on `/resources#gear`, grouped collapsible, trending re-ranked (D-017), 1724px height verified vs 5500px flat-list incident
- `amazon-catalog.json` empty until `AssociateNotEligible` clears after 2026-07-17 — re-test command documented
- Shop placeholder, email not built, /advertise copy only, blog 3 posts

## Pricing research (verified)

- **Fees:** Lemon 5%+50c — https://www.lemonsqueezy.com/pricing ; Gumroad 10%+50c — https://gumroad.com/pricing
  - $5 net $4.25 Lemon, $9 net $8.05, $19 net $17.55, $29 net $27.05
- **Market comps:**
  - Swift Starter Kits $199 — https://swiftstarterkits.com/
  - WrapFast $399/$299 — https://wrapfa.st/
  - SwiftyLaunch $179/$229 — https://swiftylaun.ch/
  - SwiftShip $129 avg $166 market — https://boilerplatehub.com/compare/swiftui-boilerplates
  - SwiftShip Previews $29 (offline) — https://swiftship.dev/
  - Codester iOS templates $14-95 — https://www.codester.com/categories/28/ios-app-templates-source-codes
  - Hacking with Swift archives $20/$50
- **Dataset:** 146k Gumroad — Software Dev avg $39.95 median $11.97; $5-9.99 tier 2,896 products, $10-19.99 tier 3,365, $30-49.99 sweet spot
- **Verdict:** $5-10 underpriced for premium privacy-first SF studio. Correct to $19-29 per focused archive, $49-79 bundle, $149-199 full starter. $5-10 only as PWYW floor.

## Prioritized avenues

### P0 — Daily trends + gear re-ranking — DONE (D-017)
Weekly→daily, pillar counts re-rank gear. Zero fabrication risk, makes page live. Build + Playwright verified.

### P1 — Buttondown newsletter (free first)
3h, high leverage — owned list for paid tier + sponsors. Forms on /blog, /resources, /shop footer, welcome with free snippet lead magnet via Lemon free product.

### P1 — Shop MVP: 2-3 real archives + tip
1-2 days after owner selects repos. Candidates: BLExAR Nano+OLED (33 traceable builds), CoreML offline classifier, Biquadia DSP snippet. Pricing above, Lemon overlay checkout, `shop.json` SSOT, secure downloads, README with provenance (which blog post/app). See `docs/MONETIZATION-STRATEGY-2026-07-15.md` archived for full implementation plan or below.

**Shop MVP implementation:**
- Data: `src/data/shop.json` `{id, title, blurb, price, compareAt, lemonId, lemonUrl, tag, includes[], relatedTo[], pillars[]}`
- Page: `shop.astro` replace placeholders with cards, Lemon.js overlay `<script src="https://assets.lemonsqueezy.com/lemon.js">`, CTA "Buy for $19 — secure download via Lemon", disclosure MoR tax included
- Lemon setup (owner): create store `makerportal`, 3 digital products, upload zips (<50MB), enable secure delivery, copy Buy URLs + IDs, enable customer portal + discount code `LAUNCH20`, create PWYW "Support the studio" floor $9
- Packaging per archive: `/README.md` (what, hardware, how to run, provenance — no fabrication), `/IOS/` or `/Arduino/` or `/Xcode/`, `/LICENSE`, `/CHANGELOG.md`, test `open Xcode` builds
- Verification: build passes, Playwright shop cards visible, CTA not white-on-white, no secrets in client
- Sequenced: owner selects 2-3 → Lemon store → shop.json + shop.astro + overlay → tip product → newsletter embed → build + verify → announce

### P2 — /advertise media kit
2h, foundation before traffic. Audience 11 apps + pillars, formats + starting rates $300 note / $150 slot / $500 video, disclosure.

### P2 — Tip jar
1h, zero overhead, Lemon PWYW floor $9.

### P3 — LLM-assisted blog with affiliate (deferred)
Viable only with guardrails: only gear from `affiliate-links.json`, no auto-publish (build-time → draft → human PR), disclose assisted, max 1-2 picks/post. Math: 1k sessions/mo → ~$1.5/mo, 10k → ~$15/mo, 50k + 3 posts/week → $100-300 after 6-12mo SEO. Negative ROI early — defer until list + shop validate.

### Not now
- YouTube ad revenue (needs 1k subs/4k hrs, not passive)
- Second processor (violates D-014)
- SearchItems auto-discovery (violates D-015)

## Checklist next session

- [ ] Re-test `AssociateNotEligible` after 2026-07-17
- [ ] Merge trend PR #2
- [ ] Owner selects archives
- [ ] Ship shop MVP + newsletter embed
- [ ] Upgrade /advertise copy
- [ ] After 2-3 cycles tune `keywords.mjs`
