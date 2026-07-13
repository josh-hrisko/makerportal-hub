# Open items

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

## P1

- [ ] Fill shop inventory when ready  
- [ ] Real YouTube embeds on `/watch`  
- [ ] More field notes + internal links  
- [ ] Email list (privacy-first)  
- [ ] Press kit downloadable assets  
- [ ] Custom branded 404 already exists — verify light mode  

## P2

- [ ] Font payload: Inter preload if unused critically  
- [ ] AppCard blur-[80px] on mobile  
- [ ] content-visibility below fold  
- [ ] Unused var cleanup (`bigMark` in brand assets script)  
- [ ] Lighthouse CI budget  

## Done recently (context)

- Empire IA + mega nav + hub pages  
- Hybrid theme system + reading paper  
- Team page + org GitHub  
- Personal name scrub  
- Mobile Safari glass purge (prior sessions)  
