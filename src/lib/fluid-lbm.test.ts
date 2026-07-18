import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  CX,
  CY,
  W,
  OPP,
  CS2,
  equilibrium,
  viscosityFromOmega,
  omegaFromViscosity,
  Lattice,
} from './fluid-lbm.ts';

const close = (a: number, b: number, eps = 1e-12) => Math.abs(a - b) < eps;

describe('D2Q9 velocity set', () => {
  test('weights sum to 1', () => {
    assert.ok(close(W.reduce((a, b) => a + b, 0), 1));
  });

  test('first moment of the weights vanishes (Σ wᵢ cᵢ = 0)', () => {
    let sx = 0, sy = 0;
    for (let i = 0; i < 9; i++) { sx += W[i] * CX[i]; sy += W[i] * CY[i]; }
    assert.ok(close(sx, 0) && close(sy, 0));
  });

  test('second moment of the weights is cₛ²·I', () => {
    let xx = 0, yy = 0, xy = 0;
    for (let i = 0; i < 9; i++) {
      xx += W[i] * CX[i] * CX[i];
      yy += W[i] * CY[i] * CY[i];
      xy += W[i] * CX[i] * CY[i];
    }
    assert.ok(close(xx, CS2) && close(yy, CS2) && close(xy, 0));
  });

  test('opposite indices really are opposite', () => {
    for (let i = 0; i < 9; i++) {
      assert.ok(CX[OPP[i]] === -CX[i] && CY[OPP[i]] === -CY[i]);
    }
  });
});

describe('Equilibrium distribution', () => {
  test('recovers ρ and momentum ρu as its 0th and 1st moments', () => {
    const rho = 1.3, ux = 0.05, uy = -0.03;
    const eq = new Float64Array(9);
    equilibrium(rho, ux, uy, eq);
    let r = 0, mx = 0, my = 0;
    for (let i = 0; i < 9; i++) { r += eq[i]; mx += CX[i] * eq[i]; my += CY[i] * eq[i]; }
    assert.ok(close(r, rho, 1e-12));
    assert.ok(close(mx, rho * ux, 1e-12));
    assert.ok(close(my, rho * uy, 1e-12));
  });

  test('at rest, equilibrium equals the weights times ρ', () => {
    const eq = new Float64Array(9);
    equilibrium(2, 0, 0, eq);
    for (let i = 0; i < 9; i++) assert.ok(close(eq[i], 2 * W[i]));
  });
});

describe('Viscosity / omega relationship', () => {
  test('round-trips ν ↔ ω', () => {
    for (const nu of [0.01, 0.05, 0.1, 0.5]) {
      const omega = omegaFromViscosity(nu);
      assert.ok(close(viscosityFromOmega(omega), nu, 1e-12));
      assert.ok(omega > 0 && omega < 2); // stable range
    }
  });
});

describe('Lattice conservation', () => {
  test('BGK collision conserves mass and momentum at a node', () => {
    const lat = new Lattice(3, 3, 1.2);
    // Seed a single interior node with a non-equilibrium distribution.
    const c = 1 + 3 * 1;
    const seed = [0.2, 0.15, 0.1, 0.12, 0.08, 0.05, 0.06, 0.07, 0.04];
    let m0 = 0, px0 = 0, py0 = 0;
    for (let i = 0; i < 9; i++) { lat.f[i][c] = seed[i]; m0 += seed[i]; px0 += CX[i] * seed[i]; py0 += CY[i] * seed[i]; }
    lat.collide();
    let m1 = 0, px1 = 0, py1 = 0;
    for (let i = 0; i < 9; i++) { m1 += lat.f[i][c]; px1 += CX[i] * lat.f[i][c]; py1 += CY[i] * lat.f[i][c]; }
    assert.ok(close(m1, m0, 1e-12));
    assert.ok(close(px1, px0, 1e-12));
    assert.ok(close(py1, py0, 1e-12));
  });

  test('uniform flow stays exactly uniform through collide + stream', () => {
    const lat = new Lattice(16, 16, 1.0);
    lat.initEquilibrium(0.1, 0);
    const m0 = lat.totalMass();
    lat.collide();
    lat.stream();
    lat.computeMacros();
    assert.ok(close(lat.totalMass(), m0, 1e-9));
    // Every interior node still has u = (0.1, 0).
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const c = x + 16 * y;
        assert.ok(close(lat.ux[c], 0.1, 1e-9));
        assert.ok(close(lat.uy[c], 0, 1e-9));
      }
    }
  });

  test('bounce-back conserves total mass', () => {
    const lat = new Lattice(20, 20, 1.0);
    lat.initEquilibrium(0.08, 0);
    // Place a solid block.
    const mask = new Uint8Array(20 * 20);
    for (let y = 8; y < 12; y++) for (let x = 8; x < 12; x++) mask[x + 20 * y] = 1;
    lat.setObstacle(mask);
    const m0 = lat.totalMass();
    lat.collide();
    lat.bounceBack();
    lat.stream();
    assert.ok(Math.abs(lat.totalMass() - m0) < 1e-9);
  });
});
