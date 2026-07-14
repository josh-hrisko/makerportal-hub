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
**Known gap:** Bluesky's `app.bsky.feed.searchPosts` returned 403 from the dev sandbox network (other public reads like `getProfile` succeed — endpoint/traffic-pattern specific, not a full IP ban). Docs say unauthenticated search should work without a `cursor` param. GitHub Actions runner IPs may hit the same block (shared datacenter ranges are common WAF targets) — **first scheduled/manual run should be checked** before trusting the weekly cadence; if it fails consistently, the documented fallback is an authenticated Bluesky app password (legitimate, not evasion), not a workaround.
**Do not:** add Cloudflare Workers/D1/KV for this — repo is Vercel-only (`@astrojs/vercel`, no wrangler config anywhere); the data volume doesn't need it. Do not add Modal/Fly.io/e2b compute to route around Google's or Bluesky's anti-abuse measures — that crosses from "fetch a public API" into deliberate evasion.
**Status (2026-07-14):** Amazon site registered in Associates Central; first real gear pick live (Behringer UMC1820, `inside-biquadia`). Reddit self-service app registration is closed as of 2026 (Reddit's Responsible Builder Policy now requires a request-form approval, category "developer", read-only) — access request + the Bluesky-from-GitHub-Actions verification are both deferred together by the owner until picked back up. Digest currently runs on Bluesky + HN only.
