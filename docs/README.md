# MakerPortal Hub — internal docs (repo-only)

**Not a public site surface.** These files are for humans and coding agents working in this repo. They are not linked from the marketing site, sitemap, or `llms.txt`.

| Doc | Purpose |
|-----|---------|
| [HANDOFF-LIGHT-MODE.md](./HANDOFF-LIGHT-MODE.md) | **Paste this** into the next session — light-mode contrast + UI specialist brief |
| [RESEARCH-EMPIRE-IA.md](./RESEARCH-EMPIRE-IA.md) | Web research: content empires, nav IA, blog patterns → what we shipped |
| [THEME-SYSTEM.md](./THEME-SYSTEM.md) | Dark default / light toggle / reading paper — tokens, rules, pitfalls |
| [DECISIONS.md](./DECISIONS.md) | Architecture Decision Records (why we chose X) |
| [OPEN-ITEMS.md](./OPEN-ITEMS.md) | Backlog, known bugs, light-mode contrast audit targets |
| [DID-NOT-WORK.md](./DID-NOT-WORK.md) | Failed approaches (do not re-learn) |

## Stack reminder

- Astro 7 + Tailwind v4, `output: 'static'`, Vercel adapter
- Brand: App Grid 2×2 (`BrandLogo.astro`, `scripts/brand-assets/`)
- Studio: San Francisco (never LA)
- GitHub org: `https://github.com/makerportal` (not personal accounts)
- No personal legal names on the public hub; team is **role-first** (`/team`)

## Before shipping

```bash
npm run build   # astro check && build && strip-dev-pages
```

After brand geometry/color changes: `npm run brand:assets` then build.
