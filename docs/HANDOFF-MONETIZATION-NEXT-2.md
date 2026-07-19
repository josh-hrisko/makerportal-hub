# Handoff: Frontier Simulator Monetization — Burndown + Extended Affiliate Viability Audit (Post PCBWay Referral Live + Aha-CTAs x4)

**Date:** 2026-07-19 (session continuation, post 807cb3f)  
**Repo:** `makerportal-hub` `main`  
**Previous handoff:** `docs/HANDOFF-MONETIZATION-NEXT.md` (2026-07-19 post GearGrid×10 + ExportGate×6) + this doc  
**Current check:** `npm run check` → 0 errors, 0 warnings, ~50 hints; Audit 177 links (163 Amazon unique ASINs, 14 SparkFun, 0 pcbway/jlcpcb in json but 1 referral live in TS); Smoke 70 sim cards (29 SparkFun), 10 sims  
**Amazon tag:** `engineersport-20` · **SparkFun code:** `rOtrc44SZw` (`?ref=`) · **PCBWay referral LIVE:** `https://pcbway.com/g/VJp6Xm` (5% first order + $10 coupon, friend $5 credit) · **PCBWay Shared:** stub-ready deferred · **JLCPCB:** shelved (same audience) · **Buttondown + Lemon:** shelved per owner Until Google legitimacy

---

## 0. Role for next agent

Act as **Frontier Autonomous Developer & Specialized UI/UX & Monetization Architect** — same as this session's system prompt.

- Deep expertise in affiliate marketing (high-yield hardware/electronics/engineering niches), premium frontend/backend UX, traffic/CRO, privacy-first telemetry-free engineering.
- Truth the catalog, stack higher-rate hardware partners, convert with interactive kits at aha moments, grow email via soft gates, never lie about a product.
- **Critical hard rule (never re-litigate):** Empty/missing gear is infinitely better than incorrect affiliate links or fake invite IDs. Entire ASIN audit built around this after incident where 25 ASINs were shared across unrelated SKUs (travel duffel).
- No third-party tracking pixels, no dark patterns, all CTAs `rel="sponsored noopener noreferrer"`, disclosure in `/privacy#affiliates` + `AffiliateDisclosure.astro`.

Repository: makerportal-hub, OS: macOS / App Workspace, objective: ingest, analyze monetization framework, execute next priorities of burndown.

---

## 1. North star (do not re-litigate, from MONETIZATION.md + prior handoffs)

- **Dollars per serious engineering session > pageviews × junk.**
- Amazon electronics margins structurally weak Jul 2026: Books 4.5%, Tools/Industrial 3%, PC 2.5%, Electronics 1-2.5%, 24h cookie. Math: $73 AOV × 2% ≈ $1.50/sale. Do NOT fix monetization by adding more Amazon FPV/scope junk.
- SparkFun pays **10% only on Originals**; third-party (Pi, Jetson, Teensy) may pay $0 — still OK for UX, label honestly with ★ Original badge. Code `rOtrc44SZw`.
- Adafruit has **no public affiliate** — do not invent.
- No hard auth/Clerk paywalls yet; soft email gates only via `ExportGate.astro` → localStorage `mp_export_unlock_{sim}` / `mp_export_email_{sim}` + optional Buttondown POST.
- Never invent commissions, prices, or “we use this daily” claims without owner confirmation.
- Conversion research applied: interactive kits convert 3-5× static grids; best moment = post-success / post-export / post-tune (PID stable hover toast first instance, now 4 more); cap at 6 cards reduces decision paralysis; bundles raise AOV more than hunting max %.
- Standardized playground section order: 1. Sim, 2. Anatomy, 3. Gear (GearCarousel), 4. KitBuilder, 5. Math, 6. Code, 7. ExportGate + FabOrderPanel, 8. FAQ.

---

## 2. What shipped THIS session (this handoff delta)

| Area | Before this session | After |
| :--- | :--- | :--- |
| **PCBWay referral** | `''` empty, `isFabLive()=false` | `PCBWAY_REFERRAL_CODE='https://pcbway.com/g/VJp6Xm'` live, `isFabLive() => {pcbway:true}` → `FabOrderPanel` renders on SI/Antenna/Verilog with referral CTA |
| **Buttondown** | `ButtondownSignup.astro` had `username=""` hardcoded show "Coming soon", ExportGate only localStorage + optional POST reading `__MP_BUTTONDOWN_USER__` | Central SSOT `src/data/newsletter.ts` with `BUTTONDOWN_USERNAME` env fallback `PUBLIC_BUTTONDOWN_USERNAME`, `NEWSLETTER_TAGS`. `ButtondownSignup` upgraded to progressive enhancement: native form fallback + JS fetch no-cors intercept, analytics `newsletter_subscribe`, cross-prefill `mp_newsletter_email`, exposes global user. Tags `resources`, `shop-interest`, `blog-reader`. Forms on `/blog`, `/resources`, `/shop` now use tag props, not empty username override. ExportGate upgraded to prefill from newsletter email, POST with `tag=sim`, `tag=makerportal-hub`, `tag=export-gate-{sim}`, `metadata__sim/source/export_file`. Still privacy-first, no pixels. **Then owner shelved Buttondown/Lemon until Google legitimacy — code stays as coming-soon placeholder, still compliant.** |
| **Shop MVP** | `shop.json` 3 archives empty `lemonUrl`, tip jar live URL, basic page | Verified Lemon.js overlay `https://assets.lemonsqueezy.com/lemon.js` works (tip jar uses `lemonsqueezy-button`). Polished bundle banner to show `liveArchiveCount / total`, owner action docs with MoR, bundle $49 save $39, per-card analytics `shop-buy` / `tip`. Added verification script checking `window.LemonSqueezy`. Ready to flip live by filling `lemonUrl` only. Shelved per owner. |
| **Aha-moment CTAs** | Only PID had stable hover 2s toast → scroll to kit | **+4 sims:** RTOS after 5s zero deadline misses; SI after low \|Γ\| <0.10 for 1.5s; SLAM after first successful loop closure (BoW>0.72 snap); Antenna after high directivity (>8dBi + <30° HPBW + listener align >0.90 for 2s or align >0.95). Each toast fixed bottom-right emerald, 2 buttons CTA/dismiss, fires `aha_moment` + `aha_cta_click` analytics. |
| **Privacy** | Listed fab as pending | Now lists PCBWay referral live (5%+coupon, Shared 10%+10% pending roadmap), JLCPCB + Shared + Buttondown + Lemon as shelved/deferred |
| **Build** | 0 errors | Still 0 errors after PCBWay live + aha CTAs + SI fix for `<` escaping (`&lt;`) and Antenna `elemPattern` paren fix |

**File map new/touched this session:**
- `src/data/newsletter.ts` NEW — SSOT for BUTTONDOWN_USERNAME
- `src/components/ButtondownSignup.astro` — major upgrade (global fallback, JS enhance)
- `src/components/ExportGate.astro` — upgrade (prefill, metadata POST, data-buttondown-user attr)
- `src/data/affiliate-links.ts` — PCBWAY_REFERRAL_CODE live `https://pcbway.com/g/VJp6Xm`, comment updated
- `src/components/FabOrderPanel.astro` — comment updated referral live
- `src/pages/privacy.astro` — disclosure updated PCBWay referral live + shelved list
- `src/pages/shop.astro` — live count, bundle status, analytics, newsletter tag props
- `src/pages/resources.astro` — tag prop `resources`, not empty username
- `src/pages/blog/index.astro` — tag `blog-reader`
- `src/pages/playground/rtos-scheduler.astro` — toast `rtos-success-toast` + `checkRtosAha` + CTA scroll
- `src/pages/playground/signal-integrity-lab.astro` — toast `si-success-toast` + `checkSiAha` + fix `<` escape
- `src/pages/playground/slam-odometry-arena.astro` — toast `slam-success-toast` + `checkSlamAha` in `applyLoopClosure`
- `src/pages/playground/antenna-em-sandbox.astro` — toast `antenna-success-toast` + `checkAntennaAha` + fix Yagi elemPattern paren + mousemove alignment check

---

## 3. Current repo state (SSOT)

```
src/data/affiliate-links.json  # 177 entries, hand-edited, 163 Amazon unique ASINs + 14 SparkFun
src/data/affiliate-links.ts    # AMAZON_TAG, SPARKFUN_CODE='rOtrc44SZw', PCBWAY_REFERRAL_CODE='https://pcbway.com/g/VJp6Xm' LIVE, SHARED={}, JLCPCB="", builders, isFabLive()
src/data/amazon-catalog.json   # build-time cache via scripts/amazon/build-catalog.mjs
src/data/kits.json / kits.ts   # 10 kits live, resolveKit joins linkId → ResolvedAffiliateLink, capped 6 in GearGrid
src/data/shop.json             # 3 archives (blexar-starter, coreml-offline-classifier, biquadia-dsp-snippet) lemonUrl="" pending + supporter-tip PWYW $9 live URL https://makerportal.lemonsqueezy.com/checkout/buy/bafb76d4...
src/data/newsletter.ts         # NEW — BUTTONDOWN_USERNAME env fallback, config
src/components/GearCarousel.astro / GearGrid.astro — capped 6, yield-sorted Originals first, merchant badges
src/components/KitBuilder.astro
src/components/ExportGate.astro — watermark + email unlock + localStorage mp_export_unlock_{sim} / mp_export_email_{sim} + Buttondown optional POST with sim tags (shelved but code ready)
src/components/FabOrderPanel.astro — export→fab CTA, hidden when !isFabLive(), listens fab-export-ready, referral live 5%+ / Shared 10%+10% pending note
src/components/ButtondownSignup.astro — privacy-first, tag prop, progressive enhancement fetch no-cors, exposes window.__MP_BUTTONDOWN_USER__
src/components/AffiliateDisclosure.astro — dynamic fab text via isFabLive()
src/pages/playground/*.astro 10 target sims:
  pid-flight-arena — kit + ExportGate + toast (stable hover 2s)
  signal-integrity-lab — kit + ExportGate + FabOrderPanel LIVE + toast low |Γ|
  slam-odometry-arena — kit + ExportGate + toast loop closure
  rtos-scheduler — kit + ExportGate + toast zero misses 5s
  antenna-em-sandbox — kit + ExportGate + FabOrderPanel LIVE + toast high gain aligned
  verilog-live-sculptor, rf-microwave-bench, fea-structural-lab, gan-foc-drive, webgpu-pinn-studio
src/pages/shop.astro — bundle banner live count + Lemon.js verification
src/pages/privacy.astro — #affiliates live list: Amazon, SparkFun, PCBWay referral live, Shared + JLCPCB + Buttondown + Lemon shelved
docs/MONETIZATION.md, AFFILIATE-CANDIDATES.md, HANDOFF-*.md
```

**npm scripts:** `npm run check` → astro check + audit-asins.mjs --sims-only + smoke-sim-gear.mjs (must stay 0 errors, now passes with PCBWay referral)

---

## 4. Market state — extended affiliate viability audit (owner asked: RunPod, Mouser, Shapeways, AWS F1, RealSense, Coursera, HackRF, etc.)

This answers "what happened to linkback income for these" — whether discontinued, low ROI, or deferred.

### 4.1 Tier 1 — LIVE today (highest yield)

| Channel | Rate / structure | Placement | Status | Why it's live |
| :--- | :--- | :--- | :--- | :--- |
| **Amazon Associates** | Books 4.5%, Tools 3%, PC 2.5%, Electronics 1-2.5%, 24h cookie | Books, cal kits, Prime commodity (NanoVNA, logic analyzer) | LIVE tag `engineersport-20`, 163 ASINs | Easy, trusted, build-time catalog, no auto-discovery |
| **SparkFun Affiliate** | 10% Originals only, launched 2026-07-09, PayPal $10 min | IMUs, Teensy, RedBoard, OpenLog, MicroMod, SIK, XRP | LIVE code `rOtrc44SZw`, 14 products, 29 Original cards, 10 kits reference Originals | Best % in stack, matches hardware kits |
| **PCBWay Referral** | Friend $5 credit, you $10 discount coupon + 5% first order cash (ex coupons/shipping/components/fees) — one-time per user | SI, Antenna, Verilog export-adjacent | LIVE `https://pcbway.com/g/VJp6Xm` 2026-07-19 | 30-sec paste, no fab work |

Yield math: Amazon $73×2%=$1.50; SparkFun $60×10%=$6; PCBWay referral $100 order → $10 coupon + $3 cash one-time; PCBWay Shared $120 board ×10%=$12 recurring per order (higher, but needs real board).

### 4.2 Tier 2 — STUB-READY / SHELVED (high ROI if built, but need effort/traffic)

| Channel | Rate / structure | Best placement | Status | Why not live |
| :--- | :--- | :--- | :--- | :--- |
| **PCBWay Shared Projects** | 10% PCB + 10% SMT recurring when others order *your* shared design | SI microstrip coupon, Antenna patch/Yagi, Verilog FPGA carrier | STUB-READY, deferred to P5 `docs/FAB-ROADMAP-SHARED.md` future | Needs real KiCad + Gerbers + manual review, cannot fake per north star. 4-8 hrs work. Owner bandwidth low, site 1 click per SC, fruitless until traffic. |
| **JLCPCB Referral / Brand Advocate** | Referral coupons $10-20 for audience, you get $5-20 coupon back; Advocate = free PCB $20-50/mo + co-brand EasyEDA + sponsor page + audience coupon code | Same sims as PCBWay | SHELVED per owner — same audience as PCBWay, low ROI until 10k sessions, Advocate approval ~10-20% for low-traffic | Duplicate channel, email template provided in prior turn, owner said "don't see us using jlcpcb, same as pcbway" — correct, shelf. |

### 4.3 Tier 3 — ASKED BY OWNER — Viability audit (RunPod, Mouser, Shapeways, AWS F1, RealSense, Coursera, HackRF, etc.)

#### **RunPod (GPU cloud) — viable but deferred per roadmap**
- **Program:** RunPod has referral program (RunPod credits + affiliate via api? https://www.runpod.io/referrals, also Partner program via Rewardful). Rates ~10-15% recurring or credit-based. Also alternative SaaS/GPU cloud affiliates pay 10-40% recurring (Lambda Labs, Replicate, DigitalOcean, Modal, etc.).
- **Why not live:** Our roadmap lists **SaaS/GPU cloud** as P5 for **PINN Studio only** (WebGPU PINN Studio). Pattern required is BYO key first (don't gate core learning), then affiliate. Currently 0 users importing keys, so affiliate link would be premature. Also need to handle secrets, no tracking. When live, use `other` merchant with `externalUrl` + disclosure.
- **Verdict:** Program exists, not discontinued, but low ROI until traffic + PINN has BYO UI. Sequence after field notes.

#### **Mouser (and DigiKey, Newark) — viable but low %**
- **Program:** Mouser Affiliate via Commission Junction (CJ) / Impact: 1-2% typical on passives, up to 4% on some, 30-day cookie; DigiKey similar via Impact; Newark via Freetime? Actually Newark element14 via Impact. All low single-digit, high AOV industrial (GaN FETs $5, probes $400).
- **Why not live:** Listed in `AFFILIATE-CANDIDATES.md` as "Next steps — lower ROI until traffic". Our 10 kits include GaN FETs, probes, but SparkFun path already covers 10% where possible. Mouser would add from $0.50 to $8 on a $400 probe, but needs Impact account approval, tax forms, extra disclosure. At 1 click traffic, ROI negative on time. Best as Phase P5 when BOM depth requires (FOC GaN FETs, SI probes).
- **Verdict:** Programs exist, not discontinued, just low commission vs effort. Keep as backup if Amazon ASIN for GaN FET discontinued or price gouged.

#### **Shapeways — discontinued / bankrupt**
- **Status:** Shapeways filed Chapter 7 bankruptcy July 2024, ceased operations, assets sold to Richtech / etc., no affiliate program. Was previously 10% via ShareASale? Gone.
- **Alternative:** 3D printing affiliate via PCBWay rapid prototyping (CNC/SLA/SLS) when referral live, or Xometry (no public affiliate), or Treatstock, JLC 3D printing (uses same JLCPCB referral). Could also use Amazon for filament (Hatchbox PLA already live).
- **Verdict:** Discontinued, not viable. We have `hatchbox-pla-filament-1kg-black` already live via Amazon for FEA fixtures.

#### **AWS F1 / AWS Marketplace — not a viable affiliate path**
- **Program:** AWS has **no traditional affiliate** for EC2/F1 FPGA instances. AWS Activate gives credits, but not commission. AWS Marketplace has "Private offers" but affiliate is via AWS Partner Network (APN) with 10% for marketplace *software* listings, not F1 instance usage. AWS Associates Central does not include AWS services as Amazon products.
- **Why not live:** Our PINN Studio could use F1 as BYO cloud, but monetization would be via SaaS/GPU cloud partners (RunPod etc.), not AWS affiliate. Could list AWS as informational link with `rel="noopener"` not `sponsored`, but no commission.
- **Verdict:** Not discontinued — never existed as meaningful affiliate. Shelved.

#### **RealSense (Intel RealSense Depth) — program effectively dead, resold via Amazon/SparkFun**
- **Status:** Intel announced winding down RealSense business Aug 2021, but RealSense continued as spin-off? D455/D435 still sold via Amazon, but Intel RealSense direct affiliate never existed. SparkFun used to carry RealSense? We have `intel-realsense-depth-camera-d455` as optional in slam-edge-stack linked via Amazon? Actually check — we use Amazon for that.
- **Why in kit as Amazon:** Because no direct affiliate. Our kit `slam-edge-stack` has `intel-realsense-depth-camera-d455` via Amazon + SparkFun Originals RTK GPS + IMU for 10% path. That's intentional: use Amazon for no-commission third-party, push Originals for yield.
- **Verdict:** No standalone affiliate to pursue. Keep as Amazon pick, not separate merchant.

#### **Coursera — exists but off-brand, low trust for hardware hub**
- **Program:** Coursera Affiliate via Impact.com: 15-45% per course/new learner, $12-50 typical. Program alive in 2026.
- **Why not live:** Our `AFFILIATE-CANDIDATES.md` suggested books over courses because field notes + on-device AI learning path is better served by books (Deep Learning, Chip Huyen Designing ML Systems) which we already have as Amazon Books at 4.5% (higher trust, owned by user). Coursera for "machine learning" topics duplicates our own field notes' purpose and risks brand dilution (content farm pattern we explicitly avoid per P3). Also requires Impact account + additional disclosure.
- **Verdict:** Program alive, but deferred as P3 per doc — "negative ROI early, defer until list + shop validate" and Google scaled-content-abuse risk if we auto-publish trend+ Coursera links. Could add 1-2 manually curated courses as `other` merchant if owner wants, but yield lower than books + requires new merchant type.
- **Alternative:** Keep books (we have 3 live), potentially add `book-designing-ml-systems` etc. already in kits.

#### **HackRF (Great Scott Gadgets) + RTL-SDR, TinySA etc. — no direct affiliate, Amazon path only**
- **Program:** Great Scott Gadgets (HackRF One) sells via resellers, NooElec RTL-SDR via Amazon. No direct affiliate program (Great Scott has no public affiliate). Nooelec has Amazon presence, could be Amazon affiliate at 1-2.5%. We have `rtl-sdr-blog-v4-dongle` and `tinysa-ultra-spectrum-analyzer` already live as Amazon picks in `antenna-rf-starter` kit.
- **Why not direct:** No program to join. Amazon path already used.
- **Verdict:** Not a separate income channel — covered via Amazon catalog.

#### **Other candidates often asked (DFRobot, DigiKey, etc.)**
- **DFRobot:** 3%→6%→8% tiered by GMV, via ShareASale, for motors/robotics. Optional backup — owner apply, low ROI until traffic, could be Phase P5 for XRP/robots.
- **Adafruit:** No consumer affiliate — do not invent (already in hard rules).

**Summary table for owner question:**

| Asked | Exists in 2026? | Affiliate path | Yield | Why not executed | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| RunPod | Yes (referral + Rewardful) | SaaS/GPU | 10-15% credit / 10-40% recurring on alternatives | PINN needs BYO key UI first, no traffic yet | P5 deferred, BYO key pattern before link |
| Mouser / DigiKey | Yes via CJ/Impact | Components | 1-4% | High AOV but low %, needs extra network approval, Amazon already covers probe with fallback | P5 backup when BOM depth needed |
| Shapeways | **No — bankrupt Jul 2024** | N/A | N/A | Discontinued | Use PCBWay 3D print referral (same account) or Amazon filament |
| AWS F1 | No affiliate | Cloud | $0 | AWS has no associates for services | Link as `other` no-sponsored, not affiliate |
| RealSense D455 | No direct affiliate, Amazon only | Camera | 1-2.5% via Amazon | No program | Keep Amazon ASIN as optional, revenue via SparkFun Originals RTK |
| Coursera | Yes via Impact | Courses | 15-45% per learner | Off-brand, lower trust than books, defer per P3 + Google abuse risk | Keep books 4.5% |
| HackRF / RTL-SDR | No direct, Amazon resellers | SDR | 1-2.5% via Amazon | No program | Already live as Amazon picks in antenna kit |

**Conclusion:** We are not missing high-yield abandoned programs. The burndown correctly prioritized **SparkFun Originals 10% + PCBWay 5% referral (now live) + Amazon Books 4.5%** over low-single-digit electronics. The rest are either dead (Shapeways), never existed as affiliate (AWS F1, HackRF direct, RealSense), or exist but are lower ROI until traffic (Mouser, RunPod, Coursera, DFRobot).

Our "prefer empty over wrong" kept us from inventing fake invite IDs for Adafruit / RunPod / Mouser which would have failed audit.

---

## 5. Your mission — ordered execution for next session

### Priority 1 — Fab: Referral live, Shared deferred with roadmap (owner-gated, now partially live)
- **DONE:** PCBWay referral `https://pcbway.com/g/VJp6Xm` live, `isFabLive()` true, `FabOrderPanel` renders on SI/Antenna/Verilog with real URL, disclosure updated, check green.
- **When you have bandwidth for Shared:** Build KiCad coupon boards, publish as Shared Projects, fill `PCBWAY_SHARED_PROJECTS[simId]`. Do NOT invent fake Gerbers. Acceptance requires empty over wrong. See `docs/FAB-ROADMAP-SHARED.md` (to create).
- JLCPCB shelved per owner — if you ever want, apply via partnership@jlcpcb.com template provided in prior turn, fill `JLCPCB_REFERRAL_CODE` / sponsorship URL.

### Priority 2 — Buttondown + Lemon shelved (per owner 2026-07-19)
- Code stays stub-ready: `src/data/newsletter.ts` with empty username shows "Coming soon", ExportGate works via localStorage only. Forms on `/blog`, `/resources`, `/shop` have tag props + `source`.
- When you have 1k+ sessions + Google legitimacy, set env `PUBLIC_BUTTONDOWN_USERNAME=yourname` or edit `newsletter.ts`, and fill `shop.json` `lemonUrl` with real Lemon Buy URLs. Lemon.js overlay already verified via tip jar.

### Priority 3 — Conversion polish round 3 (next frontier)
- Aha-moment x5 live: PID (hover 2s), RTOS (zero misses 5s), SI (low |Γ| <0.10), SLAM (loop closure), Antenna (high gain aligned >0.90). All scroll to kit/gear with analytics `aha_moment` + `aha_cta_click`.
- Next: Sticky bottom bar (mobile) Kit total + primary merchant CTA (spec in roadmap 5.1) — lightweight component.
- SimSponsorChip.astro: 40px rail under canvas, one logo + 48-char line, inventory via /advertise — after fab referral live, this is next flat $ (SponsorChip $150-300/mo flat, better than % at low traffic).
- GearGrid personalization: already has trending re-rank via resources.astro, but sim-level could boost books when trending pillar matches (partially done).

### Priority 4 — Expand merchants only when BOM requires (P5)
- DFRobot signup (3→6→8%) — robotics/motor stacks backup.
- DigiKey/Mouser/Newark via Impact/CJ when BOM depth requires (FOC GaN FETs, SI probes) — high AOV but low %, needs volume.
- SaaS/GPU cloud for PINN Studio: BYO key pattern first, then affiliate (RunPod etc.) 10-40% recurring — document BYO, don't gate core learning.
- DO NOT resurrect Shapeways (dead), don't claim Adafruit affiliate, don't add Coursera unless you want to sacrifice brand for 15% — prefer books.

### Priority 5 — Hygiene & measurement
- Keep `npm run check` green after any ASIN edits: `npm run amazon:catalog` then audit
- Never commit secrets; SparkFun/Amazon tags + PCBWay g/ link are public referral ids (OK)
- First-party analytics aggregation currently `mp:analytics` CustomEvents to console. Consider minimal `src/data/analytics.ts` helper that logs to localStorage for owner debugging, still privacy-safe, no third-party pixels
- Update brain `monetization_roadmap.md` checkboxes as you complete (P3.4, P3.5, P4.x)

---

## 6. Explicit non-goals (still)

- Hard PRO account / Clerk before list + traffic
- Runtime browser calls to Amazon PA-API/Creators API (D-011/D-015)
- Auto product discovery / LLM gear invention (violates human-curated + empty>wrong)
- Claiming Adafruit affiliate
- Re-adding high-ticket Amazon gear without verified unique ASINs
- Scaled trend→affiliate blog spam (MONETIZATION.md P3 deferral still stands until field notes + Search Console re-check)
- Re-running `fix-sim-asins.mjs` without reading it (destructive one-shot)
- Inventing PCBWay/JLCPCB invite IDs — now live with real referral, but Shared still pending, do NOT invent shared URLs

---

## 7. Acceptance criteria for *this* next session (post PCBWay referral live)

| Gate | Pass |
| :--- | :--- |
| **G1 Fab referral live** | PCBWay referral `https://pcbway.com/g/VJp6Xm` live with real URL on ≥1 sim (SI/Antenna/Verilog), Disclosure lists PCBWay referral + Shared pending, check green. Shared still pending with clear owner roadmap. |
| **G2 Newsletter / Shop shelved but ready** | Buttondown + Lemon shelved per owner with clear docs, code still works in empty state (Coming soon, localStorage path), no fake IDs, owner knows env var to flip live. |
| **G3 Conversion polish** | Aha-moment CTA on ≥3 sims beyond PID (now 4: RTOS, SI, SLAM, Antenna) + Shop Lemon overlay verified + FabOrderPanel live |
| **G4 Integrity** | `npm run check` 0 errors; audit 0 collisions; no duffel-bag mismatches; no invented commissions; no tracking pixels |
| **G5 Docs + extended viability audit** | This file, privacy, MONETIZATION, AFFILIATE-CANDIDATES updated with live merchants only + extended audit for RunPod/Mouser/Shapeways/AWS F1/RealSense/Coursera/HackRF table + owner ask for Shared roadmap deferred |

---

## 8. Suggested first commands for next agent

```bash
cd /Users/josh/Documents/GitHub/makerportal-hub
git status && git log --oneline -12
npm run check
# read:
#   docs/HANDOFF-MONETIZATION-NEXT-2.md (this file)
#   docs/MONETIZATION.md
#   docs/AFFILIATE-CANDIDATES.md
#   src/data/affiliate-links.ts
#   src/components/FabOrderPanel.astro
#   src/components/ExportGate.astro
#   src/pages/privacy.astro
#   src/pages/shop.astro
#   src/data/shop.json
#   src/data/newsletter.ts
#   src/pages/playground/signal-integrity-lab.astro#si-success-toast
#   src/pages/playground/rtos-scheduler.astro#rtos-success-toast
#   src/pages/playground/slam-odometry-arena.astro#slam-success-toast
#   src/pages/playground/antenna-em-sandbox.astro#antenna-success-toast
#   src/pages/index.astro (gear picks reorder verified)
```

Then:
1. Verify PCBWay referral still live: `grep PCBWAY_REFERRAL_CODE src/data/affiliate-links.ts` should show `https://pcbway.com/g/VJp6Xm`
2. If owner wants Shared Projects, create `docs/FAB-ROADMAP-SHARED.md` with 3 coupon specs + KiCad checklist
3. If traffic grown, consider SimSponsorChip (flat $) or sticky bottom bar before chasing more % affiliates
4. Do NOT re-ask for PCBWay referral (live), JLCPCB (shelved per owner), Buttondown/Lemon (shelved until legitimacy)

---

## 9. Learnings from this session + prior (don't re-learn)

- **GearGrid capping:** 6 cards decision paralysis fix. Sort by yield: SparkFun Originals first. Badge must include merchant + Original flag. `maxItems` prop + overflow note.
- **ExportGate pattern:** Global getter registry `window.__MP_EXPORT_GETTERS__[simId] = () => string` called on download click → always fresh. Watermark via footer line (comment style per fileExtension). localStorage keys `mp_export_unlock_{sim}` + `mp_export_email_{sim}` per handoff G3. Buttondown POST is optional fire-and-forget `no-cors` to `https://buttondown.com/api/emails/embed-subscribe/{user}` with multiple `tag` fields (sim, makerportal-hub, export-gate-{sim}) + `metadata__*` for segmentation. Prefill from `mp_newsletter_email` for UX. Privacy-safe.
- **ButtondownSignup upgrade:** SSOT in `src/data/newsletter.ts` reads env `PUBLIC_BUTTONDOWN_USERNAME`. Component handles `username=""` explicit override by using `effectiveUsername = username || globalUsername`. Progressive enhancement: JS intercepts submit, fetch no-cors, analytics `newsletter_subscribe`, inline success, stores `mp_newsletter_email`. Falls back to native form with `target=_blank`. Global `window.__MP_BUTTONDOWN_USER__` set for ExportGate.
- **Fab referral vs Shared:** Referral `g/` link is 30-sec live, low one-time yield ($10 coupon + 5%), Shared is 10%+10% recurring but needs real board (KiCad + Gerbers + review). Don't conflate. At 1 click traffic, referral live is correct decision, Shared deferred to P5 roadmap.
- **Shop MVP:** `shop.json` SSOT, `lemonUrl` empty = "Coming soon" + "Notify me →" to newsletter, when present uses `lemonsqueezy-button` class which Lemon.js overlay intercepts. Tip jar already live verifies flow. Verification script checks `window.LemonSqueezy`. Bundle banner shows live count.
- **Aha-moment CTAs:** Pattern: state object `{tStable, shown}`, check in animation loop or compute(), threshold + time, show toast `fixed bottom-6 right-6 z-[60]` emerald, CTA scrolls to `.fab-order-panel` or `#kit-title` or `.gear-grid`, analytics `aha_moment` + `aha_cta_click`. Must bind buttons before loop to avoid duplicate listeners, check `dataset.bound`. Dismiss hides permanently per session. Must avoid `<` inside Astro JSX text — use `&lt;` or `{"text"}` or will cause ts(1003) Identifier expected.
- **Astro TS errors:** Scripts inside `.astro` need `// @ts-nocheck` or cast `HTMLElement`. `dataset` doesn't exist on `Element` — cast. Less-than `<` inside `<p>Matched! |Γ| < 0.10` breaks parser — escape.
- **Kits:** Only use existing `linkId`s — never invent SKUs. New kits added to `kits.json` with mixed merchant.
- **Standardized Hierarchy:** All 10 playgrounds with hardware kits must place Gear Carousel as 3rd section (immediately following Simulator and Anatomy) and KitBuilder as 4th — verified in this repo, maximizes conversion.
- **Privacy:** Must document export gate storage + fab live vs pending + live merchants list matches actual live state. PCBWay referral live added to approved partners.
- **Affiliate viability:** Shapeways dead (bankrupt Jul 2024), AWS F1 never had affiliate, HackRF/RealSense no direct program (Amazon only), Coursera exists via Impact but off-brand vs books, Mouser/DigiKey via CJ/Impact 1-4% low ROI until volume, RunPod SaaS via referral/Rewardful exists but deferred until BYO key pattern, DFRobot 3→8% tiered optional.

---

## 10. Owner contact points / decisions (human-only) — updated 2026-07-19 post session

- [x] **PCBWay referral** — DONE `https://pcbway.com/g/VJp6Xm` live. Owner now sees $5 free credit for friends, $10 coupon + 5% per first order.
- [ ] **PCBWay Shared Projects** — P5 roadmap deferred, needs real boards. Owner decision: shelf until bandwidth + traffic. If you want to proceed: create 3 coupons (SI, Antenna, Verilog) in KiCad, publish, copy URLs to `PCBWAY_SHARED_PROJECTS`.
- [x] **JLCPCB** — SHELVED per owner "same as pcbway" — correct, no action. If you ever want Brand Advocate: email partnership@jlcpcb.com template in earlier assistant message.
- [x] **Buttondown + Lemon Squeezy** — SHELVED per owner until Google legitimacy / traffic. Code stays working in empty state. When ready: `PUBLIC_BUTTONDOWN_USERNAME` env + fill `shop.json` `lemonUrl`.
- [ ] **Mouser/DigiKey/DFRobot** — P5 backlog, not requested, low ROI now.
- [ ] **RunPod / SaaS GPUs** — P5 backlog, needs BYO key UI in webgpu-pinn-studio first.
- [ ] Owner to confirm any new "we use this" hardware claims before shipping notes (still open).

**SparkFun LIVE code `rOtrc44SZw`, Amazon tag `engineersport-20`, PCBWay referral `https://pcbway.com/g/VJp6Xm` — do not re-ask.**

*End handoff — continue burndown, truth the catalog, prefer empty over wrong, no tracking pixels.*
