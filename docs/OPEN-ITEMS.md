# Open items

## P0 — App suite expansion + inter-app navigation (DONE 2026-07-13)

Expanded from 4 to 11 live:

- Added AuraLinter (agentic DSP orchestrator, https://auralinter.makerportal.ai) — July 2026, icon histogram #070B28 navy + #4C6492 blue-gray, dot #2B3C5E / #8AA0C6
- Merged Thumb-Dash duplicate: kept one, updated description to match makersportal.com (SmolLM2-360M, llama.cpp + Metal speed-texting battleground), new icon downloaded from Squarespace CDN, histogram #363130/#D49371
- Added 6 legacy apps from https://makersportal.com/apps as external bridge (will migrate to *.makerportal.ai):
  - nymic — kNN-VC vocal engine, WavLM-Large, HiFiGAN, ONNX Runtime, icon #C16223/#E69433 orange dot #7A3410/#E69433
  - akous — Diffusion Transformer ANE, binaural, icon rose #E7A6A2 dot #7A4744/#E7A6A2
  - itria — Metal + llama.cpp offline LLM, icon coral #E6524A dot #8C2F2C/#E6524A
  - GridVerse — AI word game Spell Bound/Lexify/Crossword, purple #631FCB dot #4E1A9E/#B59CDC
  - MotionLink — Headphone Motion API AirPods Pro, icon cyan #09A1D2 dot #0F4F6B/#4FC3E8
  - BLExAR — BLE Arduino HM-10/CC254x/nRF52, teal #3C888F dot #1F4E54/#7FB8BE

**Navigation pieces:**
- [x] Hub /apps matrix shows 11 cards, sorted by date desc, related apps by category inside each AppCard (same category filter)
- [x] AppCard footer: "Explore 11 apps →" + related 2 + legacy badge for makersportal.com hosts
- [x] Mega menu Apps productLinks extended to 11, dynamic bridge note "11 products • Subdomains + legacy"
- [x] Footer Products column now 11 live
- [x] Created src/data/app-nav.ts helper (getRelatedApps, getAppNavLinks, getNextPrev, legacyBridgeNote) for future subdomains
- [x] Created AppSwitcher.astro — theme-aware pill, no backdrop-filter, opaque surfaces, icon dots, usable in subdomains
- [x] /apps hero + bridge note transparent about legacy migration, AppSwitcher demo + hosts list with Legacy badge
- [x] /about bridge note + AppSwitcher + apps.length dynamic
- [x] / index orbit limited to 4 featured to avoid unstyled positions, micro-trust row caps 6 icons + +5, counts dynamic
- [x] llms.txt updated to 11 live with full mapping + bridge note, sitemap stays hub-only (external not in sitemap per spec)
- [x] global.css accent overrides extended for cyan/emerald for MotionLink/BLExAR AA
- [x] apps.ts extended AppCategory to include Developer Tool | Audio | Game, AppAccent + emerald/cyan, iconDot per-entry

**Acceptance:**
- [x] npm run build passes (astro check + strip-dev-pages)
- [x] /apps shows 11 article cards (verified 11 in dist/client/apps/index.html)
- [x] Icons not 404 — all webp 64/128/256/512 exist, auralinter + 6 legacy converted via magick + cwebp pipeline
- [x] Light mode still AA — badges primary-text 16:1 + dot (no yellow on beige regression), new accents violet/amber/emerald/cyan overridden in light to 5-8:1
- [x] No bg-white text-canvas regressions — grep empty
- [x] Schema sitemap hub-only, llms.txt includes external mapping
- [x] New CTAs use bg-primary-text text-canvas

## P0 — Light mode contrast (DONE 2026-07-13)

Fixed. Dark hero preserved, light now meets WCAG AA for body + meaningful muted text.

**Audited with toggle = light — all checked:**

- [x] `/` hero, ticker, app cards, tech terminal, closing directory  
- [x] `/apps`  
- [x] `/contact` + `ContactCard`  
- [x] `/team` — already tokenized, verified (role-first, surface-card)  
- [x] `/shop`, `/resources`, `/watch`, `/about`, `/advertise`, `/press`  
- [x] Mega menus + mobile drawer + footer — drawer `text-white/90` → `text-primary-text`, `hover:bg-white/[0.04]` → `hover:bg-elevated`  
- [x] 404 — `border-white/10 bg-white/[0.04]` → `border-border bg-elevated`

**Culprits fixed:**

- [x] `text-white` on light canvas → `text-primary-text` / `text-muted-text`  
- [x] `border-white/*`, `bg-white/[0.0x]` → `border-border`, `bg-elevated` / `bg-card-bg` / `surface-card`  
- [x] Hardcoded `#0F141C`, `#151D27`, `#1A232E`, `#1E2C3A` → `bg-canvas`, `bg-card-bg`, `bg-elevated`, `surface-card`  
- [x] Buttons `bg-white text-canvas` → `bg-primary-text text-canvas` (flips: light button dark text in dark, dark button light text in light, always visible)  
- [x] Orbit / AppCard glow and borders → `border-border`, shadow tokens, spotlight uses `color-mix(in srgb, var(--mp-text) 6%, transparent)` not raw `rgba(white)`  

**Token improvements:**

- `--mp-muted` `#5C6B7A` (4.2:1 on white) → `#4A5D6F` (6.2:1 on white, 5.6:1 on canvas)  
- `--mp-border` `rgba(26,35,48,0.10)` → `0.14`, new `--mp-border-strong` `0.22` for hover  
- `--mp-elevated` `#EBE6DE` → `#E8DFD1` for more separation from `#F4F1EB` canvas  
- `--mp-text` `#1A2330` → `#16202E` for extra headroom  
- Added theme-aware shadows: `--mp-shadow-nav`, `--mp-shadow-card`, `--mp-shadow-card-hover`, `--mp-shadow-elevated` — light softer ink, dark heavy atmospheric; `.surface-*` emits them  

**Acceptance met:**

- [x] Body text ≥ 4.5:1 on canvas and cards — primary `#16202E` on `#F4F1EB` ~15:1, on white ~15:1  
- [x] Muted text ≥ 4.5:1 where meaningful — `#4A5D6F` 6.2:1 white, 5.6:1 canvas; decorative `/70` variants demoted  
- [x] Borders visible but not muddy — 0.14 default, 0.22 hover  
- [x] Focus rings visible both themes — `--mp-focus` / `--mp-focus-ring` unchanged but verified  
- [x] No invisible white-on-white CTAs — all `bg-white` → `bg-primary-text` with `text-canvas`  

See `docs/THEME-SYSTEM.md` for full fix list + QA checklist.

## P1 — Next (post-expansion)

- [ ] Migrate legacy makersportal.com/apps/* to *.makerportal.ai subdomains on Vercel (need 302s + new standalone Astro sites)
- [ ] Real shop inventory + YouTube embeds on /watch
- [ ] More field notes + internal links (AuraLinter launch note, nymic technical deep dive)
- [ ] Email list (privacy-first)
- [ ] Press kit downloadable assets including new 11 icons zip
- [ ] AppSwitcher island integration in AuraLinter, Biquadia, etc. subdomains (import from hub)
- [ ] Verify light mode contrast for new 7 icons in bright sun + low light (amber/orange/cyan need real device test)

## P2

- [ ] Font payload: Inter preload if unused critically  
- [ ] AppCard blur-[80px] on mobile  
- [ ] content-visibility below fold  
- [ ] Unused var cleanup (`bigMark` in brand assets script)  
- [ ] Lighthouse CI budget  
- [ ] Auto-generate iconDot via script (magick histogram -> apps.ts json) instead of manual

## Done recently (context)

- P0 App suite expansion 4→11 + inter-app nav (AuraLinter + legacy bridge, AppSwitcher, app-nav.ts)
- P0 Light mode contrast AA fixed (tokens, shadows, violet/amber/emerald overrides, badges primary-text + icon dot)
- Empire IA + mega nav + hub pages  
- Hybrid theme system + reading paper  
- Team page + org GitHub  
- Personal name scrub  
- Mobile Safari glass purge (prior sessions)  
