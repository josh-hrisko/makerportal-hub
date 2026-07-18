import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  speedOfSound,
  rt60Sabine,
  roomModes,
  splSum,
  splToPressure,
  pressureToSpl,
  besselJ0,
  besselJ1,
  dopplerShift,
  massLawTransmissionLoss,
  websterHornArea
} from './acoustics.ts';

describe('Acoustics Library', () => {
  test('speedOfSound', () => {
    // at 20C, speed of sound is approx 343 m/s
    const c = speedOfSound(20);
    assert.ok(Math.abs(c - 343.2) < 0.2);
  });

  test('rt60Sabine', () => {
    // V = 100, A = 10 -> 0.161 * 100 / 10 = 1.61
    const rt60 = rt60Sabine(100, 10);
    assert.strictEqual(rt60, 1.61);
  });

  test('roomModes', () => {
    const modes = roomModes(5, 4, 2.8, 343, 100);
    assert.ok(modes.length > 0);
    // (1,0,0) mode should be 343 / (2 * 5) = 34.3 Hz
    const m100 = modes.find(m => m.nx === 1 && m.ny === 0 && m.nz === 0)!;
    assert.ok(Math.abs(m100.freq - 34.3) < 0.1);
  });

  test('spl sum and conversion', () => {
    // 0 dB + 0 dB = 3.01 dB
    const sum = splSum(0, 0);
    assert.ok(Math.abs(sum - 3.01) < 0.05);

    const p = splToPressure(94); // 94 dB is approx 1 Pa
    assert.ok(Math.abs(p - 1.0) < 0.01);

    const spl = pressureToSpl(1.0);
    assert.ok(Math.abs(spl - 94.0) < 0.05);
  });
  
  test('Bessel functions', () => {
    assert.ok(Math.abs(besselJ0(0) - 1.0) < 1e-5);
    assert.ok(Math.abs(besselJ0(2.4048) - 0.0) < 1e-3);
    assert.ok(Math.abs(besselJ1(0) - 0.0) < 1e-5);
  });

  test('Doppler Shift', () => {
    // Source moving towards observer at 34.3 m/s (approx Mach 0.1)
    const shifted = dopplerShift(1000, 34.3, 0, 343);
    assert.ok(shifted > 1100 && shifted < 1120); 
  });

  test('Mass Law', () => {
    // 10 kg/m2 at 500 Hz
    const tl = massLawTransmissionLoss(10, 500);
    assert.ok(tl > 25 && tl < 35);
  });

  test('Webster Horn Area', () => {
    const s_exp = websterHornArea('exponential', 10, 0.1, 1);
    assert.ok(s_exp > 10);
    const s_con = websterHornArea('conical', 10, 0.1, 1);
    assert.ok(s_con > 10);
  });
});
