/** DSP filter math — pure functions for pole-zero analysis and biquad design. */

export interface BiquadCoeffs {
  b0: number;
  b1: number;
  b2: number;
  a0: number;
  a1: number;
  a2: number;
}

export interface PoleZero {
  r: number;
  theta: number;
}

/** RBJ Audio EQ Cookbook coefficient calculation. */
export function rbjCoeffs(
  type: string,
  freq: number,
  Q: number,
  gainDB: number,
  Fs: number,
): BiquadCoeffs {
  const w0 = (2 * Math.PI * freq) / Fs;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const A = Math.pow(10, gainDB / 40);
  const sqrtA = Math.sqrt(A);
  const safeQ = Q <= 0 ? 0.0001 : Q;

  let alpha: number;
  let b0 = 1, b1 = 0, b2 = 0;
  let a0 = 1, a1 = 0, a2 = 0;

  switch (type) {
    case 'lowpass':
      alpha = sinW0 / (2 * safeQ);
      b0 = (1 - cosW0) / 2; b1 = 1 - cosW0; b2 = (1 - cosW0) / 2;
      a0 = 1 + alpha; a1 = -2 * cosW0; a2 = 1 - alpha;
      break;
    case 'highpass':
      alpha = sinW0 / (2 * safeQ);
      b0 = (1 + cosW0) / 2; b1 = -(1 + cosW0); b2 = (1 + cosW0) / 2;
      a0 = 1 + alpha; a1 = -2 * cosW0; a2 = 1 - alpha;
      break;
    case 'bandpass':
      alpha = sinW0 / (2 * safeQ);
      b0 = alpha; b1 = 0; b2 = -alpha;
      a0 = 1 + alpha; a1 = -2 * cosW0; a2 = 1 - alpha;
      break;
    case 'notch':
      alpha = sinW0 / (2 * safeQ);
      b0 = 1; b1 = -2 * cosW0; b2 = 1;
      a0 = 1 + alpha; a1 = -2 * cosW0; a2 = 1 - alpha;
      break;
    case 'allpass':
      alpha = sinW0 / (2 * safeQ);
      b0 = 1 - alpha; b1 = -2 * cosW0; b2 = 1 + alpha;
      a0 = 1 + alpha; a1 = -2 * cosW0; a2 = 1 - alpha;
      break;
    case 'peaking':
      alpha = sinW0 * Math.sinh(Math.log(2) / 2 * Q * w0 / sinW0);
      b0 = 1 + alpha * A; b1 = -2 * cosW0; b2 = 1 - alpha * A;
      a0 = 1 + alpha / A; a1 = -2 * cosW0; a2 = 1 - alpha / A;
      break;
    case 'lowshelf':
      alpha = sinW0 / 2 * Math.sqrt((A + 1 / A) * (1 / 1 - 1) + 2);
      b0 = A * ((A + 1) - (A - 1) * cosW0 + 2 * sqrtA * alpha);
      b1 = 2 * A * ((A - 1) - (A + 1) * cosW0);
      b2 = A * ((A + 1) - (A - 1) * cosW0 - 2 * sqrtA * alpha);
      a0 = (A + 1) + (A - 1) * cosW0 + 2 * sqrtA * alpha;
      a1 = -2 * ((A - 1) + (A + 1) * cosW0);
      a2 = (A + 1) + (A - 1) * cosW0 - 2 * sqrtA * alpha;
      break;
    case 'highshelf':
      alpha = sinW0 / 2 * Math.sqrt((A + 1 / A) * (1 / 1 - 1) + 2);
      b0 = A * ((A + 1) + (A - 1) * cosW0 + 2 * sqrtA * alpha);
      b1 = -2 * A * ((A - 1) + (A + 1) * cosW0);
      b2 = A * ((A + 1) + (A - 1) * cosW0 - 2 * sqrtA * alpha);
      a0 = (A + 1) - (A - 1) * cosW0 + 2 * sqrtA * alpha;
      a1 = 2 * ((A - 1) + (A + 1) * cosW0);
      a2 = (A + 1) - (A - 1) * cosW0 - 2 * sqrtA * alpha;
      break;
    default:
      return { b0: 1, b1: 0, b2: 0, a0: 1, a1: 0, a2: 0 };
  }

  b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0; a0 = 1;
  return { b0, b1, b2, a0, a1, a2 };
}

/** Frequency response at a single frequency for given biquad. */
export function freqResponse(
  coeffs: BiquadCoeffs,
  f: number,
  Fs: number,
): { mag: number; phase: number; re: number; im: number } {
  const w = (2 * Math.PI * f) / Fs;
  const cosW = Math.cos(w);
  const cos2W = Math.cos(2 * w);
  const sinW = Math.sin(w);
  const sin2W = Math.sin(2 * w);

  const nr = coeffs.b0 + coeffs.b1 * cosW + coeffs.b2 * cos2W;
  const ni = -coeffs.b1 * sinW - coeffs.b2 * sin2W;
  const dr = 1 + coeffs.a1 * cosW + coeffs.a2 * cos2W;
  const di = -coeffs.a1 * sinW - coeffs.a2 * sin2W;

  const denom = dr * dr + di * di || 1e-12;
  const re = (nr * dr + ni * di) / denom;
  const im = (ni * dr - nr * di) / denom;

  return {
    mag: Math.hypot(re, im),
    phase: Math.atan2(im, re),
    re,
    im,
  };
}

/**
 * Group delay (samples) at frequency f for biquad.
 * d(phase)/d(omega) computed via finite difference.
 */
export function groupDelay(
  coeffs: BiquadCoeffs,
  f: number,
  Fs: number,
  df = 1,
): number {
  const r1 = freqResponse(coeffs, Math.max(1, f - df), Fs);
  const r2 = freqResponse(coeffs, f + df, Fs);
  const dw = (2 * Math.PI * (2 * df)) / Fs;

  let dPhase = r2.phase - r1.phase;
  // Unwrap phase difference
  while (dPhase > Math.PI) dPhase -= 2 * Math.PI;
  while (dPhase < -Math.PI) dPhase += 2 * Math.PI;

  return -dPhase / dw / Fs; // in seconds
}

/**
 * Convert pole-zero pair to biquad coefficients.
 * Conjugate pairs: p1, p2 are conjugates; z1, z2 are conjugates.
 */
export function poleZeroToCoeffs(
  poles: [PoleZero, PoleZero],
  zeros: [PoleZero, PoleZero],
): BiquadCoeffs {
  const [p1] = poles;
  const [z1] = zeros;

  const reP = p1.r * Math.cos(p1.theta);
  const reZ = z1.r * Math.cos(z1.theta);

  const b0 = 1;
  const b1 = -2 * reZ;
  const b2 = z1.r * z1.r;
  const a0 = 1;
  const a1 = -2 * reP;
  const a2 = p1.r * p1.r;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a0: 1,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

/** Single pole/zero frequency response factor: H = (e^jw - z) / (e^jw - p) */
export function poleZeroResponse(
  pole: PoleZero | null,
  zero: PoleZero | null,
  w: number,
): { mag: number; phase: number } {
  const jwRe = Math.cos(w);
  const jwIm = Math.sin(w);

  let numRe = 1, numIm = 0;
  if (zero) {
    const zRe = zero.r * Math.cos(zero.theta);
    const zIm = zero.r * Math.sin(zero.theta);
    numRe = jwRe - zRe;
    numIm = jwIm - zIm;
  }

  let denRe = 1, denIm = 0;
  if (pole) {
    const pRe = pole.r * Math.cos(pole.theta);
    const pIm = pole.r * Math.sin(pole.theta);
    denRe = jwRe - pRe;
    denIm = jwIm - pIm;
  }

  const mag = Math.hypot(numRe, numIm) / (Math.hypot(denRe, denIm) || 1e-12);
  const phase = Math.atan2(numIm, numRe) - Math.atan2(denIm, denRe);

  return { mag, phase };
}

/** Conjugate of a pole/zero (reflected across real axis). */
export function conjugate(pz: PoleZero): PoleZero {
  return { r: pz.r, theta: -pz.theta };
}

/** Clamp value between lo and hi. */
export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Log-spaced frequency array. */
export function logFreqSteps(minF: number, maxF: number, count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    out.push(minF * Math.pow(maxF / minF, i / (count - 1)));
  }
  return out;
}

/** Map frequency to x position on a log-scaled axis. */
export function freqToX(f: number, minF: number, maxF: number, width: number): number {
  return (Math.log(f / minF) / Math.log(maxF / minF)) * width;
}

/**
 * Exact numerical extraction of Fourier coefficients for a known fundamental frequency.
 * Extracts over exactly one period (the last period in the arrays).
 * Returns array of magnitudes [DC, Fundamental, H2, H3, ...].
 */
export function extractHarmonics(
  time: number[],
  signal: number[],
  f0: number,
  numHarmonics = 5
): number[] {
  if (time.length < 2 || time.length !== signal.length) return Array(numHarmonics + 1).fill(0);
  
  const T = 1 / f0;
  const tEnd = time[time.length - 1];
  let tStart = tEnd - T;
  
  if (tStart < time[0]) tStart = time[0]; // fallback
  
  const mags = new Float64Array(numHarmonics + 1);
  const w0 = 2 * Math.PI * f0;
  
  let dcSum = 0;
  const aSum = new Float64Array(numHarmonics + 1);
  const bSum = new Float64Array(numHarmonics + 1);
  
  for (let i = 0; i < time.length - 1; i++) {
    const t1 = time[i];
    const t2 = time[i+1];
    
    if (t2 <= tStart) continue; // Before our window
    
    // Find intersection with [tStart, tEnd]
    const tLeft = Math.max(t1, tStart);
    const tRight = Math.min(t2, tEnd);
    
    if (tLeft >= tRight) continue;
    
    // Interpolate signal values
    const fraction1 = (tLeft - t1) / (t2 - t1);
    const sLeft = signal[i] + fraction1 * (signal[i+1] - signal[i]);
    
    const fraction2 = (tRight - t1) / (t2 - t1);
    const sRight = signal[i] + fraction2 * (signal[i+1] - signal[i]);
    
    const dt = tRight - tLeft;
    const tMid = (tLeft + tRight) / 2;
    const sMid = (sLeft + sRight) / 2;
    
    dcSum += sMid * dt;
    for (let n = 1; n <= numHarmonics; n++) {
      aSum[n] += sMid * Math.cos(n * w0 * tMid) * dt;
      bSum[n] += sMid * Math.sin(n * w0 * tMid) * dt;
    }
  }
  
  const actualT = tEnd - tStart;
  mags[0] = dcSum / actualT;
  for (let n = 1; n <= numHarmonics; n++) {
    mags[n] = Math.hypot(aSum[n] * (2 / actualT), bSum[n] * (2 / actualT));
  }
  
  return Array.from(mags);
}

