/**
 * Magnetostatics via the Biot–Savart law — pure functions, safe for server and
 * client use. Current-carrying geometry is represented as a list of straight
 * segments; the field of each segment uses the exact finite-wire closed form,
 * and field lines are marched with a classical 4th-order Runge–Kutta integrator.
 *
 * The finite-segment field at observation point P for current I flowing A→B is
 *   B = μ0 I / (4π d) · (cosθ1 − cosθ2) · (ê × n̂)
 * with ê the current direction, d the perpendicular distance from the line to
 * P, n̂ the unit vector from the line to P, and θ1, θ2 the angles subtended at
 * the endpoints. This reproduces the infinite-wire result μ0 I/(2π d) in the
 * long-wire limit and, summed over the chords of a polygon, converges to any
 * smooth loop as the chord count grows.
 *
 * This is STATIC (DC) magnetostatics: no induced currents, no time variation,
 * no magnetic materials (µ = µ0 everywhere), and loops are approximated by
 * straight chords. It is exact for the idealised filamentary currents shown.
 */

export type Vec3 = [number, number, number];

/** Vacuum permeability µ0 (T·m/A). */
export const MU0 = 4 * Math.PI * 1e-7;

export interface Segment {
  a: Vec3;
  b: Vec3;
  /** Current (A), flowing from a to b. */
  current: number;
}

const sub = (u: Vec3, v: Vec3): Vec3 => [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
const add = (u: Vec3, v: Vec3): Vec3 => [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
const scale = (u: Vec3, s: number): Vec3 => [u[0] * s, u[1] * s, u[2] * s];
const dot = (u: Vec3, v: Vec3): number => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const cross = (u: Vec3, v: Vec3): Vec3 => [
  u[1] * v[2] - u[2] * v[1],
  u[2] * v[0] - u[0] * v[2],
  u[0] * v[1] - u[1] * v[0],
];
const norm3 = (u: Vec3): number => Math.hypot(u[0], u[1], u[2]);

/** Field (T) at point P from a single finite straight current segment. */
export function segmentField(seg: Segment, p: Vec3): Vec3 {
  const eVec = sub(seg.b, seg.a);
  const len = norm3(eVec);
  if (len < 1e-15) return [0, 0, 0];
  const e: Vec3 = scale(eVec, 1 / len);

  const aToP = sub(p, seg.a); // vector from A to P
  const along = dot(aToP, e); // projection onto the wire
  // Perpendicular component from the wire's foot to P.
  const perp = sub(aToP, scale(e, along));
  let d = norm3(perp);
  const MIN_D = 1e-9;
  if (d < MIN_D) return [0, 0, 0]; // on the wire axis: singular, treated as 0
  const nHat: Vec3 = scale(perp, 1 / d);

  const bToP = sub(p, seg.b);
  const ra = norm3(aToP);
  const rb = norm3(bToP);
  // cosθ1 at A, cosθ2 at B (angles between wire direction and line to P).
  const cos1 = dot(aToP, e) / ra;
  const cos2 = dot(bToP, e) / rb;

  const mag = (MU0 * seg.current) / (4 * Math.PI * d) * (cos1 - cos2);
  return scale(cross(e, nHat), mag);
}

/** Total field (T) at point P from a collection of segments (superposition). */
export function fieldAt(segments: Segment[], p: Vec3): Vec3 {
  let bx = 0, by = 0, bz = 0;
  for (const seg of segments) {
    const b = segmentField(seg, p);
    bx += b[0]; by += b[1]; bz += b[2];
  }
  return [bx, by, bz];
}

/** Two unit vectors spanning the plane perpendicular to `axis`. */
function planeBasis(axis: Vec3): [Vec3, Vec3] {
  const n = norm3(axis);
  const a: Vec3 = scale(axis, 1 / n);
  // Pick any vector not parallel to a.
  const ref: Vec3 = Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  let u = cross(a, ref);
  u = scale(u, 1 / norm3(u));
  const v = cross(a, u);
  return [u, v];
}

/**
 * Discretise a circular current loop into `nSeg` chords. `center` is the loop
 * centre, `radius` its radius (m), `axis` its normal (current circulates by the
 * right-hand rule about +axis), `current` in A.
 */
export function buildLoop(center: Vec3, radius: number, axis: Vec3, current: number, nSeg = 180): Segment[] {
  const [u, v] = planeBasis(axis);
  const pt = (phi: number): Vec3 =>
    add(center, add(scale(u, radius * Math.cos(phi)), scale(v, radius * Math.sin(phi))));
  const segs: Segment[] = [];
  for (let k = 0; k < nSeg; k++) {
    const p0 = pt((2 * Math.PI * k) / nSeg);
    const p1 = pt((2 * Math.PI * (k + 1)) / nSeg);
    segs.push({ a: p0, b: p1, current });
  }
  return segs;
}

/** A straight finite wire from a to b carrying `current` A. */
export function buildWire(a: Vec3, b: Vec3, current: number): Segment {
  return { a, b, current };
}

/** Analytic on-axis field magnitude of a circular loop: µ0 I R²/(2(R²+z²)^{3/2}). */
export function loopAxisField(radius: number, current: number, z: number): number {
  const R2 = radius * radius;
  return (MU0 * current * R2) / (2 * Math.pow(R2 + z * z, 1.5));
}

export interface FieldLine {
  points: Vec3[];
  /** True if the trace terminated because |B| fell below the floor. */
  faded: boolean;
}

export interface TraceOptions {
  /** Arclength step (m). */
  step: number;
  maxSteps: number;
  /** Stop if |B| drops below this (T). */
  minField?: number;
  /** Stop if the point leaves this axis-aligned half-extent from the origin (m). */
  bound?: number;
  /** March along −B̂ instead of +B̂. */
  reverse?: boolean;
}

/**
 * Trace one magnetic field line from `start` by RK4-integrating dr/ds = B̂(r),
 * the unit field direction. Field lines follow B but do NOT preserve |B|, so we
 * normalise the field at each RK4 stage to march at constant arclength.
 */
export function traceFieldLine(segments: Segment[], start: Vec3, opts: TraceOptions): FieldLine {
  const h = opts.reverse ? -opts.step : opts.step;
  const minField = opts.minField ?? 1e-12;
  const bound = opts.bound ?? Infinity;
  const points: Vec3[] = [start];
  let p = start;

  const dir = (q: Vec3): Vec3 | null => {
    const b = fieldAt(segments, q);
    const m = norm3(b);
    if (m < minField) return null;
    return scale(b, 1 / m);
  };

  for (let i = 0; i < opts.maxSteps; i++) {
    const k1 = dir(p);
    if (!k1) return { points, faded: true };
    const k2 = dir(add(p, scale(k1, h / 2)));
    if (!k2) return { points, faded: true };
    const k3 = dir(add(p, scale(k2, h / 2)));
    if (!k3) return { points, faded: true };
    const k4 = dir(add(p, scale(k3, h)));
    if (!k4) return { points, faded: true };
    const incr = scale(
      [
        k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0],
        k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1],
        k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2],
      ],
      h / 6,
    );
    p = add(p, incr);
    if (Math.abs(p[0]) > bound || Math.abs(p[1]) > bound || Math.abs(p[2]) > bound) {
      points.push(p);
      break;
    }
    points.push(p);
  }
  return { points, faded: false };
}
