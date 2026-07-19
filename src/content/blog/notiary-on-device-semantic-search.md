---
title: "What it actually takes to run semantic search entirely on-device"
description: "Notiary's local semantic brain: converting a sentence-transformer to CoreML, why storage math is deterministic once you know the embedding dimension, and the fixed-length-input problem long notes run into."
publishedAt: 2026-07-17
draft: false
tags: [notiary, popcloset, coreml, on-device-ai]
eyebrow: "Field note / Notiary"
readingTime: "4 min read"
---

"Semantic search" almost always means an API call — embed the query server-side, compare it against vectors sitting in a hosted index, ship the results back. [Notiary](https://notiary.makerportal.ai) doesn't have a server in that loop at all: it's a markdown workspace where every note gets embedded and indexed on-device, fully offline. That constraint changes which parts of "add semantic search" are actually hard.

## The model has to run through CoreML, not just exist as a checkpoint

Notiary's embedding model is MiniLM-L6-v2, a small sentence-transformer that outputs 384-dimensional vectors — a reasonable choice precisely because it's small enough to convert and run through CoreML rather than a Python runtime. Getting there means taking the model out of its native framework, converting it to CoreML's format, and quantizing the weights — the same category of "no cloud dependency" tradeoff that shows up everywhere else in the on-device pillar: PopCloset's `MobileNetV4` outfit parser runs the same way, through `CoreML Vision`, so it can categorize clothing and pull color palettes without a photo ever leaving the phone. The interesting cost isn't inference speed at that point, it's making the model small enough to ship in the app bundle at all without the download size becoming its own UX problem.

## Storage is deterministic math, once you know the dimension

A 384-dimensional embedding stored at fp16 is 384 × 2 bytes — 768 bytes per note, before any index overhead. Notiary's real on-device index sits around 28 MB, which at that per-vector cost is on the order of tens of thousands of note embeddings — the exact count depends on index overhead and metadata, but the point is that it's arithmetic, not a mystery. This is the same "deterministic bytes, not latency guesswork" approach behind the [CoreML model size calculator](/playground/coreml-model-size-calculator): plug in a parameter count and quantization scheme and get an exact footprint, because unlike latency (which depends on ANE scheduling, thermal state, and op mix), storage size is just multiplication.

## Two things that matter for on-device search specifically

- **Cosine similarity needs L2-normalized vectors.** Compare two embeddings without normalizing first and the "closest" match can be a longer note that happens to share more raw magnitude, not the note that's actually most semantically similar. Normalizing once at embedding time is cheap; skipping it produces search results that are wrong in a way that's easy to miss in casual testing and obvious once you have a large note collection.
- **A transformer has a fixed input length, and notes don't.** MiniLM-L6-v2, like most sentence-transformers, embeds a bounded number of tokens per pass. A note longer than that either gets silently truncated — losing everything past the cutoff to search — or has to be split into overlapping chunks and embedded separately. The second approach is more work but is the only one that doesn't quietly make half a long note unsearchable.

None of this is about making the model faster. It's about the specific arithmetic and preprocessing choices that come from putting the entire embedding-and-search pipeline on the device instead of behind an API — the same tradeoff PopCloset makes for vision instead of text, and the one Notiary's own "entirely offline" claim rests on.

Want to inspect the retrieval side directly? The [Vector Retrieval Recall Lab](/playground/vector-retrieval-recall-lab) generates a local synthetic corpus and measures exact cosine against a disclosed coarse index, so recall loss stays visible instead of becoming a provider claim. The [CoreML Offline Classifier Starter](/shop) packages the model-side pattern; for everything else in [`on-device-ai`](/journal), the byte math above applies to any embedding model you're sizing for a phone, not just this one.
