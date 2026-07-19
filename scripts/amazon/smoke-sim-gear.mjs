/**
 * Build-time smoke: every simulator gear card resolves to a URL.
 * Amazon cards must title-match catalog; SparkFun cards need path + image.
 *
 *   node scripts/amazon/smoke-sim-gear.mjs
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const links = JSON.parse(readFileSync(join(ROOT, 'src/data/affiliate-links.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(join(ROOT, 'src/data/amazon-catalog.json'), 'utf8'));

const SIMS = [
  'pid-flight-arena',
  'signal-integrity-lab',
  'rf-microwave-bench',
  'fea-structural-lab',
  'rtos-scheduler',
  'slam-odometry-arena',
  'gan-foc-drive',
  'antenna-em-sandbox',
  'verilog-live-sculptor',
  'webgpu-pinn-studio',
  'elevenlabs-dsp-sandbox',
  'modal-gpu-benchmarker',
  'fly-edge-db-lab',
];

const STOP = new Set([
  'with', 'and', 'the', 'for', 'from', 'kit', 'board', 'module', 'usb', 'set',
  'pack', 'pcs', 'version', 'edition', 'black', 'white', 'new', 'pro', 'mini',
]);

function tokens(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9.+]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function coverage(label, title) {
  const A = tokens(label);
  const B = new Set(tokens(title));
  if (!A.length || !B.size) return 0;
  let n = 0;
  for (const t of A) if (B.has(t)) n += 1;
  return n / A.length;
}

function merchantOf(link) {
  if (link.merchant) return link.merchant;
  if (link.externalUrl && !link.asin) return 'other';
  return 'amazon';
}

const errors = [];
let cards = 0;
let sparkfunCards = 0;

for (const sim of SIMS) {
  const gear = links.filter((l) => l.relatedTo?.includes(sim));
  if (!gear.length) {
    errors.push(`${sim}: no gear linked`);
    continue;
  }
  for (const link of gear) {
    cards += 1;
    const merchant = merchantOf(link);

    if (merchant === 'sparkfun') {
      sparkfunCards += 1;
      if (!link.externalUrl && !link.sku) {
        errors.push(`${sim}/${link.id}: sparkfun missing path`);
      }
      if (!link.image) {
        errors.push(`${sim}/${link.id}: sparkfun missing image`);
      }
      continue;
    }

    if (merchant !== 'amazon') {
      if (!link.externalUrl) errors.push(`${sim}/${link.id}: non-amazon missing externalUrl`);
      continue;
    }

    if (!link.asin) {
      errors.push(`${sim}/${link.id}: amazon link missing asin`);
      continue;
    }
    const live = catalog.items?.[link.asin];
    if (!live?.title) {
      errors.push(`${sim}/${link.id}: no catalog title for ${link.asin}`);
      continue;
    }
    const cov = coverage(link.label, live.title);
    if (cov < 0.34) {
      errors.push(`${sim}/${link.id}: title mismatch (${(cov * 100).toFixed(0)}%) live="${live.title.slice(0, 60)}"`);
    }
  }
}

if (errors.length) {
  console.error(`Sim gear smoke FAILED (${errors.length} issues, ${cards} cards):`);
  for (const e of errors) console.error('  ✖', e);
  process.exit(1);
}
console.log(`Sim gear smoke passed: ${SIMS.length} sims, ${cards} cards (${sparkfunCards} SparkFun).`);
