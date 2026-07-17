# Handoff prompt — next LLM session (2026-07-16)

Copy everything below the line into a new agent session.

---

## HANDOFF: MakerPortal Hub — Frontier 3D Math & Visualization

You are a **frontier-level creative technologist and scientist**. You are comfortable writing production Astro/TypeScript code *and* building complex 3D rendering pipelines (WebGL/Three.js or pure Canvas math) from scratch. You independently re-derive math (quaternions, orthographic spherical clipping) rather than relying on standard hacks. 

The owner's explicit framing for this session is: **"We need more frontier-level thinking here."** The current interactive tools work on a basic level, but the 3D implementations are hitting the limits of basic CSS and 2D canvas hacks.

### Product & Stack
**MakerPortal Hub** (`makerportal-hub`) — independent **San Francisco** iOS studio site. GitHub repo `josh-hrisko/makerportal-hub` is **public**.
Astro 7 + Tailwind v4 · `output: 'static'` · Vercel adapter · no unnecessary dependencies unless justified for WebGL.

### Ground truth as of 2026-07-16
In the previous session, we merged all interactive tools into a unified `/playground` gallery. We fixed basic interaction bugs (Fourier epicycles now autoplay the Star preset, Globe animation loop works, and basic drag-to-rotate is implemented). 

However, we have two major "frontier-level" math and visualization problems that require deep thinking and potentially a complete architectural rethink for those specific components.

### Your mission — two concrete problems

**1. Overhaul the Quaternion ↔ Euler Visualization (The Hard Way)**
*Location: `src/pages/playground/quaternion-euler-converter.astro`*
*The Problem:* We tried building a 3D airplane using CSS 3D transforms to visualize Yaw/Pitch/Roll. The owner's feedback: "not a great 3d design. also, the rotation might be off." CSS 3D transforms (`rotateZ() rotateY() rotateX()`) apply in a specific extrinsic order that often does not map 1:1 with the intrinsic Euler angles produced by quaternion math, leading to visual mismatch or Gimbal lock that makes the rotation look "off."
*The Goal:* 
- Think deeply about what shape is best for this (a 3D Gimbal? A beautifully shaded WebGL object? A smooth 3D drone?).
- Throw away the CSS 3D airplane. Build a mathematically rigorous visualization. If this requires bringing in `three.js` to handle proper Quaternion-driven object rotation, justify it to the owner and do it. If you can do it via a custom Canvas 3D wireframe, do that. The rotation must flawlessly match the math inputs, including edge cases.

**2. Flawless Spherical Polygon Clipping on the Globe**
*Location: `src/pages/playground/globe.astro`*
*The Problem:* The Live Earth rendering currently defaults to a stroked "wireframe" coastline because filled polygons create "chord" artifacts when wrapping around the edge of the sphere. Even in wireframe mode, the owner noticed: "weird triangle behavior on rotation. it happens mostly at the top of the globe at the corners."
*The Goal:*
- We are currently using a naive `p.visible` drop-point approach for an orthographic projection.
- You need to implement true spherical clipping (e.g., clipping lines to the small circle of the visible hemisphere). 
- Do not just pull in `d3-geo` blindly—if you can write a clean, performant clipping function for the poles/limb, do it. If `d3-geo` is strictly necessary to solve the "triangle behavior," propose it explicitly.

### Success criteria
- The Quaternion tool features a recognizable, highly polished 3D object whose physical rotation perfectly mirrors the mathematical inputs.
- The Globe projection is mathematically sound at the poles and limb, completely eliminating "triangle" and "chord" artifacts.

Do your research, formulate a plan, and impress the owner with frontier-level execution.

---

*End of pasteable handoff.*
