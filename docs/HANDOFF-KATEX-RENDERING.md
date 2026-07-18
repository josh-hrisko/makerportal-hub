# HANDOFF — KaTeX Rendering Fix for Playground & Sitewide Math

**Date:** 2026-07-18
**From:** OpenCode (Muse Spark) — frontier rewrite pass
**Status:** Partially fixed, needs verification in production + potential server-side render switch

---

## What the user reported

- Equations appear as raw LaTeX on live site, e.g.:
  `$$ L_p = 20 \log_{10} \left| \frac{p}{p_0} \right|, \qquad L_W = 10 \log_{10} \frac{W}{W_0} $$`
- "a LOT of ugly lines rendered like this" — visible across playground and possibly site
- Also reported lingering "toy" language on landing (now fixed in commit 07f3fd0)

---

## What was done in this sprint

### 1. Toy language eradication (commit a6c5726, 37fef7d, 07f3fd0)
- `src/pages/index.astro:456` badge `{isGrounded ? 'Grounded' : 'Toy'}` → `App-grounded / Research`
- `src/components/PlaygroundShell.astro` kicker `not app-grounded` → `research instrument`, subtext rewired to "Independent research instrument — numerically rigorous..."
- `src/pages/playground/index.astro` title/description/lead: `math & physics toys` → `frontier physics & math instruments`
- `src/pages/resources.astro`, `src/data/site-nav.ts`, `src/data/playground.ts`, `scripts/generate-llms.ts` — all `toy` → `research instrument`
- `grep -R "\btoy\b" src` → 0 hits now

### 2. Frontier rewrite of all playground instruments (commits a6c5726 → f91efc5)
- 27 live tools audited: tiered into excellent / decent / thin
- Rewrote 14 thinnest with Feynman/3Blue1Brown voice, no banned phrases ("In conclusion", "Furthermore", "Delve into", etc.)
- Files rewritten:
  - `double-pendulum.astro` — full Lagrangian, coupled α1/α2, RK4, Lyapunov
  - `voice-coil-thermal-compression.astro` — RC thermal, Re(T), steady-state Newton solve
  - `fourier-epicycles.astro` — DFT, complex plane, Gibbs
  - `acoustic-calculators.astro` + `acoustics-room-modes.astro`
  - `biquad-filter-designer.astro`, `pole-zero-explorer.astro`
  - `cone-breakup.astro`, `loudspeaker-enclosure-designer.astro`, `loudspeaker-nonlinearity-lab.astro`, `waveguide-designer.astro`, `multiphysics-dsp-lab.astro`
  - `optics-bench.astro`, `conformal-mapping.astro`, `globe.astro`, `quaternion-euler-converter.astro`
  - `head-tracked-stereo-pan.astro`, `coreml-model-size-calculator.astro`, `ble-gatt-visualizer.astro`, `agentic-dsp-pipeline.astro`
- Added KaTeX auto-render attempts per-page initially, then consolidated to global.

### 3. The Astro parser collision (critical)

Astro's `*.astro` parser treats `{` `}` as JS expression delimiters and `<` as HTML tag start. LaTeX is full of them:

- `\frac{a}{b}` → contains `{` `}`
- `$Q_{ts} < 0.4$` → contains `<` → parsed as `< 0.4$` tag
- Result: `astro check` fails with "Unexpected token" / "Invalid character" / "Unable to assign attributes when using <> Fragment shorthand"

**Workaround applied:**
- Inside ALL math (`$...$` and `$$...$$`), escape `{` → `&#123;` and `}` → `&#125;`
- Inside math, escape `<` → `\lt ` and `>` → `\gt ` (KaTeX understands `\lt`, `\gt`)
- Script did this only outside `<script>` tags to avoid breaking JS template literals `${...}`

Example before:
```
$$ \frac{a}{b} $$
$p < 1$
```
After:
```
$$ \frac&#123;a&#125;&#123;b&#125; $$
$p \lt 1$
```

Browser decodes `&#123;` → `{` in textContent, so KaTeX should see correct LaTeX if auto-render runs.

- Verified: `npm run check` → 0 errors, 0 warnings.

### 4. KaTeX loader refactor (commit 07f3fd0)

**Before:** Each playground page had its own inline loader in `<Fragment slot="head">` plus PlaygroundShell had another loader. Fragile, race conditions, duplicate tags.

**After:** Consolidated to single source in `src/layouts/Layout.astro`:

```astro
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous" />
<script is:inline src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
<script is:inline src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>
<script is:inline data-astro-rerun>
  (function(){
    function doRender(){
      if(!window.renderMathInElement) return;
      var root = document.getElementById('main-content') || document.body;
      if(root.innerHTML.indexOf('$')===-1) return;
      window.renderMathInElement(root, {
        delimiters: [
          {left:'$$', right:'$$', display:true},
          {left:'$', right:'$', display:false},
          {left:'\\(', right:'\\)', display:false},
          {left:'\\[', right:'\\]', display:true}
        ],
        throwOnError:false,
        strict:false,
        ignoredTags:['script','noscript','style','textarea','pre','code','canvas','svg'],
        ignoredClasses:['no-katex']
      });
    }
    document.addEventListener('DOMContentLoaded', doRender);
    document.addEventListener('astro:page-load', doRender);
    document.addEventListener('astro:after-swap', doRender);
    setTimeout(doRender, 800);
    setTimeout(doRender, 2000);
  })();
</script>
```

Removed per-page loaders from:
- `src/components/PlaygroundShell.astro` (now clean)
- `src/pages/playground/double-pendulum.astro`
- `src/pages/playground/voice-coil-thermal-compression.astro`

---

## Why equations still appear raw (hypothesis)

1. **CDN load failure in production:** Vercel CSP or ad-blocker blocking `cdn.jsdelivr.net`. Check browser console → Network tab for `katex.min.js` 200 or blocked. If blocked, switch to self-hosted via npm: `npm i katex` and import.

2. **Entity decoding timing:** `renderMathInElement` uses `textContent`, which should have decoded `&#123;` → `{`. But if Astro outputs double-escaped `&amp;#123;`, KaTeX sees literal `&#123;` and fails to parse `\frac&#123;`. Need to inspect live HTML source → View Source for `acoustic-calculators` — does it say `\frac&#123;` or `\frac{`? If it says `&#123;` in source, browser should decode, but check.

3. **ClientRouter (View Transitions) timing:** `astro:page-load` may fire before CDN scripts loaded (defer). Our 800ms/2000ms retry should catch, but if scripts fail, never renders.

4. **IgnoredTags or early return:** Our check `if(root.innerHTML.indexOf('$')===-1)` — but `innerHTML` contains encoded entities, still `$` present, so should pass.

5. **Existing raw $$ lines are in files that were NOT rewritten with new prose but had legacy math:** e.g., `acoustic-calculators.astro:416` already had `$$ L_p = ... $$` before our rewrite, and our escaping script converted its braces but maybe left `<` issues. Need to verify that file's final HTML actually matches.

---

## What the next frontier LLM should do (actionable)

### Option A — Quick fix (client-side, keep current files)

1. Open production site in incognito, DevTools → Console. Check for:
   - `KaTeX render error`
   - Failed GET `katex.min.js` or `auto-render.min.js`
   - `renderMathInElement is not defined`

2. If CDN blocked:
   - `npm i katex@0.16.11`
   - In `Layout.astro`, replace CDN links with local import:
     ```astro
     import 'katex/dist/katex.min.css';
     ```
   - And client script: `import katex from 'katex'; import autoRender from 'katex/dist/contrib/auto-render';` — use `client:only` component or inline module.

3. If entities not decoding:
   - Instead of `&#123;`, use a different Astro-safe escape: Wrap math in `<span set:html={"$$\\frac{a}{b}$$"}></span>` or use `{@html}`-like pattern. Astro's `set:html` takes JS string, braces inside are not parsed as Astro expressions. So you can write raw LaTeX with real `{` inside `set:html`.
   - Example refactor:
     ```astro
     <p set:html={`$$ L_p = 20 \\log_{10} \\left| \\frac{p}{p_0} \\right| $$`}></p>
     ```
   - This avoids entity hack entirely. Need to convert all math blocks to `set:html` or to a `<Math>` component.

4. Test in `npm run dev`, inspect `localhost:4321/playground/acoustic-calculators` → View Source → search `L_p` — ensure final HTML contains `{` not `&#123;`, and that `katex` CSS makes equations styled.

### Option B — Robust server-side rendering (recommended for PhD-level site)

1. Install: `npm i katex remark-math rehype-katex` (or use `astro-katex` integration)
2. Create component `src/components/Math.astro`:
   ```astro
   ---
   import katex from 'katex';
   const { math, display } = Astro.props;
   const html = katex.renderToString(math, { displayMode: !!display, throwOnError:false });
   ---
   <span set:html={html} class={display ? 'katex-display' : 'katex-inline'} />
   ```
3. Then in playground files, replace every `$...$` and `$$...$$` with:
   ```astro
   ---
   import Math from '../../components/Math.astro';
   ---
   <Math math="L_p = 20 \log_{10} \left| \frac{p}{p_0} \right|" display={true} />
   ```
   This eliminates client-side auto-render entirely, renders at build time, no CDN dependency, no Astro parser collision (math string is inside JS prop, braces safe).

4. For existing files with many equations, write a script to auto-convert `$$...$$` → `<Math display>` and `$...$` → `<Math>`.

5. Keep KaTeX CSS in Layout, remove auto-render JS.

6. Verify `astro check` and `astro build` still 0 errors.

### Files to audit for math

- `src/pages/playground/*.astro` — all 27 files now contain $ math (grep)
- `src/layouts/Layout.astro` — global loader lives here
- `src/components/PlaygroundShell.astro` — now clean, should stay clean
- `src/pages/playground/acoustic-calculators.astro:416` — the specific L_p line user screenshot
- `src/pages/playground/voice-coil-thermal-compression.astro`, `double-pendulum.astro`, `fourier-epicycles.astro`, etc. — all have many $$ blocks

### Verification checklist for next LLM

- [ ] `grep -R "\$\$" src/pages/playground/*.astro | wc -l` — count math blocks
- [ ] `npm run dev` → open `/playground/acoustic-calculators` → Inspect → Console → `window.katex` exists?
- [ ] Network tab → `katex.min.css` 200?
- [ ] View Source → search `L_p` → does source contain `{` or `&#123;`? Does rendered DOM show styled `.katex` span or raw `$$` text?
- [ ] Run `npm run build` → check `dist/client/playground/*/index.html` for `class="katex"` or raw `$$`
- [ ] If using Option B, remove CDN scripts from Layout and use server component

---

## Context: Playground quality bar after rewrite

All playground prose now aims for:

- No "toy" anywhere (`\btoy\b` grep → 0)
- Voice: confident, punchy, Feynman/3Blue1Brown, em-dashes sparingly, no filler phrases
- Structure per tool: Hook (why interesting) → Intuition (analogy) → Math (governing equations, variable breakdown) → Play Guide (what to try, what to look for) → Honesty (what is exact vs simplified)
- Equations: beautiful block `$$` and inline `$`, with `&#123;` escaping workaround (should be migrated to Option B)

The simulation engines themselves were untouched (Web Workers, Canvas2D/WebGL, fixed-step RK4, Yoshida symplectic, Crank-Nicolson, D2Q9 LBM, Biot-Savart, etc.) — only prose upgraded.

---

## Immediate next steps (15 min)

1. `git pull` latest `main` (includes 07f3fd0 KaTeX global move)
2. `npm run dev` → open `http://localhost:4321/playground/acoustic-calculators`
3. Open DevTools → Console → check for KaTeX errors
4. If raw $$ still visible, apply Option B (Math.astro server component) — most robust for production
5. `npm run check` → 0 errors, commit, push

---

**Contact:** This handoff generated by OpenCode after completing tone eradication and full prose rewrite. The remaining issue is purely rendering pipeline, not content quality. The next LLM should prioritize fixing KaTeX delivery (CDN vs npm + server render) and verifying entity decoding.
