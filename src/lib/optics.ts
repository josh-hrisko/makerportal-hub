/**
 * Paraxial (Gaussian) optics via ABCD ray-transfer matrices — pure functions,
 * safe for server and client use.
 *
 * Ray convention: a ray is [y, θ] where y is the transverse height (m) and θ is
 * the slope (radians, paraxial small-angle). An optical element acts on the ray
 * by a 2×2 matrix [[A, B], [C, D]] so that [y', θ'] = M · [y, θ].
 *
 * These are FIRST-ORDER (paraxial) optics: they ignore aberrations, diffraction
 * at apertures, chromatic dispersion, and any nonlinearity. They are exact for
 * ideal thin elements in the small-angle limit and are the standard tool for
 * laser-cavity and beam-relay design.
 */

export interface Matrix2 {
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface Ray {
  /** Transverse height (m). */
  y: number;
  /** Slope / angle (rad). */
  theta: number;
}

export const identity: Matrix2 = { A: 1, B: 0, C: 0, D: 1 };

/** Propagation through a homogeneous medium of length d (m). */
export function freeSpace(d: number): Matrix2 {
  return { A: 1, B: d, C: 0, D: 1 };
}

/** Thin lens of focal length f (m). Positive f converges. */
export function thinLens(f: number): Matrix2 {
  return { A: 1, B: 0, C: -1 / f, D: 1 };
}

/**
 * Curved mirror, radius of curvature R (m). Concave (focusing) mirrors take
 * R > 0. Reflection is folded into the same forward-propagating convention, so
 * a concave mirror behaves as a lens of focal length R/2.
 */
export function curvedMirror(R: number): Matrix2 {
  return { A: 1, B: 0, C: -2 / R, D: 1 };
}

/** Flat mirror — identity in the unfolded ray convention. */
export function flatMirror(): Matrix2 {
  return { ...identity };
}

/** Flat refracting interface from index n1 to n2. */
export function flatInterface(n1: number, n2: number): Matrix2 {
  return { A: 1, B: 0, C: 0, D: n1 / n2 };
}

/**
 * Curved refracting interface, radius R (m), from index n1 to n2.
 * R > 0 when the centre of curvature is downstream of the surface.
 */
export function curvedInterface(R: number, n1: number, n2: number): Matrix2 {
  return { A: 1, B: 0, C: (n1 - n2) / (R * n2), D: n1 / n2 };
}

/** Matrix product M1 · M2 (M2 acts first, then M1). */
export function multiply(m1: Matrix2, m2: Matrix2): Matrix2 {
  return {
    A: m1.A * m2.A + m1.B * m2.C,
    B: m1.A * m2.B + m1.B * m2.D,
    C: m1.C * m2.A + m1.D * m2.C,
    D: m1.C * m2.B + m1.D * m2.D,
  };
}

/**
 * System matrix for a cascade of elements listed in the order light encounters
 * them. The equivalent single matrix is M_last · … · M_first.
 */
export function systemMatrix(elements: Matrix2[]): Matrix2 {
  let m = { ...identity };
  for (const el of elements) m = multiply(el, m);
  return m;
}

/** Apply a matrix to a ray. */
export function traceRay(m: Matrix2, ray: Ray): Ray {
  return {
    y: m.A * ray.y + m.B * ray.theta,
    theta: m.C * ray.y + m.D * ray.theta,
  };
}

/** Determinant. For a lossless system in a single medium this equals 1 (= n_in/n_out). */
export function determinant(m: Matrix2): number {
  return m.A * m.D - m.B * m.C;
}

/**
 * Effective focal length of a system matrix, EFL = −1/C. Returns Infinity for
 * an afocal (telescopic) system where C = 0.
 */
export function effectiveFocalLength(m: Matrix2): number {
  if (m.C === 0) return Infinity;
  return -1 / m.C;
}

/**
 * Given the fixed optics between object and image reference planes (matrix M0),
 * find the extra image-side free-space distance v that forms an image of an
 * object placed an extra u of free space before M0. Returns the image distance
 * v (m) and transverse magnification, or null if no real conjugate exists.
 *
 * The full object→image matrix is FreeSpace(v) · M0 · FreeSpace(u); an image
 * forms where its B element vanishes.
 */
export function imageDistance(m0: Matrix2, u: number): { v: number; magnification: number } | null {
  // M0 · FreeSpace(u):
  const p = multiply(m0, freeSpace(u));
  // FreeSpace(v) · P has B = P.B + v·P.D. Solve B = 0.
  if (p.D === 0) return null;
  const v = -p.B / p.D;
  // Magnification is the A element of the full object→image matrix.
  const full = multiply(freeSpace(v), p);
  return { v, magnification: full.A };
}

// ---------------------------------------------------------------------------
// Optical resonators (laser cavities)
// ---------------------------------------------------------------------------

/**
 * g-parameters of a two-mirror cavity: gᵢ = 1 − L/Rᵢ. The cavity is stable when
 * 0 ≤ g1·g2 ≤ 1 — equivalently a ray stays bounded over many round trips.
 */
export function resonatorGParams(L: number, R1: number, R2: number): { g1: number; g2: number } {
  return { g1: 1 - L / R1, g2: 1 - L / R2 };
}

/** True when 0 ≤ g1·g2 ≤ 1 (stable cavity). */
export function resonatorStable(g1: number, g2: number): boolean {
  const p = g1 * g2;
  return p >= 0 && p <= 1;
}

/**
 * Round-trip ray matrix of a two-mirror cavity starting just after mirror 1:
 * propagate L, reflect off mirror 2 (R2), propagate L, reflect off mirror 1 (R1).
 */
export function roundTripMatrix(L: number, R1: number, R2: number): Matrix2 {
  return systemMatrix([freeSpace(L), curvedMirror(R2), freeSpace(L), curvedMirror(R1)]);
}

/**
 * Cavity stability parameter m = (A + D)/2 of a round-trip matrix. |m| < 1 is a
 * stable (real-eigenvalue-free) cavity — the same condition as 0 < g1·g2 < 1.
 */
export function stabilityParameter(m: Matrix2): number {
  return (m.A + m.D) / 2;
}

// ---------------------------------------------------------------------------
// Gaussian-beam propagation via the complex q parameter
// ---------------------------------------------------------------------------

export interface Complex {
  re: number;
  im: number;
}

/**
 * Complex beam parameter q at a waist of radius w0 (m) for wavelength λ (m).
 * At the waist R = ∞ so q = i·zR with Rayleigh range zR = π w0²/λ.
 */
export function beamQAtWaist(w0: number, lambda: number): Complex {
  return { re: 0, im: (Math.PI * w0 * w0) / lambda };
}

/** Propagate a Gaussian beam parameter q through an ABCD matrix: q' = (Aq+B)/(Cq+D). */
export function propagateQ(m: Matrix2, q: Complex): Complex {
  const numRe = m.A * q.re + m.B;
  const numIm = m.A * q.im;
  const denRe = m.C * q.re + m.D;
  const denIm = m.C * q.im;
  const denMag = denRe * denRe + denIm * denIm;
  return {
    re: (numRe * denRe + numIm * denIm) / denMag,
    im: (numIm * denRe - numRe * denIm) / denMag,
  };
}

/** 1/e² beam radius w (m) from a beam parameter q and wavelength λ. */
export function beamRadius(q: Complex, lambda: number): number {
  // 1/q = 1/R − i·λ/(π w²). Im(1/q) = −λ/(π w²).
  const invMag = q.re * q.re + q.im * q.im;
  const invIm = -q.im / invMag;
  const w2 = -lambda / (Math.PI * invIm);
  return Math.sqrt(Math.abs(w2));
}

/** Radius of curvature R (m) of the beam's phase front from q. R = 1/Re(1/q). */
export function beamCurvature(q: Complex): number {
  const invMag = q.re * q.re + q.im * q.im;
  const invRe = q.re / invMag;
  if (invRe === 0) return Infinity;
  return 1 / invRe;
}
