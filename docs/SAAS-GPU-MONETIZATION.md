# SaaS / GPU Cloud Monetization — dual-engine strategy

Companion to `MONETIZATION.md` (evergreen stack). This doc tracks the
SaaS/GPU-cloud expansion: converting developer traffic into (a) direct
affiliate cash and (b) operational credit grants that offset AuraLinter's
infra costs. Same hard constraints as everywhere: no fabricated numbers, no
fake affiliate IDs, no tracking pixels, telemetry via first-party
`mp:analytics` only.

## The two engines

1. **Cash engine — ElevenLabs** (PartnerStack, 22% recurring 12 mo on
   Starter/Creator/Pro/Scale). Note: 22% is *our commission*, not a user
   discount — UI copy must never say "22% off".
2. **Pending cash engine — Pinecone** publishes an affiliate application for
   technical builders and educators, but no public commission rate. The link
   stays informational until MakerPortal is accepted and receives its own URL.
3. **Credit engine — Modal + Fly.io** (no public affiliate programs; links
   stay informational). Monetized by pitching DevRel teams for compute /
   hosting credit grants using the playgrounds as evidence of integration
   quality. Any request must be derived from a reviewed workload and hard cap.

## Shipped (2026-07-19)

- [x] `/playground/elevenlabs-dsp-sandbox` — TTS → Web Audio DSP rack
  (bandpass / echo / RT60 convolution reverb / pitch), waveform +
  spectrogram, demo formant voice + mic + BYO ElevenLabs key, aha toast on
  3 s clean DSP playback, ExportGate preset JSON + watermark-tone-gated WAV.
- [x] `/playground/modal-gpu-benchmarker` — WebGPU matmul at Whisper-tiny
  encoder dims (CPU-verified), BYO Modal endpoint benchmark (deployable
  script on-page), cold/warm ping, offload crossover F* in export. Chart
  renders **measured values only**.
- [x] `/playground/fly-edge-db-lab` — d3-geo world map, 19 real Fly
  regions, LiteFS read-local / write-forward animation, disclosed
  physics latency model, litefs.yml + fly-replay middleware code.
- [x] `/playground/vector-retrieval-recall-lab` — deterministic local Float32
  corpus, exact cosine ground truth, disclosed IVF-style coarse search, measured
  probe sweep, recall@k/candidate/latency table, local JSON export, and a
  server-only Pinecone TypeScript pattern. Explicitly not a Pinecone benchmark.
- [x] `ELEVENLABS_PARTNER_URL` / `MODAL_REFERRAL_URL` / `FLY_REFERRAL_URL`
  constants in `affiliate-links.ts` — ship **empty**; `buildSaasPartnerUrl()`
  flips links from `rel="noopener noreferrer"` (informational) to
  `rel="sponsored noopener noreferrer"` automatically when a real URL lands.
- [x] `PINECONE_PARTNER_URL` follows the same empty-until-approved rule. The
  official public program page does not disclose a rate, so UI/docs state none.
- [x] Kits: `voice-synth-workstation`, `modal-edge-bench-stack`,
  `fly-edge-lab-stack`, `vector-retrieval-edge-stack` (14 kits total). Gear
  tags ×6 per sim from existing
  audited ASINs. Sims added to `smoke-sim-gear.mjs`.
- [x] Strict layout on all four monetization labs: Simulator → Anatomy → GearCarousel →
  KitBuilder → Math → Code → ExportGate → FAQ. Analytics: `aha_moment`,
  `aha_cta_click`, `export_download`, `export_gate_unlock`.

## Phase A browser audit (2026-07-19)

- [x] Real Chromium pass on all three pages: zero page/console errors, zero
  horizontal overflow at 390 px, ExportGate getters return parseable JSON, and
  all tested `mp:analytics` events land in the local rolling log.
- [x] Privacy network audit: removed the Vercel Analytics runtime after the
  browser exposed a request to `va.vercel-scripts.com`. Initial simulator loads
  now make zero external requests. Lazy merchant product artwork is marked
  `referrerpolicy="no-referrer"` and is disclosed in `/privacy`; it can still
  reveal IP/user-agent to the image host when a card approaches the viewport.
  ExportGate only contacts Buttondown after a separate unchecked newsletter
  opt-in; analytics payloads omit email/domain, keys, tokens, text, and endpoint
  URLs.
- [x] ElevenLabs lab: built-in formant output recorded at nonzero post-DSP RMS;
  post-DSP ScriptProcessor capture produced a valid stereo RIFF/WAVE with a
  350 ms 1 kHz watermark tail; spectrogram had live color data in light and
  dark themes; aha logged once; mic selection disables/reset pitch immediately.
- [x] GPU lab: WebGPU matmul passed its CPU cross-check on hardware. The
  no-WebGPU fallback leaves the Modal controls usable, the chart stacks into a
  legible 305 × 340 px mobile canvas, and zero/negative cold-start deltas can no
  longer poison the log scale. Corrected Whisper-tiny encoder arithmetic from
  21 GFLOP to ≈35.1 GFLOP for the stated terms.
- [x] Modal deploy snippet checked against the current official
  [`modal.fastapi_endpoint`](https://modal.com/docs/sdk/py/latest/modal.fastapi_endpoint)
  and [Web Functions](https://modal.com/docs/guide/webhooks) documentation.
  Ping now POSTs to the same GPU function/container pool as the benchmark;
  benchmark wall time is no longer mislabeled as network RTT or double-counted
  in the crossover. A live deploy was intentionally not attempted because it
  requires the owner's Modal workspace/payment credentials.
- [x] Fly lab: Natural Earth land reports ready; arcs/read-write flows run;
  marker and map clicks are separated; off-sphere clicks are ignored; reset
  cancels in-flight burst timers; animation speed direction is correct; mobile
  map is 305 × 320 px; region selector provides a keyboard-accessible path.
- [x] Production Pagefind index returns all three canonical simulator routes.
  Production-like gzip/cache Lighthouse runs score **98 performance / 100
  accessibility / 100 best practices / 100 SEO** on all three. LCP is 1.95 s,
  TBT is 0 ms, CLS is 0–0.00014, transfer is 165–278 KiB, scripts are 12–20
  KiB, and fonts are 69 KiB. FCP displays at the 1.8 s budget boundary; the raw
  simulated value varies 1–2 ms over 1800 ms, so this is recorded as measurement
  resolution rather than silently claimed as an exact numeric pass. All other
  timing, size, and third-party-count thresholds in `lighthouse-budget.json`
  pass.
- [x] Shared accessibility hardening: gear cards now have one full-card target,
  excluded kit rows keep AA contrast, inline links have non-color affordances,
  code uses a high-contrast theme, and the ElevenLabs source select has a real
  label. Removed an unused Inter preload/font bundle; the retained Plus Jakarta
  subset is self-hosted.

## Owner actions (blocked on human)

- [x] **ElevenLabs PartnerStack URL live** — approved destination
  `https://try.elevenlabs.io/jzowx8mw6p6b` is stored in
  `ELEVENLABS_PARTNER_URL`; ElevenLabs CTAs use
  `rel="sponsored noopener noreferrer"`, and `/privacy` names the relationship.
- [ ] **Buttondown username — deferred by owner** — only needed when the owner is ready to collect
  explicit newsletter opt-ins. Set `PUBLIC_BUTTONDOWN_USERNAME`; clean export
  remains local and works without it. Do not provide a Buttondown API key.
- [ ] **Pinecone affiliate approval pending** — application submitted through
  the Affiliate Partner path at https://www.pinecone.io/partners/. On approval, paste only the issued
  destination URL into `PINECONE_PARTNER_URL` and add Pinecone to `/privacy` in
  the same PR. Do not infer or publish a commission rate from a third-party list.
- [ ] **Modal DevRel credit pitch** — owner sends the reviewed draft in
  `docs/DEVREL-PITCHES-SAAS-GPU.md` through the official community Slack or
  `support@modal.com` routing path. Fill in a capped pilot estimate first; do
  not invent a traffic number or paste visitor data.
- [ ] **Fly.io technical review / credit inquiry** — owner posts the reviewed
  draft to the official community forum or sends it to a real Fly team contact.
  Current official docs do not expose a public grant application, so the draft
  asks for the correct contact instead of claiming a program exists.

### Exact owner inputs still needed

- ElevenLabs: no further input needed; approved PartnerStack destination is live.
- Pinecone: the approved affiliate destination URL after acceptance (not a
  project API key). No URL or public rate is currently available.
- Modal: no referral ID is expected; later, owner workspace credentials are
  only needed for the owner-run AuraLinter deployment or credit-pitch follow-up.
- Fly.io: no referral ID is expected; later, owner account contact is only
  needed to send the grant pitch.
- Buttondown: the public username only, after the owner wants newsletter
  collection enabled.
- No shared ElevenLabs, Pinecone, Modal, Fly.io, Amazon, or other API key is needed for
  these static pages. Visitor BYO keys/tokens remain in their own localStorage
  and are sent only to the provider endpoint they explicitly invoke.
- To send the pitch drafts: owner name/role/reply address, Modal workspace and
  Fly organization handles (not credentials), and a reviewed workload estimate
  with a hard spending cap. Optional aggregate traffic evidence must include a
  source and date range.
- PCBWay Shared Projects remain tabled until the owner has an active design with
  real KiCad/Gerber assets; do not create placeholder project URLs.

## Phase B growth surfaces (2026-07-19)

- [x] Homepage now features the Modal, ElevenLabs, and Fly labs first and derives
  the live-lab count from the registry instead of the stale hard-coded “18”.
- [x] `/playground` leads with a dedicated four-card deployment-labs row, keeps
  the full catalog below it, and emits a 32-item `CollectionPage` / `ItemList`.
- [x] `PlaygroundShell` derives field-note CTAs from the registry and adds three
  editorially related instruments. Twelve relevant existing labs explicitly
  link into the SaaS/GPU funnels; same-pillar fallback covers the rest.
- [x] Published three query-focused field notes with visible FAQ sections and
  `FAQPage` schema:
  - `/blog/elevenlabs-web-audio-streaming-latency`
  - `/blog/webgpu-benchmark-browser`
  - `/blog/litefs-multi-region-sqlite`
- [x] Added owner-ready Modal and Fly outreach drafts with evidence/privacy gates
  in `docs/DEVREL-PITCHES-SAAS-GPU.md`.
- [x] Strengthened the AuraLinter loop: Modal's benchmark narrative links compute
  placement to the verification worker, and unsourced failure-rate, retrieval-score,
  temperature-tuning, and cost-ratio claims were removed from the agentic DSP lab.
- [x] Rejected a visible aggregate “social proof” count for now. The local
  `mp_analytics_log` cannot represent site-wide use; displaying one would require
  a first-party aggregate backend or fabrication.
- [x] Affiliate-program ROI research: Pinecone is the only candidate in the
  current Supabase / Neon / Cloudflare / vector DB / Sentry sweep with an
  official creator-educator affiliate application. Neon cash referrals are
  limited to accepted open-source projects; Supabase and Cloudflare publish
  broader partner programs; no official public Sentry creator rate was found.
- [x] Vector lab browser QA: default and maximum corpus sweeps complete without
  console errors or overflow; reset cancels in-flight work; light/dark canvas
  redraw works; initial load makes zero external requests; free and clean JSON
  exports both parse (the free watermark is now a JSON field); lifecycle
  navigation does not duplicate handlers. Mobile Lighthouse: 98 performance /
  100 accessibility / 100 best practices / 100 SEO, TBT 0 ms, CLS 0.
- [x] Gear smoke now covers 14 monetized simulators and 94 rendered gear cards.

## Follow-ups (agent-executable later)

- [ ] Once a real Modal deployment for AuraLinter exists, consider a shared
  demo endpoint with rate limiting (needs a backend secret — currently
  rejected by design; BYO-endpoint only).
- [x] Playwright pass over the three sims (canvas + toast + gate flows).

## Integrity guardrails carried through

- No shared API keys shipped client-side; BYO keys stay in localStorage.
- Benchmark charts start empty; every bar is user-measured or
  user-endpoint-reported. WER intentionally not charted (no ground truth).
- Fly latency numbers labeled "model, not measurement" at every readout.
- Demo voice labeled as a toy formant synth, never presented as ElevenLabs.
