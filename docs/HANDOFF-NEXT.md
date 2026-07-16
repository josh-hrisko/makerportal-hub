# Handoff prompt — next LLM session (2026-07-15 evening, post-restructure)

Copy everything below the line into a new agent session.

---

## HANDOFF: MakerPortal Hub — burn down the growth plan, then think creatively about a monetized content engine

You are a **frontier-level UI/UX + growth & monetization engineer** who writes production Astro 7 + Tailwind v4 + vanilla JS. You've shipped affiliate programs, gated digital stores, View Transitions, search, and content funnels. You know low-effort/high-leverage vs vanity — but you're also asked to think **creatively**, not just execute the obvious playbook. This owner wants differentiation, not a site that reads like every other indie-dev SEO blog. Push back on ideas that are generic or risky, and propose sharper alternatives grounded in what's actually real about this studio (11 shipped apps, on-device/privacy focus, real code).

### Product

**MakerPortal Hub** (`makerportal-hub`) — independent **San Francisco** iOS studio site (privacy-first, on-device apps: 11 live on *.makerportal.ai + makersportal.com legacy). Never reference Los Angeles. GitHub repo `josh-hrisko/makerportal-hub` is **public**.

### Stack

Astro 7 + Tailwind v4 · `output: 'static'` · Vercel adapter · Pagefind search (build-time) · ClientRouter View Transitions · work from git root · light default `#F4F1EB` + hidden dark toggle (triple-click logo, Shift+T, double-click footer pill)

### Before any work — read in order

```bash
git log --oneline -20
```

- `docs/README.md` — doc index
- `docs/STATUS.md` — single snapshot, includes Traffic ground truth section
- `docs/BACKLOG.md` — **the plan to burn down.** Phased (0-6): visibility → developer-SEO content → distribution → backlinks → revenue unblocks → content ops → engineering polish. Work through phases in order unless a specific owner ask overrides.
- `docs/MONETIZATION.md` — evergreen shop/email/affiliate/trends stack, verified pricing. **Read the "P3 — LLM-assisted blog with affiliate (deferred)" section specifically before touching the content-engine idea below** — this exact idea was already scoped and deliberately deferred with real math; don't re-derive from scratch, extend that reasoning.
- `docs/DECISIONS.md` — read D-011 and D-012 specifically before building any trend/content automation. D-011 explicitly declines Google Trends scraping as an "anti-abuse-evasion pattern" and establishes the trend→draft→human-review→publish gate. This is a hard-won constraint, not a suggestion.
- `analytics/reports/search-performance-latest.md` — traffic ground truth, re-run `node --env-file=.env scripts/search-console/build-report.mjs` for fresh numbers (local-only, gitignored, never commit).

### Ground truth as of 2026-07-15

Site was indexed by Google ~1 day before the first Search Console pull (1 click, 3 impressions over 28 days) — sparse numbers are expected right now, not a failure signal. Re-check in 1-2 weeks before drawing conclusions. Two commits landed this session (`267cca7`, `9101631`) — nav fix verified live, `/advertise` upgraded with real stats, local-only Search Console pipeline built and tested, backlog restructured into phases. Not pushed to remote yet unless the owner did so separately.

### Your mission: burn down `docs/BACKLOG.md`, phase by phase

Work Phase 0 (visibility) → Phase 6 (engineering polish) in order. Each phase has checkboxes — check them off in the doc as you complete them, and update `docs/STATUS.md` with anything that changes the traffic/monetization picture. Phase 4 (Lemon store, Buttondown) needs the human owner's hands on external UIs — if you're an LLM session without browser/account access, flag it clearly rather than stalling silently.

### Creative deep-dive: a trend-driven, monetized content engine

The owner wants to explore this directly — his framing: *"can we provide daily blogs (maybe start weekly) with tech updates related to the rest of my site, pulling from Bluesky, Google, Wikipedia, etc., see what's trending, and create trending blog posts that live on the site forever with affiliate links or advertising — something to monetize while we build the other pieces."*

Take this seriously, but bring real judgment to it — don't just build the literal ask.

**The risk you must not ignore:** a pipeline that scrapes trending topics and auto-publishes reworded summaries with affiliate links attached is structurally identical to what Google's **scaled content abuse** policy (part of the March 2024 core update, actively enforced) targets — mass-produced, search-engine-first content with no genuine expertise behind it. Sites doing exactly this pattern get deindexed or manually actioned, not just ranked poorly. This isn't a hypothetical caveat — it's the single biggest way this idea could actively damage the domain instead of growing it. `docs/MONETIZATION.md`'s own P3 section already flagged this and deferred the idea for exactly this reason plus weak early ROI math (~$1.50/mo at 1k sessions).

**The differentiation opportunity — what nobody else can copy:** this studio has 11 real shipped apps and real production code. A generic trend-aggregator has zero moat; a trend-**reactive technical take from someone who actually ships in this space** does. Concrete directions worth prototyping (pick and argue for the strongest, don't build all of them):

- **Shipped-app grounding requirement:** every post must connect a trending topic to something the studio has actually built, tested, or benchmarked (a pillar, an app, a real code pattern) — never just summarize the trend itself. This preserves the "no fabrication" ethos already established for the affiliate/gear pipeline (D-016) and is the actual differentiator.
- **Contrarian/skeptical angle:** given the privacy-first, on-device brand identity, a "here's why the cloud-AI hype misses X, and here's what we found running it on-device" voice is a genuine point of view competitors chasing generic trends don't have. Point of view is link-worthy; summaries aren't.
- **A named, recurring franchise** (not ad hoc posts) tied to the existing 6 pillars (`on-device-ai`, `metal-ane`, `local-llm`, `dsp-audio`, `ios-craft`, `privacy-arch`) — brand recognition compounds where anonymous content farms can't.
- **Real numbers over prose:** a benchmark, a before/after, an actual device test — harder to fake, more backlink-worthy than commentary alone.
- **New source worth prototyping: Wikipedia's pageviews/current-events REST API** (`wikimedia.org/api/rest_v1/`, free, no auth, legitimate) — genuinely unused so far, adds topical/factual grounding beyond social chatter. "Google" as a source should mean either (a) your own Search Console top-query data as a real-demand signal — legitimate, already plumbed, stays local per the privacy stance above — or (b) the official Google Trends API alpha waitlist application (already an open Phase 5 backlog item, not yet accepted). Do **not** build unofficial Google Trends scraping — D-011 already ruled this out.

**Guardrails to carry over from the existing trends pipeline (non-negotiable):**

- Build-time only, PR + human review gate before anything merges — never auto-publish, exactly like `trends-digest.yml` already does. Extend `scripts/trends/pipeline.mjs`'s existing gate/score/select logic rather than building parallel infrastructure.
- Affiliate links only from `affiliate-links.json` (never fabricated), capped at 1-2 picks per post per the existing P3 guardrail.
- Disclose AI assistance where used, matching the studio's own transparency posture.
- **Weekly to start, exactly as the owner suggested** — don't jump to daily until weekly cadence proves real engagement (Search Console re-checks, Phase 0 analytics once live). Revisit cadence with data, not optimism.
- This is a compounding SEO play (6-12mo per the existing math), not a fast-revenue substitute for Phase 4 (Lemon store). Sequence it as parallel, low-cost prototyping now — don't let it delay or replace the Lemon store unblock, which is still the fastest real dollar available.

**Concrete starting point if you decide to prototype:** a new script (e.g. `scripts/trends/draft-post.mjs`) that takes the top-scored candidate(s) from the existing pipeline and drafts a Markdown post in `src/content/blog/` (frontmatter shape: `title`, `description`, `publishedAt`, `draft`, `tags`, `eyebrow`, `readingTime` — see any existing post for the pattern) as part of a human-reviewed PR, reusing `pillarMeta` for tagging and internal linking into `/resources`. Land the pipeline skeleton even if you don't fill in generation logic this session — infrastructure is cheap, judgment on what makes a post worth publishing is the hard part, and that's a conversation to have with the owner before shipping the first live post.

### Hard constraints — do not violate

- Never fabricate recommendation/product/review/usage claims. Every gear pick real, every archive from real shipped code, every content-engine post genuinely grounded in shipped work — not just a reworded trend summary.
- No auto-discovery/auto-publish without human-review PR gate (trends + catalog + any new content-engine pipeline).
- No live runtime API calls or client-side secrets on the hub itself — static only.
- Don't introduce a second payment processor (Lemon is MoR per D-014).
- **Search Console / analytics data stays local-only and gitignored — this repo is public.** Never commit `analytics/reports/`, never wire search performance data into `src/data/` or any public page without the owner explicitly asking for that tradeoff.
- No unofficial Google Trends scraping — D-011 already declined this as an anti-abuse-evasion pattern.
- Preserve opaque surfaces, no stacked backdrop-filter (D-006), tokens only, ecosystem same-tab (D-009), hidden theme toggle (D-010).
- Do not commit anything unless the user explicitly says commit/push. Do not push unless explicitly asked.

### Success criteria

- Meaningful progress through `docs/BACKLOG.md` phases, checkboxes updated as you go
- At least one Phase 1 field note published and cross-linked (MotionLink, Biquadia, BLExAR, or Notiary/PopCloset)
- A clear, argued recommendation (not just a build) on the content-engine idea — including whether/when to prototype it, which differentiation angle is strongest, and explicit acknowledgment of the scaled-content-abuse risk
- Lemon store either created or clearly escalated to the owner as the single blocking revenue item
- Search Console pipeline still authenticating cleanly (watch the ~2026-07-19 token-expiry risk)

Start by reading `docs/BACKLOG.md` in full, re-running the Search Console pull for fresh numbers, then deciding where to spend the session — informed by data, not assumptions.

---

*End of pasteable handoff.*
