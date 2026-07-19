# Handoff: Frontier Simulator Monetization — Next Burndown (Post GearGrid×10 + ExportGate×6)

**Date:** 2026-07-19 (post session 807cb3f)  
**Repo:** `makerportal-hub` `main` (just pushed)  
**Previous handoff:** `docs/HANDOFF-MONETIZATION-SIMS-CONTINUE.md` + brain `monetization_roadmap.md` (now updated)  
**Amazon tag:** `engineersport-20` · **SparkFun LIVE code:** `rOtrc44SZw` (`?ref=`) · **PCBWay/JLCPCB:** stub-ready, blocked pending owner IDs  
**Current check:** `npm run check` → 0 errors, 0 warnings, 50 hints; Audit 177 links (163 amazon unique, 14 sparkfun), 70 sim cards (29 SparkFun)

---

## 1. North star (do not re-litigate)

**Truth the catalog, stack higher-rate hardware partners (SparkFun done → PCB houses next), convert with interactive kits at aha moments, grow email via export gates, never lie about a product.** Dollars per serious engineering session beats pageviews × junk.

Hard rules carried over:
- Prefer **empty gear over wrong ASINs** — integrity incident (25 ASINs shared across unrelated SKUs, e.g. travel duffel) fixed in Phase 0. CI enforces 1 ASIN → 1 link id + label/title coverage ≥34%.
- Amazon electronics margins structurally weak in Jul 2026: **Books 4.5%, Tools/Industrial 3%, PC 2.5%, Electronics 1–2.5%, 24h cookie**. Math: $73 AOV × 2% ≈ $1.50/sale. Do NOT fix monetization by adding more Amazon FPV/scope junk.
- SparkFun pays **10% only on Originals**; third-party (Pi, Jetson, Teensy) may pay $0 — still OK for UX, but label honestly with ★ Original badge.
- Adafruit has **no public affiliate** — do not invent.
- No hard auth/Clerk paywalls yet; soft email gates only.
- No audio-on-affiliate-click gimmicks.
- Never invent commissions, prices, or “we use this daily” claims without owner confirmation.
- All affiliate CTAs `rel="sponsored noopener noreferrer"`; disclosure in `/privacy#affiliates` + `AffiliateDisclosure.astro`.

---

## 2. What just shipped (807cb3f — this session)

| Area | Before | After |
| :--- | :--- | :--- |
| **GearGrid** | 6/10 sims | **10/10 sims** use `GearGrid.astro` — `rg GearGrid` = 10 |
| **Kits** | 6 kits | **10 kits**: pid-hover-stack, si-vna-starter, rf-bench-starter, rtos-lab-stack, fea-mech-lab, slam-edge-stack, **gan-foc-starter, antenna-rf-starter, verilog-fpga-starter, pinn-edge-stack** |
| **Gear capping** | Uncapped, up to 7 | Capped `maxItems=6`, yield-sorted (Originals first), merchant badges (emerald ★ 10%, orange, blue PCBWay, purple JLCPCB), overflow note |
| **Fabrication** | No PCB code | `FabOrderPanel.astro` + helpers `buildPcbWayUrl()`, `buildJlcUrl()`, `isFabLive()` in `affiliate-links.ts` — renders nothing until owner supplies IDs (no fake IDs) — wired on SI, Antenna, Verilog (export-adjacent) |
| **ExportGate** | 0 sims | **6 sims**: RTOS FreeRTOSConfig.h, SI stackup CSV, SLAM trajectory CSV (600-pose buffer), PID JSON + stable-hover toast, Antenna JSON, Verilog RTL + timing report. Free watermarked + clean email unlock via `localStorage mp_export_unlock_{sim}` / `mp_export_email_{sim}` + optional Buttondown POST |
| **Conversion polish** | Basic | PID success toast `pid-success-toast` after 2s stable hover → scroll to kit, analytics `mp:analytics` CustomEvent `gear_click`, `kit_cta_click`, `export_gate_unlock`, `export_download`, `fab_*_click`, `aha_moment` — first-party, no pixels |
| **Docs** | Stale | `privacy.astro` 2026-07-19 + `MONETIZATION.md` + `AFFILIATE-CANDIDATES.md` list live merchants only, fab pending noted, brain `monetization_roadmap.md` P2.3-P4.1 marked done |

**File map new:**
- `src/components/ExportGate.astro` — soft gate UI + JS IIFE `@ts-nocheck`, getter registry `window.__MP_EXPORT_GETTERS__` / `MPExportGate.register(sim, fn)`
- `src/components/FabOrderPanel.astro` — export→fab CTA, hidden when `!isFabLive()`, listens `fab-export-ready` event
- `src/data/affiliate-links.ts` now has `PCBWAY_*`, `JLCPCB_*` string-typed constants + builders + `isFabLive()`
- Sim pages: RTOS, SI, SLAM, PID, Antenna, Verilog, plus the 4 new GearGrid migrations (gan, antenna, verilog, pinn)

---

## 3. Market state — Jul 2026 refresh (use this, don't re-research from scratch)

| Channel | Rate / structure | Best placement | Status |
| :--- | :--- | :--- | :--- |
| **Amazon Associates** | Books 4.5%, Tools/Industrial 3%, PC 2.5%, Electronics 1–2.5%, All Other 4% | Books, cal kits, Prime commodity (NanoVNA, logic analyzer) | LIVE tag `engineersport-20`, 163 ASINs in `amazon-catalog.json` |
| **SparkFun Affiliate** | 10% Originals only, launched 2026-07-09, PayPal $10 min | IMUs, Teensy, RedBoard, OpenLog, MicroMod, SIK, XRP | LIVE code `rOtrc44SZw`, 14 products, 29 Original cards |
| **PCBWay** | ~5% referral; **10% PCB + 10% SMT** on Shared Projects | SI microstrip coupon, Antenna Yagi/balun, Verilog FPGA carrier, FEA fixtures | STUB-READY — needs referral URL `setinvite.aspx?inviteid=XXXX` + Shared Project URLs per sim |
| **JLCPCB** | Referral coupons + Brand Advocate / free PCB / EasyEDA co-brand sponsorship | Order PCB CTA, free boards for content — higher leverage than coupon alone | STUB-READY — needs Brand Advocate approval + coupon terms + CTA assets |
| **DFRobot** | 3%→6%→8% tiered by GMV | Motors, robotics, sensors | Optional backup — owner apply |
| **DigiKey/Mouser/Newark** | Low single-digit via Impact/CJ; high AOV industrial | GaN FETs, probes, passives (FOC, SI) | Not started — low ROI until traffic |
| **SaaS/GPU cloud** | 10–40% recurring (DO, Lambda, Replicate-class) | WebGPU PINN Studio only | Not started — BYO key pattern first |
| **Adafruit** | No consumer affiliate | Skip | N/A |

**Yield math (keep using):** Amazon $73 × 2% = $1.50; SparkFun Original $60 × 10% = $6; PCBWay $120 board × 10% = $12. One fab conversion beats 8 Amazon electronics clicks.

**Conversion research (already applied, keep):**
- Interactive kits convert 3–5× static grids.
- Best moment = post-success / post-export / post-tune (PID stable hover toast is first instance — replicate to other sims).
- Bundles raise AOV more than hunting max % on single SKUs.
- Soft lead magnets (watermark vs clean) beat hard paywalls at low traffic.
- Cap at ~6 cards reduces decision paralysis — we now enforce via `maxItems`.

---

## 4. Current repo state & file map

```
src/data/affiliate-links.json  # 177 entries SSOT, hand-edited, no auto-discovery
src/data/affiliate-links.ts    # AMAZON_TAG, SPARKFUN_CODE, PCBWAY/JLCPCB constants + builders, resolveAffiliateLink
src/data/amazon-catalog.json   # build-time cache via scripts/amazon/build-catalog.mjs (Creators API)
src/data/kits.json / kits.ts   # 10 kits, resolveKit joins linkId → ResolvedAffiliateLink
src/components/GearGrid.astro  # capped 6, yield-sort, merchant badges, overflow, analytics gear_click/kit_cta_click
src/components/KitBuilder.astro
src/components/ExportGate.astro # watermark + email unlock, localStorage, Buttondown optional, registry pattern
src/components/FabOrderPanel.astro # export→fab CTA, hidden when !isFabLive(), listens fab-export-ready
src/components/AffiliateDisclosure.astro # now dynamic fab text via isFabLive()
src/pages/playground/*.astro   # 10 target sims + 28 other playground tools
  pid-flight-arena            # kit + ExportGate + toast CTA
  signal-integrity-lab        # kit + ExportGate + FabOrderPanel
  slam-odometry-arena         # kit + ExportGate
  rtos-scheduler              # kit + ExportGate (FreeRTOSConfig.h getter)
  rf-microwave-bench, fea-structural-lab, gan-foc-drive, antenna-em-sandbox, verilog-live-sculptor, webgpu-pinn-studio # now all GearGrid + KitBuilder
src/pages/privacy.astro        # #affiliates live list + fab pending + export gate localStorage docs, updated 2026-07-19
docs/MONETIZATION.md           # evergreen stack + current state 2026-07-19 rollup
docs/AFFILIATE-CANDIDATES.md   # working tracker + owner ask for PCBWay/JLCPCB
docs/HANDOFF-MONETIZATION-SIMS-CONTINUE.md # previous handoff (this builds on it)
docs/HANDOFF-MONETIZATION-NEXT.md # this file
scripts/amazon/audit-asins.mjs, smoke-sim-gear.mjs, build-catalog.mjs
```

**npm scripts:**
- `npm run check` → `astro check` + `audit-asins.mjs --sims-only` + `smoke-sim-gear.mjs` (must stay 0 errors)
- `npm run amazon:audit` / `amazon:smoke` / `amazon:catalog` (needs `.env` `AMAZON_CLIENT_ID/SECRET`)

---

## 5. Your mission — ordered execution (next burndown)

### Priority 1 — PCBWay/JLCPCB live (owner-gated, then code — highest yield)

**Owner must supply (ask explicitly, do not invent):**
- PCBWay referral URL (`https://www.pcbway.com/setinvite.aspx?inviteid=XXXX`) and/or Shared Project URLs per sim (SI Lab microstrip coupon, Antenna Yagi/balun, Verilog FPGA carrier)
- JLCPCB Brand Advocate approval + referral coupon / sponsorship terms + any CTA assets

**When you have them:**
1. Fill `PCBWAY_REFERRAL_CODE`, `PCBWAY_SHARED_PROJECTS[simId]`, `JLCPCB_REFERRAL_CODE`, `JLCPCB_SPONSORSHIP_URL` in `src/data/affiliate-links.ts`
2. Optional: add rows to `affiliate-links.json` with `merchant: pcbway|jlcpcb`, `externalUrl: <real shared project URL>`, no ASIN, `relatedTo: [simId]`
3. Verify `isFabLive()` returns true, `FabOrderPanel` now renders CTA on SI/Antenna/Verilog
4. Update `/privacy#affiliates`, `AffiliateDisclosure.astro`, `docs/MONETIZATION.md`, `AFFILIATE-CANDIDATES.md` to list live merchants
5. `npm run check` must still pass (non-Amazon path requires `externalUrl`)
6. Do NOT hardcode fake invite IDs — acceptance requires empty over wrong.

**Acceptance G2:** PCBWay and/or JLCPCB live with real URLs OR still blocked with clear owner ask + stub not emitting fake links (currently compliant). After owner supplies, G2 becomes truly live.

### Priority 2 — Buttondown newsletter + export gate email path upgrade

Current `ButtondownSignup.astro` has no username (renders "Coming soon"). ExportGate currently does localStorage soft unlock + optional fire-and-forget POST to Buttondown if `window.__MP_BUTTONDOWN_USER__` set.

**Tasks:**
- Owner creates Buttondown account at buttondown.com → username → set prop in `ButtondownSignup.astro` + global `__MP_BUTTONDOWN_USER__` or data attr on ExportGate
- Wire ExportGate unlock to create/update Buttondown subscriber with tag = simId (privacy-first mode, no tracking pixels per D-014)
- Add forms to `/blog`, `/resources`, `/shop` footer per `MONETIZATION.md` P1
- Update privacy disclosure if needed

### Priority 3 — Shop MVP (Lemon Squeezy)

Per `docs/MONETIZATION.md` P1 shop MVP:
- Owner selects 2–3 repos: BLExAR Nano+OLED (33 builds), CoreML offline classifier, Biquadia DSP snippet
- Lemon store `makerportal` setup: 3 digital products, secure delivery, customer portal, discount `LAUNCH20`, PWYW floor $9
- Data: `src/data/shop.json` + `shop.astro` Lemon.js overlay + README provenance
- Packaging per archive with no fabrication

### Priority 4 — Conversion polish round 2

- **Replicate aha-moment CTA** beyond PID: RTOS after no deadline misses for 5s, SI after low |Γ|, SLAM after loop closure trigger, Antenna after high alignment. All should scroll to kit/gear with analytics `aha_moment`.
- **Sticky bottom bar (mobile):** Kit total + primary merchant CTA (spec in roadmap 5.1) — implement as lightweight component.
- **SimSponsorChip.astro**: 40px rail under canvas, one logo + 48-char line, inventory via `/advertise` — after fab CTAs live, this is next flat $ (SponsorChip: $150–300/mo).
- **GearGrid personalization:** Consider trending re-rank already exists via `resources.astro`, but sim-level could boost books when trending pillar matches (already partially).

### Priority 5 — Expand merchants (lower ROI until traffic)

- **DFRobot** signup (3→6→8%) — robotics/motor stacks backup.
- **DigiKey/Mouser/Newark** via Impact/CJ when BOM depth requires (FOC GaN FETs, SI probes) — high AOV but low %; needs volume.
- **SaaS/GPU cloud** for PINN Studio: BYO key pattern first, then affiliate (10–40% recurring) — document BYO, don't gate core learning.

### Priority 6 — Hygiene & measurement

- Keep `npm run check` green after any ASIN edits: `npm run amazon:catalog` then audit
- Never commit secrets; SparkFun/Amazon tags are public referral ids (OK)
- First-party analytics aggregation: currently `mp:analytics` CustomEvents fire to console. Consider minimal `src/data/analytics.ts` helper that logs to localStorage for owner debugging, still privacy-safe, no third-party pixels
- Update brain `monetization_roadmap.md` checkboxes as you complete (P3.4, P3.5, P4.x)

---

## 6. Explicit non-goals (still)

- Hard PRO account / Clerk before list + traffic
- Runtime browser calls to Amazon PA-API/Creators API (D-011/D-015)
- Auto product discovery / LLM gear invention (violates human-curated)
- Claiming Adafruit affiliate
- Re-adding high-ticket Amazon gear without verified unique ASINs
- Scaled trend→affiliate blog spam (MONETIZATION.md P3 deferral still stands)
- Re-running `fix-sim-asins.mjs` without reading it (destructive one-shot)
- Inventing PCBWay/JLCPCB invite IDs

---

## 7. Acceptance criteria for *this* next session

| Gate | Pass |
| :--- | :--- |
| **G1 Fab live (or still blocked cleanly)** | If owner supplied IDs: PCBWay and/or JLCPCB live with real URLs on ≥1 sim (SI/Antenna/Verilog), disclosure lists them, check green. If not: still blocked with clear owner ask, no fake IDs, FabOrderPanel hidden — still compliant, but note remaining owner action. |
| **G2 Newsletter** | Buttondown username configured OR documented why still pending + ExportGate email path documented (already done, but upgrade to real subscriber creation) |
| **G3 Shop or Sponsor** | Either shop MVP (2–3 archives) OR `SimSponsorChip` live on ≥1 sim + `/advertise` updated, OR conversion polish round 2 (aha CTAs on ≥3 sims beyond PID) |
| **G4 Integrity** | `npm run check` 0 errors; audit 0 collisions; no duffel-bag mismatches |
| **G5 Docs** | Privacy + MONETIZATION list every live merchant only; pending fab noted but not claimed as live if IDs missing |

---

## 8. Suggested first commands

```bash
cd /Users/josh/Documents/GitHub/makerportal-hub
git status && git log --oneline -8
npm run check
# read:
#   docs/MONETIZATION.md
#   docs/AFFILIATE-CANDIDATES.md
#   src/data/affiliate-links.ts
#   src/components/FabOrderPanel.astro
#   src/components/ExportGate.astro
#   src/pages/privacy.astro
#   monetization_roadmap.md (brain)
```

Then:
1. Ask owner for PCBWay referral + Shared Projects + JLCPCB Advocate terms (if not in env/docs)
2. If IDs present, implement Priority 1 live path immediately
3. Parallel: wire Buttondown username (P2) — 1h high-leverage
4. Then shop MVP or sponsor chip (P3/P4) + aha CTAs replication

---

## 9. Learnings from 807cb3f session (don't re-learn)

- **GearGrid capping:** 6 cards decision paralysis fix. Sort by yield: SparkFun Originals first. Badge must include merchant + Original flag. `maxItems` prop + overflow note.
- **ExportGate pattern:** Global getter registry `window.__MP_EXPORT_GETTERS__[simId] = () => string` called on download click → always fresh. Watermark via footer line (comment style per fileExtension). localStorage keys `mp_export_unlock_{sim}` + `mp_export_email_{sim}` per handoff G3. Buttondown POST is optional fire-and-forget `no-cors` to `https://buttondown.com/api/emails/embed-subscribe/{user}`.
- **Fab stub:** `isFabLive()` false until IDs land → `FabOrderPanel` returns empty fragment (no fake links). `buildPcbWayUrl()` handles full URL passthrough vs path + `?from=` param. Typed constants as `string` (not literal '') to avoid TS `never` narrowing after truthiness check.
- **PID toast:** Stable hover detection in main loop (posErr<0.18, vel<0.25 for 2s) → show fixed toast, CTA scrolls to `.gear-grid`. Use `window.__pidStable` global to avoid re-trigger.
- **Astro TS errors:** Scripts inside `.astro` need `// @ts-nocheck` or cast `HTMLElement`. `dataset` doesn't exist on `Element` — cast.
- **Kits:** Only use existing `linkId`s — never invent SKUs. New kits added to `kits.json` with mixed merchant.
- **Privacy:** Must document export gate storage + fab pending + live merchants list matches actual live state.

---

## 10. Owner contact points (human-only) — still open

- [ ] PCBWay account / Shared Project / referral link
- [ ] JLCPCB Brand Advocate approval + coupon codes + CTA assets
- [ ] Buttondown username (or chosen ESP)
- [ ] Lemon Squeezy store + archive selection (BLExAR, CoreML, Biquadia candidates)
- [ ] Confirm any new “we use this” hardware claims before shipping notes

**SparkFun is LIVE — code `rOtrc44SZw` — do not re-ask.**

*End handoff — continue burndown, do not restart Amazon-only strategy. Prefer empty gear over wrong ASINs.*
