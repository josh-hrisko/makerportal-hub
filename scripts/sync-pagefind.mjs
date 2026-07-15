/**
 * Pagefind indexes dist/client (the real static web root), but the Vercel
 * adapter already copied static assets to .vercel/output/static *before*
 * this script's build step runs — so the index never reaches the deployed
 * output on its own. Mirror it over so /pagefind/* resolves in production.
 */
import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const source = join(process.cwd(), 'dist', 'client', 'pagefind');
const dest = join(process.cwd(), '.vercel', 'output', 'static', 'pagefind');

if (!existsSync(source)) {
  console.warn(`[sync-pagefind] source not found, skipping: ${source}`);
} else {
  cpSync(source, dest, { recursive: true });
  console.log(`[sync-pagefind] copied ${source} -> ${dest}`);
}
