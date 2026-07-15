# Handoff — UX overhaul, search, nav redesign (written 2026-07-15)

**Role for this session:** act as a frontier web developer *and* data scientist — design decisions should be argued from how top publishing properties actually work (TechCrunch, Wired, 9to5Mac patterns), measured where possible (contrast ratios, tap targets, CLS), and verified on mobile viewports, not just desktop.

**Required reading before touching anything:** `docs/DECISIONS.md` (D-001 → D-013, especially D-005 nav SSOT, D-006 mobile-Safari perf rules, D-009 link targets, D-010 light-default theme) and `docs/OPEN-ITEMS.md`. Also skim `docs/DID-NOT-WORK.md` and `docs/THEME-SYSTEM.md` before styling chrome.

## State as of 2026-07-15

- 11 live apps, hub on Astro + Vercel (`@astrojs/vercel`), light theme default, hidden dark toggle (D-010).
- Trend digest pipeline (D-011/D-012/D-013) fully verified: weekly Actions cron → gated/scored digest → PR with pillar-grouped summary + self-hosted og:image thumbnails → merge publishes to `/resources`. **PR #2 (Trend digest — 2026-07-15) may still be open — check and remind the owner to review/merge.**
- Reddit API access application pending (self-service is closed — see D-011; don't suggest workarounds). Bluesky runs authenticated via repo secrets.
- Constraint that shapes everything: **no monthly spend** until the blog has traffic. Per-transaction fees are acceptable; subscriptions/SaaS are not.

## Task list (owner's words, with implementation notes)

1. **Site search.** Candidate: Pagefind (build-time index, zero runtime services, fits the static + no-spend posture) — but evaluate honestly. Ties into task 3 (search glyph in the header).
2. **Explore Substack** — how does it work, how could it serve this site? Research task first, not implementation: reconcile with the privacy-first posture and the existing P1 "email list (privacy-first)" open item. Newsletter strategy recommendation wanted (Substack vs Buttondown vs self-hosted vs nothing yet).
3. **Nav bar redesign.** Owner: the floating pill nav doesn't fit the scope; popular blog-empire sites (TechCrunch, Wired, Gizmodo, Engadget, 9to5Mac) use full-width sticky headers with home link, search magnifying glass, burger menu. Rework the chrome accordingly. Hard rules: all links from `src/data/site-nav.ts` (D-005), opaque sticky chrome / no stacked backdrop-filter (D-006), theme tokens only, ecosystem links same-tab (D-009).
4. **Mobile hero fixes on `/`:** "BUILD / LEARN / SHIP" looks wrong on mobile — fix. Also **randomize which 4 of the 11 apps** appear in the hero orbit (currently hardcoded 4 featured; index deliberately caps at 4 to avoid unstyled orbit positions — keep the cap, randomize the selection. Note SSG: build-time random only reshuffles per deploy; a tiny hydration-safe client shuffle is likely what's wanted).
5. **Landing-page kickers:** "STUDIO TRANSMISSION • SF • 2026" and "SHIPPING" don't fit — remove or relocate (owner leans remove; careful: two footer pills are dark-mode easter-egg triggers per D-010 — those are footer, not hero, but verify before deleting anything labeled `data-theme-easter-egg`).
6. **Notes prev/next on mobile:** currently stacked vertically; make them side-by-side (previous left, next right — standard blog pattern).
7. **Full usability audit:** Notes / Learn / Studio compete and confuse. Clean up the IA and user journeys — propose before implementing; this touches D-002 (≤7 primary nav items) and probably wants a decision entry when resolved.
8. **Active-page indication in nav:** current path segment (e.g. `/learn`) should be visibly bolder/highlighted in header, mega menu, and mobile drawer. Use `aria-current="page"` plus styling — it's a11y-correct and testable.
9. **Shop/store strategy:** how to charge for code and project artifacts. Research + recommendation: Gumroad / Lemon Squeezy / Stripe Payment Links style options (per-sale fees OK, monthly fees not), digital-goods tax handling, and what fits a static Astro site with no backend.
10. **Contact page "slide to verify" bug:** the slider handle is visibly off-center relative to its track. Straight CSS fix — find it, align it, check both themes and mobile.

## Working agreements (carry these forward)

- Update `docs/DECISIONS.md` (new D-numbers) and `docs/OPEN-ITEMS.md` as work lands; record failures and dead ends in the decision entries or `DID-NOT-WORK.md` so they aren't re-learned.
- Comment code for future readers: constraints and "why", not narration.
- Verify with `npm run build` (runs astro check + strip-dev-pages) before committing; light-mode AA contrast and D-006 perf rules are regression surfaces on every chrome change.
- Anything visual: check the built page at real mobile widths, not just desktop.
