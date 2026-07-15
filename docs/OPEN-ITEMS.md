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

**Hotfix 2026-07-13 — /about broken AppSwitcher pill:**
- Issue: pill variant (rounded-full + flex-wrap) with 6 items + Legacy badges wrapped to 2 lines, `hidden sm:inline` hid titles on mobile leaving only dots + "Legacy" text, outer rounded-full looked broken when multi-line
- Root: AppSwitcher was pill-only, not designed for 11-item catalog; about page placed limit=6 inside narrow grid col causing crowding
- Fix: rewrote AppSwitcher into two variants — `card` (default frontier: surface-card rounded-[20px] with header + wrap grid) and `pill` (horizontal scroll, scrollbar-none, single line for nav bars). Card handles 11 gracefully with `+N more` badge.
- About redesign: split Studio/Principles into two cols without switcher inside, added stats grid (11 apps / SF / private), then full-width bridge section with `AppSwitcher limit=11 showLegacyBadge title="All 11 products"` card. No more pill inside narrow col.
- Apps page: hero now uses pill variant limit=6 (scrollable, not wrapping), bottom section uses card variant limit=11 with title "All 11 live • inter-app nav" — no duplicate.
- Mega menu: increased panel width 36→42rem, products column now grid-cols-2 when >6 items to avoid 11-tall tall panel.
- Index dashboard: updated hardcoded 3 rows (Biquadia/Notiary/PopCloset) → 4 rows (AuraLinter agentic DSP, nymic vocal, Biquadia, itria offline LLM) with 11 live footer.
- Watch page: updated series blurbs to mention 11 live and new tech stack.
- Frontier audit: checked all pages (/, /apps, /about, /team, /contact, /resources, /shop, /watch, /press, /advertise, /privacy, /terms, /blog, /404) for hardcoded 04 counts, broken links, invisible text, backdrop-filter, alt text, focus rings. No `bg-white text-canvas` regressions, no stacked blur.

Result: /about now renders clean card AppSwitcher with all 11, no broken "Studio AuraLinter Biquadia Thumb-Dash nymic Legacy..." inline run-on.

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

- [x] **Amazon Associates:** `makerportal.ai` registered as an additional site under `engineersport-20` in Associates Central (2026-07-14)
- [x] First real gear pick added — Behringer UMC1820 (`B01EXI8Y9S`), related to `inside-biquadia`, live in `src/data/affiliate-links.json`. `/resources#gear` now renders.
- [x] **Creators API live enrichment shipped (2026-07-15):** `scripts/amazon/build-catalog.mjs` + `.github/workflows/amazon-catalog.yml` pull live title/image/price via Amazon Creators API (OAuth2, credential version 3.1), cached to `src/data/amazon-catalog.json`, monthly cron + manual dispatch, human-reviewed PR before merge. ASIN curation is still 100% manual — see D-015. User still needs to add `AMAZON_CLIENT_ID`/`AMAZON_CLIENT_SECRET` to repo Settings → Secrets and variables → Actions, and to local `.env`, before the first run will do anything.
- [ ] More gear picks — ideas by app pending owner's actual-use confirmation (only ship what's genuinely used, per existing disclosure copy): Biquadia/AuraLinter → studio mic or monitors if used; nymic → USB condenser mic; akous → reference headphones for binaural; MotionLink → AirPods Pro (literal Headphone Motion API dependency); BLExAR → Arduino Nano 33 BLE / HM-10 module / nRF52 dev board. Thumb-Dash, PopCloset, GridVerse, itria don't have an obvious authentic gear tie-in — skip unless a real one surfaces.
- [ ] **Reddit source:** confirmed 2026-07-14 — self-service API access **is closed** (Responsible Builder Policy, announced r/redditdev Nov 2025; the prefs/apps form now shows a policy notice instead of creating credentials). The earlier "correction" claiming script apps were exempt was wrong; the original note was right. Path forward: submit an access application via the request form linked from the [Reddit Data API Wiki](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki) (category: developer; read-only, non-commercial, weekly digest, low volume, named subreddits). Target response is ~7 days but small personal projects are frequently rejected or ignored — **do not block on this**. Digest runs on Bluesky + HN; `fetch-reddit.mjs` skips cleanly without credentials. If approved later, add `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` under repo Settings → Secrets and variables → Actions.
- [x] Verify `.github/workflows/trends-digest.yml` (2026-07-15): pipeline works end-to-end — HN 34 items, PR auto-created after enabling "Allow GitHub Actions to create and approve pull requests" in repo Actions settings. Unauthenticated Bluesky search **confirmed 403 from Actions IPs** (same as sandbox) — switched to authenticated app-password session (`BLUESKY_IDENTIFIER` / `BLUESKY_APP_PASSWORD` repo secrets, account `makerportal`), public endpoint kept as local fallback.
- [ ] Google Trends signal: apply to the official Trends API alpha waitlist (free); until approved, spot-check manually rather than automate — see D-011 for why disposable/rotating scrape infra was declined
- [ ] Migrate legacy makersportal.com/apps/* to *.makerportal.ai subdomains on Vercel (need 302s + new standalone Astro sites)
- [ ] Real shop inventory (Lemon Squeezy integration) + YouTube embeds on /watch
- [ ] More field notes + internal links (AuraLinter launch note, nymic technical deep dive)
- [ ] Email list (Buttondown integration for privacy-first approach)
- [ ] Press kit downloadable assets including new 11 icons zip
- [ ] AppSwitcher island integration in AuraLinter, Biquadia, etc. subdomains (import from hub)
- [ ] Verify light mode contrast for new 7 icons in bright sun + low light (amber/orange/cyan need real device test)

- [x] Trend digest gating pipeline (D-012, 2026-07-15): staged funnel in `scripts/trends/pipeline.mjs` (dedupe/gates/relevance-dominant scoring/diversity caps), 13 fixture regression tests gate every CI build, PR body is now a pillar-grouped markdown summary with score breakdowns
- [x] Signals section redesign (D-013, 2026-07-15): featured card + thumbnail grid on `/resources`, self-hosted og:image webp thumbnails built in Actions (see D-013 findings: ImageMagick must be apt-installed on runners; extension-from-content-type bug)
- [ ] **Merge PR #2** (Trend digest — 2026-07-15) after reviewing the Vercel branch preview — first digest with gates + thumbnails; merging publishes to production /resources
- [ ] Trend digest keyword tuning: after 2–3 weekly cycles, review which pillars under/over-fill (`trend-digest-summary.md` funnel stats in each PR) and adjust `keywords.mjs` needles; fixture tests in `pipeline.test.mjs` guard against regressions (see D-012)
- [ ] Watch for HN-mirror bot accounts in Bluesky results (e.g. `bestofhn.bsky.social` passed legitimately on 2026-07-15 with "Submit to upvote" boilerplate) — add an author denylist to `pipeline.mjs` gates if the pattern recurs, not preemptively

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
