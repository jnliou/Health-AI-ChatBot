type RagTopic = 'contraception' | 'pregnancy' | 'sti';

interface RagRoot {
  id: string;
  label: string;
  canonicalUrl: string;
  proxyPath: string;
  topic: RagTopic;
}

interface RagSourceDoc {
  id: string;
  label: string;
  canonicalUrl: string;
  proxyPath: string;
  topic: RagTopic;
}

export interface RagChunk {
  sourceLabel: string;
  sourceUrl: string;
  text: string;
  score: number;
}

const RAG_ROOTS: RagRoot[] = [
  {
    id: 'ssr-stis-root',
    label: 'SmartSexResource - STIs and Conditions',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/',
    proxyPath: '/smartsexresource/sexually-transmitted-infections/stis-conditions/',
    topic: 'sti',
  },
  {
    id: 'hl-contraception-root',
    label: 'HealthLinkBC - Birth Control',
    canonicalUrl:
      'https://www.healthlinkbc.ca/living-well/family-planning-pregnancy-and-childbirth/birth-control',
    proxyPath: '/healthlinkbc/living-well/family-planning-pregnancy-and-childbirth/birth-control',
    topic: 'contraception',
  },
];

const MAX_LINKS_PER_ROOT = 40;
const MAX_CRAWL_DEPTH = 2;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const PREWARM_DOCS_PER_ROOT = 24;
const PREWARM_CONCURRENCY = 4;

interface TimedCacheEntry<T> {
  value: T;
  cachedAt: number;
}

const htmlCache = new Map<string, TimedCacheEntry<string>>();
const textCache = new Map<string, TimedCacheEntry<string>>();
const discoveredDocsCache = new Map<string, TimedCacheEntry<RagSourceDoc[]>>();
let prewarmPromise: Promise<void> | null = null;

function getCacheValue<T>(cache: Map<string, TimedCacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const isFresh = Date.now() - entry.cachedAt < CACHE_TTL_MS;
  if (!isFresh) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCacheValue<T>(cache: Map<string, TimedCacheEntry<T>>, key: string, value: T): void {
  cache.set(key, { value, cachedAt: Date.now() });
}

function classifyQueryTopic(query: string): RagTopic {
  const lower = query.toLowerCase();
  if (
    lower.includes('birth control') ||
    lower.includes('contraception') ||
    lower.includes('contraceptive') ||
    lower.includes('plan b') ||
    lower.includes('iud') ||
    lower.includes('pill') ||
    lower.includes('ring') ||
    lower.includes('nuvaring') ||
    lower.includes('pregnan')
  ) {
    return 'contraception';
  }
  return 'sti';
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function isLikelyNoiseLine(line: string): boolean {
  const lower = line.toLowerCase();
  if (line.length < 25) return true;
  if (line.length > 320) return false;
  if (
    lower.includes('cookie') ||
    lower.includes('privacy policy') ||
    lower.includes('terms of use') ||
    lower.includes('skip to content') ||
    lower.includes('breadcrumb') ||
    lower.includes('social media') ||
    lower.includes('share this')
  ) {
    return true;
  }
  // Common merged menu/header text patterns from scraped pages.
  if (!/[.!?]/.test(line) && /birth control|healthlinkbc|smartsexresource/i.test(line) && line.length < 80) {
    return true;
  }
  return false;
}

function cleanExtractedText(raw: string): string {
  if (!raw) return '';
  const lines = raw
    .split(/\r?\n+/)
    .map((l) => normalizeWhitespace(l))
    .filter(Boolean)
    .filter((l) => !isLikelyNoiseLine(l));

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
  }

  return deduped.join('\n');
}

function splitIntoChunks(text: string, chunkSize = 1000, overlap = 180): string[] {
  const cleaned = normalizeWhitespace(text);
  if (!cleaned) return [];
  if (cleaned.length <= chunkSize) return [cleaned];

  const chunks: string[] = [];
  let i = 0;
  while (i < cleaned.length) {
    const end = Math.min(cleaned.length, i + chunkSize);
    const slice = cleaned.slice(i, end);
    chunks.push(slice);
    if (end === cleaned.length) break;
    i = Math.max(end - overlap, i + 1);
  }
  return chunks;
}

function scoreChunk(query: string, chunk: string): number {
  const qTokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
  const lowerChunk = chunk.toLowerCase();

  let score = 0;
  for (const token of qTokens) {
    if (lowerChunk.includes(token)) score += 1;
  }
  return score;
}

async function fetchHtml(proxyPath: string): Promise<string> {
  const cached = getCacheValue(htmlCache, proxyPath);
  if (cached !== null) {
    return cached;
  }

  const response = await fetch(proxyPath);
  if (!response.ok) {
    return '';
  }

  const html = await response.text();
  setCacheValue(htmlCache, proxyPath, html);
  return html;
}

function extractTextFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,noscript,header,footer,nav,aside').forEach((n) => n.remove());

  const primaryNode =
    doc.querySelector('main') ||
    doc.querySelector('article') ||
    doc.querySelector('[role="main"]');
  const primaryText = cleanExtractedText(primaryNode?.textContent || '');
  if (primaryText && primaryText.length > 200) {
    return primaryText;
  }

  const bodyText = cleanExtractedText(doc.body?.innerText || '');
  return bodyText;
}

async function fetchDocText(proxyPath: string): Promise<string> {
  const cached = getCacheValue(textCache, proxyPath);
  if (cached !== null) {
    return cached;
  }
  const html = await fetchHtml(proxyPath);
  if (!html) return '';
  const text = extractTextFromHtml(html);
  setCacheValue(textCache, proxyPath, text);
  return text;
}

function canonicalToProxyPath(url: string): string | null {
  const u = new URL(url);
  if (u.hostname.includes('healthlinkbc.ca')) {
    return `/healthlinkbc${u.pathname}${u.search || ''}`;
  }
  if (u.hostname.includes('smartsexresource.com')) {
    return `/smartsexresource${u.pathname}${u.search || ''}`;
  }
  return null;
}

function shouldKeepLink(url: URL, topic: RagTopic): boolean {
  if (topic === 'sti') {
    return (
      url.hostname.includes('smartsexresource.com') &&
      (
        url.pathname.includes('/sexually-transmitted-infections/') ||
        url.pathname.includes('/testing/') ||
        url.pathname.includes('/clinics-testing/')
      )
    );
  }

  return (
    url.hostname.includes('healthlinkbc.ca') &&
    (
      url.pathname.includes('/living-well/family-planning-pregnancy-and-childbirth/') ||
      url.pathname.includes('/healthwise/birth-control-') ||
      url.pathname.includes('/healthlinkbc-files/emergency-contraception')
    )
  );
}

function deriveLabelFromUrl(url: string): string {
  const u = new URL(url);
  const slug = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
  const pretty = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return `${u.hostname.includes('healthlinkbc') ? 'HealthLinkBC' : 'SmartSexResource'} - ${pretty}`;
}

async function discoverDocsFromRoot(root: RagRoot): Promise<RagSourceDoc[]> {
  const cached = getCacheValue(discoveredDocsCache, root.id);
  if (cached !== null) {
    return cached;
  }

  const docs: RagSourceDoc[] = [
    {
      id: `${root.id}-root`,
      label: root.label,
      canonicalUrl: root.canonicalUrl,
      proxyPath: root.proxyPath,
      topic: root.topic,
    },
  ];

  try {
    const seen = new Set<string>([root.canonicalUrl]);
    const candidates = new Set<string>();
    const queue: Array<{ canonical: string; proxyPath: string; depth: number }> = [
      { canonical: root.canonicalUrl, proxyPath: root.proxyPath, depth: 0 },
    ];

    while (queue.length > 0 && candidates.size < MAX_LINKS_PER_ROOT * 3) {
      const next = queue.shift();
      if (!next) break;
      if (next.depth > MAX_CRAWL_DEPTH) continue;

      const html = await fetchHtml(next.proxyPath);
      if (!html) continue;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const anchors = Array.from(doc.querySelectorAll('a[href]'));

      for (const a of anchors) {
        const href = a.getAttribute('href');
        if (!href) continue;
        try {
          const resolved = new URL(href, next.canonical);
          resolved.hash = '';
          const canonical = resolved.toString();
          if (seen.has(canonical)) continue;
          if (!shouldKeepLink(resolved, root.topic)) continue;
          const proxyPath = canonicalToProxyPath(canonical);
          if (!proxyPath) continue;

          seen.add(canonical);
          candidates.add(canonical);

          if (next.depth < MAX_CRAWL_DEPTH) {
            queue.push({ canonical, proxyPath, depth: next.depth + 1 });
          }
        } catch {
          // Ignore malformed links.
        }
      }
    }

    const rankedCandidates = Array.from(candidates).sort((a, b) => {
      const score = (u: string): number => {
        const lower = u.toLowerCase();
        let s = 0;
        if (root.topic === 'contraception') {
          if (lower.includes('birth-control-iud')) s += 6;
          if (lower.includes('birth-control-hormones-ring')) s += 5;
          if (lower.includes('birth-control-hormones-pill')) s += 5;
          if (lower.includes('birth-control-hormones-patch')) s += 4;
          if (lower.includes('birth-control-shot')) s += 4;
          if (lower.includes('implant')) s += 4;
          if (lower.includes('emergency-contraception')) s += 3;
          if (lower.includes('birth-control')) s += 2;
        } else {
          if (lower.includes('/sexually-transmitted-infections/')) s += 5;
          if (lower.includes('/testing/')) s += 4;
          if (lower.includes('/clinics-testing/')) s += 3;
        }
        return s;
      };
      return score(b) - score(a);
    });

    for (const canonical of rankedCandidates.slice(0, MAX_LINKS_PER_ROOT)) {
      const proxyPath = canonicalToProxyPath(canonical);
      if (!proxyPath) continue;
      docs.push({
        id: `${root.id}-${docs.length}`,
        label: deriveLabelFromUrl(canonical),
        canonicalUrl: canonical,
        proxyPath,
        topic: root.topic,
      });
    }
  } catch {
    // Ignore root crawl failures; root doc itself remains available.
  }

  setCacheValue(discoveredDocsCache, root.id, docs);
  return docs;
}

async function runWithConcurrency<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];
  const runners = Array.from({ length: Math.max(1, Math.min(concurrency, items.length || 1)) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      try {
        await worker(item);
      } catch {
        // Continue processing remaining items.
      }
    }
  });
  await Promise.all(runners);
}

export async function prewarmRagContext(force = false): Promise<void> {
  if (prewarmPromise && !force) return prewarmPromise;

  prewarmPromise = (async () => {
    for (const root of RAG_ROOTS) {
      const docs = await discoverDocsFromRoot(root);
      const docSlice = docs.slice(0, PREWARM_DOCS_PER_ROOT);
      await runWithConcurrency(docSlice, PREWARM_CONCURRENCY, async (doc) => {
        await fetchDocText(doc.proxyPath);
      });
    }
  })().finally(() => {
    prewarmPromise = null;
  });

  return prewarmPromise;
}

export async function retrieveRagContext(query: string, maxChunks = 3): Promise<RagChunk[]> {
  const topic = classifyQueryTopic(query);
  const roots = RAG_ROOTS.filter((r) => (topic === 'sti' ? r.topic === 'sti' : r.topic === 'contraception'));
  const scored: RagChunk[] = [];

  for (const root of roots) {
    const docs = await discoverDocsFromRoot(root);
    for (const doc of docs) {
      try {
        const text = await fetchDocText(doc.proxyPath);
        if (!text) continue;

        const chunks = splitIntoChunks(text);
        for (const chunk of chunks) {
          const score = scoreChunk(query, chunk);
          if (score <= 0) continue;
          scored.push({
            sourceLabel: doc.label,
            sourceUrl: doc.canonicalUrl,
            text: chunk.slice(0, 1200),
            score,
          });
        }
      } catch {
        // Ignore per-source failures and continue.
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxChunks);
}
