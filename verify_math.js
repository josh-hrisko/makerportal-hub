// Math verification script
function deg2rad(d) { return (d * Math.PI) / 180; }
function rad2deg(r) { return (r * 180) / Math.PI; }

const CX = 320, CY = 320, R = 300;
let lambda0 = -20;
const phi0 = 18;

function project(latDeg, lonDeg) {
  const phi = deg2rad(latDeg);
  const lam = deg2rad(lonDeg - lambda0);
  const p0 = deg2rad(phi0);
  const cosC = Math.sin(p0) * Math.sin(phi) + Math.cos(p0) * Math.cos(phi) * Math.cos(lam);
  const x = CX + R * Math.cos(phi) * Math.sin(lam);
  const y = CY - R * (Math.cos(p0) * Math.sin(phi) - Math.sin(p0) * Math.cos(phi) * Math.cos(lam));
  return { x, y, visible: cosC > 0, cosC };
}

console.log("---- Projection Edge Cases ----");
// North Pole
console.log("North Pole (90, 0):", project(90, 0));
// South Pole
console.log("South Pole (-90, 0):", project(-90, 0));
// λ - λ0 = 90° (on the limb)
console.log("Limb Equator (0, 70):", project(0, 70));
// Center (phi0, lambda0)
console.log("Center (18, -20):", project(18, -20));

console.log("\n---- Terminator Edge Cases ----");
function toVec3(latDeg, lonDeg) {
  const phi = deg2rad(latDeg), lam = deg2rad(lonDeg);
  return [Math.cos(phi) * Math.cos(lam), Math.cos(phi) * Math.sin(lam), Math.sin(phi)];
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function normalize(a) {
  const m = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / m, a[1] / m, a[2] / m];
}
function toLatLon(v) {
  return { lat: rad2deg(Math.asin(v[2])), lon: rad2deg(Math.atan2(v[1], v[0])) };
}
function terminatorLatLon(decl, ssLon) {
  const s = toVec3(decl, ssLon);
  const ref = Math.abs(s[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
  const u = normalize(cross(ref, s));
  const v = normalize(cross(s, u));
  const points = [];
  for (let i = 0; i <= 180; i++) {
    const t = deg2rad(i * 2);
    const p = [
      Math.cos(t) * u[0] + Math.sin(t) * v[0],
      Math.cos(t) * u[1] + Math.sin(t) * v[1],
      Math.cos(t) * u[2] + Math.sin(t) * v[2],
    ];
    points.push(toLatLon(p));
  }
  return points;
}
function isDaylight(latDeg, lonDeg, decl, ssLon) {
  const phi = deg2rad(latDeg), d = deg2rad(decl), dl = deg2rad(lonDeg - ssLon);
  return Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(dl); // raw dot product
}

const termSolstice = terminatorLatLon(23.44, 0); // Summer solstice
console.log("Solstice terminator sample check:");
console.log("Point 0 daylight dot product (should be ~0):", isDaylight(termSolstice[0].lat, termSolstice[0].lon, 23.44, 0));
console.log("Point 45 daylight dot product (should be ~0):", isDaylight(termSolstice[45].lat, termSolstice[45].lon, 23.44, 0));
console.log("Point 90 daylight dot product (should be ~0):", isDaylight(termSolstice[90].lat, termSolstice[90].lon, 23.44, 0));

console.log("\n---- Orbit Edge Cases ----");
const GM = 398600.4418;
const EARTH_RADIUS_KM = 6378.137;
function testOrbit(ecc, meanAnom, a) {
  const nRadS = Math.sqrt(GM / (a*a*a));
  let M = meanAnom;
  let E = M;
  for (let i = 0; i < 15; i++) E -= (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E));
  const nu = 2 * Math.atan2(Math.sqrt(1 + ecc) * Math.sin(E / 2), Math.sqrt(1 - ecc) * Math.cos(E / 2));
  const r = a * (1 - ecc * Math.cos(E));
  return {E, nu, r};
}
console.log("Circular orbit at anomaly 0:", testOrbit(0, 0, 6700));
console.log("Circular orbit at anomaly PI:", testOrbit(0, Math.PI, 6700));
console.log("Near-circular orbit near periapsis:", testOrbit(0.0001, 0.001, 6700));
