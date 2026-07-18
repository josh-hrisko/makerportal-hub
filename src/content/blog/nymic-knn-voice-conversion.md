---
title: "Why nymic needs no training step to learn a new voice"
description: "How kNN-VC voice conversion actually works: WavLM feature extraction, nearest-neighbor matching instead of a trained model, HiFiGAN vocoding, and why voice-bank coverage — not model size — is the real limiting factor."
publishedAt: 2026-07-17
draft: false
tags: [nymic, voice-conversion, onnx, dsp-audio]
eyebrow: "Field note / nymic"
readingTime: "4 min read"
---

Most voice-conversion approaches worth talking about — VAE- or GAN-based systems that learn a mapping to a specific target voice — need a training or fine-tuning pass per new voice, which is why "add a custom voice" in most tools means minutes of setup at best. [nymic](https://makersportal.com/apps/nymic) builds a new voice bank in under a minute, and the reason isn't a smaller model — it's a different technique entirely: kNN-VC, which does the conversion without training anything.

## There's no training step, which is the whole point

kNN-VC works by matching features, not by learning a speaker-specific mapping. A source utterance and a set of target-speaker reference recordings both get run through WavLM-Large, a self-supervised speech model, to produce a sequence of feature vectors per frame — no labels, no fine-tuning, just a forward pass through a pretrained model. Converting a source frame to the target voice means finding its nearest neighbor (by cosine similarity) among the target speaker's reference features and swapping it in. There's no gradient step anywhere in that pipeline. That's exactly why building a new voice bank is a matter of extracting features from a short reference recording rather than training a model on it — the "under a minute" claim is a direct consequence of the technique, not an optimization on top of a slower one.

## Matching happens in feature space, not audio space

The nearest-neighbor search operates on WavLM's learned representation of speech, not on raw waveform samples — which is what makes "nearest neighbor" a meaningful operation at all; two frames that sound similar end up close in that feature space even if their waveforms don't look alike. Once the matched sequence of target-voice features is assembled, HiFiGAN — a neural vocoder — turns it back into audio. This is also where the technique's real constraint shows up: match quality is bounded by how well the target reference recordings cover the phonetic range of the source speech. A voice bank built from a narrow slice of sounds (a short clip of mostly vowels, say) has fewer close matches available for consonant-heavy source audio, and distant matches are where artifacts creep in. It's a coverage problem, not a model-capacity problem — more or better-varied reference audio helps in a way that a bigger model wouldn't.

## Worth knowing if you're building on the same stack

- **The whole pipeline runs on-device via ONNX Runtime.** WavLM-Large and HiFiGAN are both research models that started life in PyTorch; getting them to run locally means exporting to ONNX, which is its own category of engineering work (dynamic shapes, custom ops) separate from the voice-conversion technique itself.
- **Recording quality feeds directly into match quality.** Because the target voice bank is just a set of extracted features from real recordings, mic noise and inconsistent levels in the reference audio propagate straight through to conversion quality — there's no training process to average that noise out.

If you're testing anything like this yourself, the microphone matters more than it would for a system that trains a model on your data: [Shure MV7](/resources#gear), [Blue Yeti Nano](/resources#gear), and [Rode NT-USB+](/resources#gear) are the three we've actually used building and testing nymic, chosen to cover different price points and connection types (USB/XLR hybrid vs. USB-only) rather than to endorse one over the others. For everything else in [`dsp-audio`](/journal), the same feature-space-matching idea shows up anywhere a nearest-neighbor or retrieval step stands in for a trained mapping.
