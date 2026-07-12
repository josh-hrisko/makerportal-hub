import opentype from 'opentype.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

function toArrayBuffer(buffer) {
  const ab = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

function commandsToPathData(commands, decimalPlaces = 2) {
  function f(v) {
    if (v === undefined || isNaN(v)) return '';
    return Number(v.toFixed(decimalPlaces)).toString();
  }
  return commands.map(cmd => {
    switch (cmd.type) {
      case 'M': return `M ${f(cmd.x)} ${f(cmd.y)}`;
      case 'L': return `L ${f(cmd.x)} ${f(cmd.y)}`;
      case 'C': return `C ${f(cmd.x1)} ${f(cmd.y1)} ${f(cmd.x2)} ${f(cmd.y2)} ${f(cmd.x)} ${f(cmd.y)}`;
      case 'Q': return `Q ${f(cmd.x1)} ${f(cmd.y1)} ${f(cmd.x)} ${f(cmd.y)}`;
      case 'Z': return 'Z';
      default: return '';
    }
  }).join(' ');
}

async function run() {
  console.log('Starting automated brand assets generator...');

  // Load fonts
  const fontPathBold = path.join(projectRoot, 'public/brand/fonts/PlusJakartaSans-Bold.ttf');
  const boldBuffer = fs.readFileSync(fontPathBold);
  const font = opentype.parse(toArrayBuffer(boldBuffer));

  const fontSize = 24;
  const yOffset = 22;

  // 1. Generate path for 'makerportal'
  let x = 0;
  const makerPathDataParts = [];
  const makerText = 'makerportal';
  for (let i = 0; i < makerText.length; i++) {
    const char = makerText[i];
    const glyph = font.charToGlyph(char);
    const glyphPath = glyph.getPath(x, yOffset, fontSize);
    makerPathDataParts.push(commandsToPathData(glyphPath.commands));

    let advance = glyph.advanceWidth * (fontSize / font.unitsPerEm);
    if (i < makerText.length - 1) {
      const nextChar = makerText[i + 1];
      const nextGlyph = font.charToGlyph(nextChar);
      const kern = font.getKerningValue(glyph.index, nextGlyph.index) || 0;
      advance += kern * (fontSize / font.unitsPerEm);
    }
    x += advance;
  }
  const makerWidth = x;

  // Dot configuration
  const dotRadius = 2.4;
  const dotX = makerWidth + 5;

  // 2. Generate path for 'ai'
  let aiX = dotX + dotRadius + 5;
  const aiPathDataParts = [];
  const aiText = 'ai';
  x = aiX;
  for (let i = 0; i < aiText.length; i++) {
    const char = aiText[i];
    const glyph = font.charToGlyph(char);
    const glyphPath = glyph.getPath(x, yOffset, fontSize);
    aiPathDataParts.push(commandsToPathData(glyphPath.commands));

    let advance = glyph.advanceWidth * (fontSize / font.unitsPerEm);
    if (i < aiText.length - 1) {
      const nextChar = aiText[i + 1];
      const nextGlyph = font.charToGlyph(nextChar);
      const kern = font.getKerningValue(glyph.index, nextGlyph.index) || 0;
      advance += kern * (fontSize / font.unitsPerEm);
    }
    x += advance;
  }
  const totalWidth = Math.ceil(x + 4);

  const makerPathData = makerPathDataParts.join(' ');
  const aiPathData = aiPathDataParts.join(' ');

  // 3. Write wordmarks
  const darkSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 32" fill="none" role="img" aria-label="makerportal.ai wordmark dark">
  <path d="${makerPathData}" fill="white" />
  <circle cx="${dotX}" cy="${22 - dotRadius - 0.5}" r="${dotRadius}" fill="#CE445D" />
  <path d="${aiPathData}" fill="white" />
</svg>`;

  const lightSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 32" fill="none" role="img" aria-label="makerportal.ai wordmark light">
  <path d="${makerPathData}" fill="#0F141C" />
  <circle cx="${dotX}" cy="${22 - dotRadius - 0.5}" r="${dotRadius}" fill="#CE445D" />
  <path d="${aiPathData}" fill="#0F141C" />
</svg>`;

  fs.writeFileSync(path.join(projectRoot, 'public/brand/logo-wordmark-dark.svg'), darkSVG);
  fs.writeFileSync(path.join(projectRoot, 'public/brand/logo-wordmark-light.svg'), lightSVG);
  console.log(`- Generated logo-wordmark-dark.svg & logo-wordmark-light.svg (Width: ${totalWidth}px)`);

  // Write editable wordmark
  const editableSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 32" fill="none" role="img" aria-label="makerportal.ai wordmark (Editable)">
  <text x="0" y="22" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="24" fill="white">makerportal</text>
  <circle cx="${dotX}" cy="${22 - dotRadius - 0.5}" r="${dotRadius}" fill="#CE445D" />
  <text x="${aiX}" y="22" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="24" fill="white">ai</text>
</svg>`;
  fs.writeFileSync(path.join(projectRoot, 'public/brand/logo-wordmark-editable.svg'), editableSVG);

  // 4. Standalone Icon (AI Sparkle Portal Gateway)
  const sparklePortalPath = `M 16,2 C 16,10 10,16 2,16 C 10,16 16,22 16,30 C 16,22 22,16 30,16 C 22,16 16,10 16,2 Z M 16,11 A 5,5 0 1 0 16,21 A 5,5 0 1 0 16,11 Z`;
  const iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" role="img" aria-label="MakerPortal AI Sparkle Portal">
  <path d="${sparklePortalPath}" fill="#CE445D" fill-rule="evenodd" />
</svg>`;
  fs.writeFileSync(path.join(projectRoot, 'public/brand/logo-icon.svg'), iconSVG);
  
  const iconEditableSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" role="img" aria-label="MakerPortal AI Sparkle Portal (Editable)">
  <g id="sparkle-portal">
    <path d="${sparklePortalPath}" fill="#CE445D" fill-rule="evenodd" />
  </g>
</svg>`;
  fs.writeFileSync(path.join(projectRoot, 'public/brand/logo-icon-editable.svg'), iconEditableSVG);
  console.log('- Generated logo-icon.svg & logo-icon-editable.svg');

  // 5. Favicon
  const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" role="img" aria-label="MakerPortal favicon">
  <rect width="64" height="64" rx="16" fill="#0F141C"/>
  <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" fill="none" stroke="white" stroke-opacity="0.08"/>
  <g transform="translate(8 8) scale(1.5)">
    <circle cx="16" cy="16" r="12" fill="#CE445D" opacity="0.22" style="filter: blur(5px)"/>
    <path d="${sparklePortalPath}" fill="#CE445D" fill-rule="evenodd" />
  </g>
</svg>`;
  fs.writeFileSync(path.join(projectRoot, 'public/favicon.svg'), faviconSVG);
  console.log('- Generated favicon.svg');

  // 6. App Icons
  const appIcons = [
    {
      name: 'biquadia',
      color: '#CE445D',
      glyph: `<path d="M 23 32 L 27 26.5 L 32 37.5 L 36.5 24.5 L 41 37.5 L 43.5 26.5 L 47 32" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
    },
    {
      name: 'notiary',
      color: '#8B5CF6',
      glyph: `<g stroke="white" stroke-width="2" stroke-linecap="round">
        <line x1="24" y1="29.5" x2="35" y2="29.5" />
        <line x1="24" y1="34.5" x2="40" y2="34.5" />
      </g>`
    },
    {
      name: 'thumbdash',
      color: '#F59E0B',
      glyph: `<g fill="white">
        <rect x="23" y="28" width="4" height="8" rx="1.5" />
        <rect x="30" y="24" width="4" height="12" rx="1.5" />
        <rect x="37" y="27" width="4" height="9" rx="1.5" />
      </g>`
    },
    {
      name: 'popcloset',
      color: '#326C88',
      glyph: `<path d="M25 31.5L32 27L39 31.5L39 36.5H25V31.5Z M32 27V24.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />`
    }
  ];

  for (const app of appIcons) {
    const appSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" role="img" aria-label="${app.name} app icon">
  <rect width="64" height="64" rx="18" fill="#0F141C"/>
  <rect x="0.5" y="0.5" width="63" height="63" rx="17.5" fill="none" stroke="white" stroke-opacity="0.06"/>
  <circle cx="32" cy="32" r="22" fill="${app.color}" opacity="0.18" style="filter: blur(10px)"/>
  <g transform="translate(8 8) scale(1.5)">
    <path d="${sparklePortalPath}" fill="${app.color}" fill-rule="evenodd" />
  </g>
  ${app.glyph}
</svg>`;
    fs.writeFileSync(path.join(projectRoot, `public/assets/app-icons/${app.name}.svg`), appSVG);
    console.log(`- Generated app icon: ${app.name}.svg`);
  }

  // 7. OG Template / Social Card
  const ogTemplateSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="#0F141C"/>
  <g transform="translate(100 50) scale(16)" opacity="0.06">
    <path d="${sparklePortalPath}" fill="#CE445D" fill-rule="evenodd" />
  </g>
  <g transform="translate(100 280) scale(1.6)">
    <circle cx="16" cy="16" r="24" fill="#CE445D" opacity="0.15" style="filter: blur(12px)"/>
    <path d="${sparklePortalPath}" fill="#CE445D" fill-rule="evenodd" transform="scale(1)"/>
  </g>
  <g transform="translate(170 280)">
    <g transform="scale(2)" fill="white">
      <path d="${makerPathData}" fill="white" />
      <circle cx="${dotX}" cy="${22 - dotRadius - 0.5}" r="${dotRadius}" fill="#CE445D" />
      <path d="${aiPathData}" fill="white" />
    </g>
    <text x="1" y="90" font-family="'Plus Jakarta Sans', Inter, sans-serif" font-weight="600" font-size="42" letter-spacing="-0.04em" fill="white">Software with</text>
    <text x="1" y="145" font-family="'Plus Jakarta Sans', Inter, sans-serif" font-weight="600" font-size="42" letter-spacing="-0.04em" fill="#CE445D">a point of view.</text>
    <text x="1" y="195" font-family="SFMono-Regular, monospace" font-size="12" letter-spacing="0.18em" fill="#5C6E7A">ON-DEVICE • PRIVATE • CRAFTED IN LOS ANGELES</text>
  </g>
  <g transform="translate(860 480)">
    <rect width="240" height="56" rx="28" fill="#1A232E" stroke="white" stroke-opacity="0.08"/>
    <circle cx="28" cy="28" r="4" fill="#CE445D"/>
    <text x="44" y="34" font-family="SFMono-Regular, monospace" font-size="13" fill="white" letter-spacing="0.12em">makerportal.ai</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(projectRoot, 'public/brand/og-template.svg'), ogTemplateSVG);
  console.log('- Generated og-template.svg');

  // 8. Rasterize all targets to PNG using Resvg
  console.log('Starting Resvg PNG rasterization...');
  
  const rasterTargets = [
    { src: 'public/brand/logo-icon.svg', dest: 'public/brand/icon-1024.png', width: 1024 },
    { src: 'public/brand/logo-icon.svg', dest: 'public/brand/icon-512.png', width: 512 },
    { src: 'public/brand/logo-icon.svg', dest: 'public/brand/icon-180.png', width: 180 },
    { src: 'public/brand/logo-icon.svg', dest: 'public/apple-touch-icon.png', width: 180 },
    { src: 'public/brand/logo-icon.svg', dest: 'public/icon-512.png', width: 512 },
    { src: 'public/brand/logo-icon.svg', dest: 'public/icon-1024.png', width: 1024 },
    { src: 'public/brand/og-template.svg', dest: 'public/social-card.png', width: 1200 }
  ];

  for (const target of rasterTargets) {
    const srcPath = path.join(projectRoot, target.src);
    const destPath = path.join(projectRoot, target.dest);
    const svgData = fs.readFileSync(srcPath);
    const resvg = new Resvg(svgData, { fitTo: { mode: 'width', value: target.width } });
    const pngData = resvg.render().asPng();
    fs.writeFileSync(destPath, pngData);
    console.log(`  Rasterized: ${target.dest} (${target.width}px)`);
  }

  console.log('Brand asset generation completed successfully!');
}

run().catch(console.error);
