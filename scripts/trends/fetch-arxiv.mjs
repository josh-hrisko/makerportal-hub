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

function buildArxivQuery() {
  // (cat:cs.LG OR cat:cs.CL ...) AND (on-device OR CoreML OR ...)
  const catPart = CATEGORIES.map((c) => `cat:${c}`).join(' OR ');
  const termPart = QUERY_TERMS.map((t) => `"${t}"`).join(' OR ');
  return `(${catPart}) AND (${termPart})`;
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

export async function fetchArxiv() {
  const query = buildArxivQuery();
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
    const entries = parseArxivXml(xml);
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
