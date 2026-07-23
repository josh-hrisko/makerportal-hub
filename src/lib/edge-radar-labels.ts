/**
 * Compact board labels that always retain RAM SKU size.
 *
 * DEAD-END (do not reintroduce): `name.split('(')[0].trim()` collapses
 * "Raspberry Pi 5 (8 GB)" and "Raspberry Pi 5 (16 GB)" to the same string,
 * which broke fit-matrix headers, spider chips, kit cards, and MemoryBar groups.
 *
 * SSOT for Astro UI. Mirror kept in scripts/edgespec/radar-core.mjs for gate tests
 * (shortBoardLabel uniqueness across BOARDS). Keep both implementations in sync
 * when adding boards.
 *
 * "Raspberry Pi 5 (8 GB)"  → "Pi 5 8GB"
 * "Raspberry Pi 5 (16 GB)" → "Pi 5 16GB"
 * "Radxa ROCK 5B (16 GB)"  → "ROCK 5B 16GB"
 */
const ALIASES: [RegExp, string][] = [
  [/^Raspberry Pi 5$/i, 'Pi 5'],
  [/^Jetson Orin Nano$/i, 'Orin Nano'],
  [/^Jetson Orin NX$/i, 'Orin NX'],
  [/^LattePanda Sigma$/i, 'Sigma'],
  [/^Orange Pi 5 Plus$/i, 'Orange Pi 5+'],
  [/^Radxa ROCK 5B$/i, 'ROCK 5B'],
  [/^Coral Edge TPU$/i, 'Coral TPU'],
  [/^ESP32-S3$/i, 'ESP32-S3'],
  [/^Teensy 4\.1$/i, 'Teensy 4.1'],
];

export function shortBoardLabel(name: string): string {
  const m = name.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  const base = (m ? m[1] : name).trim();
  const paren = m ? m[2].trim() : '';

  let short = base;
  for (const [re, alias] of ALIASES) {
    if (re.test(base)) {
      short = alias;
      break;
    }
  }

  const sizeMatch = paren.match(/(\d+(?:\.\d+)?)\s*(GB|MB|KB|GiB|MiB|KiB)/i);
  if (sizeMatch) {
    const unit = sizeMatch[2].toUpperCase().replace('IB', 'B');
    return `${short} ${sizeMatch[1]}${unit}`;
  }

  if (/N8R8/i.test(paren)) return `${short} N8R8`;
  if (/\+?\s*8\s*MB\s*PSRAM/i.test(paren)) return `${short} +8MB`;

  return short;
}
