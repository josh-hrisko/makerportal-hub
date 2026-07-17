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
**Scoped exception (2026-07-15):** Owner explicitly asked to be named on `/team` — "Josh, Principal Engineer" plus a LinkedIn link. This is a deliberate, owner-initiated, single-person exception, not a reversal of the rule: `TeamMember` gained optional `name`/`linkedin` fields (`src/data/team.ts`), used only on the `principal-engineer` entry. The role-first default still applies everywhere else (SeoMeta, llms.txt, other pages, any future team entries without an explicit ask). Don't propagate this to other surfaces without a similar explicit ask.

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

## D-014 — Shop and Email List Platforms

**Decision:** Use Lemon Squeezy for digital goods and Buttondown for the email list. Substack and Stripe Payment Links were evaluated and rejected.
**Why:**
- **Email List (Buttondown):** Substack relies heavily on tracking pixels and forces users into its ecosystem, which conflicts with the studio's "privacy-first" posture. Buttondown offers an explicitly privacy-first mode, disabling tracking pixels, and provides a lightweight markdown-friendly authoring experience that fits the engineering focus of the studio.
- **Shop Strategy (Lemon Squeezy):** For a static Astro site with no backend, a Merchant of Record (MoR) is required to handle global digital goods tax (VAT/GST). Stripe Payment Links require the seller to calculate and remit taxes, which adds massive overhead. Lemon Squeezy acts as the MoR, handles all tax compliance, has zero monthly fees (per-sale only), and offers a modern embedded checkout that fits the MakerPortal premium aesthetic. Gumroad is a fallback but its UI is less aligned with the studio's visual identity.

## D-015 — Amazon Creators API live catalog enrichment

**Decision:** Wire up live product data (title, image, price, a freshly-tagged detail URL) for the existing curated ASIN list via the Amazon Creators API (OAuth2/Login-with-Amazon, credential version 3.1, NA region), on the same build-time-script → committed-JSON → human-reviewed-PR pattern as the trends digest. Supersedes D-011's "no PA-API/Creators API dependency" clause — D-011 itself is left as the historical record of why that call was made at the time.
**Why:** D-011 declined API integration because the account lacked the 10-qualifying-sales/30-days history the Creators API requires. That's since cleared (27 qualifying sales in the trailing 30 days, confirmed 2026-07-15) and the owner registered a Creators API application (`makerportal-hub`, credential version 3.1). Which ASINs get recommended stays **100% human-curated** — this only automates fetching real data for a pick a human already made, never auto-discovery or auto-publish (`SearchItems`-based candidate surfacing was explicitly considered and deferred, see `docs/OPEN-ITEMS.md`'s existing "pending owner's actual-use confirmation" gate, which still applies unchanged).
**Mechanism:**
- `src/data/affiliate-links.ts` split into `affiliate-links.json` (hand-edited SSOT: id/asin/note/category/relatedTo/optional `pillars`) + a thin typed `.ts` wrapper — mirrors the existing `trends.json`/`trends.ts` split, needed because the new Node fetch script can't import a `.ts` module.
- `scripts/amazon/fetch-items.mjs` — OAuth2 client_credentials token fetch (`https://api.amazon.com/auth/o2/token`, JSON body, v3.x/LwA flow) then batched `POST https://creatorsapi.amazon/catalog/v1/getItems` calls; mirrors `fetch-reddit.mjs`'s "warn + return `[]`" posture when `AMAZON_CLIENT_ID`/`AMAZON_CLIENT_SECRET` are unset.
- `scripts/amazon/build-catalog.mjs` — reads ASINs from `affiliate-links.json`, writes `src/data/amazon-catalog.json` (keyed by ASIN) + a gitignored `amazon-catalog-summary.md` PR body. On total fetch failure, or when an individual ASIN's lookup fails, it **leaves the existing cache entry untouched** rather than overwriting good cached data with nothing — this is the one deliberate deviation from `build-digest.mjs`'s "fine to write empty" posture, since gear data isn't a disposable weekly feed.
- `.github/workflows/amazon-catalog.yml` — monthly cron (gear rarely changes, base Creators API rate tier) + `workflow_dispatch`; same PR-bot mechanics as `trends-digest.yml` (branch `amazon/catalog-YYYY-MM-DD`, force-push + `gh pr create`/`gh pr edit`).
- `src/data/affiliate-links.ts` exports `resolveAffiliateLink(link)`, merging live title/image/price/detail-URL over the curated `label`/`note`/static `buildAmazonUrl()` — falls back gracefully to the static fields whenever live data is missing (pre-first-run stub, throttled call, discontinued ASIN), so the page never breaks or shows fabricated data.
- Trends linkage is a **soft tag only**: `AffiliateLink.pillars?: string[]` reuses the exact 6 keys from `trends.ts`'s `pillarMeta`; `/resources#gear` renders a small colored pillar chip per entry. No changes to `build-digest.mjs` or the trends pipeline — the two systems share a vocabulary, not a pipeline.
- Never runs at Vercel build/request time or with any runtime API call — same "static data, no live fetch on the hub" posture as trends. No Vercel env vars needed at all; secrets only ever live in local `.env` and GitHub Actions repo secrets.
**Do not:** add `SearchItems`-based keyword discovery to auto-propose new gear without a human review gate — that would cross from "automate fetching data for a chosen ASIN" into "automate which products get recommended," which conflicts with the disclosure copy's "we only recommend gear we actually use."
**Known gap (2026-07-15, pending):** First live call against real credentials surfaced two things:
1. **`resources` fix (resolved):** a bare `"offersV2"` resource string 400s — `GetItems` requires specific sub-fields (`offersV2.listings.price`, `offersV2.listings.availability`, etc., not the parent object). Also, the response field is `images.primary.hiRes` but the *request* enum value is `images.primary.highRes` — request and response naming diverge here, don't assume symmetry. Fixed in `fetch-items.mjs`.
2. **`AssociateNotEligible` (expected, not yet resolved):** even after the `resources` fix, `GetItems` 403s with `{"reason":"AssociateNotEligible"}`. Per Amazon's own FAQ this is expected for up to 48 hours after credential creation (credential created 2026-07-15 ~16:36 UTC) — re-test after ~2026-07-17. `build-catalog.mjs` already handles this correctly (logs, leaves the cache untouched, exits 0) — no code change needed unless the error persists past the 48-hour window, in which case re-check actual eligibility in Associates Central.

## D-016 — Gear list expansion (1 → 50 items) + grouped rendering

**Decision:** Expanded `affiliate-links.json` from 1 to 50 owner-confirmed products, sourced primarily by mining the owner's own historical `makersportal.com` blog for real, previously-used hardware (rather than inventing a wishlist) — full sourcing trail kept in `docs/AFFILIATE-CANDIDATES.md`. Reorganized `/resources#gear`'s rendering from one flat list into collapsible per-app groups.
**Why:** Same "we only recommend gear we actually use" constraint as D-011/D-015 — at 50 items, sourcing from real prior usage (not guessing at generically-popular products) was the only defensible way to scale this honestly. Separately, the flat-list rendering broke down at scale: 50 items in one `<ul>` rendered as a ~5500px wall of undifferentiated content on a real Playwright-measured page load — a correctness-passing build can still be a UX failure, and this wasn't caught until actually loading the page and measuring it (`.boundingBox()`), not from reading the code.
**Mechanism:**
- `docs/AFFILIATE-CANDIDATES.md` — a working (non-data, **not** gitignored) reference doc: numbered plain-text entries — deliberately not a markdown pipe table, since the point was to make each product name copy-pasteable directly into Amazon's search bar / SiteStripe — with a `Status: Confirmed`/`Suggested` flag and a blank `Affiliate link:` line per item. Kept committed (unlike `trend-digest-summary.md`/`amazon-catalog-summary.md`, which are transient PR bodies) since it's the durable audit trail for *why* each ASIN was chosen.
- `src/pages/resources.astro` — new `gearGroups` helper groups `affiliateLinks` by `relatedTo[0]` (falling back to a `studio` catch-all for items with no app tie), rendered as native `<details>` per group (zero JS) — collapsed by default when a group has more than 6 items, open otherwise. An item can appear in more than one group if `relatedTo` lists more than one owner (e.g. the shared power supply used by both BLExAR and Biquadia).
**Lessons (don't repeat these):**
1. **Don't trust a resolved short-link's URL slug as proof of product identity.** Amazon's `amzn.to` redirect's final URL slug (used here to sanity-check ~50 links via `curl -sL -w '%{url_effective}'`) is an SEO-ish fragment, not the live listing title — it flagged 3 false "mismatches" (Rode NT-USB vs NT-USB+, a "wired" reading of a wireless mic, "NodeMCU" vs "D1 Mini") that were all actually correct once the owner checked the real rendered Amazon page. If verifying product identity again, ask the human to confirm from the live page, or wait for real `GetItems` title data — don't treat the slug as ground truth.
2. **`node script.mjs` does not read `.env` automatically.** Needed `node --env-file=.env scripts/amazon/build-catalog.mjs` for local testing — easy to mistake the resulting "not set" warning for a real config problem instead of a missing flag.
3. **A working pattern at n=1 doesn't prove it works at n=50.** The flat-list gear rendering was correct and looked fine with one item; nothing about the code was "wrong" until the data scaled — always re-check actual rendered output (not just build success) after a data-driven section's input size changes materially.
**Status (2026-07-15):** All 50 ASINs resolved and verified by the owner; `GetItems` still 403s with `AssociateNotEligible` (see D-015's known-gap note above — same 48-hour window, now covering 5 batches of 10 ASINs instead of 1, so the `BATCH_SIZE = 10` assumption in `fetch-items.mjs` is still unexercised in practice). Re-test after ~2026-07-17.

## D-017 — Daily trends + pillar-driven gear re-ranking

**Decision:** Bump `trends-digest.yml` from weekly (Mondays) to daily (14:00 UTC) and use the resulting pillar frequency to re-rank the 50 curated gear items on `/resources#gear` — no new ASINs, no auto-discovery, only sort order changes. Groups with trending pillars surface first, items within groups sorted by matching pillar count, trending chips rendered with `↗ {Pillar}` badges.

**Why:** Tabled in `OPEN-ITEMS.md` as "good candidate for quick win if you want one before diving into bigger research" — safe because it reuses existing human-curated data (50 ASINs) and the `pillars` soft-tag added in D-015, zero fabrication risk. Weekly cadence made the page feel stale; daily makes the "Signals" section feel live without adding content volume (still capped at 24 items via `MAX_TOTAL`). Re-ranking gives affiliate section a reason to be revisited, improving internal cross-link without inventing new recommendations.

**Mechanism:**
- `.github/workflows/trends-digest.yml` cron `0 14 * * 1` → `0 14 * * *` (daily).
- `src/pages/resources.astro` — computes `pillarCounts` from full `trends` array (not just top 7), derives `trendingPillars` sorted by frequency, `linkTrendScore()` sum of counts, `gearGroups` sorted by aggregate score (original index as tie-breaker), items within groups sorted by score. Adds "Re-ranked · trending {Top 3 pillars}" header and `▲ trending` on group summaries, `↗ {pillars}` chip on individual cards where `pillars` intersect trending set. Open state stays `items.length <= 6` (D-016 lesson — don't auto-open large groups even if trending) — only sort order changes, not collapse logic.
- Verified: 1724px gear bbox height vs 5500px flat-list incident, 7 groups, BLExAR (33 items) stays collapsed, itria (on-device-ai, 6-count trending) surfaces first in this data snapshot. Build passes, no secrets.

**Do not:** use trending to auto-*select* which products get recommended or to inject `SearchItems` candidates without human review (D-015 Do-not still applies). This is ranking only.

**Status (2026-07-15):** Shipped in this session, verified via Playwright boundingBox check. `OPEN-ITEMS.md` tabled item can be marked done.

## D-018 — The Lab (app-grounded tools) vs Playground (viral math/physics toys), combined with labels

**Decision:** The interactive-tool surfaces have been combined into a single unified **Playground** (`/playground`, `src/data/playground.ts`). Previously, the owner wanted "The Lab" separated from ungrounded viral physics toys. However, after further review, the owner requested them combined because the distinction wasn't clear in practice and both will house standalone tools. The brand honesty mitigation—making clear what is actually shipped code and what is just a toy—is now preserved via an `isGrounded` boolean flag in `playground.ts`. Grounded tools render with a "Lab" label and link directly to the app they came from; ungrounded tools carry no such claim.

**Why:** The owner asked to put all interactive tools together ("they should all be there"). Maintaining two separate pages diluted discovery. Combining them makes the site IA simpler, while the per-card labels preserve the original intent of D-018: never claim a toy is a production app component.

**Mechanism:**
- `src/data/playground.ts` — combined registry. Every entry has an `isGrounded` flag.
- `src/components/PlaygroundShell.astro` — updated to handle both states. Grounded tools get "app-grounded" kicker and explicit links to the related app/field note. Ungrounded tools get a "not app-grounded" kicker and explanatory text.
- `src/pages/resources.astro` — unified `#playground` section rendering the combined array, with visual badges for `isGrounded` tools.

**Status (2026-07-16):** Merged into a single Playground IA, superseding the original structural split. Fourier epicycles and Live Earth shipped and verified live.

## D-019 — Live Earth: real weather + real satellite orbit via the build-time-fetch pattern, not live API calls

**Decision:** When the owner asked for geospatial/map/weather/satellite tools and specifically wanted **real data** (not simulated), the resolution was to extend the same build-time-fetch → commit → human-review-PR pattern the trends pipeline (D-011/D-012) already uses — not to relax the site's static-only, no-live-runtime-API-call constraint. Two new pipelines: `scripts/weather/` (Open-Meteo, free, no key, 16 curated cities, cron every 6h) and `scripts/satellite/` (Celestrak TLE for the ISS, free, no key, cron every 12h), each writing committed JSON (`src/data/weather.json`, `src/data/satellite.json`) via their own GitHub Action mirroring `trends-digest.yml`'s human-review-PR gate exactly (force-push same-day branch, open/update PR, never auto-merge). Shipped as one unified tool, `/playground/globe.astro` ("Live Earth"), with three switchable modes — Day/Night, Live Weather, ISS Tracker — rather than three separate globe pages, since all three share the same coastline rendering.

**Why:** "Real data" and "static only, no live client-side API calls" initially read as contradictory, but they're not — the trends pipeline already proves the resolution: fetch real data *at build time* on a schedule, commit the snapshot, human reviews before it reaches the site, browser only ever reads static same-origin data. Weather and TLE data go stale faster than trend items (hours, not days), which is why they get their own shorter cron cadences rather than reusing the daily trends schedule — this is "real data, refreshed periodically," not instantaneous live tracking, and the tool's own copy says so explicitly (no overclaiming precision).

**Mechanism:**
- **Coastlines:** `public/data/world-land-110m.json` — real Natural Earth 110m land polygons (public domain, official maintainer's GeoJSON export), downloaded once, coordinate-rounded to 2 decimals to shrink from 138KB to 91KB, committed as a static asset. Fetched client-side once per page load from same-origin (`fetch('/data/world-land-110m.json')`) — this is loading the site's own bundled asset, not a third-party live call, same category as Pagefind's own index files.
- **Weather:** `scripts/weather/cities.mjs` (16 real cities, hand-verified coordinates) + `fetch-weather.mjs` (Open-Meteo `current=` endpoint) + `build-weather.mjs` orchestrator + `.github/workflows/weather-digest.yml`. `src/data/weather-codes.ts` maps WMO weather-interpretation codes to labels for display.
- **Satellite:** `scripts/satellite/fetch-tle.mjs` (Celestrak `gp.php?CATNR=25544&FORMAT=TLE`) + `build-satellite.mjs` + `.github/workflows/satellite-tle.yml`. Stores the raw TLE lines (not pre-parsed) — all orbital math happens client-side in `globe.astro`.
- **Client-side orbital propagation (the interesting part):** a simplified two-body Keplerian propagator (semi-major axis from mean motion via Kepler's third law, Kepler's equation solved by Newton-Raphson, perifocal→ECI rotation, ECI→ECEF via computed Greenwich Mean Sidereal Time) turns the committed TLE into a real, continuously-updating lat/lon/altitude/speed — genuine orbital mechanics running in the browser on real data, not a live tracking API call. **Deliberately not full SGP4** (which models atmospheric drag and higher-order perturbations) — the tool's copy discloses this plainly ("simplified two-body propagation... treat position as illustrative, not precision tracking"). Verified numerically in Node before writing any UI code: altitude ≈ 418km (real ISS altitude), orbital period 92.96min from the mean motion (matches ISS's real ~93min period), latitude excursion bounded at ±51.6° (matches the TLE's real inclination exactly) — all three checks passed before this shipped.
- **Real astronomy, no fetch needed:** the day/night terminator doesn't need any external data at all — solar declination and the subsolar longitude are computed from the browser's own clock via standard approximation formulas, then the exact terminator (a great circle 90° from the subsolar point) is parametrized via 3D vector math and projected onto the same orthographic view as the coastlines. Verified numerically: known solstice/equinox dates reproduce the correct declination, and the terminator parametrization satisfies the daylight-boundary equation to floating-point-zero at every sampled point.
- **Orthographic projection + drag-to-spin:** standard D3-`geoOrthographic`-equivalent formulas (verified by hand-checking cardinal points — equator/pole visibility, limb behavior — before writing the canvas renderer), pointer-event drag same pattern as the Fourier epicycles tool, auto-rotates when not being dragged.
- No new dependencies (no three.js/WebGL) — pure Canvas 2D + trigonometry, consistent with the site's vanilla-JS, small-bundle posture (D-006 lineage).

**Do not:** treat this as license to add live client-side fetches elsewhere — the resolution here is specifically "fetch at build time, commit, review, serve statically," identical in spirit to D-011. A tool that needs true sub-minute-fresh data (not weather/orbital-mechanics timescales) is not a fit for this pattern and shouldn't be built until that tension is resolved the same explicit way, not silently.

**Status (2026-07-16):** Shipped and verified live in-browser this session — all three modes (Day/Night terminator, Live Weather dots with real temps, ISS Tracker with a visibly moving real-time marker) confirmed rendering correctly, drag-to-spin confirmed working, zero console errors. `weather.json`/`satellite.json` contain real fetched data from this session's pipeline runs, not placeholders.

## D-020 — Quaternion ↔ Euler preview: intrinsic vs. extrinsic rotation composition, and a texture-orientation bug

**Decision:** Redesigned the quaternion preview's 3D object (`src/pages/playground/quaternion-euler-converter.astro`) from an abstract egg/pod shape to an aerodynamic guided-missile silhouette (cruciform tail fins, nose cone, pitot, brand wordmark livery), and fixed two real bugs surfaced during that work rather than papering over them: (1) the drag-to-roll interaction was mathematically wrong once the craft had already been yawed/pitched, and (2) a CanvasTexture wrapped onto a `CylinderGeometry` decal read in the wrong direction.

**Why — bug 1, roll composition:** The pointer-drag handler builds a small delta quaternion per frame and combines it with the craft's current orientation via `quatMul`. For yaw/pitch this is correct as a **pre-multiply** (`quatMul(delta, dragStartQuat)`): the delta's rotation axis is expressed in the fixed *world/camera* frame, so "drag right always yaws around the screen's vertical" regardless of the craft's current attitude — the desired arcball behavior. The original roll code used the exact same pre-multiply pattern with axis `[1,0,0]`, which is only equivalent to "spin around the nose" when the craft is still at its 0° rest orientation, where world +X and the craft's local nose axis coincide. Once the craft had been rotated away from 0° (any yaw or pitch applied first), world +X no longer points down the nose, so a shift-drag "roll" instead tumbled the craft around a fixed, now-arbitrary world axis — reported by the owner as "the whole object rolls" when combining a prior yaw/pitch with a roll drag.
**Mechanism:** Changed only the roll branch to a **post-multiply** (`quatMul(dragStartQuat, delta)`), which is the standard intrinsic/body-frame composition rule: post-multiplying expresses the delta's rotation axis in the object's own current local frame rather than the world frame. Verified numerically before shipping (not just by eye): starting from a craft already yawed 40°/pitched 25°, transforming the local nose vector `(1,0,0)` by the quaternion before and after a 0.6 rad roll delta — the old (pre-multiply) code moved the nose direction by 0.4254 (a real bug, roll should never move the nose), the new (post-multiply) code left it at exactly 0.0000 displacement. Yaw/pitch were left untouched (pre-multiply is correct there and the owner confirmed the arcball behavior "already feels right").

**Why — bug 2, texture orientation:** `THREE.CylinderGeometry`'s side-surface UV mapping ties texture-U to the circumferential (theta) direction and texture-V to the axial (height/length) direction — this is fixed by the geometry generator, not something you can flip via material settings. A canvas texture (MakerPortal's App-Grid icon + wordmark, drawn from the actual SVG path data in `BrandLogo.astro`/`BrandIconConcepts.astro`) was first mapped with its natural left-to-right reading direction along canvas-X, which maps to U — i.e. the text wrapped *around* the fuselage's circumference like a belt, reading top-to-bottom as you scanned along the body, instead of running lengthwise like real vehicle livery (e.g. "SPACEX" painted along a rocket's flank).
**Mechanism:** Built the canvas physically rotated 90° from its logical content — `canvas.width = 32×SCALE` (circumference/U), `canvas.height = 220×SCALE` (length/V) — via `ctx.translate(32, 0); ctx.rotate(Math.PI/2)` before drawing the logo at its native 220×32 layout, so the existing drawing code didn't need to change, only the coordinate frame it draws into. Also had to flip the decal geometry itself: the wordmark band was originally sized as a *wide, short* arc (a "belt," long around the circumference, short along the length) to match the texture's native aspect ratio under the wrong assumption; once the reading direction was corrected, the band had to become a *narrow, long* arc instead (long along the fuselage length, only ~9-10° wide around the circumference) — otherwise the aspect ratio and the UV mapping fight each other and the logo distorts.
**Verified:** screenshotted at 90° yaw before and after — before, "makerportal.ai" read sideways wrapped around the body; after, it reads correctly left-to-right along the flank, matching real fuselage-lettering conventions.

**Do not:** assume `quatMul(delta, current)` is "the" way to apply an incremental rotation — whether it should be pre- or post-multiplied depends on whether the delta's axis is meant to be interpreted in world space or the object's own current local space, and getting this backwards produces a bug that only shows up once the object is away from its rest orientation (easy to miss if you only test from identity). Same caution for `CylinderGeometry`/any procedural UV mapping: verify which geometric direction U and V actually correspond to before assuming a texture's natural orientation will "just work" once wrapped.

**Status (2026-07-17):** Both fixes shipped and verified this session (numeric check for the roll fix, screenshot comparison for the texture fix). Missile silhouette, roll-index markers (steel-blue stripe + one recolored fin, since the tail-fin cruciform alone is 4-fold symmetric and can't show roll magnitude past 90°), and the brand wordmark livery are live at `/playground/quaternion-euler-converter`. Superseded later the same session by D-021 (missile → binaural dummy head) — the math/camera/drag pipeline this entry documents was untouched by that swap.

## D-021 — Quaternion preview object: missile → binaural dummy head, and a TorusGeometry orientation bug

**Decision:** Replaced the guided-missile 3D object (D-020) with a stylized binaural dummy head (smooth cranium, nose with a brand-blue tip marker, two ears with gold mic-capsule detail, a gold "headband" ring, a neck + mount with the wordmark nameplate) — the actual class of hardware (Neumann KU 100 and similar) used for head-tracked spatial-audio recording. Considered reusing a real head asset (`AirPodHeadTracker`'s `head_for_app_animation.usdz`, 9MB, SceneKit) but rejected it: USDZ has no native Three.js loader (would need an unproven Blender/CLI conversion), 9MB is heavy against this site's performance posture, and the asset's redistribution rights on a public page were unconfirmed. Built procedurally instead, same pattern as the missile.
**Why:** The page is specifically about `CMHeadphoneMotionManager`/MotionLink head tracking — a dummy head is directly on-theme in a way the missile wasn't, and it turned out to also be a better fit for the "fill the frame at rest" goal from D-020: a head is roughly isotropic (similar apparent size from any angle), unlike the missile's elongated silhouette, which was foreshortened to near-nothing at the 0° tail-view and needed careful fin/nose-length rebalancing to compensate.
**A real bug caught before shipping:** the ear's outer rim (`TorusGeometry`) was first oriented with `rotation.z = Math.PI / 2`, intended to make it stand up facing outward like a real pinna. That's wrong — a torus lies natively in its local XY plane (normal = Z), and rotating around Z only spins the arc's gap position *within* that same XY plane; it does not change which plane the ring occupies. The ring would have rendered lying flat (facing up/down) instead of facing sideways. Fixed by rotating around X instead (`rotation.x = ∓Math.PI / 2` per ear, sign flipped per side so each ring's normal points away from the head, not into it) — verified by inspecting a zoomed screenshot showing the rim as a standing arc against the side of the head, not a flat disc.
**A design bug caught via screenshot, not math:** the first pass reused the missile's brand-blue accent on one ear's mic capsule (mirroring D-020's "one recolored fin" roll-index trick). A screenshot at a moderate yaw showed the nose-tip marker and the ear capsule — both small, both the same steel-blue — visible simultaneously, genuinely ambiguous which was which. Removed: a head has real anatomical asymmetry front-to-back (nose vs. occiput) and top-to-bottom (crown vs. neck/mount) that the missile's symmetric fin cruciform never had, so roll reads at a glance without a dedicated color-coded marker — both ear capsules are gold now, and brand-blue is reserved for the nose tip alone. Also pushed the nose bump itself further out (0.8 → 0.84 units, radius 0.15 → 0.16) since the marker only reads as "the nose" if the nose is visually obvious as a bump first, not just a dot on a sphere.
**Wordmark reorientation:** the missile's fuselage was long, so the brand wordmark decal was built to read *along* the length (canvas physically rotated 90° so U maps to the axial direction). The head's neck is short, so that convention was dropped — the nameplate instead wraps the circumference like a label on a mic-stand tube (canvas kept in its natural, non-rotated 220×32 layout), and is centered at the theta angle that maps to world −X, so it faces the camera at rest instead of only becoming visible after yawing (an improvement over the missile version, which sat on the +Y side and needed rotation to see at all).
**Do not:** assume a `rotation.<axis>` on a torus (or any shape with an inherent "hole normal") reorients its plane — check which axis is actually normal to the shape locally, and rotate around a *perpendicular* axis to change which plane it occupies; rotating around the normal axis itself only changes in-plane position (arc start, gap location), not orientation.
**Status (2026-07-17):** Shipped and verified this session — screenshots confirmed correct ear-rim orientation, unambiguous single blue marker, no clipping at yaw/pitch/roll extremes (89–90° single-axis and combined 60°/55°/40°) with the same D-020 camera-derived `MODEL_SCALE` safety formula (recomputed `DESIGN_MAX_RADIUS` for the new geometry, now bounded by the neck mount's bottom edge rather than a nose spike).
