# Decisions log (ADR-lite)

## D-001 — Hub vs product subdomains

**Decision:** Hub is studio + catalog + media. Products live on `*.makerportal.ai`.  
**Why:** Avoid SEO cannibalization; product teams can ship independently.  
**Code:** `src/data/apps.ts` URLs; `/apps` thin catalog only.

## D-002 — Empire IA with ≤7 primary nav items

**Decision:** Pillars Apps / Notes / Learn / Shop / Watch / Studio + Contact CTA.  
**Why:** Research on scanability; mega menus for density.  
**Code:** `src/data/site-nav.ts`, `Layout.astro`.

## D-003 — Dark default, hybrid light, reading paper

**Decision:** Dark brand default; toggle for light chrome; paper for long-form.  
**Why:** ICP + brand vs long-read polarity research.  
**Code:** `global.css`, `Layout.astro` theme script.  
**Status:** Light chrome contrast incomplete (see OPEN-ITEMS).

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
