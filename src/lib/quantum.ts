/**
 * 1D time-dependent Schrödinger equation solved with the Crank–Nicolson scheme
 * — pure functions plus a small stepper class, safe for server and client use.
 *
 * Natural units: ħ = 1, m = 1. The Hamiltonian is H = −½ ∂²/∂x² + V(x).
 * Crank–Nicolson advances (I + i·dt/2·H) ψⁿ⁺¹ = (I − i·dt/2·H) ψⁿ, which is the
 * Cayley form of the propagator. It is UNITARY to machine precision (norm is
 * conserved for a real potential) and unconditionally stable — its key virtue
 * over explicit schemes, which blow up unless dt is tiny.
 *
 * Limitations: this is a fixed, uniform grid with Dirichlet walls (ψ = 0 at the
 * edges). Without an absorbing layer a packet reaching a wall reflects, so the
 * usable window is finite. An optional imaginary (absorbing) potential damps
 * amplitude near the edges to suppress those reflections — at the cost of the
 * exact unitarity the interior otherwise enjoys.
 */

export interface ComplexArray {
  re: Float64Array;
  im: Float64Array;
}

/**
 * Normalised Gaussian wave packet ψ(x) = (2πσ²)^(−1/4)·exp(−(x−x0)²/4σ²)·e^{i k0 x}
 * evaluated on the grid `x`. ∫|ψ|² dx = 1 in the continuum limit.
 */
export function gaussianPacket(x: number[] | Float64Array, x0: number, k0: number, sigma: number): ComplexArray {
  const n = x.length;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const norm = Math.pow(2 * Math.PI * sigma * sigma, -0.25);
  for (let i = 0; i < n; i++) {
    const dx = x[i] - x0;
    const env = norm * Math.exp(-(dx * dx) / (4 * sigma * sigma));
    re[i] = env * Math.cos(k0 * x[i]);
    im[i] = env * Math.sin(k0 * x[i]);
  }
  return { re, im };
}

/** Total probability ∑|ψ|²·dx on the grid. */
export function norm(psi: ComplexArray, dx: number): number {
  let s = 0;
  for (let i = 0; i < psi.re.length; i++) s += psi.re[i] * psi.re[i] + psi.im[i] * psi.im[i];
  return s * dx;
}

/** Probability found to the left of grid index `split` (∑|ψ|²·dx over i < split). */
export function probabilityBelow(psi: ComplexArray, dx: number, split: number): number {
  let s = 0;
  for (let i = 0; i < split && i < psi.re.length; i++) s += psi.re[i] * psi.re[i] + psi.im[i] * psi.im[i];
  return s * dx;
}

/**
 * Solve a tridiagonal complex system with CONSTANT off-diagonals a (sub) and
 * c (super) and per-row main diagonal b, right-hand side d, via the Thomas
 * algorithm. Arrays b and d have length n (the interior size). Returns ψ.
 */
export function thomasSolveComplex(
  aRe: number, aIm: number,
  bRe: Float64Array, bIm: Float64Array,
  cRe: number, cIm: number,
  dRe: Float64Array, dIm: Float64Array,
): ComplexArray {
  const n = bRe.length;
  const cpRe = new Float64Array(n);
  const cpIm = new Float64Array(n);
  const dpRe = new Float64Array(n);
  const dpIm = new Float64Array(n);

  // Complex divide helper: (pr,pi)/(qr,qi)
  const divTo = (pr: number, pi: number, qr: number, qi: number): [number, number] => {
    const den = qr * qr + qi * qi;
    return [(pr * qr + pi * qi) / den, (pi * qr - pr * qi) / den];
  };

  // i = 0
  let [c0r, c0i] = divTo(cRe, cIm, bRe[0], bIm[0]);
  cpRe[0] = c0r; cpIm[0] = c0i;
  let [d0r, d0i] = divTo(dRe[0], dIm[0], bRe[0], bIm[0]);
  dpRe[0] = d0r; dpIm[0] = d0i;

  for (let i = 1; i < n; i++) {
    // m = b[i] − a·cp[i−1]
    const acpRe = aRe * cpRe[i - 1] - aIm * cpIm[i - 1];
    const acpIm = aRe * cpIm[i - 1] + aIm * cpRe[i - 1];
    const mRe = bRe[i] - acpRe;
    const mIm = bIm[i] - acpIm;
    const [cr, ci] = divTo(cRe, cIm, mRe, mIm);
    cpRe[i] = cr; cpIm[i] = ci;
    // d[i] − a·dp[i−1]
    const adpRe = aRe * dpRe[i - 1] - aIm * dpIm[i - 1];
    const adpIm = aRe * dpIm[i - 1] + aIm * dpRe[i - 1];
    const [dr, di] = divTo(dRe[i] - adpRe, dIm[i] - adpIm, mRe, mIm);
    dpRe[i] = dr; dpIm[i] = di;
  }

  const re = new Float64Array(n);
  const im = new Float64Array(n);
  re[n - 1] = dpRe[n - 1]; im[n - 1] = dpIm[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    // ψ[i] = dp[i] − cp[i]·ψ[i+1]
    const cpsiRe = cpRe[i] * re[i + 1] - cpIm[i] * im[i + 1];
    const cpsiIm = cpRe[i] * im[i + 1] + cpIm[i] * re[i + 1];
    re[i] = dpRe[i] - cpsiRe;
    im[i] = dpIm[i] - cpsiIm;
  }
  return { re, im };
}

/**
 * Analytic transmission probability through a rectangular barrier of height V0
 * and width L for a particle of energy E (natural units ħ = m = 1).
 * Returns a value in [0, 1]. Handles E < V0 (tunnelling), E > V0 (resonant
 * transmission), and the E = V0 limit.
 */
export function rectangularBarrierTransmission(E: number, V0: number, L: number): number {
  if (E <= 0) return 0;
  if (V0 <= 0) return 1;
  if (Math.abs(E - V0) < 1e-9 * Math.max(1, V0)) {
    // κ→0 limit of the sub-barrier form (sinh(κL) → κL): T = 1/(1 + V0²L²/(2E)).
    return 1 / (1 + (V0 * V0 * L * L) / (2 * E));
  }
  if (E < V0) {
    const kappa = Math.sqrt(2 * (V0 - E));
    const s = Math.sinh(kappa * L);
    return 1 / (1 + (V0 * V0 * s * s) / (4 * E * (V0 - E)));
  }
  const k2 = Math.sqrt(2 * (E - V0));
  const s = Math.sin(k2 * L);
  return 1 / (1 + (V0 * V0 * s * s) / (4 * E * (E - V0)));
}

/**
 * Crank–Nicolson stepper on a uniform grid with Dirichlet walls. The potential
 * may be complex (imaginary part < 0 absorbs amplitude — used for edge layers).
 */
export class CrankNicolson1D {
  readonly n: number;
  readonly dx: number;
  readonly dt: number;
  psi: ComplexArray;
  private Vre: Float64Array;
  private Vim: Float64Array;
  // Constant off-diagonal a = c = −i·dt/(4 dx²).
  private aRe = 0;
  private aIm = 0;
  // Interior main diagonal (length n−2) for the LHS operator (I + i dt/2 H).
  private bRe: Float64Array;
  private bIm: Float64Array;

  constructor(x: Float64Array, dt: number, Vre: Float64Array, Vim?: Float64Array) {
    this.n = x.length;
    this.dx = x.length > 1 ? x[1] - x[0] : 1;
    this.dt = dt;
    this.Vre = Vre;
    this.Vim = Vim ?? new Float64Array(this.n);
    this.psi = { re: new Float64Array(this.n), im: new Float64Array(this.n) };
    this.bRe = new Float64Array(this.n - 2);
    this.bIm = new Float64Array(this.n - 2);
    this.recompute();
  }

  private recompute(): void {
    const off = this.dt / (4 * this.dx * this.dx); // magnitude of −i·dt/(4dx²)
    this.aRe = 0;
    this.aIm = -off;
    const diagKin = 1 / (this.dx * this.dx); // 1/dx² diagonal of −½∂²
    for (let j = 1; j <= this.n - 2; j++) {
      // b = 1 + i·dt/2·(1/dx² + V). With complex V = Vre + i·Vim.
      const hRe = diagKin + this.Vre[j];
      const hIm = this.Vim[j];
      // i·dt/2·(hRe + i·hIm) = dt/2·(−hIm + i·hRe)
      this.bRe[j - 1] = 1 + (this.dt / 2) * -hIm;
      this.bIm[j - 1] = (this.dt / 2) * hRe;
    }
  }

  setPotential(Vre: Float64Array, Vim?: Float64Array): void {
    this.Vre = Vre;
    this.Vim = Vim ?? new Float64Array(this.n);
    this.recompute();
  }

  setState(psi: ComplexArray): void {
    this.psi.re.set(psi.re);
    this.psi.im.set(psi.im);
    this.psi.re[0] = this.psi.im[0] = 0;
    this.psi.re[this.n - 1] = this.psi.im[this.n - 1] = 0;
  }

  /** Advance one time step. */
  step(): void {
    const n = this.n;
    const off = this.dt / (4 * this.dx * this.dx);
    const diagKin = 1 / (this.dx * this.dx);
    const { re, im } = this.psi;
    // Build RHS d = (I − i dt/2 H) ψ over interior nodes.
    const dRe = new Float64Array(n - 2);
    const dIm = new Float64Array(n - 2);
    for (let j = 1; j <= n - 2; j++) {
      const hRe = diagKin + this.Vre[j];
      const hIm = this.Vim[j];
      // main RHS diagonal = 1 − i dt/2 (hRe + i hIm) = 1 + dt/2 hIm − i dt/2 hRe
      const mRe = 1 + (this.dt / 2) * hIm;
      const mIm = -(this.dt / 2) * hRe;
      // (mRe + i mIm)·ψ_j
      let rr = mRe * re[j] - mIm * im[j];
      let ii = mRe * im[j] + mIm * re[j];
      // off-diagonal on RHS is +i·dt/(4dx²) = (0 + i·off); acting on ψ_{j−1}+ψ_{j+1}
      const sr = re[j - 1] + re[j + 1];
      const si = im[j - 1] + im[j + 1];
      // (0 + i·off)·(sr + i·si) = −off·si + i·off·sr
      rr += -off * si;
      ii += off * sr;
      dRe[j - 1] = rr;
      dIm[j - 1] = ii;
    }
    const sol = thomasSolveComplex(this.aRe, this.aIm, this.bRe, this.bIm, this.aRe, this.aIm, dRe, dIm);
    for (let j = 1; j <= n - 2; j++) {
      re[j] = sol.re[j - 1];
      im[j] = sol.im[j - 1];
    }
    re[0] = im[0] = 0;
    re[n - 1] = im[n - 1] = 0;
  }

  norm(): number {
    return norm(this.psi, this.dx);
  }
}
