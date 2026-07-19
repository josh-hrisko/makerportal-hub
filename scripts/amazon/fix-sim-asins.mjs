/**
 * One-shot integrity repair for simulator gear ASINs.
 * - Enforces 1 ASIN → 1 link id
 * - Replaces known-wrong collisions with verified Creators-API ASINs
 * - Removes unfixifiable specialty SKUs (prefer empty over lying)
 * - Merges pure duplicate entries
 *
 * Run: node scripts/amazon/fix-sim-asins.mjs
 * Then: node --env-file=.env scripts/amazon/build-catalog.mjs
 * Then: node scripts/amazon/audit-asins.mjs --sims-only --strict-catalog
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PATH = join(process.cwd(), 'src', 'data', 'affiliate-links.json');
const links = JSON.parse(readFileSync(PATH, 'utf8'));
const byId = new Map(links.map((l) => [l.id, { ...l, relatedTo: [...(l.relatedTo ?? [])] }]));

function ensure(id) {
  const l = byId.get(id);
  if (!l) throw new Error(`Missing link id: ${id}`);
  return l;
}

function setAsin(id, asin, patch = {}) {
  const l = ensure(id);
  l.asin = asin;
  Object.assign(l, patch);
}

function mergeInto(fromId, intoId) {
  const from = byId.get(fromId);
  const into = byId.get(intoId);
  if (!from) return;
  if (!into) {
    byId.delete(fromId);
    return;
  }
  const rel = new Set([...(into.relatedTo ?? []), ...(from.relatedTo ?? [])]);
  into.relatedTo = [...rel];
  byId.delete(fromId);
}

function remove(id) {
  byId.delete(id);
}

function addRelated(id, ...sims) {
  const l = ensure(id);
  const rel = new Set([...(l.relatedTo ?? []), ...sims]);
  l.relatedTo = [...rel];
}

// ── Merges (same physical product, two ids) ──────────────────────────
mergeInto('jetson-orin-nano-super-8gb-pinn', 'jetson-orin-nano-super-dev-kit');
mergeInto('segger-jlink-edu-mini-debugger-rtos', 'segger-jlink-edu-mini');
mergeInto('adafruit-bno085-imu-9dof', 'bno055-9dof-imu-adafruit');
// BNO055 is the verified Adafruit ASIN — keep honest labeling
if (byId.has('bno055-9dof-imu-adafruit')) {
  setAsin('bno055-9dof-imu-adafruit', 'B017PEIGIG', {
    label: 'Adafruit BNO055 9-DoF Absolute Orientation IMU',
    note: 'Bosch BNO055 fusion IMU breakout — quaternion/Euler output for flight, SLAM, and head-tracking labs. Closest verified Amazon listing to BNO085 workflows.',
  });
  addRelated('bno055-9dof-imu-adafruit', 'pid-flight-arena', 'slam-odometry-arena');
}

// ── PID Flight Arena ─────────────────────────────────────────────────
setAsin('holybro-pixhawk-6c-mini', 'B0BJKV4SP8', {
  id: 'speedybee-f405-v3-fc',
  label: 'SpeedyBee F405 V3 Flight Controller',
  note: '30×30 Betaflight F405 FC with wireless config — PID bench companion for the Flight Arena (verified ASIN).',
  category: 'Apparatus',
});
// rename map key
{
  const l = byId.get('holybro-pixhawk-6c-mini');
  if (l) {
    byId.delete('holybro-pixhawk-6c-mini');
    l.id = 'speedybee-f405-v3-fc';
    byId.set(l.id, l);
  }
}

setAsin('matek-f722-betaflight-board', 'B0C2VKDLFK', {
  id: 'speedybee-f405-v4-stack',
  label: 'SpeedyBee F405 V4 FC + 55A ESC Stack',
  note: 'Bluetooth Betaflight stack (FC + 4-in-1 ESC) — full power stage for taking PID gains to a quad.',
  category: 'Kit',
});
{
  const l = byId.get('matek-f722-betaflight-board');
  if (l) {
    byId.delete('matek-f722-betaflight-board');
    l.id = 'speedybee-f405-v4-stack';
    byId.set(l.id, l);
  }
}

remove('emax-eco2-2306-2400kv-motor');
remove('blheli32-35a-esc-dshot');
remove('rush-tank-ultimate-vtx');

setAsin('radiomaster-boxer-elrs-radio', 'B0BTN1KXMT', {
  label: 'RadioMaster Boxer 2.4GHz ELRS Radio Controller',
  note: 'EdgeTX Boxer with hall gimbals — ELRS-ready transmitter for PID Flight Arena bench flying.',
});

// ── Signal Integrity + RF shared RF kits ──────────────────────────────
setAsin('sma-cal-kit-4ghz-open-short-load', 'B0D6YY6LV9', {
  label: 'SMA Calibration Kit for NanoVNA (Open/Short/Load + Jumper)',
  note: 'SOL cal standards + SMA jumper for NanoVNA H/H4 — SI Lab and RF Bench SOLT demos.',
});
// Collapse redundant cal-kit variants onto the one verified ASIN via merge
mergeInto('rf-cal-kit-35mm-sma-6ghz', 'sma-cal-kit-4ghz-open-short-load');
mergeInto('sma-rf-cal-kit-demo-board-em', 'sma-cal-kit-4ghz-open-short-load');
remove('microstrip-filter-eval-board');
remove('sma-attenuator-kit-6ghz-3db-20db');
remove('siglent-sva1015x-vna');
remove('keysight-n2873a-passive-probe');
remove('rogers-ro4003c-laminate-board');
remove('rogers-4350b-microstrip-substrate-20mil');

setAsin('nanovna-h4-vector-analyzer', 'B085CFHTBM', {
  label: 'NanoVNA-H4 Vector Network Analyzer (9kHz–1.5GHz)',
  note: 'Handheld VNA with touchscreen + SOL kit — S11/S21 lab companion for RF Bench and Antenna Sandbox.',
});
setAsin('tinysa-ultra-spectrum-analyzer', 'B0BXWW7JQF', {
  label: 'TinySA Ultra+ ZS406 Spectrum Analyzer (to 5.4GHz)',
  note: 'Portable spectrum analyzer + attenuator kit — EMI and spur checks next to the RF Bench.',
});

// Honest logic analyzer (Saleae rarely sold legitimately on Amazon)
setAsin('saleae-logic-8-usb-analyzer', 'B077LSG5P2', {
  id: 'hiletgo-usb-logic-analyzer-8ch',
  label: 'HiLetgo 8-Channel USB Logic Analyzer (24MHz)',
  note: 'Budget 8-ch USB logic analyzer (sigrok/PulseView). Useful for RTOS GPIO timing and SI digital demos — not a Saleae substitute in bandwidth.',
  category: 'Diagnostic',
});
{
  const l = byId.get('saleae-logic-8-usb-analyzer');
  if (l) {
    byId.delete('saleae-logic-8-usb-analyzer');
    l.id = 'hiletgo-usb-logic-analyzer-8ch';
    byId.set(l.id, l);
  }
}

// Johnson book — ensure correct ISBN
if (byId.has('high-speed-digital-design-johnson-book')) {
  setAsin('high-speed-digital-design-johnson-book', '0133957241', {
    label: 'High-Speed Digital Design (Johnson & Graham)',
  });
}

// ── FEA ──────────────────────────────────────────────────────────────
remove('prusa-mk4s-3d-printer-assembled');
remove('bambu-lab-x1-carbon-combo-printer');
remove('cnc-router-3018-pro-max');
if (byId.has('prusament-pla-filament-prusament-1kg')) {
  setAsin('prusament-pla-filament-prusament-1kg', 'B00J0ECR5I', {
    id: 'hatchbox-pla-filament-1kg-black',
    label: 'HATCHBOX PLA 1.75mm Filament 1kg (Black)',
    note: 'Reliable PLA spool for printing FEA fixtures and brackets from the Structural Lab.',
  });
  const l = byId.get('prusament-pla-filament-prusament-1kg');
  byId.delete('prusament-pla-filament-prusament-1kg');
  l.id = 'hatchbox-pla-filament-1kg-black';
  byId.set(l.id, l);
}
setAsin('mechanics-materials-hibbeler-11th', '0134319656', {
  label: 'Mechanics of Materials (Hibbeler)',
});
// hutton already on 0072395362 and matches live title — keep unique ownership
if (byId.has('fea-practical-intro-hutton-book')) {
  setAsin('fea-practical-intro-hutton-book', '0072395362', {
    label: 'Fundamentals of Finite Element Analysis (Hutton)',
  });
}

// ── RTOS ─────────────────────────────────────────────────────────────
remove('segger-jlink-edu-mini'); // no verified Amazon ASIN; avoid nRF dongle lie
setAsin('stm32-nucleo-f446re-dev-board', 'B01I8XLEM8', {
  label: 'STM32 Nucleo-F446RE Development Board',
});
setAsin('esp32-s3-devkitc-1-n8r2-board', 'B09MHP42LY', {
  label: 'ESP32-S3-DevKitC-1-N8R8 Development Board',
  note: 'Official Espressif S3 devkit with 8MB flash + 8MB PSRAM — FreeRTOS playground hardware.',
});
remove('mastering-freertos-bare-book'); // free PDF from FreeRTOS.org; no clean Amazon ASIN
// Liu book owns 0130996513
if (byId.has('real-time-embedded-book-liu')) {
  setAsin('real-time-embedded-book-liu', '0130996513', {
    label: 'Real-Time Systems (Liu)',
  });
}

// ── SLAM ─────────────────────────────────────────────────────────────
// realsense keeps B08HHHDRNM
remove('luxonis-oak-d-pro-spatial-ai');
remove('stereo-labs-zed-2-stereo-camera');
if (byId.has('slam-probabilistic-robotics-thrun-book')) {
  setAsin('slam-probabilistic-robotics-thrun-book', '0262201623', {
    label: 'Probabilistic Robotics (Thrun, Burgard, Fox)',
  });
}
setAsin('visual-slam-book-cadena', '0521540518', {
  id: 'multiple-view-geometry-hartley-zisserman',
  label: 'Multiple View Geometry in Computer Vision (Hartley & Zisserman)',
  note: 'Canonical multi-view geometry text underpinning visual odometry / SLAM pipelines.',
});
{
  const l = byId.get('visual-slam-book-cadena');
  if (l) {
    byId.delete('visual-slam-book-cadena');
    l.id = 'multiple-view-geometry-hartley-zisserman';
    byId.set(l.id, l);
  }
}
// jetson already merged onto jetson-orin-nano-super-dev-kit
if (byId.has('jetson-orin-nano-super-dev-kit')) {
  setAsin('jetson-orin-nano-super-dev-kit', 'B0BZJTQ5YP', {
    label: 'NVIDIA Jetson Orin Nano Super Developer Kit',
  });
  addRelated('jetson-orin-nano-super-dev-kit', 'slam-odometry-arena', 'webgpu-pinn-studio');
}

// ── GaN FOC ──────────────────────────────────────────────────────────
remove('gan-systems-gs66508b-eval-board');
remove('wolfspeed-c3m0065090-sic-eval');
remove('bk-precision-8600-electronic-load');
// fluke already B0002YFD1K — verify unique ownership
setAsin('fluke-87v-true-rms-multimeter', 'B0002YFD1K', {
  label: 'Fluke 87V Industrial True-RMS Multimeter',
});
setAsin('rigol-ds1054z-digital-scope', 'B0CMT5WMFY', {
  id: 'fnirsi-2c23t-scope-meter',
  label: 'FNIRSI 2C23T Handheld Scope + Multimeter + DDS',
  note: 'Portable 2-ch scope/meter for FOC phase-current debugging on the bench (verified listing).',
  category: 'Diagnostic',
});
{
  const l = byId.get('rigol-ds1054z-digital-scope');
  if (l) {
    byId.delete('rigol-ds1054z-digital-scope');
    l.id = 'fnirsi-2c23t-scope-meter';
    byId.set(l.id, l);
  }
}
if (byId.has('power-electronics-mohan-book')) {
  setAsin('power-electronics-mohan-book', '1118074807', {
    label: 'Power Electronics: A First Course (Mohan)',
  });
}

// ── Antenna ──────────────────────────────────────────────────────────
remove('greatscott-hackrf-one-sdr'); // no stable US ASIN via API
setAsin('rtl-sdr-blog-v4-dongle', 'B0CD7558GT', {
  label: 'RTL-SDR Blog V4 SDR Dongle + Dipole Antenna Kit',
});
remove('yagi-antenna-kit-433mhz-builder');
if (byId.has('antenna-theory-balanis-4th-edition')) {
  setAsin('antenna-theory-balanis-4th-edition', '1118642066', {
    label: 'Antenna Theory: Analysis and Design (Balanis)',
  });
}

// ── Verilog ──────────────────────────────────────────────────────────
// digilent-arty already B017BOBNEO
remove('lattice-ice40-hx8k-breakout');
remove('altera-de10-lite-max10');
if (byId.has('digital-design-harris-harris-book')) {
  setAsin('digital-design-harris-harris-book', '0128000562', {
    label: 'Digital Design and Computer Architecture: ARM Edition (Harris & Harris)',
  });
}
setAsin('fpga-4-fun-fpga-prototyping-basys3-book', '0470185325', {
  id: 'fpga-prototyping-verilog-chu',
  label: 'FPGA Prototyping by Verilog Examples (Chu)',
  note: 'Hands-on Verilog FPGA prototyping text paired with the Live Sculptor.',
});
{
  const l = byId.get('fpga-4-fun-fpga-prototyping-basys3-book');
  if (l) {
    byId.delete('fpga-4-fun-fpga-prototyping-basys3-book');
    l.id = 'fpga-prototyping-verilog-chu';
    byId.set(l.id, l);
  }
}

// ── PINN / WebGPU ────────────────────────────────────────────────────
remove('nvidia-rtx-4090-founders-edition');
remove('lambda-tensorbook-gpu-workstation');
// PINN book slots: no clean Karniadakis/FNO Amazon editions — merge into verified ML books
if (byId.has('physics-informed-deep-learning-book')) {
  const src = byId.get('physics-informed-deep-learning-book');
  const destId = byId.has('book-hands-on-ml') ? 'book-hands-on-ml' : 'hands-on-ml-geron';
  if (!byId.has(destId)) {
    byId.set(destId, {
      id: destId,
      label: 'Hands-On Machine Learning (Géron)',
      asin: '1098125975',
      note: 'Practical ML systems text — companion reading for PINN Studio workflows and neural surrogates.',
      category: 'Book',
      relatedTo: [],
    });
  }
  const dest = byId.get(destId);
  dest.asin = '1098125975';
  dest.label = dest.label || 'Hands-On Machine Learning (Géron)';
  dest.relatedTo = [...new Set([...(dest.relatedTo ?? []), ...(src.relatedTo ?? []), 'webgpu-pinn-studio'])];
  byId.delete('physics-informed-deep-learning-book');
}
if (byId.has('fourier-neural-operator-intro-book')) {
  const src = byId.get('fourier-neural-operator-intro-book');
  const destId = byId.has('book-designing-ml-systems') ? 'book-designing-ml-systems' : 'designing-ml-systems-huyen';
  if (!byId.has(destId)) {
    byId.set(destId, {
      id: destId,
      label: 'Designing Machine Learning Systems (Huyen)',
      asin: '1098107969',
      note: 'Production ML systems design — pairs with PINN Studio cloud/edge deployment thinking.',
      category: 'Book',
      relatedTo: [],
    });
  }
  const dest = byId.get(destId);
  dest.asin = '1098107969';
  dest.label = dest.label || 'Designing Machine Learning Systems (Huyen)';
  dest.relatedTo = [...new Set([...(dest.relatedTo ?? []), ...(src.relatedTo ?? []), 'webgpu-pinn-studio'])];
  byId.delete('fourier-neural-operator-intro-book');
}
setAsin('cuda-programming-kirk-hwu-book', '0323912311', {
  label: 'Programming Massively Parallel Processors (Hwu, Kirk, El Hajj)',
  note: 'CUDA/GPU parallel programming text for WebGPU PINN and edge GPU workloads.',
});

// ── Final uniqueness pass: if any ASIN still shared, keep first, merge relatedTo, drop rest ──
const asinOwners = new Map();
for (const [id, link] of byId) {
  const asin = link.asin;
  if (!asinOwners.has(asin)) {
    asinOwners.set(asin, id);
    continue;
  }
  const ownerId = asinOwners.get(asin);
  const owner = byId.get(ownerId);
  if (!owner) continue;
  const rel = new Set([...(owner.relatedTo ?? []), ...(link.relatedTo ?? [])]);
  owner.relatedTo = [...rel];
  console.log(`  merge duplicate ASIN ${asin}: ${id} → ${ownerId}`);
  byId.delete(id);
}

// Ensure RF/SI books stay linked
if (byId.has('microwave-engineering-pozar-4th-book')) {
  setAsin('microwave-engineering-pozar-4th-book', '0470631554');
  addRelated('microwave-engineering-pozar-4th-book', 'rf-microwave-bench');
}
if (byId.has('rf-circuit-design-bowick-book')) {
  setAsin('rf-circuit-design-bowick-book', '0750685182');
  addRelated('rf-circuit-design-bowick-book', 'rf-microwave-bench');
}

// Jetson relatedTo already handled
// NanoVNA / TinySA / cal kit should hit SI + RF + Antenna
if (byId.has('nanovna-h4-vector-analyzer')) {
  addRelated('nanovna-h4-vector-analyzer', 'rf-microwave-bench', 'antenna-em-sandbox', 'signal-integrity-lab');
}
if (byId.has('tinysa-ultra-spectrum-analyzer')) {
  addRelated('tinysa-ultra-spectrum-analyzer', 'rf-microwave-bench', 'antenna-em-sandbox');
}
if (byId.has('sma-cal-kit-4ghz-open-short-load')) {
  addRelated('sma-cal-kit-4ghz-open-short-load', 'signal-integrity-lab', 'rf-microwave-bench', 'antenna-em-sandbox');
}
if (byId.has('hiletgo-usb-logic-analyzer-8ch')) {
  addRelated('hiletgo-usb-logic-analyzer-8ch', 'rtos-scheduler', 'signal-integrity-lab', 'gan-foc-drive');
}

const out = [...byId.values()].map((l) => {
  const row = {
    id: l.id,
    label: l.label,
    asin: l.asin,
    note: l.note,
    category: l.category,
  };
  if (l.relatedTo?.length) row.relatedTo = l.relatedTo;
  if (l.pillars?.length) row.pillars = l.pillars;
  return row;
});

// stable-ish sort: keep original-ish order by sorting id
out.sort((a, b) => a.id.localeCompare(b.id));

writeFileSync(PATH, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${out.length} links to ${PATH}`);

// report sims coverage
const sims = [
  'pid-flight-arena','signal-integrity-lab','rf-microwave-bench','fea-structural-lab',
  'rtos-scheduler','slam-odometry-arena','gan-foc-drive','antenna-em-sandbox',
  'verilog-live-sculptor','webgpu-pinn-studio',
];
for (const s of sims) {
  const m = out.filter((l) => l.relatedTo?.includes(s));
  console.log(`  ${s}: ${m.length} → ${m.map((x) => x.id).join(', ')}`);
}
