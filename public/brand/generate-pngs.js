import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const targets = [
  // 1. Standalone Icon PNGs (rendered from public/brand/logo-icon.svg)
  {
    src: path.join(projectRoot, 'public/brand/logo-icon.svg'),
    dest: path.join(projectRoot, 'public/brand/icon-1024.png'),
    width: 1024,
  },
  {
    src: path.join(projectRoot, 'public/brand/logo-icon.svg'),
    dest: path.join(projectRoot, 'public/brand/icon-512.png'),
    width: 512,
  },
  {
    src: path.join(projectRoot, 'public/brand/logo-icon.svg'),
    dest: path.join(projectRoot, 'public/brand/icon-180.png'),
    width: 180,
  },
  // Replicating under root public/ for App Icon system/PWA
  {
    src: path.join(projectRoot, 'public/favicon.svg'),
    dest: path.join(projectRoot, 'public/apple-touch-icon.png'),
    width: 180,
  },
  {
    src: path.join(projectRoot, 'public/favicon.svg'),
    dest: path.join(projectRoot, 'public/icon-512.png'),
    width: 512,
  },
  {
    src: path.join(projectRoot, 'public/favicon.svg'),
    dest: path.join(projectRoot, 'public/icon-1024.png'),
    width: 1024,
  },
  // 2. Social / OG Card (rendered from public/brand/og-template.svg)
  {
    src: path.join(projectRoot, 'public/brand/og-template.svg'),
    dest: path.join(projectRoot, 'public/social-card.png'),
    width: 1200,
    height: 630,
  },
];

async function generate() {
  console.log('Starting PNG rasterization from SVGs using Resvg...');
  for (const target of targets) {
    try {
      if (!fs.existsSync(target.src)) {
        console.error(`Source file not found: ${target.src}`);
        continue;
      }
      const svgBuffer = fs.readFileSync(target.src);
      const opts = {
        fitTo: target.height 
          ? { mode: 'height', value: target.height } 
          : { mode: 'width', value: target.width },
      };
      
      const resvg = new Resvg(svgBuffer, opts);
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      
      // Ensure target directory exists
      fs.mkdirSync(path.dirname(target.dest), { recursive: true });
      fs.writeFileSync(target.dest, pngBuffer);
      console.log(`Successfully generated: ${path.relative(projectRoot, target.dest)} (${target.width}px wide)`);
    } catch (err) {
      console.error(`Error generating ${target.dest}:`, err);
    }
  }
  console.log('PNG generation complete!');
}

generate();
