/**
 * Lattice Boltzmann fluid solver (D2Q9, single-relaxation-time BGK) — pure
 * helpers plus a grid class, dependency-free and safe for server and client use.
 *
 * The fluid is represented by nine discrete velocity populations fᵢ on each
 * lattice node. Each step relaxes them toward the local equilibrium and then
 * streams them to neighbours:
 *
 *   collide:  f_i <- f_i + omega*(f_i^eq - f_i)      omega = 1/tau
 *   stream:   f_i(x + c_i, t+1) <- f_i(x, t)
 *
 * with the second-order equilibrium
 *   f_i^eq = w_i * rho * [1 + 3(c_i.u) + 9/2 (c_i.u)^2 - 3/2 |u|^2].
 *
 * In the low-Mach limit this recovers the incompressible Navier–Stokes
 * equations with kinematic viscosity ν = cₛ²(τ − ½) and cₛ² = 1/3 (lattice
 * units). It is a genuine mesoscopic solver — NOT full spectral/FEM CFD. Solid
 * obstacles use simple half-way bounce-back (staircased boundaries), density is
 * weakly compressible, and stability requires τ > ½ (ω < 2); very high Reynolds
 * numbers on a coarse grid will show lattice artefacts, not physics.
 */

/** Lattice velocity x-components (D2Q9). */
export const CX = [0, 1, 0, -1, 0, 1, -1, -1, 1];
/** Lattice velocity y-components (D2Q9). */
export const CY = [0, 0, 1, 0, -1, 1, 1, -1, -1];
/** Lattice weights (sum to 1). */
export const W = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36];
/** Opposite-direction index for bounce-back. */
export const OPP = [0, 3, 4, 1, 2, 7, 8, 5, 6];
/** Lattice speed of sound squared. */
export const CS2 = 1 / 3;

/** Fill `out` (length 9) with the D2Q9 equilibrium for density ρ and velocity (ux, uy). */
export function equilibrium(rho: number, ux: number, uy: number, out: Float64Array | number[]): void {
  const usq = 1.5 * (ux * ux + uy * uy);
  for (let i = 0; i < 9; i++) {
    const cu = 3 * (CX[i] * ux + CY[i] * uy);
    out[i] = W[i] * rho * (1 + cu + 0.5 * cu * cu - usq);
  }
}

/** Kinematic viscosity ν from relaxation rate ω (= 1/τ), in lattice units. */
export function viscosityFromOmega(omega: number): number {
  return CS2 * (1 / omega - 0.5);
}

/** Relaxation rate ω from a target kinematic viscosity ν. */
export function omegaFromViscosity(nu: number): number {
  return 1 / (3 * nu + 0.5);
}

/** Reynolds number Re = u·L/ν. */
export function reynolds(u: number, L: number, nu: number): number {
  return (u * L) / nu;
}

export class Lattice {
  readonly nx: number;
  readonly ny: number;
  omega: number;
  /** Nine population arrays, each length nx·ny. */
  f: Float64Array[];
  private tmp: Float64Array[];
  obstacle: Uint8Array;
  rho: Float64Array;
  ux: Float64Array;
  uy: Float64Array;
  private inflowU = 0;

  constructor(nx: number, ny: number, omega = 1.0) {
    this.nx = nx;
    this.ny = ny;
    this.omega = omega;
    const size = nx * ny;
    this.f = Array.from({ length: 9 }, () => new Float64Array(size));
    this.tmp = Array.from({ length: 9 }, () => new Float64Array(size));
    this.obstacle = new Uint8Array(size);
    this.rho = new Float64Array(size).fill(1);
    this.ux = new Float64Array(size);
    this.uy = new Float64Array(size);
  }

  private idx(x: number, y: number): number {
    return x + this.nx * y;
  }

  /** Initialise every node to the equilibrium for a uniform flow (ux0, uy0). */
  initEquilibrium(ux0: number, uy0 = 0, rho0 = 1): void {
    this.inflowU = ux0;
    const eq = new Float64Array(9);
    equilibrium(rho0, ux0, uy0, eq);
    for (let c = 0; c < this.nx * this.ny; c++) {
      for (let i = 0; i < 9; i++) this.f[i][c] = eq[i];
      this.rho[c] = rho0;
      this.ux[c] = ux0;
      this.uy[c] = uy0;
    }
  }

  setObstacle(mask: Uint8Array): void {
    this.obstacle.set(mask);
  }

  /** Total mass ∑∑ fᵢ over the grid (conserved by collide + periodic stream). */
  totalMass(): number {
    let s = 0;
    for (let i = 0; i < 9; i++) {
      const fi = this.f[i];
      for (let c = 0; c < fi.length; c++) s += fi[c];
    }
    return s;
  }

  /** BGK collision. Updates macroscopic ρ, u and relaxes populations toward equilibrium. */
  collide(): void {
    const { nx, ny, omega, f, obstacle, rho, ux, uy } = this;
    const eq = new Float64Array(9);
    for (let c = 0; c < nx * ny; c++) {
      if (obstacle[c]) continue;
      let r = 0, mx = 0, my = 0;
      for (let i = 0; i < 9; i++) {
        const v = f[i][c];
        r += v;
        mx += CX[i] * v;
        my += CY[i] * v;
      }
      const u = mx / r;
      const v = my / r;
      rho[c] = r; ux[c] = u; uy[c] = v;
      equilibrium(r, u, v, eq);
      for (let i = 0; i < 9; i++) f[i][c] += omega * (eq[i] - f[i][c]);
    }
  }

  /** Periodic streaming into a temp buffer, then swap. */
  stream(): void {
    const { nx, ny, f, tmp } = this;
    for (let i = 0; i < 9; i++) {
      const src = f[i];
      const dst = tmp[i];
      const cx = CX[i], cy = CY[i];
      for (let y = 0; y < ny; y++) {
        const yt = (y + cy + ny) % ny;
        for (let x = 0; x < nx; x++) {
          const xt = (x + cx + nx) % nx;
          dst[xt + nx * yt] = src[x + nx * y];
        }
      }
    }
    // swap
    const t = this.f;
    this.f = this.tmp;
    this.tmp = t;
  }

  /**
   * Full-way bounce-back applied as a local operator on solid nodes: swap each
   * population with its opposite. Because it only permutes populations already
   * present at the node it conserves mass exactly. Call it after collide() and
   * before stream() so the reversed populations get sent back out next step.
   */
  bounceBack(): void {
    const { nx, ny, f, obstacle } = this;
    // Swap each opposite pair once: (1,3), (2,4), (5,7), (6,8).
    const pairs: [number, number][] = [[1, 3], [2, 4], [5, 7], [6, 8]];
    for (let c = 0; c < nx * ny; c++) {
      if (!obstacle[c]) continue;
      for (const [i, o] of pairs) {
        const t = f[i][c];
        f[i][c] = f[o][c];
        f[o][c] = t;
      }
    }
  }

  /** Force the left column and the top/bottom rows to a uniform inflow (Dirichlet). */
  applyInflow(ux0 = this.inflowU): void {
    const { nx, ny, f } = this;
    this.inflowU = ux0;
    const eq = new Float64Array(9);
    equilibrium(1, ux0, 0, eq);
    for (let y = 0; y < ny; y++) {
      for (const x of [0]) {
        const c = x + nx * y;
        for (let i = 0; i < 9; i++) f[i][c] = eq[i];
      }
    }
    for (let x = 0; x < nx; x++) {
      for (const y of [0, ny - 1]) {
        const c = x + nx * y;
        for (let i = 0; i < 9; i++) f[i][c] = eq[i];
      }
    }
  }

  /** Zero-gradient outflow on the right column (copy the second-to-last column). */
  applyOutflow(): void {
    const { nx, ny, f } = this;
    for (let y = 0; y < ny; y++) {
      const last = nx - 1 + nx * y;
      const prev = nx - 2 + nx * y;
      for (let i = 0; i < 9; i++) f[i][last] = f[i][prev];
    }
  }

  /** One full wind-tunnel step: collide → bounce-back → stream → re-impose boundaries. */
  step(ux0 = this.inflowU): void {
    this.collide();
    this.bounceBack();
    this.stream();
    this.applyInflow(ux0);
    this.applyOutflow();
  }

  /** Vorticity (∂v/∂x − ∂u/∂y) at an interior node via central differences. */
  vorticity(x: number, y: number): number {
    const { nx, ny, ux, uy } = this;
    if (x <= 0 || x >= nx - 1 || y <= 0 || y >= ny - 1) return 0;
    const dvdx = uy[x + 1 + nx * y] - uy[x - 1 + nx * y];
    const dudy = ux[x + nx * (y + 1)] - ux[x + nx * (y - 1)];
    return 0.5 * (dvdx - dudy);
  }

  /** Recompute macroscopic ρ, u from the current populations (e.g. for rendering). */
  computeMacros(): void {
    const { nx, ny, f, obstacle, rho, ux, uy } = this;
    for (let c = 0; c < nx * ny; c++) {
      if (obstacle[c]) { rho[c] = 1; ux[c] = 0; uy[c] = 0; continue; }
      let r = 0, mx = 0, my = 0;
      for (let i = 0; i < 9; i++) {
        const v = f[i][c];
        r += v; mx += CX[i] * v; my += CY[i] * v;
      }
      rho[c] = r; ux[c] = mx / r; uy[c] = my / r;
    }
  }
}
