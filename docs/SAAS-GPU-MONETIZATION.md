# SaaS / GPU Cloud Monetization — stable-affiliate-only strategy

Companion to `MONETIZATION.md` (evergreen stack). This doc tracks the
SaaS/GPU-cloud expansion. **Owner decision 2026-07-19: stable, established
affiliate programs only (PartnerStack and similar). No credit-grant / free-token
DevRel programs.** ElevenLabs (PartnerStack) and Pinecone Affiliate Partner are
the only approved SaaS paths. Modal and Fly labs remain live as educational
instruments, not monetized. Same hard constraints as everywhere: no fabricated
numbers, no fake affiliate IDs, no tracking pixels, telemetry via first-party
`mp:analytics` only.

## The engines — owner-filtered

1. **Live cash engine — ElevenLabs** (PartnerStack, 22% recurring 12 mo on
   Starter/Creator/Pro/Scale). Note: 22% is *our commission*, not a user
   discount — UI copy must never say "22% off".
2. **Pending cash engine — Pinecone** publishes an affiliate application for
   technical builders and educators, but no public commission rate. The link
   stays informational until MakerPortal is accepted and receives its own URL.
3. **Rejected credit engine — Modal + Fly.io** — owner explicitly rejected
   2026-07-19. No public affiliate program exists; DevRel credit-grant / free-token
   pitches are out of scope. Labs stay educational only, with informational links
   (`rel="noopener noreferrer"`). Do not pursue, tailor, or send credit pitches.
   Keep code/comments in `affiliate-links.ts` and docs synchronized with this
   decision so future agents do not re-open the path.

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
  constants in `affiliate-links.ts`. ElevenLabs now contains the owner's
  approved destination; Modal and Fly remain empty/informational because no
  public affiliate program was verified. `buildSaasPartnerUrl()` flips only a
  provider with a real URL from `rel="noopener noreferrer"` to
  `rel="sponsored noopener noreferrer"`.
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
- [x] Production Pagefind index returns all three original simulator routes; the
  later vector-retrieval route is also indexed and was checked separately.
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

### Verification boundaries, not hidden failures

- The offline ElevenLabs formant/DSP/recorder path was exercised. A real
  ElevenLabs synthesis request was not made because no owner or shared API key
  belongs in the test environment; the visitor BYO path remains direct to the
  provider.
- WebGPU passed in Chromium on available hardware. The no-WebGPU state was
  forced and browser-tested, but a physical Safari/iPhone run was not claimed.
- The Modal snippet was checked against current official docs and the BYO
  endpoint UI was tested without a live endpoint. No Modal function was
  deployed because that would require an owner account and could create spend.
- Fly's map is an educational client-side model. No Fly app was deployed and no
  displayed latency value is represented as a Fly measurement.

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
- [x] **Modal DevRel credit pitch — REJECTED per owner 2026-07-19** — owner wants
  established stable affiliate programs only; free-token / credit-grant DevRel
  pitches are out of scope. Drafts remain archived in `DEVREL-PITCHES-SAAS-GPU.md`
  for reference only, marked deprecated. Do not tailor or send.
- [x] **Fly.io technical review / credit inquiry — REJECTED per owner 2026-07-19**
  — same rationale as Modal. Educational lab stays live, informational links only.

### Exact owner inputs still needed

- ElevenLabs: no further input needed; approved PartnerStack destination is live.
- Pinecone: the approved affiliate destination URL after acceptance (not a
  project API key). No URL or public rate is currently available.
- Modal / Fly.io: no inputs needed — credit-engine path rejected 2026-07-19.
  Labs remain educational (WebGPU matmul, Fly region map), no affiliate or credit
  pursuit. If a verified public affiliate program (not credits) appears later,
  re-evaluate under stable-affiliate rule.
- Buttondown: the public username only, after the owner wants newsletter
  collection enabled.
- No shared ElevenLabs, Pinecone, Amazon, or other API key is needed for these
  static pages. Visitor BYO keys/tokens remain in their own localStorage and are
  sent only to the provider endpoint they explicitly invoke.
- PCBWay Shared Projects remain tabled until the owner has an active design with
  real KiCad/Gerber assets; do not create placeholder project URLs.

### Owner decisions recorded 2026-07-19

- ElevenLabs PartnerStack destination supplied and activated.
- Pinecone Affiliate Partner application submitted; waiting on approval.
- Buttondown setup deferred.
- PCBWay Shared Projects tabled until a real design exists.
- Modal/Fly credit-engine outreach explicitly rejected by owner 2026-07-19:
  only established stable affiliate programs (PartnerStack, Pinecone Affiliate)
  are in scope. No free-token / credit-grant DevRel programs. Future agents must
  not re-open this path without explicit reversal.

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

- [x] **Owner decision 2026-07-19: reject credit-grant / free-token programs.**
  Once a real Modal deployment for AuraLinter exists, keep it BYO-endpoint only.
  No shared demo endpoint with rate limiting, no credit pitch, no spend — owner
  wants stable affiliate programs only (PartnerStack, Pinecone Affiliate).
  Future agents: do not re-propose Modal/Fly credit grants.
- [x] Playwright pass over the three sims (canvas + toast + gate flows).

## Integrity guardrails carried through

- No shared API keys shipped client-side; BYO keys stay in localStorage.
- Benchmark charts start empty; every bar is user-measured or
  user-endpoint-reported. WER intentionally not charted (no ground truth).
- Fly latency numbers labeled "model, not measurement" at every readout.
- Demo voice labeled as a toy formant synth, never presented as ElevenLabs.
