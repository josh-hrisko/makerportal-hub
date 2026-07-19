# Status — MakerPortal Hub

Current snapshot as of 2026-07-19. Code and registries are authoritative when
this document conflicts with a generated-data commit.

## Product surface

- **Stack:** Astro 7, Tailwind 4, vanilla client TypeScript in inline scripts,
  Vercel adapter, static output, Pagefind build-time search.
- **Apps:** 11 live products in `src/data/apps.ts`.
- **Playground:** 32 live instruments in `src/data/playground.ts`. Every
  monetized simulator keeps the required DOM order: Simulator → Anatomy → Gear
  (third) → KitBuilder (fourth) → Math → Code → ExportGate → FAQ.
- **Blog:** 11 posts, including the 2026-07-19 field notes for ElevenLabs/Web
  Audio latency, WebGPU browser benchmarking, and LiteFS multi-region SQLite.
- **Theme/accessibility:** light default, dark tokenized through `--mp-*`,
  self-hosted Plus Jakarta, high-contrast code, 44px-class mobile controls where
  practical, keyboard paths for dense canvas interactions.

## SaaS / GPU growth engine

Four deployment-oriented labs are live:

1. `/playground/elevenlabs-dsp-sandbox`
2. `/playground/modal-gpu-benchmarker`
3. `/playground/fly-edge-db-lab`
4. `/playground/vector-retrieval-recall-lab`

Browser audit, measured boundaries, Lighthouse results, owner blockers, and
provider-specific integrity rules are in `SAAS-GPU-MONETIZATION.md`.

Current commercial state:

- ElevenLabs PartnerStack destination
  `https://try.elevenlabs.io/jzowx8mw6p6b` is live. The 22% statement is
  MakerPortal's eligible commission, never a customer discount.
- Pinecone Affiliate Partner application is pending. The partner constant stays
  empty, and no public commission rate is claimed.
- Modal and Fly links are informational. No verified public affiliate program
  or grant application is claimed; owner-ready technical-review drafts live in
  `DEVREL-PITCHES-SAAS-GPU.md`.
- PCBWay generic referral is live. PCBWay Shared Projects are tabled until a
  real board design exists. JLCPCB and Buttondown remain owner-deferred.
- Fourteen kits are live. Gear smoke covers 14 monetized simulators / 94 cards,
  capped at 6 cards per simulator.

## Privacy posture

- No third-party analytics, advertising pixel, or profiling SDK runs on the
  site. `@vercel/analytics` was removed after browser QA exposed a request to
  `va.vercel-scripts.com`.
- `mp:analytics` writes only to a 100-event `mp_analytics_log` ring buffer in
  that browser's localStorage. Nothing uploads it. It cannot substantiate
  site-wide traffic, unique users, conversions, or visible social proof.
- ExportGate stores per-simulator email/unlock state locally. A clean export
  does not subscribe anyone; Buttondown can be contacted only when a public
  username exists and the visitor checks a separate, unchecked opt-in.
- BYO ElevenLabs keys stay in localStorage and go directly to ElevenLabs only
  after the visitor chooses that source. Pinecone keys are intentionally absent
  from the browser lab; its sample is server-only. No shared provider API key is
  required for these pages.
- Lazy merchant artwork uses `referrerpolicy="no-referrer"`, but its host still
  receives IP/user-agent when loaded. `/privacy` discloses that boundary.
- Search Console reports and credentials remain local/gitignored. Do not commit
  traffic reports, reply-email addresses, tokens, raw logs, or visitor exports.

## Monetization/data state

- Amazon Associates tag `engineersport-20`; 163 cached catalog items.
- SparkFun code `rOtrc44SZw`; 10% applies only to eligible SparkFun Originals.
- PCBWay referral and ElevenLabs PartnerStack links are live/disclosed.
- `affiliate-links.ts` is the partner URL boundary: an empty provider constant
  produces an informational link; only a verified destination produces
  `rel="sponsored noopener noreferrer"`.
- Shop/Lemon Squeezy remains owner-gated by real product archives/account setup.
- No aggregate social-proof counter is shipped because no privacy-compatible
  aggregate source exists.

## Automated pipelines

| Pipeline | Cadence | Runtime secrets | State |
|---|---:|---|---|
| `trends-digest.yml` | daily | Bluesky credentials | Live; publishes gated journal data and self-hosted thumbnails |
| `amazon-catalog.yml` | monthly/manual | Amazon Creators API credentials | Live, PR-gated catalog refresh |
| `globe-data-digest.yml` | every 4h | none | Live; direct weather/TLE data commits can advance `main` during work |

The globe workflow can cause a non-fast-forward push. Fetch and rebase after a
rejected push; inspect the remote commit before resolving any overlap.

## Verification record (2026-07-19)

- Real Chromium QA covered the ElevenLabs, Modal, Fly, and vector-retrieval labs,
  including mobile overflow, theme redraws, ExportGate JSON, lifecycle cleanup,
  and local analytics events.
- WebGPU matmul passed CPU verification on available hardware. The no-WebGPU
  fallback was forced and tested; no physical Safari/iPhone claim was made.
- The offline formant/DSP/WAV path produced nonzero post-DSP audio and a valid
  watermarked RIFF/WAVE. No real ElevenLabs request was made without a BYO key.
- Modal code was checked against current official `modal.fastapi_endpoint` and
  Web Functions docs. No endpoint was deployed and no spend was incurred.
- Fly land geometry/arcs/hit-testing/reset flows passed. Its displayed latency
  remains a disclosed physics model, not provider measurement.
- Production-style Lighthouse for the three original labs was 98 performance /
  100 accessibility / 100 best practices / 100 SEO; the vector lab matched it.
  TBT was 0 ms and CLS was 0–0.00014. Treat these as local test-machine results,
  not population-wide performance data.
- Reconciled build: 85 generated HTML files, 84 Pagefind pages, and 16,834
  indexed words. Re-run the commands below before trusting these counts after
  new templates/content.

## Known residual risks

- A live Modal deployment, live Fly deployment, real ElevenLabs BYO request, and
  physical Safari/iPhone pass remain intentionally unclaimed.
- `npm audit` previously reported three high-severity transitive
  `path-to-regexp` findings through the current Vercel adapter. No non-breaking
  direct fix was available; recheck when the adapter updates, do not use a
  forced breaking audit fix casually.
- Build output on local Node 25 notes that the Vercel runtime targets Node 24 and
  warns about a >500 KiB Vite chunk. Astro type/check output remains clean.
- Fly currently documents no billing alerts. Any future pilot needs explicit
  resource bounds, manual cost review, end date, cleanup, and owner-approved
  spend regardless of credits.

## Owner inputs still needed

- **Now:** none for ElevenLabs.
- **When approved:** Pinecone-issued affiliate destination URL only; never an
  API key.
- **If tailoring outreach:** public sender name/title, private reply email,
  Modal workspace display name, optional Fly organization handle, bounded
  workload/topology, duration, concurrency, and hard spending cap.
- **Deferred:** Buttondown public username; PCBWay Shared Project URL after a
  real design; Lemon Squeezy product URLs after real archives/account setup.
- Never request provider tokens, payment credentials, raw visitor data, email
  lists, or secrets for a public-repo change.

## Required pre-commit verification

```bash
npm run check
npm run build
git status --short
```

`npm run check` must finish with 0 Astro errors and 0 warnings. A page-template
change also requires the full build because type-checking does not execute every
template or rebuild Pagefind.

## Recent coherent commits

- `234daa5` — browser hardening and privacy fixes
- `c7b101e` — growth surfaces, field notes, DevRel drafts
- `bdc3c41` — local vector retrieval recall lab and Pinecone path
- `577b40b` — Astro Markdown processor migration; quiet checks
- `e8b0858` — approved ElevenLabs PartnerStack destination live

For the next autonomous session, use `HANDOFF-FRONTIER-CHECK.md`; for the open
commercial checklist, use `SAAS-GPU-MONETIZATION.md`.
