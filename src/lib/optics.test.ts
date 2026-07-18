import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  freeSpace,
  thinLens,
  curvedMirror,
  multiply,
  systemMatrix,
  traceRay,
  determinant,
  effectiveFocalLength,
  imageDistance,
  resonatorGParams,
  resonatorStable,
  roundTripMatrix,
  stabilityParameter,
  beamQAtWaist,
  propagateQ,
  beamRadius,
  identity,
} from './optics.ts';

const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

describe('ABCD ray matrices', () => {
  test('free space and lens have unit determinant', () => {
    assert.ok(close(determinant(freeSpace(0.3)), 1));
    assert.ok(close(determinant(thinLens(0.1)), 1));
    assert.ok(close(determinant(curvedMirror(0.5)), 1));
  });

  test('a thin lens focuses collimated rays at its focal point', () => {
    const f = 0.2;
    // Collimated ray at height y, angle 0, followed by lens then free space f.
    const y0 = 0.01;
    const sys = systemMatrix([thinLens(f), freeSpace(f)]);
    const out = traceRay(sys, { y: y0, theta: 0 });
    // All collimated rays cross the axis at the back focal plane.
    assert.ok(close(out.y, 0, 1e-12));
    // Its angle is −y0/f.
    assert.ok(close(out.theta, -y0 / f, 1e-12));
  });

  test('effective focal length of a lens equals its f', () => {
    assert.ok(close(effectiveFocalLength(thinLens(0.15)), 0.15));
  });

  test('two lenses in contact add in inverse (1/f = 1/f1 + 1/f2)', () => {
    const f1 = 0.1;
    const f2 = 0.25;
    const sys = systemMatrix([thinLens(f1), thinLens(f2)]);
    const fEff = effectiveFocalLength(sys);
    assert.ok(close(1 / fEff, 1 / f1 + 1 / f2));
  });

  test('imaging obeys the thin-lens conjugate equation', () => {
    const f = 0.1;
    const u = 0.3; // object 30 cm in front
    const res = imageDistance(thinLens(f), u);
    assert.ok(res !== null);
    // 1/v_expected = 1/f − 1/u
    const vExpected = 1 / (1 / f - 1 / u);
    assert.ok(close(res!.v, vExpected, 1e-9));
    // Transverse magnification m = −v/u for a single thin lens.
    assert.ok(close(res!.magnification, -res!.v / u, 1e-9));
  });

  test('multiply is associative-consistent with systemMatrix', () => {
    const a = thinLens(0.2);
    const b = freeSpace(0.5);
    const c = curvedMirror(0.4);
    const viaMultiply = multiply(c, multiply(b, a));
    const viaSystem = systemMatrix([a, b, c]);
    assert.ok(close(viaMultiply.A, viaSystem.A));
    assert.ok(close(viaMultiply.B, viaSystem.B));
    assert.ok(close(viaMultiply.C, viaSystem.C));
    assert.ok(close(viaMultiply.D, viaSystem.D));
  });

  test('identity leaves a ray unchanged', () => {
    const r = traceRay(identity, { y: 0.02, theta: 0.01 });
    assert.ok(close(r.y, 0.02) && close(r.theta, 0.01));
  });
});

describe('Optical resonators', () => {
  test('confocal cavity (L = R1 = R2) sits at the stable edge g1·g2 = 0', () => {
    const L = 1.0;
    const { g1, g2 } = resonatorGParams(L, L, L);
    assert.ok(close(g1, 0) && close(g2, 0));
    assert.ok(resonatorStable(g1, g2));
  });

  test('symmetric confocal cavity is marginally stable (|m| = 1)', () => {
    const L = 1.0;
    const m = roundTripMatrix(L, L, L);
    assert.ok(Math.abs(stabilityParameter(m)) <= 1 + 1e-9);
  });

  test('planar cavity (R = ∞) is marginally stable, g1·g2 = 1', () => {
    const { g1, g2 } = resonatorGParams(0.5, Infinity, Infinity);
    assert.ok(close(g1, 1) && close(g2, 1));
    assert.ok(resonatorStable(g1, g2));
  });

  test('overly long cavity is unstable', () => {
    // Two concave mirrors R = 1, separated by L = 3 > R1 + R2 = 2 → unstable.
    const { g1, g2 } = resonatorGParams(3, 1, 1);
    assert.ok(!resonatorStable(g1, g2));
  });
});

describe('Gaussian beam propagation', () => {
  test('a waist propagated by free space grows per the hyperbolic law', () => {
    const lambda = 1064e-9; // Nd:YAG
    const w0 = 1e-3; // 1 mm waist
    const zR = (Math.PI * w0 * w0) / lambda;
    const q0 = beamQAtWaist(w0, lambda);
    // At one Rayleigh range the radius grows by √2.
    const q1 = propagateQ(freeSpace(zR), q0);
    assert.ok(close(beamRadius(q1, lambda), w0 * Math.SQRT2, 1e-9));
  });

  test('beam radius at the waist equals w0', () => {
    const lambda = 633e-9;
    const w0 = 0.5e-3;
    const q0 = beamQAtWaist(w0, lambda);
    assert.ok(close(beamRadius(q0, lambda), w0, 1e-9));
  });
});
