---
title: "Inside Biquadia: a serious audio lab that stays on-device"
description: "How privacy, real-time constraints, and the character of physical sound shaped MakerPortal’s newest release."
publishedAt: 2026-06-28
draft: false
tags: [biquadia, audio, engineering]
eyebrow: "Build log / 004"
readingTime: "5 min read"
---

Biquadia began with a simple tension: professional audio tools are powerful, but they often assume a studio desk, a laptop, and time to configure the environment. The phone already has microphones, accelerometers, serious compute, and an extraordinary display. What would an audio laboratory look like if it began there?

The answer was not to shrink desktop software. It was to build around the device’s actual strengths.

## Real time changes everything

Audio code has a hard deadline. If a frame arrives late, the interface cannot hide it with a loading state. The result is audible.

That constraint shaped the architecture: a focused native interface around a C++ DSP core, careful separation between real-time work and presentation, and measurement tools that remain useful without destabilizing the signal path.

## Privacy as an architectural choice

Microphone data is unusually intimate. Biquadia processes it locally and keeps analysis on-device. That decision reduces the surface area of the system while making the product more trustworthy.

It also makes the experience more immediate. No upload, no round trip, no dependency on a server remaining available. The instrument responds because the instrument is already in your hand.

## A tool should invite depth

Biquadia is technical by design, but technical does not have to mean hostile. The interface exposes serious concepts—spectra, filters, spatial processing, dynamics—through a system meant to reward exploration.

The larger experiment is whether expert capability and a welcoming surface can occupy the same product. Biquadia is our current answer.
