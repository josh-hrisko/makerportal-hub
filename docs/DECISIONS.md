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
