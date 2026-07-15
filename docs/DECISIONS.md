# Decisions log (ADR-lite)

## D-001 — Hub vs product subdomains

**Decision:** Hub is studio + catalog + media. Products live on `*.makerportal.ai`.  
**Why:** Avoid SEO cannibalization; product teams can ship independently.  
**Code:** `src/data/apps.ts` URLs; `/apps` thin catalog only.

## D-002 — Empire IA with ≤7 primary nav items

**Decision:** Pillars Apps / Notes / Learn / Shop / Watch / Studio + Contact CTA.  
**Why:** Research on scanability; mega menus for density.  
**Code:** `src/data/site-nav.ts`, `Layout.astro`.

## D-003 — Dark default, hybrid light, reading paper (superseded by D-010)

**Decision:** Originally dark brand default; toggle for light chrome; paper for long-form.  
**Why:** ICP + brand vs long-read polarity research.  
**Code:** `global.css`, `Layout.astro` theme script.  
**Status:** Light chrome contrast DONE 2026-07-13; default flipped to light in D-010 2026-07-14.

## D-004 — Studio brand, not personal name

**Decision:** No personal legal name on public hub; GitHub org `makerportal`; team is role-first.  
**Why:** Studio empire positioning; privacy.  
**Code:** `/team`, `src/data/team.ts`, scrubbed SeoMeta/schema/llms.txt.

## D-005 — Single nav source of truth

**Decision:** All chrome links from `site-nav.ts`.  
**Why:** Prevent nav/footer drift as pages multiply.

## D-006 — Mobile Safari performance posture

**Decision:** Prefer opaque fixed chrome over stacked `backdrop-filter`; no huge ATF blurs; no opacity-0 LCP text.  
**Why:** Prior sessions fixed PSI / iOS lag.  
**Do not reverse** without device re-test.

## D-007 — Prod-hidden `/brand`

**Decision:** Brand sandbox local only; strip script deletes static brand output.  
**Code:** `brand.astro` PROD 404; `scripts/strip-dev-pages.mjs`.

## D-008 — Internal docs folder

**Decision:** `docs/` is repo-only agent/human memory (not public pages).  
**Why:** Handoffs, research, open items without polluting marketing IA.

## D-009 — Ecosystem nav same-tab, true external new-tab

**Decision:** All links inside the MakerPortal cluster (`*.makerportal.ai` + `makersportal.com` legacy) open **same-tab**. Only truly external domains (`github.com`, `x.com`, `youtube.com`, `youtu.be`) open new-tab with `target="_blank" rel="noopener noreferrer"`.  
**Why:** One tab per journey, back-button works, no tab explosion, SEO continuity, no SEO cannibalization. Product → hub → product same-tab flow (makerportal.ai → AuraLinter same-tab, Biquadia → makerportal.ai back same-tab). External socials/code remain new-tab to preserve session.  
**Code:**  
- Hub: `src/data/site-nav.ts` `productLinks` `external:false`, `socials` journal `external:false`; `src/layouts/Layout.astro` `linkAttrs` checks `isTrulyExternal` + ecosystem short-circuit; `src/pages/about.astro`, `apps.astro`, `index.astro` removed `target="_blank"` for makersportal.com.  
- Subdomains: `website/index.html` nav + footer — MakerPortal `https://www.makerportal.ai` same-tab, More Apps `https://www.makerportal.ai/apps` same-tab, GitHub new-tab. Studio bridge section with 11 apps CTA list, footer mentions `makerportal.ai`. Banner / drawer footer also ecosystem same-tab.  
- Template snippet for any new subdomain site:  
```html
<nav>… <a href="https://www.makerportal.ai">MakerPortal ↗</a> <a href="https://www.makerportal.ai/apps">More Apps ↗</a> …</nav>
<section class="banner">More from MakerPortal — 11 apps: Biquadia • Thumb-Dash • … <a href="https://www.makerportal.ai">Studio hub</a> <a href="https://www.makerportal.ai/apps">App matrix</a></section>
<footer>… <a href="https://www.makerportal.ai">MakerPortal</a> <a href="https://www.makerportal.ai/apps">11 Apps</a> <a href="https://github.com/makerportal" target="_blank" rel="noopener noreferrer">GitHub</a> …</footer>
```  
**Standard:** Every subdomain must have at least 1 link back to hub in nav + 1 in footer, both same-tab; App Store links can be new-tab, GitHub new-tab.

## D-010 — Light default + invisible toggle (hidden easter-egg)

**Decision:** Flip default from dark studio to **light** (`#F4F1EB` canvas, white cards) — broader appeal, a11y-verified 6.8:1 muted, 5.9:1 anchor. Hide visible `.theme-toggle` buttons via `display:none !important`. Keep dark available via hidden triggers only.  
**Why:** User request to move/hide toggle, cleaner chrome, light default for first-time visitors. Power users still get dark via secret.  
**Code:**  
- `src/layouts/Layout.astro`: `html[data-theme="light"]` default; head inline script light fallback + `?theme=dark|light` param support; removed OS sync; `applyTheme` persists; `toggleTheme()` helper; secret listeners: triple-click `[data-brand-logo]` within 1200ms (with scale feedback), `Shift+T` keyboard (ignores INPUT/TEXTAREA/contentEditable), double-click `[data-theme-easter-egg]` footer pills (MakerPortal © + SF·Worldwide·11 apps). Footer pills get `data-theme-easter-egg` + title + `select-none` + hover scale.  
- `src/styles/global.css`: `.theme-toggle {display:none !important}` + comment for restore; added `[data-theme-easter-egg]` hover/active transitions.  
- `docs/THEME-SYSTEM.md` updated: Goals light default, Mechanism hidden toggle table.  
**Hidden triggers (documented for team, not public UI):**  
- Triple-click logo (top-left BrandLogo lockup)  
- `Shift+T` (keyboard)  
- Double-click footer status: `MakerPortal © {year}` or `SF · Worldwide · 11 apps`  
- URL param `?theme=dark` or `?theme=light` (persists)  
**Restore:** Comment out `display:none` in global.css and add back toggle buttons in nav if visible toggle needed again. Dark still fully functional — tokens, shadows, AA all preserved.

## D-011 — Trend-informed content pipeline + Amazon affiliate scaffold

**Decision:** Build a build-time trend digest from free/official public APIs only (Bluesky post search, Hacker News Algolia, Reddit OAuth), no paid vendors, no runtime fetch on the hub. Ship an Amazon Associates data/disclosure scaffold using the existing account tag, no PA-API/Creators API dependency.
**Why:** No monthly spend until the blog has traffic (explicit user constraint). X API has no free/cheap tier as of Feb 2026 (pay-per-use only, no entry tier) and forbids unofficial scraping — excluded. Google Trends has no viable free/stable API (official API alpha-gated, pytrends archived Apr 2025) — excluded from automation; a "respin compute to evade IP blocks" approach was explicitly declined as an anti-abuse-evasion pattern, not a cost issue. Amazon PA-API sunset May 15, 2026; replacement Creators API requires 10 qualified sales/30 days, which this property doesn't have yet — so affiliate links are static (no live price/availability), no API integration.
**Architecture:**
- `scripts/trends/` — `fetch-bluesky.mjs` (public.api.bsky.app search, unauthenticated), `fetch-hn.mjs` (Algolia HN API, unauthenticated), `fetch-reddit.mjs` (OAuth client_credentials, skips cleanly if `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` unset), `keywords.mjs` (pillar keyword allowlist scorer, not embeddings), `build-digest.mjs` (orchestrator, writes `src/data/trends.json`).
- `.github/workflows/trends-digest.yml` — weekly cron (Mondays) + manual `workflow_dispatch`, opens a PR for human review rather than auto-merging (trend → draft idea → human review → post, per brief). Free GitHub Actions minutes only.
- `src/data/trends.ts` — typed SSOT reading the committed JSON, `topTrends()` helper. No D1/KV/R2 — JSON committed to repo is sufficient at this volume (tens of items/week).
- `src/pages/resources.astro` — "Signals we're tracking" section renders only when `trends.length > 0`, external links `target="_blank" rel="noopener noreferrer"` (genuinely external, not ecosystem — D-009 doesn't apply).
- `src/data/affiliate-links.ts` — `AMAZON_ASSOCIATE_TAG = 'engineersport-20'` (existing Associates account, reused from another site — **user still needs to register makerportal.ai as an additional site in Associates Central** before links go live, per Operating Agreement), `buildAmazonUrl(asin)` helper, `affiliateLinks: []` (starts empty — no fabricated product picks shipped).
- `src/components/AffiliateDisclosure.astro` — DRY disclosure block, rendered only where affiliate links actually appear (currently: `/resources#gear`, conditional on `affiliateLinks.length > 0`). Links use `rel="sponsored noopener noreferrer"` per Google's affiliate-link guidance (prevents PageRank dilution question).
**Known gap (RESOLVED 2026-07-15):** Bluesky's `app.bsky.feed.searchPosts` returned 403 from the dev sandbox network, and a manual `workflow_dispatch` run confirmed the same 403 from GitHub Actions IPs — unauthenticated search is blocked from datacenter ranges. Implemented the documented fallback: authenticated Bluesky app-password session (`com.atproto.server.createSession` against bsky.social, account `makerportal`, secrets `BLUESKY_IDENTIFIER` / `BLUESKY_APP_PASSWORD`) with the public endpoint retained as fallback for local runs. Same run also surfaced that repo Actions settings needed "Allow GitHub Actions to create and approve pull requests" enabled — done 2026-07-15, PR creation verified.
**Do not:** add Cloudflare Workers/D1/KV for this — repo is Vercel-only (`@astrojs/vercel`, no wrangler config anywhere); the data volume doesn't need it. Do not add Modal/Fly.io/e2b compute to route around Google's or Bluesky's anti-abuse measures — that crosses from "fetch a public API" into deliberate evasion.
**Status (2026-07-14):** Amazon site registered in Associates Central; first real gear pick live (Behringer UMC1820, `inside-biquadia`). Reddit: self-service API access is **closed** (Responsible Builder Policy, Nov 2025) — the prefs/apps flow blocked app creation with a policy notice when the owner tried it. A prior status note here claiming script apps were still self-service was wrong twice over; do not re-flip this without a successful credential creation as evidence. Approval application via the Data API Wiki request form is the only legitimate path (small personal projects are the most-rejected category); digest proceeds on Bluesky + HN without blocking. Unauthenticated `reddit.com/*.json` / RSS polling as a substitute was considered and rejected — programmatic access without approval is exactly what the policy now forbids, same anti-evasion posture as the Google Trends call above. Bluesky-from-GitHub-Actions verification (known gap above) no longer needs to wait on Reddit — run it now.

## D-012 — Trend digest gating pipeline (relevance-dominant, engagement capped)

**Decision:** Restructure the digest into a staged funnel — fetch → normalize/dedupe → hard gates → score → diversity select → human PR review — in `scripts/trends/pipeline.mjs`, with fixture regression tests (`pipeline.test.mjs`, run in CI before every build).
**Why:** First real run (2026-07-15) ranked an 800-like joke post #1: the old formula added uncapped `likes÷20` to single-digit keyword scores, so popularity outvoted relevance; a politics rant also passed on one incidental keyword hit. On a studio marketing surface that's a brand problem.
**Mechanism:**
- Hard gates (boolean drops): recency ≤14 days; relevance floor ≥2 keyword hits for Bluesky (raw firehose) / ≥1 for HN+Reddit (community-curated); substance — Bluesky-only items must carry an outbound link or ≥280 chars.
- Score: `hits×3` + artifact bonus +3 (arxiv/github/developer.apple.com/huggingface links) + corroboration +3 per extra source carrying the same canonical URL + engagement capped at `min(4, log2(1+likes))` — a tie-breaker that can never outvote relevance.
- Select: max 6/pillar (by first tag), max 2/author, 24 total.
- Review: build writes `trend-digest-summary.md` (gitignored) used as the PR body — items grouped by pillar with score breakdowns, so weekly review is a skim, not a JSON diff. Merge = publish stays the model (a candidates/curated file split was considered and rejected: too much weekly friction for a solo owner, stale-curated-file failure mode).
- Workflow force-pushes the date-stamped branch and edits the existing PR body on same-day re-runs (idempotent).
**Fixtures:** the kebab joke post, the politics post, and the ANE-paper post from the 2026-07-15 run are permanent regression tests — gates must reject the first two and keep the third.
**Future (declined for now, no-spend constraint):** LLM triage pass (Haiku, ~1¢/week) as substance/relevance scorer once the blog has traffic.

## D-013 — Signals section redesign: self-hosted og:image thumbnails

**Decision:** `/resources` "Signals we're tracking" upgraded from plain title cards to a featured top-signal card + 2/3-col thumbnail grid. Thumbnails are og:image/twitter:image fetched **at digest build time** in Actions (`scripts/trends/enrich-images.mjs`), resized to 640w webp (~160 KB/week total), committed to `public/trends/` in the digest PR, and served from our own origin.
**Why self-hosted, not hotlinked:** the section claims "no tracking involved" — hotlinking third-party og:images would leak every visitor's IP to arbitrary hosts and contradict the studio's privacy-first posture. Self-hosting also survives image link rot. `public/trends/` is wiped and rebuilt each run so only the current digest's ~20 thumbnails live in the tree (history growth ~160 KB/week, acceptable).
**Design (resources.astro):** pillar → color/label map in `trends.ts` (`pillarMeta`, colors reused from app icon-dot palette); cards carry source labels (corroborated shows "HN + Bluesky"), time-ago stamps, domain chips, and capped 5-bar signal-strength meters scaled from score. Items without a thumbnail render a pillar-tinted `color-mix` gradient tile — theme-aware via `var(--mp-card-bg)`. D-006 respected: no backdrop-filter, fixed aspect boxes (no CLS), lazy images.
**Findings from the 2026-07-15 build-out (don't re-learn these):**
- **GitHub `ubuntu-latest` runners no longer ship ImageMagick** — the workflow now has an explicit `apt-get install imagemagick` step. Without it, enrichment logs `[images] no ImageMagick found` and skips gracefully (fallback tiles render), but that's silent quality loss — check the `[images] N/M` line in run logs.
- **ImageMagick trusts file extensions.** First pass wrote downloads to `{id}.raw` and got 0/20 conversions: `.raw` means headerless pixel data to IM, which then demands explicit dimensions. Fix: derive the temp extension from the response `content-type` (allowlist png/jpg/webp/gif/avif; anything else skipped). Never give IM a lying extension.
- **`git add <path>` fatals (exit 128) when the pathspec matches nothing** — guarded with `if [ -d public/trends ]`. Related pitfall: the workflow shell runs `bash -e`, where a bare `[ -d x ] && cmd` line aborts the whole script when the test is false — use a full `if`, not `&&`, in these steps.
- HN discussion pages (`news.ycombinator.com/item`) have no og:image and rate-limit build fetches (429) — those items intentionally fall back to pillar tiles; ~15/22 items get real thumbnails in practice.
- Unauthenticated Bluesky `searchPosts` 403s from this dev machine too, not just CI — local `build-digest.mjs` runs are HN-only unless Bluesky env secrets are exported locally.
