import fs from 'fs';
import path from 'path';

// 1. Parse apps from src/data/apps.ts (use regex to avoid webp import issues in Node)
const appsContent = fs.readFileSync('src/data/apps.ts', 'utf-8');
const cleanContent = appsContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
const arrayMatch = cleanContent.match(/export const apps:\s*AppEntry\[\]\s*=\s*\[([\s\S]*?)\];/);
if (!arrayMatch) throw new Error('Could not find apps array');

const blocks: string[] = [];
let depth = 0;
let currentBlock = '';
for (let i = 0; i < arrayMatch[1].length; i++) {
  const char = arrayMatch[1][i];
  if (char === '{') depth++;
  if (depth > 0) currentBlock += char;
  if (char === '}') {
    depth--;
    if (depth === 0) {
      blocks.push(currentBlock);
      currentBlock = '';
    }
  }
}

const parsedApps = blocks.map(block => {
  const getStr = (key: string) => {
    const m = block.match(new RegExp(`${key}:\\s*['"\`]([\\s\\S]*?)['"\`]`, 'i'));
    return m ? m[1].trim() : '';
  };
  const getBool = (key: string) => {
    const m = block.match(new RegExp(`${key}:\\s*(true|false)`, 'i'));
    return m ? m[1] === 'true' : false;
  };
  const getArray = (key: string) => {
    const m = block.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`, 'i'));
    if (!m) return [];
    return m[1].split(',').map(item => item.replace(/['"\s]/g, '')).filter(Boolean);
  };

  return {
    title: getStr('title'),
    tagline: getStr('tagline'),
    description: getStr('description'),
    url: getStr('url'),
    category: getStr('category'),
    platform: getStr('platform'),
    techBadges: getArray('techBadges'),
    featured: getBool('featured')
  };
});

// 2. Parse playground from src/data/playground.ts (regex to avoid ts compilation issue just in case)
const playgroundContent = fs.readFileSync('src/data/playground.ts', 'utf-8');
const pgClean = playgroundContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
const pgArrayMatch = pgClean.match(/export const playground:\s*PlaygroundEntry\[\]\s*=\s*\[([\s\S]*?)\];/);
if (!pgArrayMatch) throw new Error('Could not find playground array');

const pgBlocks: string[] = [];
let pgDepth = 0;
let pgCurrentBlock = '';
for (let i = 0; i < pgArrayMatch[1].length; i++) {
  const char = pgArrayMatch[1][i];
  if (char === '{') pgDepth++;
  if (pgDepth > 0) pgCurrentBlock += char;
  if (char === '}') {
    pgDepth--;
    if (pgDepth === 0) {
      pgBlocks.push(pgCurrentBlock);
      pgCurrentBlock = '';
    }
  }
}

const parsedPlayground = pgBlocks.map(block => {
  const getStr = (key: string) => {
    const m = block.match(new RegExp(`${key}:\\s*['"\`]([\\s\\S]*?)['"\`]`, 'i'));
    return m ? m[1].trim() : '';
  };
  const getBool = (key: string) => {
    const m = block.match(new RegExp(`${key}:\\s*(true|false)`, 'i'));
    return m ? m[1] === 'true' : false;
  };

  return {
    slug: getStr('slug'),
    title: getStr('title'),
    tagline: getStr('tagline'),
    description: getStr('description'),
    pillarHint: getStr('pillarHint'),
    isGrounded: getBool('isGrounded'),
    relatedApp: getStr('relatedApp'),
    status: getStr('status')
  };
}).filter(p => p.status === 'live');

// 3. Load latest journal trending signals
let latestJournalDate = '';
let topSignals: any[] = [];
try {
  const journalDir = 'src/content/journal';
  if (fs.existsSync(journalDir)) {
    const files = fs.readdirSync(journalDir).filter(f => f.endsWith('.json')).sort().reverse();
    if (files.length > 0) {
      latestJournalDate = files[0].replace('.json', '');
      const data = JSON.parse(fs.readFileSync(path.join(journalDir, files[0]), 'utf-8'));
      if (data && data.items) {
        topSignals = [...data.items].sort((a: any, b: any) => b.score - a.score).slice(0, 5);
      }
    }
  }
} catch (e) {
  console.warn('Could not read journal files:', e);
}

// 4. Load gear picks
const affiliateLinks = JSON.parse(fs.readFileSync('src/data/affiliate-links.json', 'utf-8'));
const amazonCatalog = JSON.parse(fs.readFileSync('src/data/amazon-catalog.json', 'utf-8'));

const gearIds = ['airpods-pro-3', 'behringer-umc1820', 'shure-mv7', 'ath-m50x', 'book-deep-learning', 'sandisk-extreme-ssd-1tb'];
const gearPicks = gearIds.map(id => {
  const link = affiliateLinks.find((l: any) => l.id === id);
  if (!link) return null;
  const live = amazonCatalog.items[link.asin];
  const url = live?.detailPageURL || `https://www.amazon.com/dp/${link.asin}?tag=engineersport-20`;
  return {
    ...link,
    title: live?.title || link.label,
    price: live?.price,
    currency: live?.currency || 'USD',
    url
  };
}).filter(Boolean);

// --- Build llms.txt (Summary version) ---
let llmsTxt = `# Human-friendly view → https://www.makerportal.ai/llms — raw below for LLMs, RAG, agentic browsers
# If you landed here as a human, the styled page explains everything. Bots: continue below (valid Markdown).

# MakerPortal — Independent AI & iOS Software Studio

> On-device first where possible, transparent where cloud is needed. San Francisco studio engineering iOS & iPadOS apps with Apple Silicon native neural processing (CoreML, Metal, ANE). Privacy posture per-app transparent.

MakerPortal ([makerportal.ai](https://www.makerportal.ai) / [makersportal.com](https://makersportal.com)) is an independent software studio established in 2023 in San Francisco, CA. Focus: focused utility, productivity, developer tools, audio, game, dashboard, and lifestyle applications — on-device first where possible (CoreML, Metal, ANE, ONNX, llama.cpp), transparent hybrid cloud for agentic DSP (AuraLinter backend with SSE, audio staged temporarily).

**Core principles:** On-device first where possible, transparent hybrid for agentic, no committee software, useful on day one, craft over clutter, one deliberate release at a time.

## Site map (hub) — empire IA

Primary nav (≤7): Apps · Notes · Learn · Shop · Watch · Studio · Contact

- [Home](https://www.makerportal.ai): Studio hub
- [Apps](https://www.makerportal.ai/apps): Catalog — 11 live (5 on *.makerportal.ai + 6 legacy bridge on makersportal.com/apps migrating)
- [Field notes / blog](https://www.makerportal.ai/blog): Articles & craft
- [Learn / resources](https://www.makerportal.ai/resources): Topic hubs, tools, affiliate-ready guides
- [Shop](https://www.makerportal.ai/shop): Digital goods, code packs, archives
- [Watch](https://www.makerportal.ai/watch): Video / YouTube surface
- [About](https://www.makerportal.ai/about) · [Team](https://www.makerportal.ai/team) · [Press](https://www.makerportal.ai/press) · [Advertise](https://www.makerportal.ai/advertise)
- [Contact](https://www.makerportal.ai/contact) · [Privacy](https://www.makerportal.ai/privacy) · [Terms](https://www.makerportal.ai/terms)
- [RSS](https://www.makerportal.ai/rss.xml) · [Sitemap](https://www.makerportal.ai/sitemap.xml)

## Application Matrix — 11 Live (Featured indicated with *)

Full studio catalog available at [makerportal.ai/apps](https://www.makerportal.ai/apps). Each product is canonical on its own subdomain or legacy journal host:

${parsedApps.map(app => `- [${app.featured ? '*' : ''}${app.title} — ${app.tagline}](${app.url}): ${app.description.replace(/\\s+/g, ' ')} (${app.platform}). Category: ${app.category}. Tech: ${app.techBadges.join(', ')}`).join('\n')}

## Interactive Playground — 18 Live Tools

Browser-native mathematical and physical simulations: [makerportal.ai/playground](https://www.makerportal.ai/playground).

${parsedPlayground.map(tool => `- [${tool.title}](${tool.slug.startsWith('http') ? tool.slug : `https://www.makerportal.ai/playground/${tool.slug}`}): ${tool.tagline} (${tool.isGrounded ? 'Grounded in shipped app' : 'Independent research instrument'})${tool.relatedApp ? ` ↳ Related to ${tool.relatedApp}` : ''}`).join('\n')}

## Trending Signals

Score-weighted, source-corroborated technical signals from our latest daily scan (Scan Date: ${latestJournalDate || 'N/A'}): [makerportal.ai/journal](https://www.makerportal.ai/journal).

${topSignals.map((item, idx) => `${idx + 1}. [${item.title}](${item.url}) (Score: ${item.score}) - Domain: ${item.domain || 'N/A'} [Tags: ${item.tags.join(', ')}]`).join('\n')}

## Studio Gear Picks

Hardware and equipment utilized inside the studio for engineering and testing: [makerportal.ai/resources#gear](https://www.makerportal.ai/resources#gear). Curated affiliate links use Amazon Associate tag \`engineersport-20\`. Disclosure at [makerportal.ai/privacy#affiliates](https://www.makerportal.ai/privacy#affiliates).

${gearPicks.map(gear => `- [${gear.title}](${gear.url}) (${gear.price ? `${gear.price} ${gear.currency}` : 'Amazon'}): ${gear.note} (Category: ${gear.category})`).join('\n')}

## Technical Stack

- Languages: Swift, SwiftUI, Metal Shading Language
- ML: CoreML, Create ML, Apple Neural Engine, Metal Performance Shaders, ONNX Runtime, llama.cpp
- Audio: kNN-VC, WavLM-Large, HiFiGAN, Diffusion Transformer, clang++ verified kernels, LangGraph agentic loops, Production RAG pgvector
- Privacy Architecture: No analytics SDKs, no cookies for core functionality, no cloud dependency for AI inference where possible
- Performance Targets: <8ms P95 inference where on-device, 100% offline capable for most titles

## For AI Crawlers & Agentic Browsers

- **Preferred crawling:** Full site allowed. GPTBot, ChatGPT-User, Google-Extended, Anthropic-ai, ClaudeBot, CCBot, PerplexityBot explicitly allowed in [robots.txt](https://www.makerportal.ai/robots.txt).
- **Structured data:** Organization, WebSite + SearchAction, CollectionPage with SoftwareApplication (11 items), FAQPage, BreadcrumbList via JSON-LD.
- **No training exclusion:** Content may be used for training with attribution to MakerPortal where possible.

Last updated: ${new Date().toISOString().split('T')[0]} — compiled automatically at build time.
`;

// --- Build llms-full.txt (Detailed/Comprehensive version) ---
let llmsFullTxt = `# Human-friendly view → https://www.makerportal.ai/llms — raw below for LLMs, RAG, agentic browsers
# This is the detailed directory of all apps, tools, notes, and resources of MakerPortal.

# MakerPortal — Full Studio Directory & Technical Specifications

${llmsTxt.split('## Site map (hub)')[0]}

## Site map (hub) — empire IA

Primary nav (≤7): Apps · Notes · Learn · Shop · Watch · Studio · Contact

- [Home](https://www.makerportal.ai): Studio hub
- [Apps](https://www.makerportal.ai/apps): Catalog — 11 live (5 on *.makerportal.ai + 6 legacy bridge on makersportal.com/apps migrating)
- [Field notes / blog](https://www.makerportal.ai/blog): Articles & craft
- [Learn / resources](https://www.makerportal.ai/resources): Topic hubs, tools, affiliate-ready guides
- [Shop](https://www.makerportal.ai/shop): Digital goods, code packs, archives
- [Watch](https://www.makerportal.ai/watch): Video / YouTube surface

---

## Detailed Application Profiles — 11 Live Titles

Detailed specifications of our iOS application matrix:

${parsedApps.map(app => `### ${app.title} — ${app.tagline}
- **URL:** ${app.url}
- **Category:** ${app.category}
- **Platform:** ${app.platform}
- **Featured:** ${app.featured ? 'Yes' : 'No'}
- **Tech Stack:** ${app.techBadges.join(', ')}
- **Description:** ${app.description}
`).join('\n\n')}

---

## Detailed Interactive Playground Tools — 18 Live Tools

Detailed specifications of mathematical and physical simulations available inside our sandbox:

${parsedPlayground.map(tool => `### ${tool.title}
- **Slug / Route:** ${tool.slug.startsWith('http') ? tool.slug : `/playground/${tool.slug}`}
- **Tagline:** ${tool.tagline}
- **Pillar Hint:** ${tool.pillarHint || 'General'}
- **Is Grounded:** ${tool.isGrounded ? 'Yes (maps to shipped product)' : 'No (independent research instrument)'}
- **Related Application:** ${tool.relatedApp || 'None'}
- **Description:** ${tool.description}
`).join('\n\n')}

---

## Trending Technical Signals — Latest Scan

Daily scored technical scan items (Date: ${latestJournalDate || 'N/A'}):

${topSignals.map((item, idx) => `### ${idx + 1}. ${item.title}
- **Score:** ${item.score}
- **URL:** ${item.url}
- **Domain:** ${item.domain || 'N/A'}
- **Primary Source:** ${item.source}
- **Tags:** ${item.tags.join(', ')}
- **Corroborated Sources:** ${item.sources ? item.sources.join(', ') : item.source}
`).join('\n\n')}

---

## Studio Curated Gear Specifications

curated developer hardware and equipment specifications:

${gearPicks.map(gear => `### ${gear.title}
- **URL:** ${gear.url}
- **Category:** ${gear.category}
- **Curated Price:** ${gear.price ? `${gear.price} ${gear.currency}` : 'Amazon / Check site'}
- **Curated Notes:** ${gear.note}
`).join('\n\n')}

---

## Technical Stack & Architectural Stance

- **Swift & SwiftUI**: 100% declarative UI where appropriate, native view controllers where layout control demands micro-second rendering.
- **Metal Performance Shaders**: Direct GPU pipeline access for matrix multiplication, real-time spatial calculations, and custom visual physics solvers.
- **ANE Acceleration**: Apple Neural Engine cores leveraged directly via CoreML FP16 formats to avoid thermal throttling and save battery.
- **Zero Telemetry Stance**: Absolute privacy posture. No third-party SDKs, no segment, no Firebase. All logs remain local on device.

Last updated: ${new Date().toISOString().split('T')[0]} — compiled automatically at build time.
`;

// Make sure output directories exist
fs.mkdirSync('public', { recursive: true });
fs.mkdirSync('public/.well-known', { recursive: true });

// Write files to public/
fs.writeFileSync('public/llms.txt', llmsTxt, 'utf-8');
fs.writeFileSync('public/llms-full.txt', llmsFullTxt, 'utf-8');

// Write files to public/.well-known/
fs.writeFileSync('public/.well-known/llms.txt', llmsTxt, 'utf-8');
fs.writeFileSync('public/.well-known/llms-full.txt', llmsFullTxt, 'utf-8');

console.log('Successfully generated public/llms.txt, public/llms-full.txt and their .well-known/ counterparts.');
