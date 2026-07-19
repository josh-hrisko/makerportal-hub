---
title: "ElevenLabs + Web Audio streaming latency: measure the path, not one stopwatch"
description: "A practical browser latency ledger for ElevenLabs text-to-speech, Web Audio scheduling, DSP, and output—plus the mistakes that make a fast demo sound broken."
publishedAt: 2026-07-19
draft: false
tags: [elevenlabs, web-audio, dsp-audio, latency]
eyebrow: "Field note / Voice infrastructure"
readingTime: "7 min read"
faq:
  - question: "Does the MakerPortal voice sandbox send text to ElevenLabs by default?"
    answer: "No. It starts with an offline toy formant synthesizer. The browser contacts ElevenLabs only after you select that source, provide your own key, and run synthesis."
  - question: "Should browser TTS latency be reported as one number?"
    answer: "No. Report provider time to first byte and total response time separately from decode, scheduling, Web Audio base latency, and device output latency."
  - question: "Why can streamed speech still click or stutter?"
    answer: "Network chunks do not arrive on an audio clock. Decode or convert them to PCM, then schedule each buffer against one monotonically increasing AudioContext time with a small disclosed jitter margin."
---

The easiest browser TTS demo is also the easiest one to benchmark badly: start a stopwatch before `fetch()`, stop it when sound comes out, and publish the result as “latency.” That number combines a provider queue, network travel, response encoding, browser decode, your own buffering policy, Web Audio scheduling, and the output device. It tells you that the whole path felt slow. It does not tell you what to fix.

The better approach is a latency ledger. Measure boundaries you control, label boundaries you only observe, and never turn a single run on one laptop into a provider-wide claim.

## Start with two pipelines, because they answer different questions

Our [Voice Synthesis DSP Sandbox](/playground/elevenlabs-dsp-sandbox) intentionally starts with a toy formant voice generated in the browser. That path proves the Web Audio graph, recorder, waveform, spectrogram, and DSP controls without a network or API account. It is speech-like, not ElevenLabs output, and the page says so.

When you opt into the BYO-key path, the current interactive control makes a normal text-to-speech request and decodes the returned MP3 before playback. That gives honest provider response and full-file decode measurements. The production code further down the page shows a different design: incrementally schedule PCM arriving over a WebSocket. ElevenLabs documents both [streaming text-to-speech](https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/streaming) and a [latency optimization path](https://elevenlabs.io/docs/api-reference/reducing-latency) for interactive applications.

Do not compare those two paths as if they were the same benchmark. Full-response MP3 answers “how long until I have this complete utterance?” Streaming PCM answers “how soon can I begin stable playback while text may still be arriving?”

## The browser latency ledger

I record at least these boundaries:

1. **Request start → first response byte.** This is the observable provider/network TTFB. It includes connection reuse, route, provider queue, model startup, and the beginning of synthesis. It is not pure inference time.
2. **Request start → response complete.** Useful for file export and for understanding whether generation keeps pace with playback.
3. **Response complete → decoded buffer ready.** This is browser codec work for the full-response path. For a PCM stream, replace it with per-chunk conversion time.
4. **Buffer ready → scheduled start.** This is your buffering policy. Hiding it inside “network latency” makes the network look guilty for your own jitter margin.
5. **Web Audio graph latency.** `AudioContext.baseLatency` describes the context's processing path when the browser exposes it; `outputLatency` can add an estimate for the output device. Availability varies, so an absent value should stay absent.
6. **Post-DSP health.** Peak level, clipping, and underruns matter. A low TTFB followed by discontinuities is not a low-latency success.

A minimal measurement envelope looks like this:

```ts
const requestStarted = performance.now();
const response = await fetch(url, options);
const firstHeaders = performance.now();
const bytes = await response.arrayBuffer();
const responseComplete = performance.now();
const decoded = await audioContext.decodeAudioData(bytes.slice(0));
const decodeComplete = performance.now();

console.table({
  responseHeadersMs: firstHeaders - requestStarted,
  responseTotalMs: responseComplete - requestStarted,
  decodeMs: decodeComplete - responseComplete,
  webAudioBaseMs: audioContext.baseLatency * 1000,
  outputEstimateMs: audioContext.outputLatency
    ? audioContext.outputLatency * 1000
    : null,
});
```

For a streaming response, `response.headers` is not necessarily the first audio byte. Instrument the first non-empty reader chunk or first WebSocket audio message instead.

## Network chunks are not an audio clock

The browser may receive two chunks almost together and the next one late. Calling `source.start()` immediately for each decoded chunk turns that arrival jitter into gaps and overlaps. The stable pattern is to keep one scheduling cursor in `AudioContext.currentTime`:

```ts
let nextStart = 0;
const startupMargin = 0.08; // policy, not measured network time

function schedulePcm(samples: Float32Array, sampleRate: number) {
  const buffer = audioContext.createBuffer(1, samples.length, sampleRate);
  buffer.copyToChannel(samples, 0);

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(dspInput);

  const earliest = audioContext.currentTime + startupMargin;
  nextStart = Math.max(nextStart, earliest);
  source.start(nextStart);
  nextStart += buffer.duration;
}
```

That `80 ms` value is an example policy in the snippet, not a universal recommendation or benchmark result. Measure underruns on the networks you support, then choose and disclose the smallest margin that survives them.

## DSP changes the experience even when it barely changes compute time

The sandbox routes audio through a bandpass, feedback echo, procedural RT60 convolution reverb, and—only for buffered sources—playback-rate pitch resampling. Web Audio nodes run on the browser's audio rendering thread, so a lightweight graph will usually be dominated by the output buffer rather than JavaScript work. That still does not make the DSP “free.” Long convolution responses consume more work, feedback can run away, and clipping can ruin intelligibility before a timing chart notices anything.

This is why the page's aha moment requires sustained clean post-DSP playback, not merely a successful API response. The recorder also taps the post-DSP chain. A free WAV adds a clearly disclosed tone at the end; a clean export removes it after the local soft gate.

## Privacy is part of the architecture, not footer copy

The default source is offline. A BYO ElevenLabs key is stored in that browser's `localStorage` and sent directly to `api.elevenlabs.io` only when the user requests synthesis; MakerPortal has no proxy that receives it. Local interaction events contain the simulator id and coarse action, never the key, prompt text, voice id, or email. Clearing site data removes the stored key.

For a production app, a browser-visible provider key is still the user's own credential and should be treated accordingly. If you operate a shared service, put the provider credential behind your own authenticated, rate-limited backend and publish the retention path. Do not disguise a shared secret in bundled JavaScript.

## FAQ

### Does the sandbox send text to ElevenLabs by default?

No. It starts with the offline formant source. The provider is contacted only after you choose ElevenLabs, add your own key, and run synthesis.

### Should browser TTS latency be one number?

No. Separate provider TTFB and total response time from browser decode, scheduling policy, Web Audio base latency, and output-device latency.

### Why can streamed speech still click or stutter?

Chunks arrive according to the network, not the audio clock. Convert them to audio buffers and schedule them against one increasing context-time cursor with a measured jitter policy.

The fastest way to make this concrete is to [run the DSP sandbox](/playground/elevenlabs-dsp-sandbox), listen to the graph, and export the measurement envelope. For the other side of MakerPortal's voice stack—generated DSP that must pass a real compiler and stability harness—step through [AuraLinter's verification loop](/playground/agentic-dsp-pipeline).

More voice tooling lives in [Resources · Gear](/resources#gear) and the full [Playground catalog](/playground) — the [Voice Synthesis Workstation kit](/playground/elevenlabs-dsp-sandbox) lists the physical mic/monitor/interface side of this pipeline under the same Gear cap.
