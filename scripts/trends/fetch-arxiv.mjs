/**
 * arXiv recent papers via OAI API — free, no key, no auth.
 * https://arxiv.org/help/api/user-manual
 *
 * Searches cs.LG, cs.CL, cs.SD, cs.CV, eess.AS, cs.SE for pillar keywords.
 * arXiv churns daily with fresh papers, perfect for reducing duplicate reports.
 */

const ARXIV_API = 'https://export.arxiv.org/api/query';
const MAX_RESULTS = 20;

// arXiv subject areas relevant to studio pillars
const CATEGORIES = [
  'cs.LG', // machine learning
  'cs.CL', // computation + language (LLM)
  'cs.SD', // sound / DSP
  'cs.CV', // vision (Metal, on-device)
  'eess.AS', // audio signal processing
  'cs.SE', // software engineering (SwiftUI, iOS craft)
];

const QUERY_TERMS = [
  'on-device AI',
  'CoreML',
  'Apple Neural Engine',
  'local LLM',
  'on-device language model',
  'spatial audio',
  'voice conversion',
  'SwiftUI',
  'privacy preserving machine learning',
];

function buildArxivQuery(opts = {}) {
  // (cat:cs.LG OR cat:cs.CL ...) AND (on-device OR CoreML OR ...)
  const catPart = CATEGORIES.map((c) => `cat:${c}`).join(' OR ');
  const termPart = QUERY_TERMS.map((t) => `"${t}"`).join(' OR ');
  let q = `(${catPart}) AND (${termPart})`;
  // Historical window (backlog fills): restrict to papers submitted in [after, before].
  // arXiv API supports submittedDate:[YYYYMMDDHHMM TO YYYYMMDDHHMM].
  if (opts.submittedAfter || opts.submittedBefore) {
    const fmt = (d) => d.replaceAll('-', '') + '0000';
    const lo = opts.submittedAfter ? fmt(opts.submittedAfter) : '199101010000';
    const hi = opts.submittedBefore ? fmt(opts.submittedBefore) : '999912312359';
    q += ` AND submittedDate:[${lo} TO ${hi}]`;
  }
  return q;
}

function parseArxivXml(xml) {
  const entries = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRe.exec(xml)) !== null) {
    const entryXml = m[1];
    const get = (tag) => {
      const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const match = entryXml.match(re);
      if (!match) return '';
      return match[1]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };
    const title = get('title');
    const summary = get('summary');
    const id = get('id');
    const published = get('published');
    const authorMatch = entryXml.match(/<author>[\s\S]*?<name>(.*?)<\/name>/i);
    const author = authorMatch ? authorMatch[1].trim() : undefined;

    // Extract arXiv categories: primary_category preferred, then first category term
    let category = '';
    const primaryMatch = entryXml.match(/primary_category[^>]*term="([^"]+)"/i);
    if (primaryMatch) {
      category = primaryMatch[1];
    } else {
      const catMatches = [...entryXml.matchAll(/<category[^>]+term="([^"]+)"/gi)];
      if (catMatches.length > 0) category = catMatches[0][1];
    }

    if (!title || !id) continue;
    entries.push({
      id,
      title: title.replace(/\s+/g, ' '),
      summary,
      published,
      author,
      category,
    });
  }
  return entries;
}

export async function fetchArxiv(opts = {}) {
  const query = buildArxivQuery(opts);
  const url = `${ARXIV_API}?search_query=${encodeURIComponent(query)}&start=0&max_results=${MAX_RESULTS}&sortBy=submittedDate&sortOrder=descending`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MakerPortal-Trends/1.0 (https://makerportal.ai)' },
    });
    if (!res.ok) {
      console.warn(`[arxiv] failed: ${res.status}`);
      return [];
    }
    const xml = await res.text();
    let entries = parseArxivXml(xml);
    // Defensive client-side filter: the OAI query should already constrain the
    // window, but verify published dates so backfilled days never get papers
    // from the wrong week.
    if (opts.submittedAfter || opts.submittedBefore) {
      const lo = opts.submittedAfter ? Date.parse(`${opts.submittedAfter}T00:00:00Z`) : -Infinity;
      const hi = opts.submittedBefore ? Date.parse(`${opts.submittedBefore}T23:59:59Z`) : Infinity;
      entries = entries.filter((e) => {
        const t = Date.parse(e.published);
        return !Number.isNaN(t) && t >= lo && t <= hi;
      });
    }
    return entries.map((e) => ({
      id: `arxiv-${e.id.split('/').pop()}`,
      source: 'arxiv',
      title: e.title.slice(0, 220),
      url: e.id,
      author: e.author,
      publishedAt: e.published,
      text: `${e.title} ${e.summary}`,
      externalUrl: e.id,
      engagement: 5, // arXiv papers get small base engagement (artifact bonus will add)
      category: e.category || undefined,
    }));
  } catch (err) {
    console.warn(`[arxiv] error: ${err.message}`);
    return [];
  }
}
