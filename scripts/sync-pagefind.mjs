/**
 * Pagefind indexes dist/client (the real static web root), but the Vercel
 * adapter already copied static assets to .vercel/output/static *before*
 * this script's build step runs — so the index never reaches the deployed
 * output on its own. Mirror it over so /pagefind/* resolves in production.
 *
 * Also mirror into public/pagefind so `astro dev` (which serves public/
 * directly and never runs pagefind) has a working index between builds —
 * otherwise /pagefind/pagefind.js 404s in dev and search silently returns
 * nothing.
 */
import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const source = join(process.cwd(), 'dist', 'client', 'pagefind');
const destVercel = join(process.cwd(), '.vercel', 'output', 'static', 'pagefind');
const destPublic = join(process.cwd(), 'public', 'pagefind');

if (!existsSync(source)) {
  console.warn(`[sync-pagefind] source not found, skipping: ${source}`);
} else {
  cpSync(source, destVercel, { recursive: true });
  console.log(`[sync-pagefind] copied ${source} -> ${destVercel}`);
  cpSync(source, destPublic, { recursive: true });
  console.log(`[sync-pagefind] copied ${source} -> ${destPublic}`);
}
