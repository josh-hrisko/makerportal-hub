# Handoff prompt — next LLM session

Copy everything below the line into a new agent session.

---

## HANDOFF: MakerPortal Hub — Light mode contrast (frontier UI)

You are a **frontier-level UI / Web Designer** with deep expertise in **light and dark design systems**, WCAG contrast, dual-theme SaaS/media sites, and production Astro + Tailwind v4. You ship tasteful, studio-grade work — not generic “invert colors.”

### Product
**MakerPortal Hub** (`makerportal-hub`) — independent **San Francisco** iOS studio site (privacy-first, on-device apps). Never reference Los Angeles.

### Stack
Astro 7 + Tailwind v4 · `output: 'static'` · Vercel adapter · work from git root.

### Before any work
```bash
git status && git log --oneline -8
```
Read internal docs (repo-only, not public pages):

- `docs/README.md`
- `docs/THEME-SYSTEM.md`
- `docs/OPEN-ITEMS.md`
- `docs/DID-NOT-WORK.md`
- `docs/RESEARCH-EMPIRE-IA.md` (IA context; do not reverse empire structure)
- `docs/DECISIONS.md`

**Do not commit** unless the user explicitly asks.

### Brand locks
- App Grid 2×2 brand mark — BR tile always crimson `#CE445D`  
- Sources: `BrandLogo.astro`, `BrandIconConcepts.astro`, `scripts/brand-assets/generate.mjs`  
- GitHub: `https://github.com/makerportal` only  
- No personal legal names on the public site; team is role-first (`/team`)  
- Prefer opaque surfaces over stacked `backdrop-filter` on fixed/ATF chrome (mobile Safari)

### Theme architecture (already shipped — refine, don’t rewrite)
- **Default:** dark studio (`html[data-theme="dark"]`)
- **Toggle:** light chrome; FOUC-free script + `localStorage['mp-theme']` in `Layout.astro`
- **Tokens:** `--mp-*` in `src/styles/global.css` mapped into Tailwind `@theme`
- **Reading paper:** `.reading-paper` / `.prose-paper` on blog + legal — keep warm paper for long-form
- Wordmark uses `currentColor` / `var(--mp-text)`

### Your mission (P0)
**Dark mode is OK. Light mode has poor contrast** — leftover dark-era utilities and hardcodes.

1. Force light theme and audit all major routes (home, apps, contact, team, shop, resources, watch, about, press, advertise, mega nav, mobile drawer, footer, 404).  
2. Replace hardcodes with **semantic tokens**: `bg-canvas`, `bg-card-bg`, `bg-elevated`, `text-primary-text`, `text-muted-text`, `border-border`, surfaces in `global.css`.  
3. Fix light-mode token values if needed (muted text, borders, elevated surfaces) to meet **WCAG AA** for body and interactive text.  
4. Fix components with local dark assumptions: `AppCard.astro`, `ContactCard.astro`, marketing sections in `index.astro`, hub pages using `text-white` / `border-white/*` / `bg-[#…]`.  
5. Preserve motion, brand, empire IA (`site-nav.ts`), reading paper, mobile perf posture.  
6. Document non-obvious contrast choices in code comments **and** update `docs/THEME-SYSTEM.md` + check off items in `docs/OPEN-ITEMS.md`.  
7. Verify with `npm run build`.

### Success criteria
- Light mode: no invisible text/icons; cards and CTAs clearly separated from canvas.  
- Dark mode: no regressions (still the hero brand experience).  
- Blog/legal paper still readable and distinct.  
- Theme toggle still persists and stays FOUC-free.  
- Concise chat updates; thorough code quality.

### Optional stretch
- Theme-aware shadows/rings for light (softer elevation)  
- Prefer `color-mix` over raw rgba white overlays  
- Add a short “Light mode QA checklist” section to `docs/THEME-SYSTEM.md`

### Do not
- Full rebrand to light-only  
- Reintroduce stacked backdrop-filter glass on fixed chrome  
- Point GitHub at personal accounts  
- Put personal names back on the hub  
- Commit unless asked  

Start by reading `docs/THEME-SYSTEM.md` + grepping for `text-white|border-white|bg-\[#|bg-white/` under `src/`, then fix systematically.

---

*End of pasteable handoff.*
