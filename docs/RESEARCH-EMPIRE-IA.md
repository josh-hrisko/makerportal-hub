# Research learnings: blogs, content empires & information architecture

*Session research distilled for MakerPortal Hub (2026). Sources included Nielsen Norman Group, mega-menu UX roundups (2025–26), Smashing Magazine navigation writing, Substack/Medium patterns, Wirecutter-class trust surfaces, SaaS mega-nav examples (HubSpot-class), and affiliate/content-empire playbooks. This is synthesis for our product — not a literature review.*

---

## 1. What “empire” sites actually share

Successful multi-million-session properties are not “one long landing page.” They are **graphs**:

| Pillar | Job | MakerPortal mapping |
|--------|-----|---------------------|
| **Product** | Convert / install / buy | App subdomains (`*.makerportal.ai`) + thin hub catalog `/apps` |
| **Content** | SEO, AEO, trust, habit | `/blog` field notes + journal (makersportal.com) |
| **Learn / tools** | Capture intent mid-funnel | `/resources` (topic hubs + affiliate-ready tools) |
| **Commerce** | First-party revenue | `/shop` (code packs, archives — scaffold) |
| **Media** | Distribution | `/watch` (YouTube surface — scaffold) |
| **Company** | Entity clarity | `/about`, `/team`, `/press`, `/contact` |
| **Monetize attention** | Sponsors | `/advertise` |
| **Legal / trust** | Bounce reducers for shop & apps | `/privacy`, `/terms`, affiliate disclosure |

**Key insight:** Empires grow by **adding pillars with clear jobs**, not by stuffing every CTA on the homepage. The homepage is a **hub** that routes; deep value lives one click away.

---

## 2. Navigation research → rules we adopted

### Primary nav: ≤6 job-named items (D-024, 2026-07-22)

- NN/g-style guidance and modern mega-menu writing converge: **short-term memory + scanability** break past ~7 top-level items. We ship **6**.
- **Shipped IA:** **Apps · Lab · Library · Blog · Shop · Studio**
  - **Lab** = `/playground` (try / instruments) — elevated because 32 sims are a moat.
  - **Library** = `/resources` (learn hub) — owns daily engines: Edge AI Radar + Signals Journal + gear/tools/`/llms`.
  - **Blog** = human field notes only (do not merge with automated Signals).
  - **Studio** = company mega (About, Team, Contact, Press) + Watch scaffold + socials.
- **Demoted from primary:** Signals (was unclear peer of Resources), Watch (empty scaffold).
- **URLs stable** under renames: `/resources`, `/journal`, `/playground`, `/watch` keep working; only chrome labels/ownership moved.
- Historical research draft used Apps/Notes/Learn/Shop/Watch/Studio — superseded by D-024 job names above.

### Mega menus when density > flat links

- Mega panels work when you have **columns + optional featured card** (HubSpot-class pattern).
- Prefer **click/keyboard** over hover-only (trackpads, accessibility).
- Mobile: **accordion** per pillar (curtain/drawer patterns from Smashing-style mobile nav writing), not a 40-link flat list.

### Footer = full sitemap

- Large sites use the footer as a **second IA** for SEO crawl paths and recovery.
- Ours: Explore · Studio · Products · Connect · Legal (driven by `src/data/site-nav.ts`).

### Topic over format

- Content empires organize by **subject** (on-device AI, privacy, shipping), not only by “articles vs videos vs podcasts.”
- Formats still exist (`/blog`, `/watch`) but Library is **topic + engine first**.

### Single source of truth (+ active-tab twin)

- All primary nav, footer, and hub route lists live in **`src/data/site-nav.ts`**.
- Active-tab ownership twin: **`src/layouts/Layout.astro` `routeOwner`** — must update when primary `id`s or ownership change (D-024: `lab`→playground, `library`→resources/journal/llms, `studio`→watch).
- Adding a route users should find = (1) page under `src/pages/`, (2) `hubRoutes`, (3) footer and/or mega link, (4) SearchModal category if needed, (5) `generate-llms.ts` site map. Same commit — no orphan URLs.

---

## 3. Apps: catalog vs product hosts (critical)

Research + product reality:

| Surface | Role |
|---------|------|
| Hub `/apps` | **Index only** — portfolio matrix, schema `ItemList` of `SoftwareApplication` pointing at subdomains |
| `biquadia.makerportal.ai` etc. | **Product of record** — store, privacy, screenshots |

**Do not** invent hub deep pages `/apps/notiary` that compete with subdomain SEO. Cross-link with `isPartOf` / publisher schema; list subdomains in sitemap for discovery.

---

## 4. Dark vs light (research → product decision)

### What the research says (summary)

- **Positive polarity** (dark text on light) generally wins for **long reading** and proofreading (NN/g dark-mode article; ergonomics literature).
- **SEO does not rank theme directly**; engagement (dwell, bounce, pages/session) is the indirect path.
- **Developer / creative tech audiences** strongly prefer dark UIs for tools and brand sites.
- **Media/news defaults** are often light; **SaaS product marketing** often dark or hybrid.
- Best practice for dual-audience sites: **hybrid** — dark brand chrome, light reading surfaces, optional toggle.

### What we shipped

1. **Dark default** — studio / on-device / App Grid identity.
2. **Sitewide light toggle** — `html[data-theme]`, FOUC-free head script, `localStorage` `mp-theme`.
3. **Reading paper** — always warm light for `/blog/*`, `/privacy`, `/terms` (long-form polarity), independent of chrome theme tokens where `.reading-paper` is applied.
4. **Do not** rebrand the whole site to light — loses differentiation and fights the audience.

### Known gap (handoff)

**Light studio chrome has poor contrast on many hard-coded dark-era classes** (`text-white`, `border-white/…`, `bg-[#…]`). Dark mode is the polished path. Fixing light chrome is the next design pass — see [OPEN-ITEMS.md](./OPEN-ITEMS.md) and [HANDOFF-LIGHT-MODE.md](./HANDOFF-LIGHT-MODE.md).

---

## 5. Monetization surfaces (without killing brand)

Affiliate / sponsor research (content-empire playbooks):

- **Trust first:** disclosure on privacy + near links; never dark-pattern CTAs.
- **Own products before pure affiliate** when possible (`/shop`).
- **Sponsored content** needs a dedicated path (`/advertise`) and labeled formats.
- **Avoid** empty “careers / forum / cookie wall” pages that hurt E-E-A-T.

MakerPortal stance: privacy-first brand; affiliate only when labeled; shop is first-party digital goods.

---

## 6. SEO / AEO / agentic

Already in motion:

- `public/llms.txt` — machine map of hub + subdomains  
- JSON-LD Organization / WebSite / CollectionPage / FAQ / ContactPage  
- `sitemap.xml` from hub routes + posts + product URLs  
- RSS for notes  

Empire growth multiplies **internal links** (home → apps → notes → resources → contact) more than another hero animation.

---

## 7. What not to copy from “top blogs”

| Pattern | Why skip / adapt |
|---------|------------------|
| Infinite homepage scroll with no routes | Weak crawl graph, weak sharing |
| 12-item top nav | Cognitive overload |
| Duplicate product pages on hub + subdomain | SEO cannibalization |
| Full light rebrand for “professionalism” | Wrong for this ICP |
| Affiliate without disclosure | Trust / legal risk |
| Personal founder name everywhere | We chose **studio brand + role-first team** |

---

## 8. Implementation map (code)

| Concern | File |
|---------|------|
| Nav / footer / hub routes | `src/data/site-nav.ts` |
| Apps data | `src/data/apps.ts` |
| Team (role-first) | `src/data/team.ts` |
| Theme tokens | `src/styles/global.css` |
| Nav chrome + toggle | `src/layouts/Layout.astro` |
| Reading paper pages | `src/pages/blog/*`, `privacy.astro`, `terms.astro` |
| Hub page shell | `src/components/HubShell.astro` |
| Brand mark | `src/components/BrandLogo.astro` |

---

## 9. Recommended growth order (post–light-mode fix)

1. Light-mode contrast system (semantic tokens everywhere).  
2. Real shop inventory + payment (when ready).  
3. YouTube embeds on `/watch`.  
4. More field notes + internal linking.  
5. Email capture (privacy-respecting).  
6. Press kit assets pack (downloadable zip).  

---

*Last written: 2026-07-13. Update when IA or theme strategy changes.*
