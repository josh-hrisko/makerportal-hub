import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  C,
  G0,
  LIGHT_YEAR,
  lorentzGamma,
  betaAtProperTime,
  gammaAtProperTime,
  coordinateTime,
  distanceTraveled,
  dopplerFactor,
  cmbTemperatureAhead,
  flipAndBurn,
  gToMetric,
  CMB_TEMPERATURE,
} from './relativity.ts';

const rel = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

describe('Constant-proper-acceleration flight', () => {
  test('at τ = 0 the ship is at rest at the origin', () => {
    const a = gToMetric(1);
    assert.ok(rel(betaAtProperTime(a, 0), 0));
    assert.ok(rel(gammaAtProperTime(a, 0), 1));
    assert.ok(rel(coordinateTime(a, 0), 0));
    assert.ok(rel(distanceTraveled(a, 0), 0));
  });

  test('velocity approaches but never reaches c', () => {
    const a = gToMetric(1);
    // 6 ship-years at 1g: β ≈ 0.99999 — resolvably below c (beyond ~19 rapidity
    // tanh saturates to exactly 1.0 in float64, so we stay in the resolvable range).
    const beta = betaAtProperTime(a, 6 * 31557600);
    assert.ok(beta < 1);
    assert.ok(beta > 0.9999);
  });

  test('γ is consistent between definitions (cosh φ = 1/√(1−β²))', () => {
    const a = gToMetric(1);
    const tau = 3 * 31557600;
    const beta = betaAtProperTime(a, tau);
    assert.ok(rel(gammaAtProperTime(a, tau), lorentzGamma(beta)));
  });

  test('hyperbolic identity: (a·t/c)² − (a·x/c² + 1)² = −1', () => {
    const a = gToMetric(1);
    const tau = 2.5 * 31557600;
    const t = coordinateTime(a, tau);
    const x = distanceTraveled(a, tau);
    const lhs = Math.pow((a * t) / C, 2) - Math.pow((a * x) / (C * C) + 1, 2);
    assert.ok(rel(lhs, -1, 1e-9));
  });

  test('1g flight covers ~1 light-year of Earth distance in the first year of Earth time (order of magnitude)', () => {
    const a = gToMetric(1);
    // After ~1 Julian year of *proper* time, Earth time is a bit more and distance ~0.5 ly.
    const x = distanceTraveled(a, 31557600);
    assert.ok(x > 0.4 * LIGHT_YEAR && x < 0.7 * LIGHT_YEAR);
  });

  test('coordinate time always exceeds proper time (time dilation)', () => {
    const a = gToMetric(1);
    const tau = 5 * 31557600;
    assert.ok(coordinateTime(a, tau) > tau);
  });
});

describe('Relativistic Doppler and CMB', () => {
  test('Doppler factor is 1 at rest and grows with β', () => {
    assert.ok(rel(dopplerFactor(0), 1));
    assert.ok(dopplerFactor(0.6) > 1);
    // forward and aft factors are reciprocal
    assert.ok(rel(dopplerFactor(0.6) * dopplerFactor(-0.6), 1));
  });

  test('CMB ahead heats up with speed', () => {
    assert.ok(rel(cmbTemperatureAhead(0), CMB_TEMPERATURE));
    const hot = cmbTemperatureAhead(0.9);
    // δ(0.9) = √(1.9/0.1) ≈ 4.359 → ~11.9 K
    assert.ok(rel(hot, CMB_TEMPERATURE * Math.sqrt(1.9 / 0.1), 1e-6));
  });
});

describe('Flip-and-burn trips', () => {
  test('arrives with the expected peak γ and symmetric halves', () => {
    const a = gToMetric(1);
    const d = 4.24 * LIGHT_YEAR; // Proxima Centauri
    const trip = flipAndBurn(a, d);
    // Midpoint distance = d/2 ⇒ cosh φ = 1 + a(d/2)/c².
    const expectedPeakGamma = 1 + (a * (d / 2)) / (C * C);
    assert.ok(rel(trip.peakGamma, expectedPeakGamma));
    assert.ok(rel(trip.properTime, 2 * trip.turnaroundProperTime));
    // Earth time exceeds ship time.
    assert.ok(trip.coordinateTime > trip.properTime);
    // A 4.24 ly trip at 1g takes ~3.5 ship-years and ~6 Earth-years (known result).
    const shipYears = trip.properTime / 31557600;
    const earthYears = trip.coordinateTime / 31557600;
    assert.ok(shipYears > 3 && shipYears < 4);
    assert.ok(earthYears > 5.5 && earthYears < 6.5);
  });

  test('gToMetric maps 1g to standard gravity', () => {
    assert.ok(rel(gToMetric(1), G0));
  });
});
