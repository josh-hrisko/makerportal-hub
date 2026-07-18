import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  gaussianPacket,
  norm,
  thomasSolveComplex,
  rectangularBarrierTransmission,
  CrankNicolson1D,
} from './quantum.ts';

function makeGrid(n: number, xMin: number, xMax: number): Float64Array {
  const x = new Float64Array(n);
  const dx = (xMax - xMin) / (n - 1);
  for (let i = 0; i < n; i++) x[i] = xMin + i * dx;
  return x;
}

describe('Gaussian packet', () => {
  test('is normalised: ∫|ψ|² dx ≈ 1', () => {
    const x = makeGrid(2001, -50, 50);
    const dx = x[1] - x[0];
    const psi = gaussianPacket(x, 0, 2, 3);
    assert.ok(Math.abs(norm(psi, dx) - 1) < 1e-4);
  });
});

describe('Complex Thomas solver', () => {
  test('solves a known real tridiagonal system', () => {
    // Tridiagonal with a = c = 1, b = 2 on all rows (the 1D Laplacian-ish matrix).
    // For n = 3, system:  [2 1 0; 1 2 1; 0 1 2] x = d. Pick x = [1, 2, 3].
    const b = new Float64Array([2, 2, 2]);
    const bi = new Float64Array([0, 0, 0]);
    // d = A x
    const d = new Float64Array([2 * 1 + 1 * 2, 1 * 1 + 2 * 2 + 1 * 3, 1 * 2 + 2 * 3]);
    const di = new Float64Array([0, 0, 0]);
    const sol = thomasSolveComplex(1, 0, b, bi, 1, 0, d, di);
    assert.ok(Math.abs(sol.re[0] - 1) < 1e-12);
    assert.ok(Math.abs(sol.re[1] - 2) < 1e-12);
    assert.ok(Math.abs(sol.re[2] - 3) < 1e-12);
  });

  test('solves a complex system', () => {
    // a = c = i, b = (2, 0). x = [1+0i, 0+1i]. d = A x.
    // row0: b0*x0 + c*x1 = 2*(1) + i*(i) = 2 + (i*i)= 2 - 1 = 1 ; im: 0
    // row1: a*x0 + b1*x1 = i*(1) + 0 = i
    const b = new Float64Array([2, 0]);
    const bi = new Float64Array([0, 0]);
    const d = new Float64Array([1, 0]);
    const di = new Float64Array([0, 1]);
    const sol = thomasSolveComplex(0, 1, b, bi, 0, 1, d, di);
    assert.ok(Math.abs(sol.re[0] - 1) < 1e-12 && Math.abs(sol.im[0]) < 1e-12);
    assert.ok(Math.abs(sol.re[1]) < 1e-12 && Math.abs(sol.im[1] - 1) < 1e-12);
  });
});

describe('Crank–Nicolson unitarity', () => {
  test('free particle conserves norm over many steps', () => {
    const x = makeGrid(1024, -60, 60);
    const dx = x[1] - x[0];
    const V = new Float64Array(x.length); // free particle
    const cn = new CrankNicolson1D(x, 0.05, V);
    cn.setState(gaussianPacket(x, -20, 3, 4));
    const n0 = cn.norm();
    for (let s = 0; s < 400; s++) cn.step();
    assert.ok(Math.abs(cn.norm() - n0) < 1e-6);
    void dx;
  });

  test('real barrier potential also conserves norm (still unitary)', () => {
    const x = makeGrid(1024, -60, 60);
    const V = new Float64Array(x.length);
    for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) < 1) V[i] = 3; // barrier at origin
    const cn = new CrankNicolson1D(x, 0.05, V);
    cn.setState(gaussianPacket(x, -25, 2.2, 4));
    const n0 = cn.norm();
    for (let s = 0; s < 300; s++) cn.step();
    assert.ok(Math.abs(cn.norm() - n0) < 1e-6);
  });

  test('a wave packet actually moves to the right', () => {
    const x = makeGrid(1024, -60, 60);
    const V = new Float64Array(x.length);
    const cn = new CrankNicolson1D(x, 0.05, V);
    cn.setState(gaussianPacket(x, -20, 3, 4));
    const meanX = () => {
      let s = 0, w = 0;
      for (let i = 0; i < x.length; i++) {
        const p = cn.psi.re[i] * cn.psi.re[i] + cn.psi.im[i] * cn.psi.im[i];
        s += x[i] * p; w += p;
      }
      return s / w;
    };
    const before = meanX();
    for (let s = 0; s < 200; s++) cn.step();
    assert.ok(meanX() > before + 1); // positive group velocity (k0 > 0)
  });
});

describe('Analytic rectangular-barrier transmission', () => {
  test('always in [0, 1]', () => {
    for (const E of [0.1, 0.5, 1, 2, 5, 10]) {
      const T = rectangularBarrierTransmission(E, 3, 2);
      assert.ok(T >= 0 && T <= 1);
    }
  });

  test('high-energy particles pass almost freely', () => {
    const T = rectangularBarrierTransmission(100, 1, 1);
    assert.ok(T > 0.99);
  });

  test('a thick, tall barrier suppresses tunnelling', () => {
    const T = rectangularBarrierTransmission(0.5, 5, 4);
    assert.ok(T < 1e-3);
  });

  test('transmission is continuous across E = V0', () => {
    const V0 = 2, L = 1.5;
    const below = rectangularBarrierTransmission(V0 - 1e-4, V0, L);
    const at = rectangularBarrierTransmission(V0, V0, L);
    const above = rectangularBarrierTransmission(V0 + 1e-4, V0, L);
    assert.ok(Math.abs(below - at) < 1e-3);
    assert.ok(Math.abs(above - at) < 1e-3);
  });
});
