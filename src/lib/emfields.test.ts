import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  MU0,
  type Vec3,
  segmentField,
  fieldAt,
  buildLoop,
  buildWire,
  loopAxisField,
  traceFieldLine,
} from './emfields.ts';

const rel = (a: number, b: number, tol = 1e-3) => Math.abs(a - b) <= tol * Math.max(1e-30, Math.abs(b));
const mag = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);

describe('Biot–Savart segment field', () => {
  test('a long straight wire gives µ0 I/(2π d) near its middle', () => {
    // Wire along x from −500 to +500, current 10 A; sample at (0, d, 0).
    const wire = buildWire([-500, 0, 0], [500, 0, 0], 10);
    const d = 0.5;
    const b = segmentField(wire, [0, d, 0]);
    const expected = (MU0 * 10) / (2 * Math.PI * d);
    assert.ok(rel(mag(b), expected, 1e-3));
    // Field should be azimuthal: at +y, current +x ⇒ B in +z.
    assert.ok(b[2] > 0 && Math.abs(b[0]) < 1e-15 && Math.abs(b[1]) < 1e-12);
  });

  test('field on the wire axis is treated as zero (singular guard)', () => {
    const wire = buildWire([-1, 0, 0], [1, 0, 0], 5);
    const b = segmentField(wire, [0, 0, 0]);
    assert.ok(mag(b) === 0);
  });
});

describe('Circular loop', () => {
  test('on-axis field matches the analytic loop formula', () => {
    const R = 0.2;
    const I = 3;
    const loop = buildLoop([0, 0, 0], R, [0, 0, 1], I, 360);
    for (const z of [0, 0.1, 0.3, 0.5]) {
      const b = fieldAt(loop, [0, 0, z]);
      const expected = loopAxisField(R, I, z);
      assert.ok(rel(mag(b), expected, 2e-3), `z=${z}: got ${mag(b)}, expected ${expected}`);
      // On axis the field points along +z (right-hand rule for +z circulation).
      assert.ok(b[2] > 0);
    }
  });

  test('field is linear in current (superposition)', () => {
    const R = 0.15;
    const loop1 = buildLoop([0, 0, 0], R, [0, 0, 1], 1, 120);
    const loop2 = buildLoop([0, 0, 0], R, [0, 0, 1], 2, 120);
    const b1 = fieldAt(loop1, [0.05, 0, 0.1]);
    const b2 = fieldAt(loop2, [0.05, 0, 0.1]);
    assert.ok(rel(b2[0], 2 * b1[0], 1e-9));
    assert.ok(rel(b2[2], 2 * b1[2], 1e-9));
  });
});

describe('Helmholtz pair', () => {
  test('center field is (4/5)^{3/2} µ0 I / R and highly uniform', () => {
    const R = 0.25;
    const I = 4;
    // Two coaxial loops separated by R, both circulating the same way.
    const coils = [
      ...buildLoop([0, 0, -R / 2], R, [0, 0, 1], I, 360),
      ...buildLoop([0, 0, R / 2], R, [0, 0, 1], I, 360),
    ];
    const center = fieldAt(coils, [0, 0, 0]);
    const expected = Math.pow(4 / 5, 1.5) * (MU0 * I) / R;
    assert.ok(rel(mag(center), expected, 3e-3));
    // Uniformity: field a little off-center barely changes.
    const off = fieldAt(coils, [0, 0, R * 0.1]);
    assert.ok(Math.abs(mag(off) - mag(center)) / mag(center) < 1e-3);
  });
});

describe('RK4 field-line tracer', () => {
  test('field lines around a straight wire close into near-circles', () => {
    // Long wire along z; field lines in the z=0 plane are circles around it.
    const wire = buildWire([0, 0, -1000], [0, 0, 1000], 10);
    const r0 = 0.3;
    const line = traceFieldLine([wire], [r0, 0, 0], { step: 0.02, maxSteps: 400, minField: 1e-12, bound: 10 });
    // Every traced point should stay at radius ≈ r0 from the z-axis.
    let maxErr = 0;
    for (const p of line.points) {
      const r = Math.hypot(p[0], p[1]);
      maxErr = Math.max(maxErr, Math.abs(r - r0));
    }
    assert.ok(maxErr < 5e-3, `max radius error ${maxErr}`);
    // After enough steps it should wrap back near the start (circumference 2πr0 ≈ 1.885).
    const last = line.points[line.points.length - 1];
    assert.ok(line.points.length > 90);
    assert.ok(Math.hypot(last[0], last[1]) - r0 < 5e-3);
  });

  test('a trace fades out when it leaves the field region', () => {
    const loop = buildLoop([0, 0, 0], 0.1, [0, 0, 1], 1, 60);
    // Start far away where the field is negligible below the floor.
    const line = traceFieldLine(loop, [100, 100, 100], { step: 0.05, maxSteps: 10, minField: 1e-6 });
    assert.ok(line.faded);
  });
});
