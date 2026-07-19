# Handoff: Frontier Simulator Monetization — Continue Execution

**Date:** 2026-07-19  
**Repo:** `/Users/josh/Documents/GitHub/makerportal-hub`  
**Branch:** `main` (verify with `git status`)  
**Canonical strategy doc:** this brain folder’s `monetization_roadmap.md` + repo `docs/MONETIZATION.md`  
**Owner tag Amazon:** `engineersport-20`  
**Owner SparkFun code (LIVE):** `rOtrc44SZw`

You are picking up mid-execution of a **simulator-first monetization program** for 10 playground engineering sims. Prior agents already (1) rebuilt strategy after market research, (2) fixed a catastrophic ASIN integrity failure, (3) shipped multi-merchant data model + SparkFun + kit builders on 6/10 sims. **Do not restart strategy from scratch.** Execute the remaining stack: PCBWay/JLCPCB, GearGrid rollup, soft export gates, conversion UX, docs hygiene.

---

## 1. Who you are / posture

You are a **frontier affiliate + growth lead who also ships production Astro code**. Optimize for:

1. **Trust first** — never ship a product card whose live title ≠ curated label  
2. **Yield per engineering session** — prefer higher-rate merchants and kits over more Amazon SKUs  
3. **Brand fit** — privacy-first studio; `rel="sponsored"`; no dark patterns; no fabricated usage claims  
4. **Repo constraints** — D-011/D-014/D-015 in `docs/DECISIONS.md`: no runtime Amazon API in browser; human-curated products only; no auto-discovered gear; Lemon Squeezy for digital goods (not yet the focus)

**Hard rules from this program:**
- Prefer **empty gear** over wrong ASINs  
- Amazon electronics margins are **structurally weak** in 2026 — do not “fix” monetization by adding more Amazon FPV/scope junk  
- SparkFun pays **10% only on Originals**; third-party (Pi, Jetson, Teensy) may pay $0 — still OK to link for UX, but label honestly  
- Adafruit has **no public affiliate** — do not invent one  
- No hard auth/Clerk paywalls yet; soft email gates only  
- No audio-on-affiliate-click gimmicks  
- Never invent commissions, prices, or “we use this daily” claims without owner confirmation  

Verify after meaningful changes: `npm run check` (includes ASIN audit + sim gear smoke).

---

## 2. What the *previous* (pre-refine) roadmap got wrong

The first agent’s `monetization_roadmap.md` was Amazon-centric and conversion-naive. Corrections already baked into the refined roadmap:

| Wrong assumption | Why it fails | Correct approach |
| :--- | :--- | :--- |
| Amazon-first for all gear | Electronics ~1–2.5%, 24h cookie | Multi-merchant: Amazon = books + Prime convenience; SparkFun/PCB houses = hardware yield |
| Tier only by “ease” | Ignores EPC × intent | Re-tier by expected dollars per engaged session |
| Footer grid only | Cold, post-math placement | Kits + aha-moment CTAs + sticky BOM |
| “Verified purchase” gates | Trust-destroying friction | Soft email unlock on **clean export** only |
| Hard auth in Phase 3 | Premature at low traffic | Buttondown/list first |
| Flat SKU cards | Engineers buy BOMs | Interactive `KitBuilder` |
| Equal effort on 10 sims | Dilutes | T0 first, then expand |
| Audio click feedback | Zero revenue | Dropped |

**Integrity incident (fixed):** 25 ASINs were shared across unrelated SKUs (e.g. “Siglent VNA” → travel duffel; “Prusa MK4S” → Chladni plate). Phase 0 repaired this. **Never reintroduce ASIN collisions.** CI enforces 1 ASIN → 1 link id + label/title coverage.

---

## 3. Market state research notes (July 2026) — keep using these

### Commission / partner economics

| Channel | Rate / structure | Notes | Status on this site |
| :--- | :--- | :--- | :--- |
| **Amazon Associates** | Books **4.5%**; tools/industrial ~3%; PC 2.5%; electronics often **1–2.5%**; All Other 4% | 24h attribution; Creators API for catalog | **LIVE** tag `engineersport-20` |
| **SparkFun Affiliate** | **10% SparkFun Originals only** | Launched ~2026-07-09; PayPal; $10 min; third-party excluded from % | **LIVE** code `rOtrc44SZw` (`?ref=`) |
| **PCBWay** | ~5% referral; **10% PCB + 10% SMT** on Shared Projects | Long-lived project links; fab CTA gold | **NOT LIVE** — need owner IDs |
| **JLCPCB** | Referral coupons + Brand Advocate / free PCB / sponsorship | Treat as sponsorship + CTA more than pure CPA | **NOT LIVE** — need owner apply |
| **DFRobot** | 3% → 6% → 8% tiered | Motors/robotics backup | Optional later |
| **Adafruit** | No consumer affiliate | Skip payout claims | N/A |
| **DigiKey / Mouser / Newark** | Low single-digit via Impact/CJ; high AOV | GaN/SI passives later | Not started |
| **SaaS/GPU cloud** | 10–40% recurring | PINN Studio only | Not started |

**Math that drove the stack:** ~$73 avg Amazon AOV × ~2% ≈ **$1.50/sale**. SparkFun Original $60 × 10% = **$6**. PCBWay $120 board × 10% = **$12**. One fab conversion beats many Amazon electronics clicks.

### Conversion research applied here
- Interactive/guided product UX converts **~3–5×** static grids  
- Best moment = **post-success / post-export / post-tune**, not page entry  
- Bundles raise AOV more than hunting max % on single SKUs  
- Soft lead magnets beat hard paywalls at low traffic  

### SparkFun specifics (implemented)
- URL builder: `buildSparkFunUrl(path)` in `src/data/affiliate-links.ts`  
- Amasty Affiliate param: `?ref=rOtrc44SZw`  
- **No 3D printers** in SparkFun catalog (checked 2026-07) — FEA uses XRP + Inventor’s Kit + Amazon PLA, not fake Prusa ASINs  
- 14 SparkFun products live; prefer `sparkfunOriginal: true` for yield  

### PCBWay / JLCPCB research (to implement next)
- **PCBWay:** Shared Projects pay **10% of PCB + 10% of SMT** when others order that design; separate referral (~5% / coupons). Ideal flow: sim exports Gerbers/stackup → “Order this board on PCBWay” with shared-project or referral link.  
- **JLCPCB:** Referral program is coupon-heavy; **Brand Advocate / free PCB sponsorship / co-brand** is the high-leverage path for a content site. Do **not** invent a % commission. CTA copy: “Order PCB” / “Sponsor boards” only after owner has real terms.  
- Placement: SI Lab, Antenna EM, Verilog Sculptor, optionally FEA fixtures — **export-adjacent**, not random banners.

---

## 4. Monetization stack (designed / partially shipped)

### Channel A — Multi-merchant affiliate
1. Amazon — books, cal kits, commodity tools (truthed ASINs)  
2. SparkFun — Originals-first sensors/MCUs/kits (**done**)  
3. PCBWay / JLCPCB — fab CTAs (**next**)  
4. DigiKey/etc. — later when BOMs deepen  

### Channel B — Interactive kits (`KitBuilder`)
Data: `src/data/kits.json` + `src/data/kits.ts`  
UI: `src/components/KitBuilder.astro`  
Live kits: PID, SI, RF, RTOS, FEA, SLAM  

### Channel C — Soft PRO / list gates
| Free | Email unlock | Later |
| :--- | :--- | :--- |
| Full sim + watermarked export | Clean PNG/CSV/JSON + BOM email | Cloud save / paid archives |

**Not yet built:** `ExportGate.astro`  

### Channel D — Micro-sponsorships
`/advertise` exists; add `SimSponsorChip` later (one rail chip/page).  

### Channel E — Lemon digital goods
Per `docs/MONETIZATION.md` — shop archives; sims as top-of-funnel. Secondary to affiliate/kits right now.

---

## 5. Current implementation state (as of handoff)

### Done
| Item | Evidence |
| :--- | :--- |
| ASIN integrity repair | 163 unique Amazon ASINs; collisions removed/merged |
| Audit + smoke in CI | `npm run check` → `astro check` + `audit-asins.mjs --sims-only` + `smoke-sim-gear.mjs` |
| Multi-merchant model | `merchant`, `externalUrl`, `sku`, `sparkfunOriginal`, static `image`/`price` |
| SparkFun live | 14 products; code `rOtrc44SZw` |
| KitBuilder + GearGrid | On **6/10** sims (see matrix) |
| Privacy + disclosure | `/privacy#affiliates`, `AffiliateDisclosure.astro` multi-merchant |
| Docs | `docs/MONETIZATION.md`, `STATUS.md`, `AFFILIATE-CANDIDATES.md` SparkFun section |
| Catalog rebuild | `npm run amazon:catalog` (needs `.env` `AMAZON_CLIENT_ID/SECRET`) |

### Sim matrix (10 target sims)

| Simulator | GearGrid | Kit | Primary $ path now | Next |
| :--- | :---: | :---: | :--- | :--- |
| pid-flight-arena | ✅ | ✅ pid-hover-stack | Amazon FC + SF IMU/ESP32 | Success-toast CTA |
| signal-integrity-lab | ✅ | ✅ si-vna-starter | Amazon VNA/books | **PCBWay/JLCPCB export CTA** |
| rf-microwave-bench | ✅ | ✅ rf-bench-starter | Amazon NanoVNA/TinySA/books | Optional SF if RF Originals fit |
| fea-structural-lab | ✅ | ✅ fea-mech-lab | SF XRP/SIK + PLA | No fake printers |
| rtos-scheduler | ✅ | ✅ rtos-lab-stack | SF Teensy/RedBoard + LA | Export FreeRTOSConfig gate |
| slam-odometry-arena | ✅ | ✅ slam-edge-stack | SF Jetson/ZED-F9P/IMU | Trajectory CSV gate |
| gan-foc-drive | ❌ | ❌ | Amazon Fluke/FNIRSI + SF OpenLog | GearGrid + kit |
| antenna-em-sandbox | ❌ | ❌ | Amazon RTL-SDR/NanoVNA + SF ZED-F9P | GearGrid + PCB antenna shared project |
| verilog-live-sculptor | ❌ | ❌ | Amazon Arty + SF MicroMod | GearGrid + **PCBWay FPGA carrier** CTA |
| webgpu-pinn-studio | ❌ | ❌ | SF Jetson + Amazon ML books | GearGrid; no fake RTX 4090 |

**Counts:** 177 affiliate links (163 Amazon + 14 SparkFun). Smoke: 70 sim cards (29 SparkFun).

### Key files

```
src/data/affiliate-links.json     # SSOT products
src/data/affiliate-links.ts       # resolveAffiliateLink, buildAmazonUrl, buildSparkFunUrl
src/data/amazon-catalog.json      # Amazon live cache (committed)
src/data/kits.json / kits.ts      # BOM kits
src/components/GearGrid.astro
src/components/KitBuilder.astro
src/components/AffiliateDisclosure.astro
scripts/amazon/audit-asins.mjs
scripts/amazon/smoke-sim-gear.mjs
scripts/amazon/build-catalog.mjs
scripts/amazon/fix-sim-asins.mjs  # one-shot repair history; don’t re-run blindly
docs/MONETIZATION.md
docs/AFFILIATE-CANDIDATES.md
docs/DECISIONS.md                 # D-011, D-014, D-015
src/pages/privacy.astro           # #affiliates
src/pages/playground/*.astro      # 10 sims
```

### npm scripts
```bash
npm run check              # typecheck + affiliate audit + smoke
npm run amazon:audit
npm run amazon:audit:strict
npm run amazon:smoke
npm run amazon:catalog     # needs .env Creators API creds
```

---

## 6. Your mission — ordered execution

### Priority 1 — GearGrid rollup (code-only, unblocked)
Roll `GearGrid` (+ kit if BOM is ready) to remaining 4 sims:
- `gan-foc-drive.astro`
- `antenna-em-sandbox.astro`
- `verilog-live-sculptor.astro`
- `webgpu-pinn-studio.astro`

Pattern (already on 6 sims):

```astro
import GearGrid from '../../components/GearGrid.astro';
import KitBuilder from '../../components/KitBuilder.astro';
import { kitForSimulator } from '../../data/kits';
const gear = affiliateLinks.filter(l => l.relatedTo?.includes('SIM_ID')).map(resolveAffiliateLink);
const kit = kitForSimulator('SIM_ID');
// replace inline gear section with:
<GearGrid gear={gear}>
  {kit && <KitBuilder slot="before-grid" kit={kit} />}
</GearGrid>
```

Add kits in `kits.json` only with **existing** link ids (no invented SKUs).

### Priority 2 — PCBWay + JLCPCB (owner-gated, then code)
**Owner must supply** (ask if missing):
- PCBWay referral URL and/or Shared Project URLs  
- JLCPCB referral / Brand Advocate terms + any CTA assets  

Then implement:
1. Extend merchants already in type union: `pcbway` | `jlcpcb`  
2. Optional helpers: `buildPcbWayUrl` / `buildJlcUrl` (mirror SparkFun)  
3. Link rows: `merchant`, `externalUrl`, no ASIN  
4. **Fab CTA component** e.g. `FabOrderPanel.astro` on SI / Antenna / Verilog:  
   - “Export stackup / Gerbers → order on PCBWay/JLCPCB”  
   - Only show when real referral URLs exist  
5. Update `/privacy#affiliates`, `AffiliateDisclosure`, `docs/MONETIZATION.md`, `AFFILIATE-CANDIDATES.md`  
6. Audit/smoke: non-Amazon path must require `externalUrl` (already)

**Do not** hardcode fake PCBWay invite IDs.

### Priority 3 — Soft export gate
Build `src/components/ExportGate.astro`:
- Free path: export with small `makerportal.ai` footer watermark  
- Gated path: clean file after email (Buttondown embed or existing email path — check `ButtondownSignup.astro` / `docs/MONETIZATION.md`)  
- `localStorage` unlock key per sim  
- Wire on ≥3 sims (RTOS config, SI CSV, SLAM trajectory, PID gains JSON)

### Priority 4 — Conversion UX polish
- PID: toast/CTA after stable hover / arm success → scroll to kit  
- Cap gear grids at ~6 cards (decision paralysis)  
- Merchant badge already partially in GearGrid — ensure SparkFun/PCB labels clear  
- Optional: first-party analytics events `kit_cta_click`, `gear_click`, `export_gate_unlock` (privacy-safe, no third-party ad pixels)

### Priority 5 — Hygiene
- Keep `npm run check` green  
- After Amazon ASIN edits: `npm run amazon:catalog` then audit  
- Never commit secrets; SparkFun/Amazon tags are public referral ids (OK in repo)  
- Update refined roadmap checkboxes in brain `monetization_roadmap.md` as you complete items  

---

## 7. Explicit non-goals (still)

- Hard PRO account / Clerk before list + traffic  
- Runtime browser calls to Amazon PA-API/Creators API  
- Auto product discovery / LLM gear invention  
- Claiming Adafruit affiliate  
- Re-adding high-ticket Amazon gear without verified unique ASINs  
- Scaled trend→affiliate blog spam (`MONETIZATION.md` P3 deferral still stands)  
- Re-running `fix-sim-asins.mjs` without reading it (destructive one-shot)

---

## 8. Acceptance criteria for *this* handoff session

| Gate | Pass |
| :--- | :--- |
| G1 GearGrid complete | All 10 sims use `GearGrid` (kits on ≥6, ideally ≥8) |
| G2 Fab path ready | PCBWay and/or JLCPCB either live with real URLs **or** blocked with clear owner ask + stub component not linked |
| G3 Export gate | `ExportGate` on ≥3 sims, double-opt-in or documented email path |
| G4 Integrity | `npm run check` 0 errors; audit 0 ASIN collisions; no duffel-bag-class mismatches |
| G5 Docs | Privacy + MONETIZATION list every **live** merchant only |

---

## 9. Suggested first commands

```bash
cd /Users/josh/Documents/GitHub/makerportal-hub
git status && git log --oneline -8
npm run check
# read:
#   docs/MONETIZATION.md
#   docs/DECISIONS.md (D-011, D-014, D-015)
#   src/data/affiliate-links.ts
#   src/data/kits.json
#   monetization_roadmap.md (this brain folder)
```

Then implement Priority 1 (GearGrid ×4) immediately — no owner blocker. Parallel: ask owner for PCBWay/JLCPCB IDs if not in env/docs.

---

## 10. One-paragraph north star

**Truth the catalog, stack higher-rate hardware partners (SparkFun done → PCB houses next), convert with interactive kits at aha moments, grow email via export gates, never lie about a product.** Dollars per serious engineering session beat pageviews × junk Amazon electronics.

---

## 11. Owner contact points (human-only)

- PCBWay account / Shared Project / referral link  
- JLCPCB Brand Advocate approval + any coupon codes to promote  
- Buttondown (or chosen ESP) for export gate  
- Confirm any new “we use this” hardware claims before shipping notes  

**SparkFun is already approved and live — do not re-ask for that code.**

---

*End of handoff. Continue execution; do not re-litigate the Amazon-only strategy.*
