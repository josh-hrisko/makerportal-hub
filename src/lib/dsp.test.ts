import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  rbjCoeffs,
  freqResponse,
  poleZeroToCoeffs,
  extractHarmonics
} from './dsp.ts';

describe('DSP Library', () => {
  test('rbjCoeffs and freqResponse', () => {
    const coeffs = rbjCoeffs('lowpass', 1000, 0.707, 0, 48000);
    // At DC, gain should be approx 1 (0 dB)
    const dc = freqResponse(coeffs, 0, 48000);
    assert.ok(Math.abs(dc.mag - 1.0) < 0.01);

    // At cutoff, gain should be approx 0.707 (-3 dB)
    const cutoff = freqResponse(coeffs, 1000, 48000);
    assert.ok(Math.abs(cutoff.mag - 0.707) < 0.05);

    // At Nyquist, gain should be close to 0
    const nyquist = freqResponse(coeffs, 24000, 48000);
    assert.ok(nyquist.mag < 0.01);
  });

  test('poleZeroToCoeffs', () => {
    // Poles at r=0.5, theta=+-pi/4. Zeros at r=1, theta=+-pi/2
    const p1 = { r: 0.5, theta: Math.PI / 4 };
    const p2 = { r: 0.5, theta: -Math.PI / 4 };
    const z1 = { r: 1.0, theta: Math.PI / 2 };
    const z2 = { r: 1.0, theta: -Math.PI / 2 };

    const coeffs = poleZeroToCoeffs([p1, p2], [z1, z2]);
    // b0=1, b1=0, b2=1 (since cos(+-pi/2) = 0)
    assert.ok(Math.abs(coeffs.b0 - 1.0) < 1e-6);
    assert.ok(Math.abs(coeffs.b1 - 0.0) < 1e-6);
    assert.ok(Math.abs(coeffs.b2 - 1.0) < 1e-6);
  });

  test('extractHarmonics', () => {
    const Fs = 48000;
    const f0 = 1000;
    const T = 1 / f0;
    const numCycles = 3;
    const samples = Math.floor((numCycles * T) * Fs);
    
    const time: number[] = [];
    const signal: number[] = [];
    
    // Create a signal: 2.0 DC + 1.0*sin(w0 t) + 0.5*sin(2 w0 t)
    const w0 = 2 * Math.PI * f0;
    for (let i = 0; i < samples; i++) {
      const t = i / Fs;
      time.push(t);
      signal.push(2.0 + 1.0 * Math.sin(w0 * t) + 0.5 * Math.cos(2 * w0 * t));
    }

    const harmonics = extractHarmonics(time, signal, f0, 3);
    assert.ok(Math.abs(harmonics[0] - 2.0) < 0.05); // DC
    assert.ok(Math.abs(harmonics[1] - 1.0) < 0.05); // H1
    assert.ok(Math.abs(harmonics[2] - 0.5) < 0.05); // H2
    assert.ok(Math.abs(harmonics[3] - 0.0) < 0.05); // H3
  });
});
