type RagTopic = 'contraception' | 'pregnancy' | 'sti';
type PriorityCategory =
  | 'teen'
  | 'emergency'
  | 'larc'
  | 'comparison'
  | 'risk'
  | 'testing'
  | 'prep'
  | 'pep'
  | 'partners'
  | 'provider'
  | 'symptom'
  | 'chlamydia'
  | 'gonorrhea'
  | 'syphilis'
  | 'hiv'
  | 'herpes';

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

interface CuratedDoc {
  label: string;
  canonicalUrl: string;
  topic: RagTopic;
}

interface PriorityDoc {
  label: string;
  canonicalUrl: string;
  topic: RagTopic;
}

interface PriorityCategoryConfig {
  keywords: string[];
  primary: PriorityDoc;
  secondary: PriorityDoc[];
}

const MANDATORY_BIRTH_CONTROL_DISCLAIMER =
  'Hormonal birth control and LARCs (like IUDs) do not protect against STIs. Use condoms for dual protection.';

type ContraceptionIntent = 'general' | 'start_timing' | 'effectiveness' | 'emergency' | 'teens' | 'hormonal' | 'iud' | 'missed_pill';

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
    label: 'HealthLinkBC - Hormonal Methods Overview',
    canonicalUrl:
      'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods',
    proxyPath: '/healthlinkbc/health-topics/birth-control-pros-and-cons-hormonal-methods',
    topic: 'contraception',
  },
];

const CURATED_CONTRACEPTION_DOCS: CuratedDoc[] = [
  {
    label: 'HealthLinkBC - Birth Control for Teens',
    canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/birth-control-teens',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - Emergency Contraception (Healthwise)',
    canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/emergency-contraception',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - IUD (Healthwise)',
    canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/intrauterine-device-iud-birth-control',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - Effectiveness Rate of Birth Control Methods',
    canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/effectiveness-rate-birth-control-methods',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - Hormonal Methods Overview',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - The Pill (Combined)',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-pill',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - The Mini-Pill (Progestin)',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-mini-pill',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - The Patch',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-patch',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - The Shot (Depo)',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-shot',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - Hormonal Ring',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-ring',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - IUD (Intrauterine Device)',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/intrauterine-device-iud-birth-control',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - Barrier Methods',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/barrier-methods-birth-control',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC File #91a - Hormonal Contraception',
    canonicalUrl: 'https://www.healthlinkbc.ca/healthlinkbc-files/hormonal-contraception',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - Emergency Contraception',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/emergency-contraception',
    topic: 'contraception',
  },
  {
    label: 'HealthLinkBC - Fertility After Birth Control',
    canonicalUrl: 'https://www.healthlinkbc.ca/health-topics/getting-pregnant-after-stopping-birth-control',
    topic: 'contraception',
  },
];

const CURATED_CONTRACEPTION_URLS = new Set(CURATED_CONTRACEPTION_DOCS.map((d) => d.canonicalUrl));

const CURATED_STI_DOCS: CuratedDoc[] = [
  {
    label: 'SmartSexResource - STIs and Conditions',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Symptoms and Testing Basics',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/symptoms-testing/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Clinics & Testing',
    canonicalUrl: 'https://smartsexresource.com/clinics-testing/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Testing',
    canonicalUrl: 'https://smartsexresource.com/testing/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Talking to Partners',
    canonicalUrl: 'https://smartsexresource.com/sexual-health/partners-communication/talking-to-your-partners/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Talking to a Provider',
    canonicalUrl: 'https://smartsexresource.com/clinics-testing/#talking-to-a-provider',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Know Your Chances',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/know-your-chances/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - HIV PrEP',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/prep/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - HIV PEP',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/pep/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Chlamydia',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/chlamydia/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Gonorrhea',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/gonorrhea/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Syphilis',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/syphilis/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - HIV and AIDS',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/hiv-and-aids/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Herpes (HSV)',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/herpes-simplex-virus/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - HPV',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/hpv/',
    topic: 'sti',
  },
  {
    label: 'SmartSexResource - Hepatitis B',
    canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/hepatitis-b/',
    topic: 'sti',
  },
];

const CATEGORY_PRIORITY_MAP: Record<PriorityCategory, PriorityCategoryConfig> = {
  teen: {
    keywords: ['teen', 'teens', 'young adult', 'youth', 'under 25', 'student', 'high school'],
    primary: {
      label: 'HealthLinkBC - Birth Control for Teens',
      canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/birth-control-teens',
      topic: 'contraception',
    },
    secondary: [
      {
        label: 'HealthLinkBC - Emergency Contraception (Healthwise)',
        canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/emergency-contraception',
        topic: 'contraception',
      },
      {
        label: 'HealthLinkBC - IUD (Healthwise)',
        canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/intrauterine-device-iud-birth-control',
        topic: 'contraception',
      },
    ],
  },
  emergency: {
    keywords: ['emergency contraception', 'plan b', 'ella', 'condom broke', 'unprotected sex', 'missed pill', 'forgot pill', 'last night', 'within 5 days'],
    primary: {
      label: 'HealthLinkBC - Emergency Contraception (Healthwise)',
      canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/emergency-contraception',
      topic: 'contraception',
    },
    secondary: [
      {
        label: 'HealthLinkBC File #91b - Emergency Contraception',
        canonicalUrl: 'https://www.healthlinkbc.ca/healthlinkbc-files/emergency-contraception',
        topic: 'contraception',
      },
      {
        label: 'HealthLinkBC - IUD (Healthwise)',
        canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/intrauterine-device-iud-birth-control',
        topic: 'contraception',
      },
    ],
  },
  larc: {
    keywords: ['larc', 'long acting', 'long-acting', 'iud', 'implant', 'strongest birth control', 'best method'],
    primary: {
      label: 'HealthLinkBC - IUD (Healthwise)',
      canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/intrauterine-device-iud-birth-control',
      topic: 'contraception',
    },
    secondary: [
      {
        label: 'HealthLinkBC - Effectiveness Rate of Birth Control Methods',
        canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/effectiveness-rate-birth-control-methods',
        topic: 'contraception',
      },
    ],
  },
  comparison: {
    keywords: ['compare', 'comparison', 'effectiveness', 'effective', 'best birth control', 'which method', 'typical use', 'perfect use'],
    primary: {
      label: 'HealthLinkBC - Effectiveness Rate of Birth Control Methods',
      canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/effectiveness-rate-birth-control-methods',
      topic: 'contraception',
    },
    secondary: [
      {
        label: 'HealthLinkBC - IUD (Healthwise)',
        canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/intrauterine-device-iud-birth-control',
        topic: 'contraception',
      },
      {
        label: 'HealthLinkBC - Birth Control for Teens',
        canonicalUrl: 'https://www.healthlinkbc.ca/healthwise/birth-control-teens',
        topic: 'contraception',
      },
    ],
  },
  risk: {
    keywords: ['know your chances', 'my chances', 'risk', 'worried', 'anxious', 'recent exposure', 'exposure risk'],
    primary: {
      label: 'SmartSexResource - Know Your Chances',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/know-your-chances/',
      topic: 'sti',
    },
    secondary: [
      {
        label: 'SmartSexResource - Symptoms and Testing Basics',
        canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/symptoms-testing/',
        topic: 'sti',
      },
    ],
  },
  testing: {
    keywords: ['testing', 'test', 'when should i test', 'symptoms testing', 'sti checklist'],
    primary: {
      label: 'SmartSexResource - Symptoms and Testing Basics',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/symptoms-testing/',
      topic: 'sti',
    },
    secondary: [
      {
        label: 'SmartSexResource - STIs and Conditions',
        canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/',
        topic: 'sti',
      },
    ],
  },
  prep: {
    keywords: ['prep', 'pre-exposure prophylaxis'],
    primary: {
      label: 'SmartSexResource - HIV PrEP',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/prep/',
      topic: 'sti',
    },
    secondary: [
      {
        label: 'SmartSexResource - Know Your Chances',
        canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/know-your-chances/',
        topic: 'sti',
      },
    ],
  },
  pep: {
    keywords: ['pep', 'post-exposure prophylaxis', 'post exposure'],
    primary: {
      label: 'SmartSexResource - HIV PEP',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/pep/',
      topic: 'sti',
    },
    secondary: [
      {
        label: 'SmartSexResource - HIV PrEP',
        canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/prep/',
        topic: 'sti',
      },
    ],
  },
  partners: {
    keywords: ['talk to my partner', 'tell my partner', 'talking to partners', 'how do i bring this up', 'boyfriend', 'girlfriend'],
    primary: {
      label: 'SmartSexResource - Talking to Your Partners',
      canonicalUrl: 'https://smartsexresource.com/sexual-health/partners-communication/talking-to-your-partners/',
      topic: 'sti',
    },
    secondary: [
      {
        label: 'SmartSexResource - Talking to a Provider',
        canonicalUrl: 'https://smartsexresource.com/clinics-testing/#talking-to-a-provider',
        topic: 'sti',
      },
    ],
  },
  provider: {
    keywords: ['talk to a provider', 'what do i say at the clinic', 'doctor', 'provider'],
    primary: {
      label: 'SmartSexResource - Talking to a Provider',
      canonicalUrl: 'https://smartsexresource.com/clinics-testing/#talking-to-a-provider',
      topic: 'sti',
    },
    secondary: [
      {
        label: 'SmartSexResource - Clinics & Testing',
        canonicalUrl: 'https://smartsexresource.com/clinics-testing/',
        topic: 'sti',
      },
    ],
  },
  symptom: {
    keywords: ['symptom', 'symptoms', 'burning', 'itch', 'discharge', 'sore', 'rash', 'pain when peeing', 'std symptoms', 'sti symptoms'],
    primary: {
      label: 'SmartSexResource - STIs and Conditions',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/',
      topic: 'sti',
    },
    secondary: [
      {
        label: 'SmartSexResource - Symptoms and Testing Basics',
        canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/symptoms-testing/',
        topic: 'sti',
      },
      {
        label: 'SmartSexResource - Clinics & Testing',
        canonicalUrl: 'https://smartsexresource.com/clinics-testing/',
        topic: 'sti',
      },
    ],
  },
  chlamydia: {
    keywords: ['chlamydia'],
    primary: {
      label: 'SmartSexResource - Chlamydia',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/chlamydia/',
      topic: 'sti',
    },
    secondary: [],
  },
  gonorrhea: {
    keywords: ['gonorrhea', 'gonorrhoea'],
    primary: {
      label: 'SmartSexResource - Gonorrhea',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/gonorrhea/',
      topic: 'sti',
    },
    secondary: [],
  },
  syphilis: {
    keywords: ['syphilis'],
    primary: {
      label: 'SmartSexResource - Syphilis',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/syphilis/',
      topic: 'sti',
    },
    secondary: [],
  },
  hiv: {
    keywords: ['hiv', 'aids'],
    primary: {
      label: 'SmartSexResource - HIV and AIDS',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/hiv-and-aids/',
      topic: 'sti',
    },
    secondary: [],
  },
  herpes: {
    keywords: ['herpes', 'hsv'],
    primary: {
      label: 'SmartSexResource - Herpes Simplex Virus',
      canonicalUrl: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/herpes-simplex-virus/',
      topic: 'sti',
    },
    secondary: [],
  },
};

const MAX_LINKS_PER_ROOT = 40;
const MAX_CRAWL_DEPTH = 2;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const PREWARM_DOCS_PER_ROOT = 24;
const PREWARM_CONCURRENCY = 4;
const MAX_CHUNKS_PER_DOC = 2;
const MIN_CHUNK_SCORE = 1.5;
const FETCH_TIMEOUT_MS = 8000;
const QUERY_STOPWORDS = new Set([
  'what', 'how', 'is', 'are', 'the', 'a', 'an', 'i', 'you', 'to', 'for', 'of', 'in', 'on', 'and', 'or',
  'do', 'does', 'did', 'can', 'could', 'would', 'should', 'with', 'about', 'from', 'at', 'by', 'it', 'this',
  'that', 'my', 'me', 'we', 'our', 'your',
]);

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

function classifyQueryTopics(query: string): RagTopic[] {
  const lower = query.toLowerCase();

  let contraceptionScore = 0;
  let stiScore = 0;

  const contraceptionSignals = [
    'birth control', 'contraception', 'contraceptive', 'plan b', 'iud', 'pill', 'ring', 'nuvaring',
    'implant', 'patch', 'depo', 'emergency contraception',
  ];
  const pregnancySignals = ['pregnan', 'missed period', 'late period', 'pregnancy test', 'ovulation', 'fertility'];
  const stiSignals = ['sti', 'std', 'hiv', 'chlamydia', 'gonorrhea', 'syphilis', 'herpes', 'trich', 'testing', 'clinic'];

  for (const signal of contraceptionSignals) {
    if (lower.includes(signal)) contraceptionScore += 2;
  }
  for (const signal of pregnancySignals) {
    if (lower.includes(signal)) contraceptionScore += 2;
  }
  for (const signal of stiSignals) {
    if (lower.includes(signal)) stiScore += 2;
  }

  const topics: RagTopic[] = [];
  if (contraceptionScore > 0) topics.push('contraception');
  if (stiScore > 0) topics.push('sti');

  if (topics.length === 0) {
    // Default to both to avoid over-filtering when user wording is broad.
    return ['contraception', 'sti'];
  }

  return topics;
}

function detectPriorityCategory(query: string): PriorityCategory | null {
  const lower = query.toLowerCase();

  if (CATEGORY_PRIORITY_MAP.chlamydia.keywords.some((k) => lower.includes(k))) return 'chlamydia';
  if (CATEGORY_PRIORITY_MAP.gonorrhea.keywords.some((k) => lower.includes(k))) return 'gonorrhea';
  if (CATEGORY_PRIORITY_MAP.syphilis.keywords.some((k) => lower.includes(k))) return 'syphilis';
  if (CATEGORY_PRIORITY_MAP.herpes.keywords.some((k) => lower.includes(k))) return 'herpes';
  if (CATEGORY_PRIORITY_MAP.hiv.keywords.some((k) => lower.includes(k))) return 'hiv';
  if (CATEGORY_PRIORITY_MAP.pep.keywords.some((k) => lower.includes(k))) return 'pep';
  if (CATEGORY_PRIORITY_MAP.prep.keywords.some((k) => lower.includes(k))) return 'prep';
  if (CATEGORY_PRIORITY_MAP.emergency.keywords.some((k) => lower.includes(k))) {
    return 'emergency';
  }
  if (CATEGORY_PRIORITY_MAP.symptom.keywords.some((k) => lower.includes(k))) {
    return 'symptom';
  }
  if (CATEGORY_PRIORITY_MAP.risk.keywords.some((k) => lower.includes(k))) return 'risk';
  if (CATEGORY_PRIORITY_MAP.testing.keywords.some((k) => lower.includes(k))) return 'testing';
  if (CATEGORY_PRIORITY_MAP.partners.keywords.some((k) => lower.includes(k))) return 'partners';
  if (CATEGORY_PRIORITY_MAP.provider.keywords.some((k) => lower.includes(k))) return 'provider';
  if (CATEGORY_PRIORITY_MAP.teen.keywords.some((k) => lower.includes(k))) {
    return 'teen';
  }
  if (CATEGORY_PRIORITY_MAP.larc.keywords.some((k) => lower.includes(k))) return 'larc';
  if (CATEGORY_PRIORITY_MAP.comparison.keywords.some((k) => lower.includes(k))) return 'comparison';
  return null;
}

function isContraceptionQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return (
    lower.includes('birth control') ||
    lower.includes('contraception') ||
    lower.includes('plan b') ||
    lower.includes('iud') ||
    lower.includes('pill') ||
    lower.includes('ring') ||
    lower.includes('depo') ||
    lower.includes('shot') ||
    lower.includes('implant') ||
    lower.includes('condom') ||
    lower.includes('emergency contraception')
  );
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function isLikelyNoiseLine(line: string): boolean {
  const lower = line.toLowerCase();
  if (line.length < 25) return true;
  if (
    lower.includes('effectiveness rate of birth control methods') ||
    lower.includes('how pregnancy (conception) occurs') ||
    lower.includes('birth control: myths about sex and pregnancy')
  ) {
    return true;
  }
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

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !QUERY_STOPWORDS.has(t));
}

function splitIntoChunks(text: string, chunkSize = 900, overlapSentences = 1): string[] {
  const cleaned = cleanExtractedText(text);
  if (!cleaned) return [];

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => normalizeWhitespace(s))
    .filter((s) => s.length >= 30);

  if (sentences.length === 0) {
    const fallback = normalizeWhitespace(cleaned);
    return fallback ? [fallback.slice(0, chunkSize)] : [];
  }

  const chunks: string[] = [];
  let i = 0;
  while (i < sentences.length) {
    let current = '';
    let j = i;
    while (j < sentences.length) {
      const next = current ? `${current} ${sentences[j]}` : sentences[j];
      if (next.length > chunkSize && current.length > 0) break;
      current = next;
      j += 1;
      if (current.length >= chunkSize) break;
    }

    if (current.length > 0) {
      chunks.push(current);
    }

    if (j >= sentences.length) break;
    i = Math.max(j - overlapSentences, i + 1);
  }

  return chunks;
}

function scoreChunk(query: string, chunk: string): number {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return 0;
  const lowerChunk = chunk.toLowerCase();
  const cTokens = new Set(tokenize(chunk));

  let score = 0;
  for (const token of qTokens) {
    if (cTokens.has(token)) score += 1.2;
    if (lowerChunk.includes(` ${token} `)) score += 0.4;
  }

  const normalizedQuery = normalizeWhitespace(query.toLowerCase());
  if (normalizedQuery.length > 8 && lowerChunk.includes(normalizedQuery)) {
    score += 4;
  }

  for (let i = 0; i < qTokens.length - 1; i += 1) {
    const bigram = `${qTokens[i]} ${qTokens[i + 1]}`;
    if (lowerChunk.includes(bigram)) score += 1.5;
  }

  const coverage = qTokens.filter((t) => cTokens.has(t)).length / qTokens.length;
  score += coverage * 2;

  return score;
}

function detectContraceptionIntent(query: string): ContraceptionIntent {
  const lower = query.toLowerCase();
  if ((lower.includes('miss') || lower.includes('forgot')) && lower.includes('pill')) {
    return 'missed_pill';
  }
  if (
    lower.includes('emergency') ||
    lower.includes('plan b') ||
    lower.includes('condom broke') ||
    lower.includes('failed')
  ) {
    return 'emergency';
  }
  if (
    lower.includes('when can i start') ||
    lower.includes('when should i start') ||
    lower.includes('start taking') ||
    lower.includes('begin taking') ||
    lower.includes('when to start')
  ) {
    return 'start_timing';
  }
  if (
    lower.includes('effective') ||
    lower.includes('effectiveness') ||
    lower.includes('typical use') ||
    lower.includes('perfect use')
  ) {
    return 'effectiveness';
  }
  if (lower.includes('teen')) return 'teens';
  if (lower.includes('iud')) return 'iud';
  if (lower.includes('hormonal') || lower.includes('pill') || lower.includes('shot') || lower.includes('patch') || lower.includes('ring')) {
    return 'hormonal';
  }
  return 'general';
}

function docUrlMatchesIntent(docUrl: string, intent: ContraceptionIntent): boolean {
  const lower = docUrl.toLowerCase();
  if (intent === 'emergency') {
    return lower.includes('emergency-contraception') || lower.includes('/healthwise/emergency-contraception');
  }
  if (intent === 'effectiveness') {
    return (
      lower.includes('birth-control-hormones-pill') ||
      lower.includes('birth-control-hormones-mini-pill') ||
      lower.includes('birth-control-hormones-patch') ||
      lower.includes('birth-control-hormones-ring') ||
      lower.includes('intrauterine-device-iud-birth-control')
    );
  }
  if (intent === 'start_timing') {
    return (
      lower.includes('birth-control-pros-and-cons-hormonal-methods') ||
      lower.includes('/healthlinkbc-files/hormonal-contraception') ||
      lower.includes('birth-control-hormones-pill') ||
      lower.includes('birth-control-hormones-mini-pill') ||
      lower.includes('birth-control-hormones-patch') ||
      lower.includes('birth-control-hormones-ring')
    );
  }
  if (intent === 'iud') {
    return lower.includes('intrauterine-device-iud-birth-control');
  }
  if (intent === 'hormonal') {
    return lower.includes('hormonal-contraception') || lower.includes('birth-control-hormones');
  }
  if (intent === 'missed_pill') {
    return lower.includes('/healthlinkbc-files/hormonal-contraception') || lower.includes('birth-control-hormones-pill');
  }
  return (
    lower.includes('birth-control-pros-and-cons-hormonal-methods') ||
    lower.includes('/healthwise/effectiveness-rate-birth-control-methods') ||
    lower.includes('/healthwise/birth-control-teens') ||
    lower.includes('birth-control-hormones-pill') ||
    lower.includes('birth-control-hormones-mini-pill') ||
    lower.includes('birth-control-hormones-patch') ||
    lower.includes('birth-control-hormones-shot') ||
    lower.includes('birth-control-hormones-ring') ||
    lower.includes('intrauterine-device-iud-birth-control') ||
    lower.includes('barrier-methods-birth-control')
  );
}

function boostScoreForCuratedDoc(query: string, docUrl: string): number {
  if (!CURATED_CONTRACEPTION_URLS.has(docUrl)) return 0;

  const intent = detectContraceptionIntent(query);
  let boost = 0.6;
  if (docUrlMatchesIntent(docUrl, intent)) boost += 2.0;
  if (intent !== 'emergency' && docUrl.toLowerCase().includes('emergency-contraception')) boost -= 1.8;
  if (intent === 'start_timing' && docUrl.toLowerCase().includes('barrier-methods-birth-control')) boost -= 0.6;
  if (intent === 'missed_pill' && docUrl.toLowerCase().includes('emergency-contraception')) boost -= 0.8;
  return boost;
}

function boostScoreForPriorityCategory(
  query: string,
  docUrl: string,
  priorityCategory: PriorityCategory | null
): number {
  if (!priorityCategory) return 0;
  const config = CATEGORY_PRIORITY_MAP[priorityCategory];
  if (docUrl === config.primary.canonicalUrl) return 300;
  if (config.secondary.some((doc) => doc.canonicalUrl === docUrl)) return 120;

  const lower = query.toLowerCase();
  if (priorityCategory === 'emergency' && (lower.includes('plan b') || lower.includes('emergency'))) {
    if (docUrl.includes('emergency-contraception')) return 40;
  }
  if (priorityCategory === 'symptom' && lower.includes('symptom')) {
    if (docUrl.includes('stis-conditions') || docUrl.includes('/testing/')) return 25;
  }
  return 0;
}

async function fetchHtml(proxyPath: string): Promise<string> {
  const cached = getCacheValue(htmlCache, proxyPath);
  if (cached !== null) {
    return cached;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(proxyPath, { signal: controller.signal });
    if (!response.ok) {
      return '';
    }

    const html = await response.text();
    setCacheValue(htmlCache, proxyPath, html);
    return html;
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
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
      url.pathname.includes('/health-topics/birth-control-pros-and-cons-hormonal-methods') ||
      url.pathname.includes('/health-topics/birth-control-hormones-pill') ||
      url.pathname.includes('/health-topics/birth-control-hormones-mini-pill') ||
      url.pathname.includes('/health-topics/birth-control-hormones-patch') ||
      url.pathname.includes('/health-topics/birth-control-hormones-shot') ||
      url.pathname.includes('/health-topics/birth-control-hormones-ring') ||
      url.pathname.includes('/health-topics/intrauterine-device-iud-birth-control') ||
      url.pathname.includes('/health-topics/barrier-methods-birth-control') ||
      url.pathname.includes('/health-topics/emergency-contraception') ||
      url.pathname.includes('/health-topics/getting-pregnant-after-stopping-birth-control') ||
      url.pathname.includes('/healthlinkbc-files/emergency-contraception') ||
      url.pathname.includes('/healthlinkbc-files/hormonal-contraception')
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
  const seen = new Set<string>([root.canonicalUrl]);

  if (root.topic === 'contraception') {
    for (const doc of CURATED_CONTRACEPTION_DOCS) {
      const proxyPath = canonicalToProxyPath(doc.canonicalUrl);
      if (!proxyPath || seen.has(doc.canonicalUrl)) continue;
      seen.add(doc.canonicalUrl);
      docs.push({
        id: `${root.id}-curated-${docs.length}`,
        label: doc.label,
        canonicalUrl: doc.canonicalUrl,
        proxyPath,
        topic: doc.topic,
      });
    }
    setCacheValue(discoveredDocsCache, root.id, docs);
    return docs;
  }

  if (root.topic === 'sti') {
    for (const doc of CURATED_STI_DOCS) {
      const proxyPath = canonicalToProxyPath(doc.canonicalUrl);
      if (!proxyPath || seen.has(doc.canonicalUrl)) continue;
      seen.add(doc.canonicalUrl);
      docs.push({
        id: `${root.id}-curated-${docs.length}`,
        label: doc.label,
        canonicalUrl: doc.canonicalUrl,
        proxyPath,
        topic: doc.topic,
      });
    }
  }

  try {
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
  const topics = classifyQueryTopics(query);
  const priorityCategory = detectPriorityCategory(query);
  if (priorityCategory) {
    const priorityTopic = CATEGORY_PRIORITY_MAP[priorityCategory].primary.topic;
    if (!topics.includes(priorityTopic)) {
      topics.unshift(priorityTopic);
    }
  }
  const roots = RAG_ROOTS.filter((r) => topics.includes(r.topic));
  const scored: RagChunk[] = [];

  for (const root of roots) {
    const docs = await discoverDocsFromRoot(root);
    for (const doc of docs) {
      try {
        const text = await fetchDocText(doc.proxyPath);
        if (!text) continue;

        const chunks = splitIntoChunks(text);
        let acceptedFromDoc = 0;
        for (const chunk of chunks) {
          const score =
            scoreChunk(query, chunk) +
            boostScoreForCuratedDoc(query, doc.canonicalUrl) +
            boostScoreForPriorityCategory(query, doc.canonicalUrl, priorityCategory);
          if (score < MIN_CHUNK_SCORE) continue;
          scored.push({
            sourceLabel: doc.label,
            sourceUrl: doc.canonicalUrl,
            text: chunk.slice(0, 1200),
            score,
          });
          acceptedFromDoc += 1;
          if (acceptedFromDoc >= MAX_CHUNKS_PER_DOC) break;
        }
      } catch {
        // Ignore per-source failures and continue.
      }
    }
  }

  if (priorityCategory) {
    const config = CATEGORY_PRIORITY_MAP[priorityCategory];
    scored.push({
      sourceLabel: config.primary.label,
      sourceUrl: config.primary.canonicalUrl,
      text:
        `Priority category detected: ${priorityCategory}. Use this source first before any secondary references. ` +
        `Secondary links can be used only for extra detail or next steps.`,
      score: 500,
    });
  }

  if (topics.includes('contraception') || isContraceptionQuery(query)) {
    scored.push({
      sourceLabel: 'HealthLinkBC - Birth Control Safety Directives',
      sourceUrl: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-pill',
      text:
        'When discussing method effectiveness, clearly distinguish perfect use from typical use. ' +
        `Always append this exact warning to birth control answers: ${MANDATORY_BIRTH_CONTROL_DISCLAIMER} ` +
        'If method failure is mentioned (for example a broken condom or missed pills), prioritize emergency contraception options: emergency contraceptive pills and copper IUD, and mention time sensitivity up to 5 to 7 days depending on method.',
      score: 999,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const diverse: RagChunk[] = [];
  const perSource = new Map<string, number>();
  for (const chunk of scored) {
    const used = perSource.get(chunk.sourceUrl) ?? 0;
    if (used >= 1) continue;
    diverse.push(chunk);
    perSource.set(chunk.sourceUrl, used + 1);
    if (diverse.length >= maxChunks) break;
  }
  return diverse;
}
