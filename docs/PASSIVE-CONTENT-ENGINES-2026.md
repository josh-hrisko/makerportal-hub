# Passive Content & Revenue Engines — 2026 Architecture & Roadmap

This document outlines the architectural design, monetization mechanics, and execution sequence for building an autonomous, daily passive content engine for `makerportal-hub`.

---

## 1. Core Posture & Anti-Abuse Rules

1. **Deterministic Grounding Over Synthetic Spam:** Scraped trends reworded as generic LLM blog posts trigger Google's Scaled Content Abuse manual actions (March 2024 core update onward). Every daily generated item on MakerPortal Hub **must be anchored in deterministic math, real solver outputs, hardware datasheets, or verified API pricing models**.
2. **Privacy-First Boundary:** No 3rd-party tracking pixels, hosted analytics SDKs, or telemetry endpoints. All interaction tracking uses the local 100-event per-browser `localStorage` ring buffer (`mp_analytics_log`).
3. **Approved Stable Affiliate Paths Only:** Monetization leverages verified, long-term programs only:
   - **Amazon Associates** (tag `engineersport-20`)
   - **SparkFun Affiliate** (code `rOtrc44SZw` — 10% on SparkFun Originals)
   - **PCBWay Referral** (live on PCB/hardware simulators)
   - **ElevenLabs PartnerStack** (`try.elevenlabs.io/jzowx8mw6p6b` — 22% eligible commission)
   - **Pinecone Affiliate Partner** (pending approval)
4. **Simulator Visual Order Constraint:** Every monetized simulator strictly maintains:
   `Simulator → Anatomy → GearCarousel (third) → KitBuilder (fourth) → Math → Code → ExportGate → FAQ`
5. **Generated Pages Must Be Visual-First (owner directive 2026-07-22):** Auto-published surfaces (radar, TCO, benchmarks) must ship **rich, data-driven graphics** — SVG/canvas charts, proportional memory bars, radar/spider plots, quant-spectrum strips, crossover curves — rendered from the snapshot's verified numbers. A bare table + cards is the *floor*, not the target. Every graphic must be derived deterministically from the committed JSON (no decorative filler, no invented data points), must redraw correctly in light/dark themes, respect reduced-motion, and keep CLS = 0 (fixed aspect-ratio containers). The radar page launched 2026-07-22 with the floor (matrix + cards); elevating it to the visual standard is the next queued upgrade.

---

## 2. Dynamic Content & Monetization Engines

```
                   +-------------------------------------------------+
                   |           Daily Scheduled Trigger               |
                   |             (GitHub Actions)                    |
                   +-----------------------+-------------------------+
                                           |
                   +-----------------------v-------------------------+
                   |  Ingest Official APIs & Hardware Datasheets     |
                   |  (Hugging Face, arXiv, SparkFun API, Amazon)    |
                   +-----------------------+-------------------------+
                                           |
                   +-----------------------v-------------------------+
                   |  Deterministic Math & Solver Spec Calculation   |
                   | (FLOPs, SRAM, Quantization, Edge vs Cloud TCO)  |
                   +-----------------------+-------------------------+
                                           |
          +--------------------------------+--------------------------------+
          |                                                                 |
+---------v-----------------------+                       +-----------------v----------------------+
| Engine 1: EdgeSpec & TinyML     |                       | Engine 2: Edge vs Cloud TCO            |
| Daily Hardware Radar            |                       | Breakeven Calculator                   |
+---------+-----------------------+                       +-----------------+----------------------+
          |                                                                 |
          |  Recommends Dev Kits                                            |  Dual Affiliate Trigger
          |  (SparkFun 10% / Amazon)                                        |  (ElevenLabs/Pinecone + Hardware)
          v                                                                 v
+--------------------------------------------------------------------------------------------------+
|                              Auto-Publish to Astro Content Collections                            |
|                       (/resources/edge-radar & /journal/YYYY-MM-DD)                              |
+--------------------------------------------------------------------------------------------------+
```

### Engine 1: EdgeSpec & TinyML Hardware Radar (`edgespec-digest.yml`)
- **Trigger & Cadence:** Daily GitHub Action (`.github/workflows/edgespec-digest.yml`).
- **Data Ingestion:** Scrapes Hugging Face Hub (new quantized models: GGUF, ONNX, WebGPU LLMs/Vision models), arXiv tinyML papers, and micro-hardware releases from SparkFun/Adafruit API feeds.
- **Deterministic Computation:** Runs `scripts/edgespec/build-radar.mjs` to calculate required RAM, SRAM bounds, FLOPs per inference, power draw target, and memory footprint across microcontrollers (ESP32-S3, Teensy 4.1, Raspberry Pi 5, Coral TPU, Jetson Orin Nano).
- **Auto-Publish Target:** Emits daily JSON snapshots to `src/content/edge-radar/YYYY-MM-DD.json` rendered on `/resources/edge-ai-radar` and featured in `/journal/YYYY-MM-DD`.
- **Monetization Mechanics:** Automatically maps required compute specs to recommended development kits in `src/data/kits.json` & `src/data/amazon-catalog.json`. Links to **SparkFun Originals (10%)** and **Amazon Associates (`engineersport-20`)**.

---

### Engine 2: Cloud vs. Edge TCO Breakeven Calculator (`cloud-tco-digest.yml`)
- **Trigger & Cadence:** Daily GitHub Action (`.github/workflows/cloud-tco-digest.yml`).
- **Data Ingestion:** Monitors official public pricing schedules for cloud AI endpoints (ElevenLabs per-character pricing, Pinecone query unit pricing, AWS Bedrock rates) vs. local edge hardware acquisition costs.
- **Deterministic Computation:** Runs `scripts/tco/build-tco.mjs` to compute the **breakeven volume crossover point**: *At what daily request volume is buying local hardware 70%+ cheaper than paying cloud API fees?*
- **Auto-Publish Target:** Updates live dynamic comparison sliders on simulator pages (`elevenlabs-dsp-sandbox`, `vector-retrieval-recall-lab`).
- **Monetization Mechanics:** **Dual Affiliate Trigger** — converts high-scale enterprise visitors to SaaS affiliate links (**ElevenLabs PartnerStack** / **Pinecone Affiliate**), while converting DIY/cost-conscious developers to edge dev kits (**SparkFun** & **Amazon**).

---

### Engine 3: Daily Simulator Solver Benchmark & Challenge (`daily-sim-benchmark.yml`)
- **Trigger & Cadence:** Daily/Weekly GitHub Action (`.github/workflows/daily-sim-benchmark.yml`).
- **Deterministic Computation:** Runs headless solver scripts (`scripts/simulators/bench-sims.mjs`) across MakerPortal's 32 interactive simulators (e.g., PID loop tuning, SLAM particle filter convergence, WebGPU matrix multiplication benchmarks across GPU architectures).
- **Auto-Publish Target:** Generates daily engineering case studies with copyable solver presets.
- **Monetization Mechanics:** Drives soft **ExportGate** email unlocks for complete C++/Python preset files + highlights relevant `<KitBuilder>` hardware.

---

### Engine 4: Digital Product Auto-Bundler (`shop-bundler.mjs`)
- **Trigger & Cadence:** Manual CLI / Build-time script (`node scripts/shop/bundle-archives.mjs`).
- **Function:** Packages standalone, tested C++, TypeScript, and Python numerical solvers from the 32 simulators into downloadable zip packages (with provenance README and license).
- **Auto-Publish Target:** Populates `src/data/shop.json` and attaches Lemon Squeezy Buy overlay triggers ($9 PWYW floor, $19–$29 archives, $49 bundle).
- **Monetization Mechanics:** Direct digital product downloads via Lemon Squeezy MoR.

---

## 3. Phased Execution Sequence

```
+-----------------------------------------------------------------------------------+
| Phase 1: EdgeSpec Radar Prototyping                    [DONE 2026-07-22]         |
| - Create `scripts/edgespec/build-radar.mjs`                                      |
| - Define JSON schema for model quantizations vs hardware board specs             |
| - Connect SparkFun 10% & Amazon Associate link generation helpers                |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| Phase 2: GitHub Action & Pipeline Gate                 [DONE 2026-07-22]         |
| - Create `.github/workflows/edgespec-digest.yml`                                  |
| - Implement `scripts/edgespec/pipeline.test.mjs` (pre-publish gate test)         |
| - Auto-publish daily snapshot to `/resources/edge-ai-radar`                       |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| Phase 3: Cloud vs Edge TCO Breakeven Engine                                       |
| - Create `scripts/tco/build-tco.mjs` to fetch public pricing endpoints            |
| - Update `elevenlabs-dsp-sandbox` & `vector-retrieval-recall-lab` UI with TCO     |
| - Wire dual affiliate links (ElevenLabs PartnerStack + SparkFun/Amazon)           |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| Phase 4: Lemon Squeezy Code Archive Bundler                                       |
| - Create `scripts/shop/bundle-archives.mjs`                                      |
| - Sync zip outputs with `src/data/shop.json`                                      |
| - Enable Lemon Squeezy payment overlays                                           |
+-----------------------------------------------------------------------------------+
```

---

## 3b. Engine 1 Field Notes (build-out 2026-07-22 — read before extending)

Shipped: `scripts/edgespec/{radar-core,build-radar,pipeline.test}.mjs`,
`src/content/edge-radar/YYYY-MM-DD.json`, `/resources/edge-ai-radar`,
`.github/workflows/edgespec-digest.yml` (daily 13:30 UTC). 18 gate tests.

**Data-acquisition lessons (details + anti-patterns in DID-NOT-WORK.md → "Hugging Face Hub API"):**
- Candidate quality comes from *curated author feeds first*, then `likes7d` trending, then `lastModified` tail. Pure tag-fresh lists are spam-dominated.
- Byte sizes only from `/tree/main?recursive=true`. Nothing else is trustworthy.
- 32 verified rows → 12 slots after family dedupe is a *normal* ratio; don't "fix" the dedupe to inflate slot count.
- Runtime constants that worked: `LIST_LIMIT=40`, `CURATED_LIMIT=10`, `TREE_BUDGET=48`, `DETAIL_BUDGET=24`, `maxModels=12`, ~2 min wall time.

**Architecture choices to reuse for Engines 2/3:**
- Split pure logic (`*-core.mjs`, no I/O) from the orchestrator (fetch + write). Every published number becomes testable against fixtures without network — this is the gate-test pattern that replaces human PR review (D-022 posture).
- Integrity test that pays off: boards' `linkIds` are asserted against `src/data/affiliate-links.json` in the gate tests — the pipeline *cannot* route buyers to an uncurated product.
- Workflow mirrors `trends-digest.yml` exactly (porcelain check on the content dir, gitignored `*-summary.md` as step summary, rebase-retry push). Cron offset to `:30` — `:00` slots herd-drop.
- Page is zero-client-JS by design (SSR table + cards): CLS 0, no external requests at load, text-only kit rows. Add graphics per rule 5 without breaking these three properties.

**Open upgrades for the radar (visual-first mandate):**
- Proportional memory-footprint bars per model vs each board ceiling (log scale).
- Board-ceiling comparison strip (7 MiB → 6.5 GiB) with that day's models plotted on it.
- Quant bits-per-weight spectrum graphic; fits/tight/no distribution donut per board.
- A small canvas/SVG "radar" hero mark derived from the day's fit matrix.
- Trend line once ≥7 snapshots exist: daily count of edge-fittable models.

---

## 4. Verification & Integrity Checklist

For every automated pipeline commit:
- [ ] Pre-publish pipeline gate test (`node --test scripts/*/pipeline.test.mjs`) passes cleanly before git commit/push.
- [ ] No synthetic prose or un-grounded text generation is introduced.
- [ ] All outbound commercial links feature `rel="sponsored noopener noreferrer"` and matching `/privacy` disclosures.
- [ ] Zero 3rd-party tracking scripts or secrets are exposed in client payloads.
- [ ] `npm run check` finishes with 0 Astro errors and 0 warnings.
- [ ] `npm run build` succeeds cleanly.
