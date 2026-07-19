# MakerPortal Hub — internal docs (repo-only)

**Not a public site surface.** These files are for humans and coding agents working in this repo. They are not linked from the marketing site, sitemap, or `llms.txt`.

Compressed 2026-07-15; reconciled after the SaaS/GPU expansion on 2026-07-19.
Older handoffs remain historical. `HANDOFF-FRONTIER-CHECK.md` is the only current
copy-paste continuation prompt.

| Doc | Purpose | Status |
|-----|---------|--------|
| [STATUS.md](./STATUS.md) | **Start here** — single snapshot: 11 apps, theme, pipelines, monetization state, last verifications | Evergreen — update each session |
| [BACKLOG.md](./BACKLOG.md) | Comprehensive phased plan (traffic visibility → content → distribution → backlinks → revenue → engineering) — no DONE history noise | Evergreen — check in + burn down each session |
| [MONETIZATION.md](./MONETIZATION.md) | Shop/email/affiliate/trends stack, verified pricing, prioritized avenues, shop MVP plan | Evergreen — replaces handoff + dated strategy |
| [SAAS-GPU-MONETIZATION.md](./SAAS-GPU-MONETIZATION.md) | Browser evidence, SaaS/GPU growth state, privacy/integrity rules, exact owner blockers | Evergreen — source of truth for deployment labs |
| [DEVREL-PITCHES-SAAS-GPU.md](./DEVREL-PITCHES-SAAS-GPU.md) | Owner-send Modal/Fly drafts, evidence gate, workload walkthrough | Active draft — contains no credentials and sends nothing |
| [HANDOFF-FRONTIER-CHECK.md](./HANDOFF-FRONTIER-CHECK.md) | Copy-paste prompt for the next autonomous frontier developer | Current handoff — supersedes other `HANDOFF-*` files |
| [DECISIONS.md](./DECISIONS.md) | ADR log D-001→D-023 — why we chose X and hard-won constraints | Keep, append only |
| [THEME-SYSTEM.md](./THEME-SYSTEM.md) | Light default + hidden toggle + reading paper — tokens, QA checklist, a11y ratios | Keep — working per owner |
| [RESEARCH-EMPIRE-IA.md](./RESEARCH-EMPIRE-IA.md) | Content empires, nav IA ≤7 items, blog patterns → what we shipped | Keep — working |
| [DID-NOT-WORK.md](./DID-NOT-WORK.md) | Failed approaches (backdrop-filter iOS lag, blur ATF, slug as ground truth) | Keep — working |
| [AFFILIATE-CANDIDATES.md](./AFFILIATE-CANDIDATES.md) | Sourcing trail for 50 Amazon picks — copy-pasteable names, Confirmed vs Suggested | Keep — working |
| [archive/](./archive/) | Old handoff prompts + verbose OPEN-ITEMS history | Archive — do not use as source of truth |

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
