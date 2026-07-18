/**
 * GitHub trending repos via Search API — free, no key needed (60 req/hour anon,
 * 5000/hour with token). Searches for recently created/star-active repos matching
 * studio pillars. This is a *new* data source to reduce identical daily reports —
 * GitHub churns faster than HN top.
 *
 * API: https://api.github.com/search/repositories?q=...
 */
import { SEARCH_QUERIES } from './keywords.mjs';

const GITHUB_API = 'https://api.github.com/search/repositories';
const SINCE_DAYS = 7;

function daysAgoIso(days) {
  return new Date(Date.now() - days * 864e5).toISOString().split('T')[0];
}

function buildQuery(term) {
  // Search term + pushed in last 7 days, language not restricted but boost Swift, Python, C++
  // Example: "CoreML pushed:>2026-07-11 stars:>10"
  return `${term} pushed:>${daysAgoIso(SINCE_DAYS)} stars:>5`;
}

export async function fetchGitHub() {
  const seen = new Map();
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  for (const rawTerm of SEARCH_QUERIES.slice(0, 8)) {
    // Use simplified term for GitHub (remove quotes, keep first 2 words)
    const term = rawTerm.replace(/[^a-zA-Z0-9 .-]/g, '').split(' ').slice(0, 3).join(' ');
    const q = buildQuery(term);
    const url = `${GITHUB_API}?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=20`;
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
          console.warn('[github] rate limited — stopping');
          break;
        }
        console.warn(`[github] query "${term}" failed: ${res.status}`);
        continue;
      }
      const data = await res.json();
      for (const repo of data.items ?? []) {
        if (seen.has(repo.id)) continue;
        const text = `${repo.name} ${repo.description ?? ''} ${repo.topics?.join(' ') ?? ''}`;
        seen.set(repo.id, {
          id: `github-${repo.id}`,
          source: 'github',
          title: repo.description ? `${repo.name} – ${repo.description.slice(0, 120)}` : repo.name,
          url: repo.html_url,
          author: repo.owner?.login,
          publishedAt: repo.pushed_at ?? repo.updated_at ?? repo.created_at,
          text,
          externalUrl: repo.html_url,
          engagement: repo.stargazers_count ?? 0,
        });
      }
    } catch (err) {
      console.warn(`[github] query "${term}" error: ${err.message}`);
    }
    // Gentle throttle
    await new Promise((r) => setTimeout(r, 800));
  }
  return [...seen.values()];
}
