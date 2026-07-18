/** Acoustics equations — pure functions, safe for server and client use. */

/** Speed of sound in air (m/s) given temperature in Celsius. */
export function speedOfSound(tempC = 20): number {
  return 331.3 * Math.sqrt(1 + tempC / 273.15);
}

/** Wavelength (m) from frequency (Hz) and speed of sound (m/s). */
export function wavelength(freq: number, c = 343): number {
  return c / freq;
}

/** Frequency (Hz) from wavelength (m) and speed of sound (m/s). */
export function frequencyFromWavelength(wl: number, c = 343): number {
  return c / wl;
}

/** Time delay (ms) from distance (m) and speed of sound (m/s). */
export function delayFromDistance(distance: number, c = 343): number {
  return (distance / c) * 1000;
}

/** Distance (m) from time delay (ms) and speed of sound (m/s). */
export function distanceFromDelay(delayMs: number, c = 343): number {
  return (delayMs / 1000) * c;
}

/** Add two SPL values (dB). For summing multiple levels, reduce pairwise. */
export function splSum(dB1: number, dB2: number): number {
  return 10 * Math.log10(Math.pow(10, dB1 / 10) + Math.pow(10, dB2 / 10));
}

/** Sum an array of SPL values (dB). */
export function splSumArray(levels: number[]): number {
  if (levels.length === 0) return -Infinity;
  let sum = 0;
  for (const db of levels) sum += Math.pow(10, db / 10);
  return 10 * Math.log10(sum);
}

/** Convert SPL (dB) to pressure (Pa). Reference: 20 µPa. */
export function splToPressure(dB: number): number {
  return 20e-6 * Math.pow(10, dB / 20);
}

/** Convert pressure (Pa) to SPL (dB). Reference: 20 µPa. */
export function pressureToSpl(p: number): number {
  if (p <= 0) return -Infinity;
  return 20 * Math.log10(p / 20e-6);
}

/** Sabine RT60 (s). V = volume (m³), A = total absorption (m² sabins). */
export function rt60Sabine(V: number, A: number): number {
  if (A <= 0) return Infinity;
  return 0.161 * V / A;
}

/** Eyring RT60 (s). V = volume (m³), S = total surface area (m²), a = average absorption coefficient. */
export function rt60Eyring(V: number, S: number, alpha: number): number {
  if (alpha <= 0 || alpha >= 1) return Infinity;
  return 0.161 * V / (-S * Math.log(1 - alpha));
}

/**
 * Critical distance (m). Q = directivity factor, R = room constant.
 * R = S * alpha / (1 - alpha) where S is surface area, alpha is average absorption.
 */
export function criticalDistance(Q: number, R: number): number {
  if (R <= 0) return Infinity;
  return Math.sqrt(Q * R / (16 * Math.PI));
}

/**
 * Room modes (axial only for rectangular room).
 * Returns array of {nx, ny, nz, freq} sorted by frequency.
 */
export interface RoomMode {
  nx: number;
  ny: number;
  nz: number;
  freq: number;
  type: 'axial' | 'tangential' | 'oblique';
}

export function roomModes(Lx: number, Ly: number, Lz: number, c = 343, maxFreq = 400): RoomMode[] {
  const modes: RoomMode[] = [];
  const maxNx = Math.ceil((2 * maxFreq * Lx) / c);
  const maxNy = Math.ceil((2 * maxFreq * Ly) / c);
  const maxNz = Math.ceil((2 * maxFreq * Lz) / c);

  for (let nx = 0; nx <= maxNx; nx++) {
    for (let ny = 0; ny <= maxNy; ny++) {
      for (let nz = 0; nz <= maxNz; nz++) {
        if (nx === 0 && ny === 0 && nz === 0) continue;
        const f = (c / 2) * Math.sqrt(
          (nx / Lx) ** 2 + (ny / Ly) ** 2 + (nz / Lz) ** 2
        );
        if (f > maxFreq) continue;

        const nonZero = [nx > 0, ny > 0, nz > 0].filter(Boolean).length;
        let type: RoomMode['type'];
        if (nonZero === 1) type = 'axial';
        else if (nonZero === 2) type = 'tangential';
        else type = 'oblique';

        modes.push({ nx, ny, nz, freq: f, type });
      }
    }
  }
  modes.sort((a, b) => a.freq - b.freq);
  return modes;
}

/** Schroeder frequency (Hz). V = volume (m³), T60 = reverberation time (s). */
export function schroederFrequency(V: number, T60: number): number {
  if (T60 <= 0) return Infinity;
  return 2000 * Math.sqrt(T60 / V);
}

/** Mode density estimate per Hz at frequency f in volume V. */
export function modeDensity(f: number, V: number, S: number, L: number, c = 343): number {
  return (4 * Math.PI * V * f ** 2) / c ** 3
       + (Math.PI * S * f) / (2 * c ** 2)
       + L / (8 * c);
}

/**
 * Pressure at position (x, y, z) for a room mode (nx, ny, nz).
 * Returns normalised pressure (-1 to 1).
 */
export function modePressure(
  x: number, y: number, z: number,
  Lx: number, Ly: number, Lz: number,
  nx: number, ny: number, nz: number,
): number {
  return Math.cos((nx * Math.PI * x) / Lx)
       * Math.cos((ny * Math.PI * y) / Ly)
       * Math.cos((nz * Math.PI * z) / Lz);
}

/** Helmholtz resonator frequency (Hz). S = port area (m²), L = port length (m), V = cavity volume (m³), c = speed of sound. */
export function helmholtzFrequency(S: number, L: number, V_: number, c = 343): number {
  const Leff = L + 0.85 * Math.sqrt(S / Math.PI); // end correction
  if (Leff <= 0 || V_ <= 0) return 0;
  return (c / (2 * Math.PI)) * Math.sqrt(S / (V_ * Leff));
}

/** Port length for desired tuning frequency. S = port area (m²), fb = tuning (Hz), Vb = box volume (m³). */
export function portLength(S: number, fb: number, Vb: number, c = 343): number {
  if (fb <= 0 || Vb <= 0) return 0;
  const k = (2 * Math.PI * fb) / c;
  const L = S / (k * k * Vb);
  return L - 0.85 * Math.sqrt(S / Math.PI);
}

/** dB to linear ratio. */
export function dbToRatio(db: number): number {
  return Math.pow(10, db / 20);
}

/** Linear ratio to dB. */
export function ratioToDb(ratio: number): number {
  if (ratio <= 0) return -Infinity;
  return 20 * Math.log10(ratio);
}

/**
 * Bessel function of the first kind J_n(x) using midpoint numerical integration.
 * Excellent accuracy for the visualization range (x < 50).
 */
export function besselJ(n: number, x: number): number {
  const steps = 60;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const tau = (i + 0.5) * (Math.PI / steps);
    sum += Math.cos(n * tau - x * Math.sin(tau));
  }
  return sum / steps;
}

export function besselJ0(x: number): number {
  return besselJ(0, x);
}

export function besselJ1(x: number): number {
  return besselJ(1, x);
}

/** 
 * Doppler shifted frequency.
 * vs = source velocity (m/s), positive if moving TOWARDS observer.
 * vo = observer velocity (m/s), positive if moving TOWARDS source.
 */
export function dopplerShift(f: number, vs: number, vo: number, c = 343): number {
  return f * (c + vo) / (c - vs);
}

/**
 * Mass Law Transmission Loss (dB) for random field incidence.
 * m = surface mass density (kg/m²), f = frequency (Hz).
 */
export function massLawTransmissionLoss(m: number, f: number): number {
  const tl = 20 * Math.log10(m * f) - 47.2;
  return Math.max(0, tl);
}

/**
 * Webster's horn equation area expansion.
 * type = 'exponential' | 'conical' | 'oblate-spheroidal'
 * S0 = throat area (m²)
 * param = flare constant m (1/m) for exponential, half-angle (rad) for conical/oblate
 * x = distance from throat (m)
 */
export function websterHornArea(type: 'exponential' | 'conical' | 'oblate-spheroidal', S0: number, param: number, x: number): number {
  if (x <= 0) return S0;
  switch (type) {
    case 'exponential':
      return S0 * Math.exp(param * x);
    case 'conical': {
      const r0 = Math.sqrt(S0 / Math.PI);
      const r = r0 + x * Math.tan(param);
      return Math.PI * r * r;
    }
    case 'oblate-spheroidal': {
      const a = Math.sqrt(S0 / Math.PI) / Math.sin(param);
      return S0 * (1 + (x * x) / (a * a));
    }
    default:
      return S0;
  }
}

/**
 * Noise Rating (NR) curve SPL limit for a given frequency.
 * nr = target NR curve (e.g. 30, 45)
 * f = octave band center frequency (Hz)
 * Returns the maximum allowed SPL (dB) for that band.
 */
export function noiseRatingSpl(nr: number, f: number): number {
  let A = 0;
  let B = 1;
  switch (f) {
    case 31.5: A = 55.4; B = 0.681; break;
    case 63:   A = 35.4; B = 0.790; break;
    case 125:  A = 22.0; B = 0.870; break;
    case 250:  A = 12.0; B = 0.930; break;
    case 500:  A = 4.8;  B = 0.974; break;
    case 1000: A = 0.0;  B = 1.000; break;
    case 2000: A = -3.5; B = 1.015; break;
    case 4000: A = -6.1; B = 1.025; break;
    case 8000: A = -8.0; B = 1.030; break;
    default:
      // If an exact standard octave isn't requested, interpolate or return NaN.
      // We will just return NaN if it's not a standard band for simplicity.
      return NaN;
  }
  return A + B * nr;
}
