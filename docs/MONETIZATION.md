# Monetization — evergreen

Replaces `HANDOFF-MONETIZATION.md` + `MONETIZATION-STRATEGY-2026-07-15.md` + ad-hoc notes in `OPEN-ITEMS.md`. Human-curated, verified pricing, no fabrication.

## Stack (D-014 still valid)

- **Shop:** Lemon Squeezy MoR — 5%+50¢, zero monthly, secure signed downloads, VAT/GST handled, customer portal, bundles, discount codes. Acquired by Stripe 2024, future is Stripe Managed Payments (MoR persists). Gumroad fallback (10%+50c direct) worse. Stripe Payment Links rejected — pushes tax to seller.
- **Email:** Buttondown — privacy-first mode (no tracking pixels), markdown-friendly. Free first 100, $9/mo per addon (paid subs, analytics, sponsorships). Substack rejected — tracking pixels + ecosystem lock-in.
- **Affiliate (approved paths):**
  1. **Amazon Associates** — tag `engineersport-20`. Curated ASINs in `affiliate-links.json`, live title/image/price via Creators API → `amazon-catalog.json` (build-time, D-015). Books/tools preferred over thin electronics margins.
  2. **SparkFun Affiliate** — code `rOtrc44SZw` (`?ref=` on sparkfun.com). **10% on SparkFun Originals** only; third-party (Pi, Jetson, Teensy) still linked for UX but may pay $0. URL helper: `buildSparkFunUrl()` in `affiliate-links.ts`.
  3. **PCBWay / JLCPCB** — **stub-ready but not live** (no referral IDs shipped per G2 gate). Helpers `buildPcbWayUrl()` / `buildJlcUrl()`, `isFabLive()`, `FabOrderPanel.astro` export-adjacent CTA on SI / Antenna / Verilog (renders nothing until IDs land). Owner ask still open.
  4. **Interactive kits** — `kits.json` + `KitBuilder.astro` — 10 kits live (6 original + 4 new: gan-foc-starter, antenna-rf-starter, verilog-fpga-starter, pinn-edge-stack). GearGrid capped at 6 cards to reduce decision paralysis, merchant badges (★ Original 10%).
  5. **Soft export gate** — `ExportGate.astro` — free watermarked + clean after email unlock (localStorage `mp_export_unlock_{sim}` + `mp_export_email_{sim}`). Wired on 6 sims: RTOS FreeRTOSConfig.h, SI stackup CSV, SLAM trajectory CSV, PID gains JSON, Antenna array JSON, Verilog RTL + timing. Analytics events `export_gate_unlock`, `export_download`, `gear_click`, `kit_cta_click`, `fab_*_click` as first-party `mp:analytics` CustomEvent (no ad pixels).
  - Disclosure + `rel="sponsored"` on all outbound affiliate CTAs. Integrity: `npm run amazon:audit` + `amazon:smoke` (wired into `npm run check`). Privacy disclosure includes fab pending notice + export gate localStorage handling.
- **Trends → Signals Journal:** Daily digest `trends-digest.yml` 14:00 UTC, gated pipeline + thumbnails self-hosted (D-012/D-013/D-017). **Auto-publishes** each day directly to `/journal/YYYY-MM-DD` (D-022) — gate tests, not a PR, are the pre-publish gate; latest entry also feeds `/resources#trending` and re-ranks gear. Bluesky + HN only (Reddit disabled, D-023).

Hard constraints: never fabricate usage, no auto-discovery/auto-publish of *products or blog content* without a human-review gate (the trends *signal digest* auto-publishes curated public links gated by the pipeline tests — D-022 — which is distinct from generating content/product recommendations), no runtime API calls, no second payment processor without discussion, verify slugs/titles, check rendered output on volume changes (Playwright).

## Current state (2026-07-19 post GearGrid rollup + ExportGate)

- 177 affiliate links (163 Amazon unique ASINs + 14 SparkFun) — smoke 70 cards across 10 sims (29 SparkFun), 0 collisions
- Gear: `/resources#gear` grouped collapsible, trending re-ranked (D-017). All 10 sims now use `GearGrid` (capped 6, merchant badges) + `KitBuilder` (10 kits: pid-hover-stack, si-vna-starter, rf-bench-starter, rtos-lab-stack, fea-mech-lab, slam-edge-stack, gan-foc-starter, antenna-rf-starter, verilog-fpga-starter, pinn-edge-stack). PID success-toast CTA → scroll to kit on stable hover 2s.
- Amazon catalog live (163 ASINs refreshed 2026-07-19) — `AssociateNotEligible` cleared after 48h window, but still handle graceful fallback
- SparkFun live code `rOtrc44SZw` — 10 kits reference Originals for yield
- PCBWay/JLCPCB: stub-ready (`buildPcbWayUrl`, `buildJlcUrl`, `isFabLive()`, `FabOrderPanel.astro` on SI/Antenna/Verilog) — no fake IDs, returns empty base until owner supplies IDs. Acceptance G2 = blocked with clear owner ask + stub not linked (compliant).
- ExportGate live on 6 sims: RTOS FreeRTOSConfig.h, SI stackup CSV, SLAM trajectory CSV, PID gains JSON + toast, Antenna array JSON, Verilog RTL — soft gate, localStorage unlock per sim, Buttondown optional POST, watermark line `makerportal.ai` footer.
- Conversion: gear capping 6, merchant Original badge (★ 10%), `mp:analytics` events for kit_cta_click, gear_click, export_gate_unlock, export_download, fab_*_click — first-party, no pixels.
- Shop placeholder, /advertise copy only, blog 3 posts — newsletter form on /blog etc still TODO (ButtondownSignup needs username)

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

**Recommendation (2026-07-15 session — re-examined per owner's trend-driven content-engine framing):** still defer active publishing, for a sharper reason than the ROI math alone. A pipeline that scrapes trending topics and republishes them with affiliate links is structurally identical to what Google's scaled-content-abuse policy (March 2024 core update, actively enforced) targets — sites doing exactly this pattern get deindexed or manually actioned, not just ranked poorly. That risk is bigger than the weak early revenue, and it's a risk to the whole domain, not just this feature.

The way to de-risk it isn't caution alone, it's differentiation the studio can actually claim and a farm can't: **every post must connect a trending topic to something the studio has actually built, tested, or benchmarked** — a pillar, an app, a real code pattern — never just a reworded trend summary. This is the non-negotiable primary angle, not one option among several, because it's the same thing Google's own guidance points to as what separates legitimate commentary from abuse (genuine expertise behind the content). The other candidate angles from the owner's brief are real but secondary, layered on top of grounding rather than substitutes for it:
- **Real numbers over prose** (a benchmark, a before/after, a device test) is the strongest complement — hardest to fake, most backlink-worthy, and it's the natural format once a post is genuinely grounded in shipped work.
- **Contrarian/skeptical, on-device-vs-cloud-hype voice** is a real point of view worth using when a trend actually supports it — but forcing a contrarian angle onto every trend is its own small fabrication risk (manufacturing disagreement to hit a format), so it's situational, not structural.
- **A named, recurring franchise** tied to the 6 pillars is good for brand recognition but premature before there's enough volume (roughly 6+ posts) for a name to mean anything — revisit once the grounding pattern is established, not before.

**Sequencing — don't build the auto-draft pipeline yet:** the site was indexed by Google ~1 day before the first Search Console pull (1 click / 3 impressions total, see `STATUS.md` Traffic section) — there's no baseline audience yet to tell whether a trend-grounded post performs any differently than a plain field note, and no track record with Google of what this domain's content pattern looks like. Phase 1 field notes (real shipped-app deep dives, no trend hook required) are strictly higher-leverage right now and establish exactly the "genuinely grounded, human-authored" pattern this idea depends on for its differentiation to mean anything. Sequence trend-grounded posts *after* 3-4 Phase 1 field notes are live and after the next Search Console re-check (~2026-07-29, 2 weeks out) shows the site is being crawled normally — revisit with that data, not on a fixed calendar date.

**What's already built vs. what's still gated:** `scripts/trends/draft-post.mjs` — a manual CLI (not wired into any workflow, not scheduled) that takes a selected signal from the latest `src/content/journal/YYYY-MM-DD.json` entry and scaffolds a `draft: true` post in `src/content/blog/`. It structurally enforces the grounding requirement: it refuses to write a draft without a `--app` argument naming a real entry from `src/data/apps.ts`, so "no genuine shipped-app connection" fails at the CLI instead of relying on a human remembering a doc convention. It generates frontmatter and a TODO comment block only — no generation logic, no auto-publish, same human-review gate as `pipeline.mjs`. This is infrastructure, not a decision to start publishing; the recommendation above still stands until the trigger conditions (Phase 1 volume + traffic re-check) are met.

New source worth prototyping when this resumes: **Wikipedia's pageviews/current-events REST API** (`wikimedia.org/api/rest_v1/`, free, no auth) for topical/factual grounding beyond social chatter. "Google" as a signal should mean the site's own Search Console top-query data (real-demand signal, already plumbed, stays local per the privacy stance) or the official Trends API alpha waitlist (Phase 5 backlog item, not yet accepted) — never unofficial Trends scraping, which D-011 already declined as an anti-abuse-evasion pattern.

### Not now
- YouTube ad revenue (needs 1k subs/4k hrs, not passive)
- Second processor (violates D-014)
- SearchItems auto-discovery (violates D-015)

## Checklist next session (updated 2026-07-19)

- [x] Amazon Creators API catalog live (163 ASINs refreshed 2026-07-19)
- [x] SparkFun Affiliate live — code `rOtrc44SZw`, 14 products, multi-merchant model
- [x] GearGrid on all 10 sims (was 6/10) + 10 kits live (was 6)
- [x] ExportGate soft-gate on 6 sims (RTOS/SI/SLAM/PID/Antenna/Verilog) — free watermark + clean unlock via email + localStorage
- [x] PCBWay/JLCPCB stub-ready — helpers + FabOrderPanel + isFabLive() — blocked until owner IDs (no fake IDs) — G2 compliant
- [x] Conversion polish — cap 6, merchant badges (★ Original 10%), PID toast → kit, analytics events mp:*
- [x] Privacy disclosure updated (2026-07-19) + AffiliateDisclosure multi-merchant + fab pending note
- [ ] Owner: PCBWay referral URL / Shared Project URLs + JLCPCB Brand Advocate coupon/terms (still blocked, clear ask)
- [ ] Owner selects Lemon archives
- [ ] Ship shop MVP + Buttondown username for newsletter embed (ExportGate currently localStorage soft gate; Buttondown POST is optional fire-and-forget when username present)
- [ ] Upgrade /advertise copy
- [ ] After 2-3 cycles tune `keywords.mjs`
