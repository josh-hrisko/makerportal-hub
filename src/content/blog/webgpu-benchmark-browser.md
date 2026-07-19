---
title: "How to build a WebGPU benchmark in the browser without lying to yourself"
description: "A verification-first WebGPU benchmark methodology: warm-up, queue completion, CPU cross-checks, honest FLOP accounting, browser fallbacks, and cloud crossover math."
publishedAt: 2026-07-19
draft: false
tags: [webgpu, wgsl, gpu, benchmarking, modal]
eyebrow: "Field note / GPU deployment"
readingTime: "8 min read"
faq:
  - question: "Can a browser WebGPU GFLOPS result be compared directly with a vendor peak number?"
    answer: "No. A browser result measures one shader, data type, shape, driver path, and timing envelope. Vendor peak numbers describe different assumptions and are not a validation target."
  - question: "How do you prove a WebGPU benchmark actually computed the result?"
    answer: "Use deterministic nonzero inputs, read back selected outputs, and compare them with a CPU reference before reporting throughput. Discard the run when verification fails."
  - question: "What should happen when navigator.gpu is unavailable?"
    answer: "Render a clear compatibility state and keep independent controls usable. Do not throw during page initialization or replace missing measurements with estimates."
---

A WebGPU benchmark can produce an impressive number while measuring almost nothing useful. Time pipeline compilation once and call it inference. Submit work without waiting for the queue. Multiply a nominal operation count by loops the optimizer removed. Compare one browser shader with a GPU vendor's theoretical peak. Or show a polished cloud bar before anyone ran the endpoint.

Our rule is less exciting and more useful: no bar until a run happened, no throughput until a CPU reference agrees, and no claim that a matrix multiply is the same thing as a model.

You can inspect that rule in the [Client vs Serverless GPU Benchmarker](/playground/modal-gpu-benchmarker).

## What the browser result actually means

The lab dispatches a WGSL matrix multiply using dimensions drawn from the Whisper-tiny encoder width. The arithmetic for a dense matrix multiply is:

```text
FLOPs = 2 × M × K × N × iterations
GFLOPS = FLOPs / elapsed_seconds / 1e9
```

The factor of two counts one multiply and one add. This is a conventional operation-count model, not a hardware counter. The reported result is sustained throughput for this shader, shape, precision, browser, driver, power state, and timing method.

It is not:

- the device's theoretical peak;
- a complete Whisper inference benchmark;
- a promise about another browser on the same hardware;
- a stable device fingerprint that should be uploaded somewhere.

The WebGPU specification defines `GPUQueue.onSubmittedWorkDone()` as resolving after work submitted up to that point is complete. The current [W3C WebGPU specification](https://www.w3.org/TR/webgpu/) is the right contract to build around. Time around queue completion, not around `queue.submit()` alone.

## Warm up the thing you intend to time

Shader compilation, pipeline creation, buffer allocation, and the first driver submission can all dominate a short run. A useful compute measurement separates setup from steady execution:

1. Request the adapter and device.
2. Create the shader module, pipeline, bind group, and buffers.
3. Submit one or more unreported warm-up passes.
4. Start the wall timer.
5. Submit the measured passes.
6. Await `device.queue.onSubmittedWorkDone()`.
7. Stop the timer, then verify output.

If you need device-side timing and the adapter exposes timestamp queries, treat that as a separate measurement mode. Chrome documents that timestamp queries may be quantized for privacy because more precise GPU timing increases fingerprinting and timing-attack risk. Its [developer-features guidance](https://developer.chrome.com/docs/web-platform/webgpu/developer-features) explicitly warns against weakening that protection in production. The lab deliberately uses the portable queue-completion envelope instead of asking visitors to change browser security flags.

## Verification is the benchmark's load-bearing wall

An all-zero input can make an accidental no-op look correct. A huge random reference can make verification slower than the GPU test. The practical middle ground is deterministic nonzero inputs and a small selection of output cells computed on the CPU:

```ts
function cpuCell(a: Float32Array, b: Float32Array, row: number, col: number, k: number, n: number) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += a[row * k + i] * b[i * n + col];
  return sum;
}
```

Read back those same cells. Compare with a tolerance appropriate for floating-point accumulation order. If the check fails, display the failure and discard the throughput. A red failed run is more valuable than a fast false bar.

This mirrors the part of [AuraLinter](/playground/agentic-dsp-pipeline) that matters most. The generator can produce plausible C++; acceptance happens only after the compiler and DSP harness say the output behaves correctly. The proposed Modal backend is not there to make the architecture diagram look “cloud.” It is there to isolate and run verification workloads that should not execute inside an iOS process.

## Browser support is a state, not an exception

Feature-detect `navigator.gpu`, then check whether an adapter and device are actually available. MDN currently marks `Navigator.gpu` as limited availability and requires a secure context. Safari added WebGPU in Safari 26; WebKit describes its Metal mapping and WGSL safety model in the [Safari 26 release notes](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/). That history is useful, but feature detection remains the product contract.

```ts
if (!navigator.gpu) {
  showCompatibilityMessage();
  keepRemoteBenchmarkControlsEnabled();
  return;
}

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  showCompatibilityMessage();
  return;
}
```

The important UX detail is the third line: a missing local GPU must not break the independent serverless-endpoint controls. Missing data stays missing. It does not become an estimate.

## Cloud crossover requires three different clocks

The Modal side reports GPU compute time from inside the function. The browser separately measures end-to-end request wall time. A ping to the same deployed function and container pool helps show warm/cold behavior, but it is not a universal network RTT: it includes the endpoint runtime's request handling.

Modal's current web-function documentation uses `@modal.fastapi_endpoint`, supports `method="POST"`, and notes that a request with no active container experiences a cold start. See the official [Web Functions guide](https://modal.com/docs/guide/webhooks). One endpoint should handle both ping and benchmark requests so the comparison does not accidentally measure two different autoscaling pools.

If local sustained rate is `R_local`, cloud sustained rate is `R_cloud`, and measured fixed remote overhead is `t_fixed`, the compute-only crossover is:

```text
F* = t_fixed × R_local × R_cloud / (R_cloud − R_local)
```

Only compute it when `R_cloud > R_local` and every input was measured in the current session. Label whether `t_fixed` came from a warm ping or from end-to-end wall minus endpoint-reported compute. Those are different envelopes.

## FAQ

### Can browser GFLOPS be compared directly with a vendor peak number?

No. It is one sustained shader path with a specific shape and timing envelope. A vendor peak assumes different instructions, occupancy, clocks, and often precision.

### How do you prove the GPU computed the answer?

Use deterministic nonzero inputs, read selected results back, compare them with a CPU reference, and refuse to report the run when verification fails.

### What happens without WebGPU?

Show a compatibility state and keep unrelated controls usable. Never turn missing browser support into a guessed bar.

Run the [browser benchmark](/playground/modal-gpu-benchmarker) to see the chart stay empty until you submit work. The page includes the current deployable Modal function, but deployment remains BYO-workspace so no shared credential or unmetered public GPU endpoint ships in this static site.

Related surfaces: [Resources · Gear](/resources#gear) groups the Jetson/Pi bench hardware used to reproduce this tradeoff on device, and [/playground](/playground) collects the broader WebGPU and on-device AI lab list — including the [PINN training studio](/playground/webgpu-pinn-studio) for the GPU compute side.
