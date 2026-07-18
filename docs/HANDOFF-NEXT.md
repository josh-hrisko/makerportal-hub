# Handoff prompt — next session (2026-07-17, evening)

Copy everything below the line into a new agent session.

---

## HANDOFF: Continue building out MakerPortal Hub — Phase 1 is done, pick the next lever

You're picking up `makerportal-hub` (`josh-hrisko/makerportal-hub`, **public** repo) at a clean point: every Phase 1 item in `docs/BACKLOG.md` (developer-SEO field notes + Playground tools) shipped and is live on `main` as of commit `1adf43e`. Read `docs/STATUS.md` and `docs/BACKLOG.md` in full before doing anything — they're accurate as of this handoff, but verify against the actual code/git log before trusting any specific claim (see "a real lesson from this session" below).

### Product & stack
Astro 7 + Tailwind v4, `output: 'static'`, Vercel adapter. Independent San Francisco studio site, 11 shipped apps (5 on `*.makerportal.ai`, 6 legacy on `makersportal.com`), on-device-first / privacy-first posture. Strict no-fabrication rule: never invent metrics, review scores, engagement numbers, or product internals you can't source in the repo.

### What just happened (this session, 2026-07-17)
1. **Found and fixed significant doc drift.** A prior session's commit (`19f8990`) shipped 5 Playground tools in one go without updating `BACKLOG.md`/`STATUS.md` — they sat claiming those tools were "next" or "blocked" for almost a day. Reconciled both docs against `src/data/playground.ts`'s actual `status` field. **Lesson: don't trust a backlog checkbox at face value — a fast multi-commit session can outrun doc updates within the same day.** Cross-check against `git log` / registry status fields when something looks suspiciously "still open" or "already done."
2. **Caught a fabrication risk before it shipped.** The backlog's "Biquadia field note" item asked for content (LangGraph, `clang++` verification) that every real source in the repo attributes to **AuraLinter**, not Biquadia. Reworded the item instead of writing a note that would've misattributed another app's pipeline. Apply the same skepticism to any backlog item that names specific technical claims — verify the claim is actually attributable to the app named before writing about it.
3. **Shipped all 4 remaining Phase 1 field notes**, each grounded only in facts already present in the repo (app descriptions, existing playground-page code/copy, `llms.txt`, `shop.json`, `affiliate-links.json`) — never invented implementation detail:
   - `src/content/blog/blexar-ble-uart-bridge.md`
   - `src/content/blog/notiary-on-device-semantic-search.md`
   - `src/content/blog/auralinter-agentic-dsp-verification.md`
   - `src/content/blog/nymic-knn-voice-conversion.md`
4. **Shipped the last planned Playground tool**, `src/pages/playground/conformal-mapping.astro` — a hand-written recursive-descent complex-expression parser (no `eval`/`Function`). Caught a real operator-precedence bug (unary minus binding tighter than `^`) via a standalone Node verification script before shipping, then browser-tested live (Chrome DevTools MCP) against known conformal maps. **All 12 `playground.ts` registry entries are now `status: 'live'`.**
5. **Found and fixed 2 real bugs** outside the original ask: `ble-gatt-visualizer.astro` linked to a 404ing `blexar.makerportal.ai` (fixed to the real `makersportal.com/apps/blexar`); the claimed cross-link between `fourier-epicycles.astro` and `inside-biquadia.md` never actually existed in code (added a real bidirectional link). A follow-up link audit across every blog post and playground page found nothing further.
6. Amazon Creators API re-tested past its 48h eligibility window — still `AssociateNotEligible`. This is now flagged as a genuine owner action (check Associates Central directly), not a timing artifact.

Baseline before you start: `npm run check` (0 errors/0 warnings/42 hints), `npm run build`, `node --test scripts/trends/pipeline.test.mjs` (13/13) — all passing as of `1adf43e`. Re-run these first; if anything regressed, that's your first finding.

### Your mission — pick up where this session left off

Almost everything left in `docs/BACKLOG.md` needs the human owner directly (creating a Lemon Squeezy/Buttondown account, posting to Show HN/Reddit under the studio's identity, checking Associates Central eligibility) — **don't attempt those**, they require real account access and public posting judgment that isn't yours to exercise. Flag them, don't do them.

What you *can* do autonomously, roughly in priority order:

1. **Reverse cross-linking (real gap, cheap, high value):** `BACKLOG.md` Phase 1 has an open item — "Cross-link every new note into its `/resources` pillar and into the matching shop archive card." Right now every field note links *out* to `/shop` and `/resources#gear` in its own prose, but nothing links *back in* — `shop.json`'s cards and `resources.astro`'s pillar sections don't reference the blog posts at all, for *any* post (not just the new ones). Check whether this is worth building as a real feature (e.g., a `relatedFieldNote` field on shop products, rendered as a small "Read the field note" link on the shop card) — verify the actual component structure first, don't assume.
2. **Font payload audit** (`BACKLOG.md` Phase 6): the site currently preloads both Plus Jakarta and Inter latin — check whether Inter is actually used critically (above-the-fold) anywhere; if not, drop the preload. Small, measurable, no risk.
3. **Auto-generate `iconDot` via script** (`BACKLOG.md` Phase 6): currently manual per-app hex values in `apps.ts`. A `magick histogram`-based script could derive these from the actual icon assets. Scope it before committing to it — check whether the manual values are actually inconsistent with the real icons first (i.e., confirm there's a real problem, not just a theoretical one).
4. Re-check `docs/BACKLOG.md` Phase 5/6 for anything else that's genuinely autonomous and no-fabrication-risk — most of what remains isn't.

### What NOT to do without the user directly
- Don't create accounts (Lemon Squeezy, Buttondown, Product Hunt, etc.) or post to any external community/platform (Show HN, Reddit, BetaList) under the studio's identity — these are explicit owner actions in the backlog for a reason.
- Don't write new field notes or shop copy for anything you can't source from files already in this repo — the strict no-fabrication posture is load-bearing for this studio's credibility, and this session's "Biquadia field note" near-miss (see above) is a real example of how that goes wrong if you trust a backlog item's framing instead of verifying it.
- Don't merge/reconcile the daily trend or globe-data commits — those are automated direct-to-main pipelines (D-022, D-019 update), not PRs waiting on review.

### Before you start
Run `npm run check`, `npm run build`, and `node --test scripts/trends/pipeline.test.mjs` to confirm the baseline is still clean (it was as of `1adf43e`). Propose a plan before any batch refactor — but for well-scoped, low-risk, single-item work (a field note, a small bug fix, a doc reconciliation), the owner has explicitly authorized proceeding autonomously and committing/pushing each verified chunk without waiting for per-item approval — see the standing preference captured in memory from this session.

---

*End of pasteable handoff.*
