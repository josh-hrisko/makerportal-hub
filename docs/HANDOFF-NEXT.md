# Handoff prompt — next LLM session (2026-07-17)

Copy everything below the line into a new agent session.

---

## HANDOFF: Critical audit of the quaternion ↔ Euler converter page

You are a **skeptical technical editor and product critic**, not a cheerleader. Your job this session is to find what's wrong, weak, or amateurish on one specific page — not to congratulate the previous session's work. Assume there are real bugs, real writing tells, and real missed opportunities still in there, because the previous session found several of exactly those things on its own supposedly-finished work, more than once, in a single sitting.

### Product & stack
**MakerPortal Hub** (`makerportal-hub`) — independent San Francisco iOS studio site. GitHub repo `josh-hrisko/makerportal-hub` is **public**. Astro 7 + Tailwind v4 · `output: 'static'` · Vercel adapter · no unnecessary dependencies.

### Page under review
`src/pages/playground/quaternion-euler-converter.astro` — a quaternion↔Euler angle converter: two live converter panels, a Three.js 3D orientation preview, an educational "math and physics" section (axis-angle, gimbal lock, quaternion composition, an Euler-vs-quaternion comparison table), copyable Swift code, an FAQ section with schema, and a "Gear" affiliate section.

### Ground truth as of 2026-07-17 (what already happened, so you don't redo it blind)
This page went through several full redesigns in one long session, each triggered by the owner rejecting the previous result on sight:
- 3D object: abstract blob → aerodynamic missile (fins, wordmark livery, roll-index markers) → procedural "mannequin head" (rejected: **"looks like a balloon creation, massively uncanny"**) → final: a **real sculpted-head GLTF asset** loaded via `GLTFLoader` (Sketchfab, "Practice Head Sculpt" by OverlyWiseBat, Standard license — attribution linked on-page to `sketchfab.com/3d-models/practice-head-sculpt-...`), decimated via `gltf-transform optimize` from 7.9MB/185k verts to 520KB/~18k verts with no visible quality loss, reoriented via an explicit basis-matrix remap to the page's own frame convention, finished in a **deliberately synthetic matte brand-blue** (`#3E6C99`, not a realistic skin tone) specifically to avoid the uncanny valley rather than chase realism. Model asset lives at `public/models/practice-head-sculpt.glb`.
- Two real math/engineering bugs were found and fixed mid-session, both written up in `docs/DECISIONS.md` (**D-020**, **D-021**): (1) the drag-to-roll interaction composed quaternions extrinsically when roll specifically needed to be intrinsic (body-frame) — verified with an actual before/after numeric displacement check, not just eyeballing it; (2) a `TorusGeometry` was rotated around the wrong axis while building fin/ear rims, which only spins a ring's gap position rather than reorienting the ring's plane.
- Frame convention (locked, foundational to every rotation-reading claim on the page): **+X = forward/face, +Y = left, +Z = up**, camera positioned behind the object looking at its back at the mathematical 0° orientation. The page currently *defaults* to 180° yaw (face-forward, friendlier first impression) via changed default input values, while a separate "Reset to 0°" button still returns to the true mathematical zero (looking from behind) to keep the teaching copy about "at 0° you're looking from behind" accurate.
- Affiliate links: a "Gear" section renders real, pre-existing entries from `src/data/affiliate-links.json` (AirPods Pro, MPU9250 IMU, Arduino Uno — extended their `relatedTo` tags to this page rather than inventing new products), plus 2–3 inline contextual links in the prose. New candidate products (MPU6050, a math textbook) were added to `docs/AFFILIATE-CANDIDATES.md` as *unconfirmed suggestions*, not shipped — this repo has a **hard no-fabrication policy** for affiliate/monetization content (see `docs/MONETIZATION.md` and D-011/D-015 in `docs/DECISIONS.md`): never invent a product, price, testimonial, or usage claim; new picks go through `AFFILIATE-CANDIDATES.md` for human confirmation before they can go live.
- A page-wide layout bug was found (two sections used `max-w-[66rem]` while every other section used `max-w-[88rem]`, visibly misaligning them) and a canvas/attribution-caption alignment bug (a caption was a sibling of a wide flex container instead of grouped with the element it was meant to sit under). Both fixed. **Assume more alignment/consistency bugs like this exist elsewhere on the page** — this class of bug was found twice already by just looking carefully.

### Your mission

**1. Critical audit of the whole page — not just the 3D preview.** Go through every section (live preview, both converter panels, the "math and physics" deep-dive, the two gotchas, the Swift code blocks, the FAQ, the Gear section) looking for: factual/mathematical errors, UX friction (confusing controls, unclear copy, broken or awkward responsive layout at a few different viewport widths), inconsistent visual rhythm, and anything that reads as unfinished or under-tested. Actually load the page in a browser and interact with it — don't just review the source.

**2. Engagement.** What would make a visitor stay longer, come back, or share this? Consider (don't just default to) things like: a shareable/deep-linkable state for a specific orientation, a concrete "try this" callout tied to a real bug story (there's a great one already — the roll-composition bug — is it being used to hook readers, or buried in a code comment?), better internal cross-links to the MotionLink field note and other playground tools, a stronger opening hook before the reader has to scroll to understand why this page exists.

**3. Monetization.** Read `docs/MONETIZATION.md` and `docs/AFFILIATE-CANDIDATES.md` first — know the actual constraints (no fabrication, human-confirm-before-ship, existing 50-item catalog in `affiliate-links.json`) before proposing anything. Is the current 3-item Gear section pulling its weight, or could it be better curated/placed? Are there other *already-owned, already-confirmed* products elsewhere in the catalog that genuinely fit this page's audience (iOS/motion/DSP/3D-math builders) that haven't been cross-linked here yet?

**4. Voice — make it read like a real published article, not an AI transcript.** This is the part most likely to need real editing, not just polish. Read the current prose closely for tells: em-dashes doing the work of periods in almost every paragraph, "it's not just X — it's Y" constructions, hedge words papering over a claim ("arguably," "essentially," "in practice"), sentences that all resolve into a tidy summary clause, forced-analogy paragraphs that over-explain the analogy right after making it, list-like transitions ("Given X, let's Y"). Compare it against real technical writing you know well (a Wikipedia math article that's actually well-written, a real engineering blog post, a paper abstract) and rewrite passages so they sound like a domain expert wrote them because they had something to say, not because a prompt asked for an explanation. Don't just trim words — change the rhythm and the confidence of the claims.

### What NOT to break
- The quaternion math itself (Swift + JS) was independently verified term-by-term against the canonical Z-Y′-X″ Tait-Bryan reference — it's correct. Don't "fix" it without re-deriving and re-verifying, and don't take "it looks off" at face value without checking the frame convention first (multiple apparent bugs this session turned out to be misread conventions, not math errors).
- The intrinsic/extrinsic roll fix (D-020) and the frame convention (+X forward / +Z up / camera behind at 0°) are load-bearing for the whole page's teaching narrative — changing them invalidates the "math and physics" section's own examples.
- Don't remove the Sketchfab attribution/license note without re-reading the actual license terms yourself.
- No new affiliate products, prices, or usage claims without going through the confirm-before-ship workflow already established.

### Before you start
Run `npm run check` and `npx astro build` to confirm the page currently passes clean (it did as of the last commit, `164c894`) — if it doesn't, something regressed and that's your first finding, not a reason to route around it.

---

*End of pasteable handoff.*
