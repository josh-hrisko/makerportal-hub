/**
 * Celestrak TLE (Two-Line Element) — free, public, no key, no auth.
 * https://celestrak.org/NORAD/documentation/gp-data-formats.php
 */
const ENDPOINT = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE';

export async function fetchIssTle() {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error(`Celestrak fetch failed: ${res.status}`);
  const text = await res.text();
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 3) throw new Error(`Unexpected TLE response shape: ${text.slice(0, 200)}`);
  const [name, line1, line2] = lines;
  return { name, line1, line2 };
}
