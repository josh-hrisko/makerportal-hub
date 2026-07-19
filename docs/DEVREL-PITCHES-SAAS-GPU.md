# Modal + Fly.io DevRel pitch kit — DEPRECATED per owner 2026-07-19

> **Owner decision 2026-07-19: DO NOT PURSUE.** MakerPortal wants established,
> stable affiliate programs only (PartnerStack, Pinecone Affiliate Partner).
> No credit-grant / free-token / DevRel credit programs. Modal and Fly labs
> remain live as educational instruments, not monetized. This file is archived
> for reference only so future agents do not re-open the path. Do not tailor
> or send these drafts without explicit reversal.

Original drafts below were deliberately written without audience-size,
cost-savings, conversion, or performance claims. Add a number only when it
comes from a named, reproducible source.

Contact paths were rechecked against official provider documentation on
2026-07-19. Nothing was ever sent. This remains the case as of the 2026-07-19
stable-affiliate-only decision.

## Evidence and privacy gate before sending

- Public assets:
  - `https://www.makerportal.ai/playground/modal-gpu-benchmarker`
  - `https://www.makerportal.ai/blog/webgpu-benchmark-browser`
  - `https://www.makerportal.ai/playground/fly-edge-db-lab`
  - `https://www.makerportal.ai/blog/litefs-multi-region-sqlite`
  - `https://www.makerportal.ai/playground/agentic-dsp-pipeline`
- `mp_analytics_log` is a per-browser localStorage ring buffer. It is never
  transmitted, so it **cannot** support a site-wide traffic or conversion claim.
- Use a traffic number only if the owner has a privacy-compatible aggregate
  source and records the source, date range, bot filtering, and exact metric.
  Standard hosting request logs may support page-request counts; they do not
  prove unique humans, completed benchmarks, or conversions.
- Do not attach visitor keys, endpoint URLs/tokens, email addresses, prompts,
  exported benchmark JSON, IP addresses, or raw hosting logs.
- The local Lighthouse/WebGPU QA run proves implementation quality on the test
  machine. It is not a public cross-device performance result.
- Never promise exclusivity, placement duration, or a “powered by” badge until
  the owner has reviewed the terms.

## Modal — first contact

Current official contact paths: Modal community Slack or `support@modal.com`.
The first message should ask to be routed to the DevRel/community owner; support
is not assumed to control sponsorships or credits. Source:
`https://modal.com/docs/guide/feature-maturity`.

Subject: MakerPortal built a verification-first Modal GPU teaching lab

> Hi Modal team,
>
> I run MakerPortal, an independent software studio building on-device AI and
> DSP tools. We published a browser lab that measures a verified WebGPU matrix
> workload locally, then lets a developer deploy and benchmark the same shape on
> their own Modal endpoint:
>
> https://www.makerportal.ai/playground/modal-gpu-benchmarker
>
> The page includes a current `@modal.fastapi_endpoint(method="POST")` deploy
> script, keeps the chart empty until a user runs it, separates endpoint GPU time
> from browser-observed wall time, and explains cold/warm behavior without
> prefilled performance claims. The companion methodology note is here:
>
> https://www.makerportal.ai/blog/webgpu-benchmark-browser
>
> This connects to AuraLinter, our agentic DSP product. AuraLinter accepts
> generated C++ only after compiler and behavior checks; we are evaluating Modal
> for a bounded verification worker rather than exposing an unmetered public GPU
> endpoint.
>
> Would you route this to the person who handles developer education or small
> infrastructure-credit collaborations? We would value a technical review of the
> lab and, if it fits your program, a capped credit grant for a time-boxed
> AuraLinter verification pilot. We can publish the resulting architecture note
> and add mutually approved attribution. No visitor credentials or personal data
> would be shared.
>
> Thanks,
> [OWNER NAME]
> [ROLE / MAKERPORTAL]
> [REPLY EMAIL]

### Modal follow-up package

Only send after a reply asks for detail:

- Proposed worker: compile generated C++ in an isolated image, run deterministic
  DSP tests, return a bounded result object; no long-term user-audio retention.
- Pilot duration: `[START]` to `[END]`.
- Requested cap: `[AMOUNT OR COMPUTE BUDGET]`, backed by a workload estimate.
- Abuse controls: authenticated AuraLinter service, per-user quota, concurrency
  cap, hard function timeout, budget alerts, and no public anonymous endpoint.
- Deliverables offered: technical field note, source excerpt, approved attribution,
  and an honest post-pilot cost/reliability report.
- Success criteria: `[NUMBER]` verified jobs, compile/test completion rate, p50/p95
  worker wall time, cold-start share, and spend—collected from the owner-operated
  backend, not the public site's local analytics.

## Fly.io — first contact

Fly's official public route for general questions and sharing technical work is
`https://community.fly.io`; account/billing questions use `billing@fly.io`.
There is no verified public credit-grant application in the current docs, so do
not claim one exists. Post the public version in the community, or send the
private version only to a real Fly team contact the owner already has. Sources:
`https://fly.io/docs/about/support/` and
`https://fly.io/docs/about/cost-management/`. Fly's current cost-management
documentation says billing alerts are not supported, so a pilot needs explicit
resource limits, manual cost checks, and a time-boxed cleanup plan; a credit is
not a spending cap.

Title: We built an interactive LiteFS topology lab—looking for technical review

> Hi Fly.io team,
>
> MakerPortal published an interactive LiteFS/multi-region SQLite lab:
>
> https://www.makerportal.ai/playground/fly-edge-db-lab
>
> Developers place a primary and replicas at real Fly region codes, then compare
> read-local and write-forward paths. The milliseconds are explicitly a physics
> model—not Fly measurements—and the page includes the `.primary` / `fly-replay`
> middleware pattern plus a LiteFS proxy configuration. We also published the
> assumptions and consistency tradeoffs here:
>
> https://www.makerportal.ai/blog/litefs-multi-region-sqlite
>
> I would appreciate a technical review, especially around the current proxy,
> read-your-writes cookie, and WebSocket caveats. If Fly has a community or DevRel
> path for small hosting-credit collaborations, I would also welcome the right
> contact. A pilot would be capped and time-boxed; we would publish what we
> measured and would not share visitor credentials or personal data.
>
> Thanks,
> [OWNER NAME]
> [ROLE / MAKERPORTAL]
> [REPLY EMAIL]

### Fly follow-up package

- Fly organization handle: `[ORG]` (never a token or access credential).
- Pilot apps/regions and why each is necessary.
- Machine, volume, snapshot, and egress estimate from the current pricing page.
- Primary placement, lease strategy, recovery plan, migration owner, and maximum
  tolerated replication staleness.
- Metrics from the owner-operated deployment: real request latency, write commit,
  replication catch-up, availability, and spend. Keep raw IPs and request bodies
  out of the pitch attachment.
- Requested cap and end date. Ask for billing guardrails as well as credits.

## Owner inputs required to send

- Name, role, and reply address for the signature.
- Modal workspace name and Fly organization handle, if already created.
- A reviewed pilot workload/cost estimate and hard spending cap.
- Any verified aggregate traffic evidence, with its source and date range, or the
  decision to send without traffic claims (recommended for the first technical
  review request).
- No API key, provider token, user export, or credential belongs in this repo or
  in the initial outreach.

## Owner walkthrough: what to provide and what happens next

1. Copy the template below into a private conversation. A reply email is used
   only to tailor the message and should not be committed to this public repo.
2. For Modal, describe one bounded job. Multiply jobs/day × maximum seconds/job
   × pilot days, then add the maximum concurrency and GPU class only if a GPU is
   genuinely required. Set a hard dollar cap independently.
3. For Fly, start with a technical-review request unless a real deployment plan
   exists. If one does, list apps, regions, Machines, volumes, expected egress,
   pilot duration, and the maximum tolerated replication staleness.
4. The next agent may tailor the drafts from this metadata. It must not send the
   messages, deploy infrastructure, add a payment method, or incur spend unless
   the owner explicitly asks for that separate action.

```text
Public sender name:
Role/title:
Reply email:                 # private; keep out of git

Modal workspace display name:
Pilot job description:
GPU genuinely required?:
Expected jobs/day:
Maximum seconds/job:
Maximum concurrency:
Pilot duration:
Hard spending cap:

Fly organization handle:    # optional; never a token
Send Fly technical review now?: yes/no
Fly pilot topology:          # only if a real deployment is planned
```
