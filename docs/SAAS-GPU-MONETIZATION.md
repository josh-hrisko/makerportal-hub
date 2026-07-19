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
2. **Credit engine — Modal + Fly.io** (no public affiliate programs; links
   stay informational). Monetized by pitching DevRel teams for compute /
   hosting credit grants using the playgrounds as evidence of reach +
   integration quality. Target: $1k–$10k Modal compute for AuraLinter's
   verification backend; Fly.io credits for edge hosting.

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
- [x] `ELEVENLABS_PARTNER_URL` / `MODAL_REFERRAL_URL` / `FLY_REFERRAL_URL`
  constants in `affiliate-links.ts` — ship **empty**; `buildSaasPartnerUrl()`
  flips links from `rel="noopener noreferrer"` (informational) to
  `rel="sponsored noopener noreferrer"` automatically when a real URL lands.
- [x] Kits: `voice-synth-workstation`, `modal-edge-bench-stack`,
  `fly-edge-lab-stack` (13 kits total). Gear tags ×6 per sim from existing
  audited ASINs. Sims added to `smoke-sim-gear.mjs`.
- [x] Strict layout on all three: Simulator → Anatomy → GearCarousel →
  KitBuilder → Math → Code → ExportGate → FAQ. Analytics: `aha_moment`,
  `aha_cta_click`, `export_download`, `export_gate_unlock`.

## Owner actions (blocked on human)

- [ ] **ElevenLabs PartnerStack application** — apply at
  https://elevenlabs.io/affiliates (PartnerStack). On approval, paste link
  into `ELEVENLABS_PARTNER_URL` in `src/data/affiliate-links.ts`; pages and
  the SimSponsorChip flip to sponsored automatically. Update `/privacy`
  affiliates list in the same PR.
- [ ] **Modal DevRel credit pitch** — email devrel/community@modal.com (or
  Slack community) once the benchmarker has ~2–4 weeks of traffic data from
  `mp_analytics_log` (aha/export counts, no PII). Pitch: the page teaches
  Modal's own deploy flow with a runnable script; ask for $1k–$10k credits
  to run AuraLinter's clang++ verification backend on Modal, offer a
  "powered by Modal" chip + field-note blog post in return.
- [ ] **Fly.io grant pitch** — Fly does community credits case-by-case.
  Same package: the lab is a teaching asset for their LiteFS story; ask for
  edge-hosting credits, offer SimSponsorChip placement + write-up.
- [ ] Decide whether the ElevenLabs sandbox warrants a field-note blog post
  (SEO: "elevenlabs web audio streaming latency").

## Follow-ups (agent-executable later)

- [ ] Wire the three sims into any "newest playgrounds" surfaces on the
  landing page if editorial wants them featured.
- [ ] Once a real Modal deployment for AuraLinter exists, consider a shared
  demo endpoint with rate limiting (needs a backend secret — currently
  rejected by design; BYO-endpoint only).
- [ ] Playwright pass over the three sims (canvas + toast + gate flows).

## Integrity guardrails carried through

- No shared API keys shipped client-side; BYO keys stay in localStorage.
- Benchmark charts start empty; every bar is user-measured or
  user-endpoint-reported. WER intentionally not charted (no ground truth).
- Fly latency numbers labeled "model, not measurement" at every readout.
- Demo voice labeled as a toy formant synth, never presented as ElevenLabs.
