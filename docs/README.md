# MakerPortal Hub — internal docs (repo-only)

**Not a public site surface.** These files are for humans and coding agents working in this repo. They are not linked from the marketing site, sitemap, or `llms.txt`.

Compressed 2026-07-15; reconciled SaaS/GPU 2026-07-19; nav IA + Edge AI Radar 2026-07-22.
Older handoffs are historical. **Current copy-paste prompt:**
`HANDOFF-2026-07-22-IA-RADAR.md` (supersedes `HANDOFF-FRONTIER-CHECK.md`).

| Doc | Purpose | Status |
|-----|---------|--------|
| [STATUS.md](./STATUS.md) | **Start here** — nav IA, apps, pipelines, monetization, last verifications | Evergreen — update each session |
| [HANDOFF-2026-07-22-IA-RADAR.md](./HANDOFF-2026-07-22-IA-RADAR.md) | **Current handoff prompt** — D-024 nav, radar, dead-link rules, next work | Current — copy into next chat |
| [BACKLOG.md](./BACKLOG.md) | Phased plan (visibility → content → revenue → engines → polish) | Evergreen |
| [MONETIZATION.md](./MONETIZATION.md) | Shop/email/affiliate/trends stack | Evergreen |
| [SAAS-GPU-MONETIZATION.md](./SAAS-GPU-MONETIZATION.md) | Deployment labs + SaaS affiliate boundaries | Evergreen |
| [PASSIVE-CONTENT-ENGINES-2026.md](./PASSIVE-CONTENT-ENGINES-2026.md) | Daily engines roadmap + visual-first law | Evergreen |
| [DECISIONS.md](./DECISIONS.md) | ADR log D-001→D-024 | Append only |
| [DID-NOT-WORK.md](./DID-NOT-WORK.md) | Failed approaches incl. nav/label/snapshot traps | Keep — working |
| [RESEARCH-EMPIRE-IA.md](./RESEARCH-EMPIRE-IA.md) | Content empires + nav research → D-024 shipped IA | Keep — working |
| [THEME-SYSTEM.md](./THEME-SYSTEM.md) | Light default + tokens + a11y | Keep |
| [AFFILIATE-CANDIDATES.md](./AFFILIATE-CANDIDATES.md) | Amazon pick sourcing trail | Keep |
| [DEVREL-PITCHES-SAAS-GPU.md](./DEVREL-PITCHES-SAAS-GPU.md) | Deprecated Modal/Fly credit path drafts — do not send | Archived intent |
| [HANDOFF-FRONTIER-CHECK.md](./HANDOFF-FRONTIER-CHECK.md) | Prior frontier handoff | Superseded by HANDOFF-2026-07-22 |
| [archive/](./archive/) | Old handoffs + OPEN-ITEMS history | Do not use as SoT |

## Stack reminder

- Astro 7 + Tailwind v4, `output: 'static'`, Vercel adapter, Pagefind search
- Brand: App Grid 2×2 (`BrandLogo.astro`, `scripts/brand-assets/`)
- Studio: San Francisco (never LA)
- GitHub org: `https://github.com/makerportal` (not personal accounts)
- No personal legal names on the public hub; team is **role-first** (`/team`)
- Monetization: Amazon/SparkFun/PCBWay/ElevenLabs live paths, Pinecone pending,
  Modal/Fly informational DevRel paths, Lemon Squeezy + Buttondown owner-deferred
- Runtime privacy: no third-party analytics/pixels; `mp:analytics` stays in a
  100-event per-browser localStorage log and is not aggregate evidence

## Before shipping

```bash
npm run build   # astro check && build && pagefind && strip-dev-pages
```

After brand geometry/color changes: `npm run brand:assets` then build.
After trend/gear changes: check real rendered output (Playwright boundingBox) not just build — D-016 lesson.

## Doc compression rationale (2026-07-15)

The 2026-07-15 compression removed overlapping sources of truth. The 2026-07-19
growth pass added focused SaaS/GPU state, outreach, and current-handoff docs:

- STATUS.md replaces scattered state
- BACKLOG.md replaces OPEN-ITEMS verbose history (history moved to STATUS + DECISIONS)
- MONETIZATION.md replaces HANDOFF-MONETIZATION.md + MONETIZATION-STRATEGY-2026-07-15.md + shop notes in OPEN-ITEMS
- archive/ holds old handoffs for reference but not source of truth
- HANDOFF-FRONTIER-CHECK is the only current execution prompt; other root-level
  handoff files predate this state and should not override STATUS/BACKLOG
- THEME-SYSTEM, RESEARCH-EMPIRE-IA, DID-NOT-WORK, and AFFILIATE-CANDIDATES remain focused working references
- README updated to new index
