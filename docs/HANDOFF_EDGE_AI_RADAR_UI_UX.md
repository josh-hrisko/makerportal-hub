# HANDOFF DOCUMENT: Edge AI Radar UI/UX Architecture & Handoff Prompt

> **Superseded for full-project continuity** by [`HANDOFF-2026-07-22-IA-RADAR.md`](./HANDOFF-2026-07-22-IA-RADAR.md)
> (includes D-024 Library placement, 10-board table, shortBoardLabel, nav rules).
> Keep this file for radar-specific visual history; prefer the 2026-07-22 handoff for new chats.

**Timestamp**: `2026-07-22T20:34:00Z`  
**Repository**: `makerportal-hub`  
**Target Pages**:
- [`/resources/edge-ai-radar`](https://makerportal.ai/resources/edge-ai-radar) (`src/pages/resources/edge-ai-radar.astro`)
- [`/resources`](https://makerportal.ai/resources) (`src/pages/resources.astro`)

---

## 1. Executive Summary & Context

The **Edge AI Radar** is a daily, deterministic data pipeline and visualization engine that scans Hugging Face for fresh GGUF and ONNX releases and evaluates their verified runtime memory footprints (`fileBytes × 1.25`) against real hardware datasheet ceilings:
1. **ESP32-S3 (512 KB SRAM + 8 MB PSRAM)** → `7.0 MiB` datasheet ceiling
2. **Teensy 4.1 (1 MB SRAM + 8 MB PSRAM)** → `8.0 MiB` datasheet ceiling
3. **Coral Edge TPU (8 MB Model Cache)** → `8.0 MiB` model cache ceiling
4. **Raspberry Pi 5 (8 GB LPDDR4X)** → `6.5 GiB` datasheet ceiling
5. **Jetson Orin Nano (8 GB Unified LPDDR5)** → `6.5 GiB` datasheet ceiling

---

## 2. Status of Key Components

### A. `RadarSpider.astro` (Polar/Spider Chart)
- **Status**: Live & Interactive (`5f3cfff`, `2ddbe7e`).
- **Features**:
  - Dual-layer polygon geometry: Emerald Green (Clean fits ≤80%) and Amber Dashed (Tight fits 80-100%).
  - Shifted SVG ViewBox origin to `viewBox="-80 -20 600 320"` to guarantee long labels (`Jetson Orin Nano`, `Raspberry Pi 5`) have 60px padding and **never clip on any viewport**.
  - Interactive board selector pills + SVG vertex click targets.

### B. `CeilingStrip.astro` (Hardware RAM Containment & Context Pressure Simulator)
- **Status**: Updated with Event Delegation & Domain-Grounded Boundaries (`3061ca6`).
- **Domain Logic Rule**:
  - For models > 32 MB evaluated against microcontrollers (ESP32-S3, Teensy 4.1) or accelerators (Coral Edge TPU), the component reports **"Architectural Class Boundary Exceeded (Requires sub-16 MiB TinyML model)"** rather than printing nonsensical `85,964%` overflow numbers.
- **Client Script Reactivity**:
  - Implements **Event Delegation** on the root container (`root.addEventListener('click', ...)` and `root.addEventListener('input', ...)`).
  - Handles model pill selection and real-time context length slider movements (`512` to `8,192` tokens).

---

## 3. Affiliate Merchant Registry Update: DFRobot Code `vwfcds`

- **Merchant**: DFRobot (`https://www.dfrobot.com`)
- **Tracking Code**: `vwfcds` (parameter `?tracking_id=vwfcds`)
- **Location in Codebase**: [`src/data/affiliate-links.ts`](file:///Users/josh/Documents/GitHub/makerportal-hub/src/data/affiliate-links.ts)
  - `export const DFROBOT_AFFILIATE_CODE = 'vwfcds';`
  - `export function buildDfRobotUrl(path: string): string`
  - Integrated into `resolveAffiliateLink(link)` for `merchant === 'dfrobot'`.

### Task for Future Agent / LLM:
Add DFRobot hardware links (e.g. LattePanda Delta/Sigma SBCs, DFRobot ESP32-S3 N8R8 boards, UNIHIKER AI boards) into `src/data/affiliate-links.json` using `merchant: "dfrobot"` and `externalUrl: "product-slug.html"`. The resolver will automatically append `?tracking_id=vwfcds`.

---

## 4. Recommended Handoff Prompt for Next LLM / Agent

Copy and paste the prompt below to initiate the next session with full context:

```markdown
You are taking over UI/UX refinement on makerportal-hub for the Edge AI Radar feature (/resources/edge-ai-radar and /resources).

### Codebase & Architectural Context:
- Repository: /Users/josh/Documents/GitHub/makerportal-hub
- Core Pages:
  - src/pages/resources/edge-ai-radar.astro
  - src/pages/resources.astro
- Core Components:
  - src/components/edge-radar/RadarSpider.astro (Polar / Spider Fit Radar)
  - src/components/edge-radar/CeilingStrip.astro (RAM Containment & Context Pressure Simulator)
  - src/components/edge-radar/QuantSpectrum.astro (BPW Quantization Spectrum)
  - src/components/edge-radar/BoardFitDistribution.astro (Fit distribution per board class)
- Affiliate Registry & DFRobot Tracking:
  - DFRobot tracking code is live in src/data/affiliate-links.ts: DFROBOT_AFFILIATE_CODE = 'vwfcds' (?tracking_id=vwfcds).
  - Implement DFRobot products (LattePanda, ESP32-S3, UNIHIKER) in src/data/affiliate-links.json when adding hardware links.
- Pipeline & Ground Truth:
  - scripts/edgespec/radar-core.mjs (fit matrix math & gate tests)
  - node --test scripts/edgespec/pipeline.test.mjs (18 tests, must pass 100%)
  - npm run check (0 errors / 0 warnings / 0 hints required)

### Key Rules & Requirements:
1. Domain Integrity: Hardware ceilings are hard datasheet limits (ESP32-S3 = 7 MiB, Teensy 4.1 = 8 MiB, Coral Edge TPU = 8 MiB, Pi 5 = 6.5 GiB, Jetson Orin Nano = 6.5 GiB). Never fabricate numbers or show raw 98,000% overflow text for 7B LLMs on microcontrollers — state architectural class mismatch clearly.
2. Zero JS Breakage: Interactive components must use Event Delegation on root containers so click and input handlers survive Astro View Transitions without breaking.
3. Quality Gate: Always run `node --test scripts/edgespec/pipeline.test.mjs`, `npm run check`, and `npm run build` after editing.
```

---

## 5. Verification Baseline

All gate tests pass cleanly on the current commit:
- `node --test scripts/edgespec/pipeline.test.mjs` → **18/18 PASS**
- `npm run check` → **0 errors / 0 warnings / 0 hints**
- `npm run build` → **88 pages built**
