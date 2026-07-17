#!/usr/bin/env node
/**
 * Trend-grounded blog draft scaffold — manual CLI only, NOT wired into any
 * workflow/cron. Takes a selected signal from the latest Signals Journal entry
 * (src/content/journal/YYYY-MM-DD.json) and scaffolds a draft post in
 * src/content/blog/ for a human to actually write.
 *
 * This intentionally does NOT generate post content. Two things it does
 * enforce structurally, because a doc convention is easy to skip and a
 * missing CLI arg is not:
 *   1. --app is required — every draft must name a real shipped app
 *      (src/data/apps.ts) it connects the trend to. No app, no draft.
 *      This is the "shipped-app grounding" guardrail from docs/MONETIZATION.md
 *      P3 and the scaled-content-abuse risk it exists to manage — see there
 *      before changing this gate.
 *   2. draft: true, always. This script has no publish path. Publishing is
 *      a human editing the file, filling in the body, and opening a PR —
 *      same human-review gate as scripts/trends/pipeline.mjs.
 *
 * Usage:
 *   node scripts/trends/draft-post.mjs --id hackernews-48894351 --app Biquadia
 *   node scripts/trends/draft-post.mjs --list          # show candidate trend items
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
const JOURNAL_DIR = path.join(ROOT, 'src/content/journal');
const APPS_PATH = path.join(ROOT, 'src/data/apps.ts');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');

/** Latest journal entry filename (YYYY-MM-DD.json sorts lexically = chronologically). */
function latestJournalPath() {
  const files = existsSync(JOURNAL_DIR)
    ? readdirSync(JOURNAL_DIR).filter((f) => f.endsWith('.json')).sort()
    : [];
  if (files.length === 0) return null;
  return path.join(JOURNAL_DIR, files[files.length - 1]);
}

function loadTrends() {
  const latest = latestJournalPath();
  if (!latest) {
    console.error('[draft-post] No journal entries in src/content/journal/. Run scripts/trends/build-digest.mjs first.');
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(latest, 'utf8'));
  return raw.items ?? [];
}

/** Cheap extraction, not a TS parser — good enough to validate a name exists. */
function loadAppTitles() {
  const src = readFileSync(APPS_PATH, 'utf8');
  return [...src.matchAll(/title:\s*'([^']+)'/g)].map((m) => m[1]);
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function parseArgs(argv) {
  const args = { id: null, app: null, list: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--id') args.id = argv[++i];
    else if (argv[i] === '--app') args.app = argv[++i];
    else if (argv[i] === '--list') args.list = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const trends = loadTrends();

  if (args.list || !args.id) {
    console.log(`Candidate signals (${path.relative(ROOT, latestJournalPath())}):\n`);
    for (const t of trends) {
      console.log(`  ${t.id}  [${t.tags.join(', ')}]  score ${t.score}`);
      console.log(`    ${t.title}`);
    }
    console.log('\nRun again with --id <id> --app <ShippedAppTitle>');
    process.exit(0);
  }

  const item = trends.find((t) => t.id === args.id);
  if (!item) {
    console.error(`[draft-post] No trend item with id "${args.id}". Run with --list to see candidates.`);
    process.exit(1);
  }

  if (!args.app) {
    console.error(
      '[draft-post] --app is required. Every trend-grounded draft must name a real shipped app it connects to ' +
        '(the "shipped-app grounding" guardrail — see docs/MONETIZATION.md P3). This is not optional.'
    );
    process.exit(1);
  }

  const appTitles = loadAppTitles();
  if (!appTitles.includes(args.app)) {
    console.error(`[draft-post] "${args.app}" is not a real app in src/data/apps.ts. Known apps: ${appTitles.join(', ')}`);
    process.exit(1);
  }

  const slug = slugify(`${args.app}-${item.tags[0] ?? 'note'}-${item.id}`);
  const outPath = path.join(BLOG_DIR, `${slug}.md`);
  if (existsSync(outPath)) {
    console.error(`[draft-post] ${outPath} already exists — not overwriting.`);
    process.exit(1);
  }

  const primaryTag = item.tags[0] ?? 'signal';
  const today = new Date().toISOString().slice(0, 10);

  const frontmatter = [
    '---',
    `title: "TODO — connect this trend to ${args.app}"`,
    'description: "TODO — one sentence, written after the post is drafted, not before."',
    `publishedAt: ${today}`,
    'draft: true',
    `tags: [${[slugify(args.app), primaryTag].join(', ')}]`,
    'eyebrow: "Trend-grounded draft"',
    'readingTime: "TODO"',
    '---',
    '',
  ].join('\n');

  const body = [
    `<!--`,
    `  Source signal: ${item.title}`,
    `  ${item.url}`,
    `  Pillars: ${item.tags.join(', ')} · Score: ${item.score} · Sources: ${(item.sources ?? [item.source]).join(', ')}`,
    ``,
    `  Before writing:`,
    `  - This post must connect the signal above to something ${args.app} has actually shipped, tested,`,
    `    or benchmarked — a real code pattern, a measured number, a design decision. Not a summary of the`,
    `    signal itself. If you can't find a genuine ${args.app} connection, this isn't the right signal —`,
    `    pick a different one or don't publish.`,
    `  - Affiliate picks: only from affiliate-links.json, max 1-2, only if genuinely relevant.`,
    `  - Disclose AI assistance if used, matching the rest of the site's transparency posture.`,
    `  - Delete this comment block before publishing.`,
    `-->`,
    ``,
    `TODO: write the post.`,
    '',
  ].join('\n');

  writeFileSync(outPath, frontmatter + body);
  console.log(`[draft-post] Wrote draft: ${path.relative(ROOT, outPath)}`);
  console.log('[draft-post] draft: true — this file will not render or build into the site until a human sets draft: false.');
}

main();
