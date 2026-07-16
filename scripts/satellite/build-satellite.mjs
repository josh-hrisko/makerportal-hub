/**
 * ISS TLE digest orchestrator — writes src/data/satellite.json with the raw
 * TLE lines. Runs from .github/workflows/satellite-tle.yml; a human merges
 * the PR before it reaches the Globe tool. The tool itself does simplified
 * two-body orbital propagation client-side from these committed elements —
 * no runtime fetch, no live tracking API call.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchIssTle } from './fetch-tle.mjs';

const OUT_PATH = join(process.cwd(), 'src', 'data', 'satellite.json');
const SUMMARY_PATH = join(process.cwd(), 'satellite-tle-summary.md'); // gitignored, PR body only

const tle = await fetchIssTle();
const generatedAt = new Date().toISOString();

writeFileSync(OUT_PATH, `${JSON.stringify({ generatedAt, ...tle }, null, 2)}\n`);
writeFileSync(
  SUMMARY_PATH,
  [
    'Automated ISS orbital element refresh (Celestrak, no key). **Review before merging** — ',
    "merging publishes these to the Globe tool's ISS Tracker mode.",
    '',
    `**${tle.name}**`,
    '```',
    tle.line1,
    tle.line2,
    '```',
    '',
    `_Generated ${generatedAt}._`,
    '',
  ].join('\n'),
);

console.log(`Wrote TLE for ${tle.name} to ${OUT_PATH}`);
