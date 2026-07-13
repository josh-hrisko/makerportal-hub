# Open items

## P0 — Light mode contrast (current handoff)

Dark mode is acceptable. Light mode studio chrome has poor contrast and leftover dark-theme hardcodes.

**Audit pages with toggle set to light:**

- [ ] `/` hero, ticker, app cards, tech terminal, closing directory  
- [ ] `/apps`  
- [ ] `/contact` + `ContactCard`  
- [ ] `/team`  
- [ ] `/shop`, `/resources`, `/watch`, `/about`, `/advertise`, `/press`  
- [ ] Mega menus + mobile drawer + footer  
- [ ] 404  

**Likely culprits:**

- `text-white` on light canvas  
- `border-white/*`, `bg-white/[0.0x]` intended for dark glass  
- Hardcoded `#0F141C`, `#151D27`, `#1A232E` backgrounds that don’t flip  
- Buttons `bg-white text-canvas` inverted wrong in light  
- Orbit / AppCard glow and borders  

**Acceptance:**

- Body text ≥ 4.5:1 on canvas and cards  
- Muted text ≥ 4.5:1 where it carries meaning (or demote to decorative)  
- Borders visible but not muddy  
- Focus rings visible in both themes  
- No “invisible white-on-white” CTAs  

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
