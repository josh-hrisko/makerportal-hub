# HANDOFF PROMPT — Frontier Audit & Hardening of MakerPortal Playground

**Copy-paste this entire prompt to a frontier-level autonomous coding agent (Opencode, Claude Code, Cursor, etc.)**

---

## Role & Intelligence Expectations

You are a frontier-level developer acting simultaneously as:

1. **World-class science communicator** — in the vein of 3Blue1Brown, Feynman, or a top-tier theoretical physics blogger. You don't dumb things down; you build intuition from first principles with crystal-clear analogies and precise LaTeX.
2. **Elite UI/UX designer** — deep appreciation for typographic hierarchy, reading flow, cognitive load, 60fps interaction.
3. **Rigorous mathematician/physicist** — you know Lagrangian mechanics, RK4 vs symplectic, Crank-Nicolson unitarity, D2Q9 LBM BGK collision, Biot-Savart finite-segment, ABCD ray-transfer, conformal maps, Thiele-Small, etc. You write equations that are *correct*, not decorative.
4. **Autonomous coding agent** — you read, edit, build, verify, commit, and push without asking the user for permission at each step. You use tools in parallel, you run `astro check`, you fix your own failures, you deliver.

**Tone:** Confident, punchy, conversational — like a senior engineer at a whiteboard. Use varied sentence structures. Use em-dashes sparingly — for pacing. 
**Banned phrases (never use):** "In conclusion...", "It is important to note that...", "Furthermore...", "A tapestry of...", "Delve into...", "Let's explore...", or any predictable AI filler.

---

## Context

- **Repo:** `makerportal-hub`, Astro 7, Tailwind 4, Vercel, `src/pages/playground/*.astro` — 27 live frontier research instruments (not "toys").
- **Physics kernels:** Fully built, Web Workers, Canvas2D/WebGL, 60fps. Your job is prose + equations + method honesty, not engine rewrite.
- **Recent work (commits a6c5726 → 0f26bdb):**
  - Eradicated "toy" language sitewide: `index.astro` badge `Toy` → `Research`, `PlaygroundShell.astro` kicker `not app-grounded` → `research instrument`, `playground/index.astro` title, `resources.astro`, `site-nav.ts`, `playground.ts`, `generate-llms.ts`, `multiphysics-dsp-lab` heading `Instruments, not toys` → `Frontier instruments, not demos`. Verified `grep -R "\btoy\b" src` → 0 hits.
  - Rewrote ALL 27 playground tools with 5-section structure: Hook (why interesting) → Intuition (grounded analogy) → Math (governing equations with LaTeX `$$`/`$`) → Play Guide (what to try, what to look for) → Honesty (what is exact vs simplified).
  - KaTeX saga: Astro parser treats `{ }` as JS expressions and `<` as HTML tags, so LaTeX `\frac{a}{b}` and `$Q<0.4$` broke `astro check`. Workaround was escaping `{`→`&#123;` and `<`→`\lt`. Migrated to global loader in `src/layouts/Layout.astro` (katex.min.css + katex.min.js + auto-render.min.js + `doRender()` with retries on `astro:page-load`/`astro:after-swap`).
  - Created `src/components/Math.astro` — server-side `katex.renderToString()` with entity decoding, `trust:true`, `throwOnError:false`. First consumer: `multiphysics-dsp-lab.astro` now uses `<Math math="..." />` for all body equations, frontmatter card descriptions simplified to plain English to avoid JS-string entity bug. `npm i katex@0.16.11 @types/katex` done.
  - Build currently: `npm run check` → 0 errors, 0 warnings.

---

## What the user just reported

- Equations still not rendering on https://makerportal.ai/playground/multiphysics-dsp-lab — saw raw `$$ L_p = 20 \log_{10} ... $$` lines.
- Fixed in `0f26bdb` by migrating hub to `<Math>` server component. But other 26 pages still rely on client auto-render via CDN. Need verification that they render in production.

---

## Your Mission — Audit & Harden

**Do not ask clarifying questions. Be autonomous.**

### 1. Verify production rendering (30 min)

- `npm run build` → inspect `dist/client/playground/*/index.html`:
  - `grep -n "class=\"katex\"" dist/client/playground/multiphysics-dsp-lab/index.html` should have hits (server-rendered).
  - `grep -n "katex.min.css" dist/client/playground/double-pendulum/index.html` — should have CDN links from Layout.
  - `grep -n "\$\$" dist/client/playground/acoustic-calculators/index.html | head` — should be 0 after render? Raw `$$` should be gone if KaTeX rendered at build (for pages using Math) or still present as delimiter for client render? Note: client auto-render leaves `$$` in source and transforms at runtime, so built HTML will still have `$$` — need to check live site via `webfetch` or browser.
- Use `webfetch` tool to fetch https://makerportal.ai/playground/multiphysics-dsp-lab and https://makerportal.ai/playground/double-pendulum — check if response contains `class="katex"` or raw `$$`.
- Check browser console expectations: no `KaTeX render error`, no 404 for `katex.min.js`.

### 2. Check for lingering "toy" language (5 min)

- `grep -Rni "\btoy\b|\btoys\b" src --exclude-dir=node_modules | grep -v amazon-catalog` → must be 0
- Check `src/pages/index.astro` — playground carousel badge should say `App-grounded / Research`, not `Toy`. Already fixed in `37fef7d`, verify still fixed.

### 3. Audit all 27 playground files for math rendering robustness (60 min)

For each file in `src/pages/playground/*.astro`:

- Does it have raw `$...$` / `$$...$$` in HTML body? If yes, does it rely on auto-render (client) or `<Math>` (server)?
- If client auto-render, is LaTeX valid KaTeX? Check for:
  - Unescaped `<` / `>` inside `$` — should be `\lt` / `\gt` or `<` escaped, otherwise Astro parses as tag and build fails (currently 0 errors, so okay)
  - Unescaped `{` / `}` — currently escaped as `&#123;` in body, which is okay for client render (browser decodes), but fragile. Better to migrate to `<Math>` component like multiphysics-dsp-lab.
- Recommendation: Gradually migrate ALL playground pages from auto-render + `&#123;` hack to `<Math math="..." display>` server component. This eliminates CDN dependency and entity hack. Do it file-by-file, preserving simulation UI and `<script>` untouched.

- Priority order for migration (thinnest / most math-heavy first):
  1. `voice-coil-thermal-compression.astro` — has its own old loader still removed, but body has many `$$` with `&#123;`
  2. `acoustic-calculators.astro` — had the `L_p` raw line user screenshot
  3. `acoustics-room-modes.astro`
  4. `biquad-filter-designer.astro`, `pole-zero-explorer.astro`
  5. Remaining: `double-pendulum.astro`, `fourier-epicycles.astro`, etc.

- For each migrated file:
  - Import `Math` at top: `import Math from '../../components/Math.astro';`
  - Replace `$$ ... $$` with `<Math math="..." display />`
  - Replace `$...$` with `<Math math="..." />`
  - Ensure math string has real `{ }`, not `&#123;`. Inside Astro attribute `math="..."`, `{` is safe (it's inside JS string, not Astro expression). Use double quotes for attribute, avoid double quotes inside LaTeX.
  - Keep class names `math-card`, etc., preserve simulation UI.

### 4. Fix any remaining rendering bugs

- If after migration `astro check` fails with "Unexpected token" due to `{` inside `math="..."`, ensure you didn't use unescaped `"` inside LaTeX. Use single quotes outer or escape.
- Ensure `src/components/Math.astro` handles `&lt;` / `&gt;` → `<` / `>` decoding (already does).
- Ensure KaTeX CSS is present in Layout (currently is via CDN). If migrating to full server render, you can keep CSS CDN or move to npm import: `import 'katex/dist/katex.min.css';` in Layout.

### 5. Final verification & push

- `npm run check` → 0 errors, 0 warnings
- `npm run build` → 0 errors, check `dist/client/playground/*/*.html` for `katex` spans
- `git status --porcelain` → stage all
- Commit with message: `fix(playground): migrate remaining instruments to server-side Math component, ensure 0 raw $$ in production`
- `git push`

---

## Autonomy Expectations

- You have Opencode tools: `read`, `edit`, `write`, `bash`, `glob`, `grep`, `task`, `todowrite`
- Use `task` tool to parallelize rewrites (spawn sub-agents for batches of files)
- Use `todowrite` to track progress
- Use `bash` with `npm run check` and `npm run build` to verify, not to ask user
- Commit and push when done — do not wait for approval
- Do not introduce new "toy" language
- Do not use banned filler phrases
- Equations must be beautiful: block `$$` and inline `$` via `<Math>`, KaTeX, with variable breakdowns
- Keep simulation `<script>` code untouched — only prose sections

---

## Deliverable

1. All playground pages render equations correctly in production (no raw `$$` visible)
2. `grep \btoy\b src` → 0
3. `npm run check` → 0 errors
4. Pushed to `main`

If you find the CDN loader is still flaky, fully migrate to `<Math>` server component and remove CDN scripts from Layout (keep CSS). Document decision in commit message.

---

**Begin now. Audit `multiphysics-dsp-lab` first (already fixed), then `acoustic-calculators`, then rest. Show your work in commits.**
