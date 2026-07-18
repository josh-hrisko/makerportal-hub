/**
 * Special-relativistic relations for constant-proper-acceleration ("1g")
 * starship flight — pure functions, safe for server and client use.
 *
 * A ship that fires its engine to hold a constant proper acceleration a (the
 * acceleration its crew feels) traces a hyperbolic worldline in the Earth
 * inertial frame. With rapidity φ = a·τ/c accumulated over proper time τ:
 *
 *   β(τ) = tanh φ            γ(τ) = cosh φ
 *   t(τ) = (c/a)·sinh φ      x(τ) = (c²/a)·(cosh φ − 1)
 *
 * These are EXACT for a point ship under constant proper acceleration in flat
 * (special-relativistic) spacetime. They ignore general relativity (no real
 * gravity wells / cosmological expansion), fuel mass, and the enormous energy
 * such a flight would need. The cosmic-microwave-background shift assumes the
 * ship moves through an isotropic 2.725 K bath and uses the exact relativistic
 * Doppler factor, but ignores cosmological redshift evolution of that bath.
 */

/** Speed of light (m/s). */
export const C = 299792458;
/** Standard gravity (m/s²). */
export const G0 = 9.80665;
/** Light-year (m), using the Julian year. */
export const LIGHT_YEAR = 9.4607304725808e15;
/** Julian year (s). */
export const JULIAN_YEAR = 31557600;
/** CMB monopole temperature today (K). */
export const CMB_TEMPERATURE = 2.72548;

/** Lorentz factor γ from velocity fraction β = v/c. */
export function lorentzGamma(beta: number): number {
  return 1 / Math.sqrt(1 - beta * beta);
}

/** Accumulated rapidity φ = a·τ/c after proper time τ (s) at proper accel a (m/s²). */
export function rapidity(a: number, tau: number): number {
  return (a * tau) / C;
}

/** Velocity fraction β = v/c reached after proper time τ. */
export function betaAtProperTime(a: number, tau: number): number {
  return Math.tanh(rapidity(a, tau));
}

/** Lorentz factor γ after proper time τ (equals cosh φ). */
export function gammaAtProperTime(a: number, tau: number): number {
  return Math.cosh(rapidity(a, tau));
}

/** Earth-frame (coordinate) time t (s) elapsed after ship proper time τ. */
export function coordinateTime(a: number, tau: number): number {
  return (C / a) * Math.sinh(rapidity(a, tau));
}

/** Distance x (m) covered in the Earth frame after ship proper time τ. */
export function distanceTraveled(a: number, tau: number): number {
  return (C * C / a) * (Math.cosh(rapidity(a, tau)) - 1);
}

/**
 * Relativistic Doppler factor δ = √((1+β)/(1−β)) for a source directly ahead
 * (approaching). Blueshifts frequency ahead; use 1/δ for the source behind.
 */
export function dopplerFactor(beta: number): number {
  return Math.sqrt((1 + beta) / (1 - beta));
}

/**
 * CMB temperature the crew measures looking directly ahead, T = T0·δ. The
 * isotropic 2.725 K bath is beamed into a hot forward spot and a cold aft spot;
 * this returns the forward (hottest) value. Behind them it is T0/δ.
 */
export function cmbTemperatureAhead(beta: number, t0 = CMB_TEMPERATURE): number {
  return t0 * dopplerFactor(beta);
}

export interface FlipAndBurn {
  /** Ship proper time for the whole trip (s). */
  properTime: number;
  /** Earth-frame elapsed time for the whole trip (s). */
  coordinateTime: number;
  /** Proper time to the turnaround midpoint (s). */
  turnaroundProperTime: number;
  /** Peak β at the midpoint. */
  peakBeta: number;
  /** Peak γ at the midpoint. */
  peakGamma: number;
}

/**
 * "Flip and burn" cruise to a fixed Earth-frame distance d (m): accelerate at a
 * for the first half, flip, and decelerate for the second half, arriving at
 * rest. Returns ship and Earth times and the peak Lorentz factor at midpoint.
 */
export function flipAndBurn(a: number, distance: number): FlipAndBurn {
  // Half the distance is covered accelerating from rest.
  const half = distance / 2;
  // x = (c²/a)(cosh φ − 1) ⇒ cosh φ = 1 + a·x/c².
  const coshPhi = 1 + (a * half) / (C * C);
  const phi = Math.acosh(coshPhi);
  const tauHalf = (C / a) * phi;
  const tHalf = (C / a) * Math.sinh(phi);
  return {
    properTime: 2 * tauHalf,
    coordinateTime: 2 * tHalf,
    turnaroundProperTime: tauHalf,
    peakBeta: Math.tanh(phi),
    peakGamma: coshPhi,
  };
}

/** Convert an acceleration expressed in g's to m/s². */
export function gToMetric(gs: number): number {
  return gs * G0;
}
