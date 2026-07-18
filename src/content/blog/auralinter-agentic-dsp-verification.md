---
title: "The part of an agentic coding loop that actually matters is the part that isn't the LLM"
description: "Building AuraLinter's DSP generation loop: why RAG-grounded retrieval and a real clang++ verifier catch a hallucinated biquad formula that a single LLM call doesn't, and why this is the one MakerPortal app that isn't fully on-device."
publishedAt: 2026-07-17
draft: false
tags: [auralinter, langgraph, dsp-audio, agentic]
eyebrow: "Field note / AuraLinter"
readingTime: "5 min read"
---

"Agentic" gets used loosely enough that it's worth being specific about what it actually buys you over a single well-prompted LLM call. [AuraLinter](https://auralinter.makerportal.ai) records audio, generates a C++ DSP kernel for whatever the user asked for, and — the part that's actually load-bearing — verifies that kernel against a real compiler and a stability check before it's accepted. Five nodes: record → retrieve → generate → verify → iterate.

## The verifier is a compiler, not a vibe check

The generator node doesn't write C++ from a blank prompt. Retrieval runs first — a vector store of roughly 1200 chunks pulled from the RBJ Cookbook, Oppenheim's *Discrete-Time Signal Processing*, Smith's DSP guide, and Biquadia's own Metal kernels — and the generation prompt is constrained to output Direct-Form-II-Transposed C++ with normalized coefficients and an explicit stability invariant. Then it actually gets checked:

```
$ clang++ -O2 -std=c++20 -I./dsp -c biquad.cpp -o biquad.o
$ ./verify_biquad --freq 1000 --q 0.707 --fs 48000
[PASS] magnitude -3.01 dB @ fc (expected -3dB)
[PASS] stability: poles |p|=0.98 <1
[PASS] DF2T state bounded
→ kernel accepted
```

That verification step exists because it catches a real, specific failure mode: asked to derive a biquad coefficient set unsupervised, an LLM alone will confidently produce `alpha = Q * sin(w0)` — inverted from the correct `alpha = sin(w0) / (2*Q)`. It reads as plausible C++. It compiles. It's wrong. Grounding the generator in retrieved RBJ formulas cuts that down significantly, but the actual backstop is the harness: a wrong coefficient shows up as the wrong -3dB point or an unstable pole radius, not as a subjective code-review judgment call.

## The loop earns its name on the case that fails first

Lowpass and peaking filters pass on the first attempt — the retrieval is strong enough that there's nothing to iterate on. A 64-tap Hilbert transformer is a better test, because it fails the way a real DSP engineer would expect it to: an even-length linear-phase Hilbert design has a non-zero response right at Nyquist, which the verifier catches as a parity/DC-gain failure. The graph routes that failure back to the generator with the compiler/harness error appended, and the corrected attempt — a 63-tap design (the `4n+3` length real Hilbert designs need), built via Remez exchange — passes. That's the actual difference an agentic loop is supposed to provide over a single-shot call: not a better first answer, but a real failure that produces a real second attempt.

## Two more things worth knowing

- **This is the one MakerPortal app that isn't fully on-device, and that's disclosed rather than hidden.** Recorded audio is staged temporarily server-side and the agent's trace streams back over SSE — the codegen and retrieval steps need more than a phone can currently run. No analytics SDKs, no cookies, and the backend is optionally self-hostable, but this is a real, named exception to the rest of the studio's on-device-first posture, not something folded quietly into marketing copy.
- **The retrieval corpus includes the studio's own shipped code, not just textbooks.** Biquadia's Metal kernels are indexed alongside RBJ/Oppenheim/Smith, so a generated kernel has to be consistent with what AuraLinter's sibling app already ships — not just correct in isolation against a textbook formula.

Want to click through the actual loop instead of reading about it? The [agentic DSP pipeline step-through](/playground/agentic-dsp-pipeline) runs all three scenarios above — lowpass, peaking, and the Hilbert filter that needs a second attempt — with the same retrieval hits, generated code, and verification logs. The [DSP snippet pack](/shop) in the shop packages real kernels from both AuraLinter's loop and Biquadia together, for anyone who wants the code directly.
