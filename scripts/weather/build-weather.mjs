/**
 * Weather digest orchestrator — fetches real current conditions for a curated
 * city list, writes src/data/weather.json. Runs from
 * .github/workflows/globe-data-digest.yml (combined weather + TLE); pushes
 * directly to main when changed (build-time static data, no runtime fetch on the hub).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchWeather } from './fetch-weather.mjs';

const OUT_PATH = join(process.cwd(), 'src', 'data', 'weather.json');
const SUMMARY_PATH = join(process.cwd(), 'weather-digest-summary.md'); // gitignored, PR body only

const cities = await fetchWeather();
const generatedAt = new Date().toISOString();

writeFileSync(OUT_PATH, `${JSON.stringify({ generatedAt, cities }, null, 2)}\n`);
writeFileSync(SUMMARY_PATH, renderSummary(cities, generatedAt));

console.log(`Wrote ${cities.length} cities to ${OUT_PATH}`);

function renderSummary(cities, timestamp) {
  const lines = [
    'Automated weather refresh (Open-Meteo, no key). **Review before merging** — ',
    'merging publishes real current conditions to the Globe tool\'s Weather mode.',
    '',
    `**Cities:** ${cities.length}/${cities.length} fetched successfully.`,
    '',
  ];
  for (const c of cities) {
    lines.push(`- **${c.name}** — ${c.tempC}°C, wind ${c.windKph} km/h, humidity ${c.humidity}%`);
  }
  lines.push('', `_Generated ${timestamp}._`);
  return `${lines.join('\n')}\n`;
}
