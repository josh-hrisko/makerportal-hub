/**
 * Remove internal-only routes from production static output.
 * /brand is a local brand sandbox (`astro dev` only); Astro still emits a
 * static 404 HTML shell for Response-based pages, which would be served as
 * 200 at /brand on Vercel. Deleting the folder makes it a real 404.
 */
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const roots = [
  join(process.cwd(), 'dist', 'client', 'brand'),
  join(process.cwd(), 'dist', 'brand'),
  join(process.cwd(), '.vercel', 'output', 'static', 'brand'),
];

for (const dir of roots) {
  if (!existsSync(dir)) continue;
  rmSync(dir, { recursive: true, force: true });
  console.log(`[strip-dev-pages] removed ${dir}`);
}
