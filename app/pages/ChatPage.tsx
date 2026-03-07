import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Menu, Send } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ChatBubble } from '../components/ChatBubble';
import { QuickActionChips } from '../components/QuickActionChips';
import { getSTIInfo, searchSTIsBySymptom } from '../data/stiKnowledge';
import { getPreventionInfo } from '../data/preventionKnowledge';
import { ChatMessage } from '../types/chat';
import { searchFAQs, FAQ } from '../data/faqKnowledge';
import { searchContraceptionFAQs } from '../data/contraceptionFAQs';
import { 
  detectLanguage, 
  detectSTITopic, 
  getMultilingualResource, 
  getAvailableLanguages,
  UX_COPY,
  MULTILINGUAL_RESOURCES
} from '../data/multilingualResources';
import { useResourceHealthCheck } from '../hooks/useResourceHealthCheck';
import { PatientSummaryForm } from '../components/PatientSummaryForm';
import { PatientSummaryView } from '../components/PatientSummaryView';
import { generatePatientSummary } from '../utils/patientSummaryUtils';
import { PatientSummaryFormData, PatientSummaryData } from '../types/patientSummary';
import { RagChunk, prewarmRagContext, retrieveRagContext } from '../utils/ragRetrieval';
import { formatDateTimeLocalInput, normalizeDateTimeLocalValue } from '../utils/dateUtils';

// Intent detection types
type Intent = 
  | 'uncertain_symptoms' 
  | 'symptoms_present' 
  | 'partner_positive' 
  | 'exposure_risk'
  | 'none';

type TriagePath = 'needs_clinic' | 'ok_for_gco' | 'clarifying';
type TriageStage =
  | 'idle'
  | 'symptomCheck'
  | 'symptomDetails'
  | 'symptomDuration'
  | 'sexTypes'
  | 'condomUse'
  | 'partnerKnownSti'
  | 'whatHappened';

interface ConversationContext {
  detectedIntents: Intent[];
  hasSymptoms?: boolean;
  partnerPositive?: boolean;
  exposureRisk?: boolean;
  awaitingSymptomClarification?: boolean;
}

interface ChatSymptomTriageDraft {
  symptoms: string[];
  duration: string;
}

interface StoredTriageDraft {
  hasSymptoms: 'yes' | 'no' | 'unsure' | null;
  selectedSymptoms: string[];
  duration: string;
  contactDate?: string;
  condomUse?: 'used throughout' | 'used sometimes' | 'no condom' | 'condom broke';
  partnerKnownSti?: 'yes' | 'no' | 'unsure';
  sexTypes?: string[];
  whatHappened?: string;
  updatedAtISO: string;
}

type SummaryChatStage =
  | 'idle'
  | 'what_happened'
  | 'contact_date'
  | 'sex_types'
  | 'condom_use'
  | 'has_symptoms'
  | 'symptoms_list'
  | 'symptom_duration'
  | 'partner_known_sti'
  | 'current_medications'
  | 'medications_list'
  | 'pregnancy_possible'
  | 'allergies_meds'
  | 'preferred_language';

// Intent detection function
function detectIntents(query: string): Intent[] {
  const lowerQuery = query.toLowerCase();
  const intents: Intent[] = [];
  
  // Detect uncertain_symptoms - including uncertain language
  if (((lowerQuery.includes('think') || lowerQuery.includes('might') || lowerQuery.includes('maybe') || 
       lowerQuery.includes('not sure') || lowerQuery.includes('unsure') || lowerQuery.includes("don't know") ||
       lowerQuery.includes("idk") || lowerQuery.includes("i think so") || lowerQuery.includes("i'm not sure")) && 
      (lowerQuery.includes('have') || lowerQuery.includes('got')) && 
      (lowerQuery.includes('sti') || lowerQuery.includes('std') || lowerQuery.includes('infection'))) ||
      // Also detect standalone uncertain responses
      (lowerQuery === "i don't know" || lowerQuery === "idk" || lowerQuery === "not sure" || 
       lowerQuery === "unsure" || lowerQuery === "maybe" || lowerQuery === "i think so" || 
       lowerQuery === "i'm not sure")) {
    intents.push('uncertain_symptoms');
  }
  
  // Detect symptoms_present - expanded detection
  if (lowerQuery.includes('burning') || lowerQuery.includes('stinging') || lowerQuery.includes('hurts when') || 
      lowerQuery.includes('hurt when') || lowerQuery.includes('burns when') || lowerQuery.includes('sting when') ||
      lowerQuery.includes('pain when') || lowerQuery.includes('pain peeing') || lowerQuery.includes('pee hurts') ||
      lowerQuery.includes('peeing hurts') || lowerQuery.includes('itch') || lowerQuery.includes('discharge') || 
      lowerQuery.includes('sore') || lowerQuery.includes('rash') || lowerQuery.includes('blister') ||
      lowerQuery.includes('bump')) {
    intents.push('symptoms_present');
  }
  
  // Detect partner_positive
  if ((lowerQuery.includes('partner') || lowerQuery.includes('boyfriend') || lowerQuery.includes('girlfriend') || 
       lowerQuery.includes('husband') || lowerQuery.includes('wife')) && 
      (lowerQuery.includes('has') || lowerQuery.includes('got') || lowerQuery.includes('tested positive') || 
       lowerQuery.includes('diagnosed') || lowerQuery.includes('have')) && 
      (lowerQuery.includes('sti') || lowerQuery.includes('std') || lowerQuery.includes('infection') || 
       lowerQuery.includes('chlamydia') || lowerQuery.includes('gonorrhea') || lowerQuery.includes('syphilis') || 
       lowerQuery.includes('herpes') || lowerQuery.includes('hpv') || lowerQuery.includes('hiv'))) {
    intents.push('partner_positive');
  }
  
  // Detect exposure_risk
  if (lowerQuery.includes('condom broke') || lowerQuery.includes('no condom') || 
      lowerQuery.includes('condom slipped') || lowerQuery.includes("didn't use condom") || 
      lowerQuery.includes('without condom') || lowerQuery.includes('unprotected')) {
    intents.push('exposure_risk');
  }
  
  return intents.length > 0 ? intents : ['none'];
}

// Determine triage path based on intents
function determineTriagePath(intents: Intent[], context: ConversationContext): TriagePath {
  // symptoms_present â†’ needs_clinic
  if (intents.includes('symptoms_present')) {
    return 'needs_clinic';
  }
  
  // partner_positive â†’ needs_clinic
  if (intents.includes('partner_positive')) {
    return 'needs_clinic';
  }
  
  // uncertain_symptoms â†’ clarifying (ask follow-up)
  if (intents.includes('uncertain_symptoms')) {
    return 'clarifying';
  }
  
  // exposure_risk with no symptoms â†’ ok_for_gco
  if (intents.includes('exposure_risk') && context.hasSymptoms === false) {
    return 'ok_for_gco';
  }
  
  return 'clarifying';
}

const INITIAL_MESSAGE: ChatMessage = {
  id: '1',
  role: 'assistant',
  content: 'Hi! I\'m SIA, your Sexual Information Assistant. I can help you with:\n\n- Sexual health information\n- STI testing guidance\n- Finding nearby clinics\n- Contraception options\n- Safer sex practices\n\nWhat would you like to know?',
  sources: [
    { label: 'SmartSexResource - Home', url: 'https://smartsexresource.com' }
  ],
  timestamp: new Date(),
};

const SUMMARY_STORAGE_KEY = 'sia_patient_summary_v1';
const SUMMARY_FORM_STORAGE_KEY = 'sia_patient_summary_form_v1';
  const TRIAGE_DRAFT_STORAGE_KEY = 'sia_triage_draft_v1';
const CHAT_HISTORY_STORAGE_KEY = 'sia_chat_history_v1';
const ACCESS_CODE_STORAGE_KEY = 'sia_access_code_v1';
const USER_NAME_STORAGE_KEY = 'sia_user_name_v1';
const USER_AGE_STORAGE_KEY = 'sia_user_age_v1';
const RAG_BACKGROUND_REFRESH_MS = 1000 * 60 * 30; // 30 minutes
const MANDATORY_BIRTH_CONTROL_DISCLAIMER =
  'Hormonal birth control and LARCs (like IUDs) do not protect against STIs. Use condoms for dual protection.';
const SUPPORTED_SUMMARY_LANGUAGES = [
  'English',
  'Arabic',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Farsi',
  'French',
  'Korean',
  'Punjabi',
  'Spanish',
  'Vietnamese',
] as const;

const EMPTY_SUMMARY_FORM_DATA: PatientSummaryFormData = {
  what_happened: '',
  contact_date: '',
  sex_types: [],
  condom_use: 'no condom',
  has_symptoms: false,
  symptoms_list: '',
  symptom_duration: '',
  partner_known_sti: 'unsure',
  current_medications: false,
  medications_list: '',
  pregnancy_possible: 'no',
  allergies_meds: 'NKDA',
  preferred_language: 'English',
};

interface LlmTriageExtraction {
  hasSymptoms?: 'yes' | 'no' | 'unsure';
  selectedSymptoms?: string[];
  duration?: string;
  condomUse?: 'used throughout' | 'used sometimes' | 'no condom' | 'condom broke';
  partnerKnownSti?: 'yes' | 'no' | 'unsure';
  sexTypes?: string[];
  whatHappened?: string;
  confidence?: number;
}

async function getLLMGeneralResponse(
  query: string,
  context?: {
    triageStage: TriageStage;
    fallbackContent?: string;
    ragContextText?: string;
    userName?: string | null;
    userAge?: number | null;
    chatHistoryText?: string;
    timeoutMs?: number;
  }
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), context?.timeoutMs ?? 16000);

  try {
    const triageMode = context?.triageStage && context.triageStage !== 'idle';
    const lowerQuery = query.toLowerCase();
    const contraceptionFocused =
      lowerQuery.includes('birth control') ||
      lowerQuery.includes('contraception') ||
      lowerQuery.includes('plan b') ||
      lowerQuery.includes('iud') ||
      lowerQuery.includes('pill') ||
      lowerQuery.includes('depo') ||
      lowerQuery.includes('shot') ||
      lowerQuery.includes('emergency contraception') ||
      lowerQuery.includes('condom');
    const response = await fetch('/ollama/api/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3',
        stream: false,
        options: {
          num_predict: 180,
          temperature: 0.35,
        },
        messages: [
          {
            role: 'system',
            content:
              'You are SIA, a friendly sexual health assistant for British Columbia, Canada. ' +
              'Speak like a calm human guide: warm, simple, direct. ' +
              'Always produce one final answer only. Do not provide multiple alternative phrasings. ' +
              'Do not start with several greeting options. ' +
              'Give short, clear, practical answers at Grade 6 reading level. ' +
              'Do not diagnose. If symptoms are severe or emergency signs are present, advise urgent care. ' +
              'For STI/testing questions, mention clinic vs online testing pathways in BC when relevant. ' +
              'For contraception and pregnancy questions, prioritize HealthLink BC guidance. ' +
              'For STI/testing questions, prioritize SmartSexResource guidance. ' +
              'For pregnancy questions, explain home pregnancy testing timing and when to seek care. ' +
              (context?.userName
                ? `The user's name is ${context.userName}. Use their name naturally when appropriate. `
                : '') +
              (context?.userAge
                ? `The user is ${context.userAge} years old. Tailor wording to their age and keep tone non-judgmental. If the user is a teen, use youth-friendly language and reassure confidentiality in health care settings when relevant. `
                : '') +
              (context?.chatHistoryText
                ? 'You are given recent chat history. Use it to keep continuity and avoid repeating yourself. '
                : '') +
              (context?.ragContextText
                ? 'You are given retrieved reference snippets. Base your answer on those snippets first, then general knowledge only if needed. Do not copy long passages verbatim. Ignore unrelated/noisy lines.'
                : '') +
              (contraceptionFocused
                ? 'For birth control answers, explicitly distinguish typical use vs perfect use effectiveness. Always append this exact warning: "Hormonal birth control and LARCs (like IUDs) do not protect against STIs. Use condoms for dual protection." If method failure is mentioned, prioritize emergency contraception options (emergency contraceptive pills and copper IUD) and note time sensitivity up to 5 to 7 days depending on method. Keep the tone supportive, clinical, and non-judgmental. '
                : '') +
              (triageMode
                ? 'The user is in a structured triage flow. Keep the same intent as the reference triage prompt, do not change decision logic, and keep any yes/no/not sure choices.'
                : '') +
              'Default to 1 short paragraph (2-5 sentences). Use bullets only when explicitly helpful. Start directly with the answer and do not preface with phrases like "Based on trusted resources".',
          },
          ...(context?.ragContextText
            ? [
                {
                  role: 'assistant' as const,
                  content: `Retrieved references:\n${context.ragContextText}`,
                },
              ]
            : []),
          ...(context?.chatHistoryText
            ? [
                {
                  role: 'assistant' as const,
                  content: `Recent conversation context:\n${context.chatHistoryText}`,
                },
              ]
            : []),
          ...(context?.fallbackContent
            ? [
                {
                  role: 'assistant' as const,
                  content: `Reference triage/rule guidance to preserve intent:\n${context.fallbackContent}`,
                },
              ]
            : []),
          { role: 'user', content: query },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.message?.content;
    if (typeof content !== 'string') return null;
    const trimmed = content.trim();
    if (!trimmed) return null;
    return trimmed;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeLlmReply(reply: string): string {
  let text = reply.trim();
  if (!text) return text;

  // Remove leaked internal instruction lines.
  text = text.replace(/^Always append this exact warning to birth control answers:.*$/gim, '').trim();
  text = text.replace(/^Always append this exact warning:.*$/gim, '').trim();

  // If model outputs multiple greeting alternatives as bullets, keep first useful line.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const bulletLike = lines.filter((l) => /^[-*•]\s+/.test(l));
  if (bulletLike.length >= 2) {
    const stripped = bulletLike.map((l) => l.replace(/^[-*•]\s+/, '').trim());
    const greetingish = stripped.filter((l) =>
      /^(hi|hello|hey|good day|good morning|good afternoon|good evening)\b/i.test(l)
    );
    if (greetingish.length >= 2) {
      return stripped[0];
    }
  }

  return text;
}

function isPriorityStiConcernQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const concernWords = ['worried', 'concerned', 'anxious', 'scared', 'afraid', 'think', 'might', 'maybe'];
  const hasConcern = concernWords.some((w) => lower.includes(w));
  const hasStiTerm =
    lower.includes('sti') || lower.includes('std') || lower.includes('infection') || lower.includes('sexual infection');
  const hasSelfReference =
    lower.includes('i have') ||
    lower.includes("i've got") ||
    lower.includes('i got') ||
    lower.includes('do i have') ||
    lower.includes('could i have');

  return hasConcern && hasStiTerm && hasSelfReference;
}

function isContraceptionFocusedQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return (
    lower.includes('birth control') ||
    lower.includes('contraception') ||
    lower.includes('contraceptive') ||
    lower.includes('iud') ||
    lower.includes('pill') ||
    lower.includes('implant') ||
    lower.includes('patch') ||
    lower.includes('ring') ||
    lower.includes('depo') ||
    lower.includes('shot') ||
    lower.includes('plan b') ||
    lower.includes('emergency contraception')
  );
}

function postProcessAssistantContent(
  query: string,
  content: string,
  options?: { hasShownBirthControlDisclaimer?: boolean }
): string {
  let out = normalizeLlmReply(content);
  if (!out) return out;

  if (isContraceptionFocusedQuery(query)) {
    // Remove partial disclaimer variants and ensure exact mandatory sentence once.
    out = out
      .replace(/Hormonal birth control and LARCs \(like IUDs\) do not protect against STIs\.(?! Use condoms for dual protection\.)/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    if (!options?.hasShownBirthControlDisclaimer && !out.includes(MANDATORY_BIRTH_CONTROL_DISCLAIMER)) {
      out = `${out}\n\n${MANDATORY_BIRTH_CONTROL_DISCLAIMER}`.trim();
    }
  }

  return out;
}

function normalizeResponseSources(sources: { label: string; url: string }[]): { label: string; url: string }[] {
  const sanitizeSourceUrl = (url: string): string => {
    const trimmed = url.trim();
    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname.includes('healthlinkbc.ca')) return trimmed;
      const lowerPath = parsed.pathname.toLowerCase();
      const isSearchLike =
        lowerPath.includes('/search') ||
        parsed.searchParams.has('q') ||
        parsed.searchParams.has('query');
      if (isSearchLike) {
        return 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods';
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  };

  const cleaned = sources.filter(
    (s) =>
      !!s &&
      typeof s.label === 'string' &&
      typeof s.url === 'string' &&
      s.label.trim().length > 0 &&
      /^https?:\/\//i.test(s.url) &&
      !/safety directives/i.test(s.label)
  );
  return Array.from(
    new Map(
      cleaned.map((s) => {
        const normalizedUrl = sanitizeSourceUrl(s.url);
        return [normalizedUrl, { label: s.label.trim(), url: normalizedUrl }];
      })
    ).values()
  );
}

function buildResourceFallbackAnswer(query: string, chunks: RagChunk[]): string | null {
  if (chunks.length === 0) return null;
  const lowerQuery = query.toLowerCase();
  const asksWhatIsBirthControl =
    (lowerQuery.includes('what') && lowerQuery.includes('birth control')) ||
    lowerQuery.includes('what is contraception');
  const asksNeedBirthControl =
    (lowerQuery.includes('do i need') && lowerQuery.includes('birth control')) ||
    (lowerQuery.includes('should i use') && lowerQuery.includes('birth control'));
  const emergencyQuery =
    lowerQuery.includes('emergency') ||
    lowerQuery.includes('plan b') ||
    lowerQuery.includes('condom broke') ||
    lowerQuery.includes('missed pill') ||
    lowerQuery.includes('failed');

  if (asksWhatIsBirthControl || asksNeedBirthControl) {
    return (
      'Birth control (contraception) means methods used to reduce the chance of pregnancy. ' +
      'Whether you need it depends on your goals: if you want to avoid pregnancy and are having vaginal sex, using birth control is recommended.\n\n' +
      'Most birth control methods do not protect against STIs. Condoms are still needed for STI prevention.'
    );
  }

  const stopwords = new Set([
    'what', 'how', 'is', 'are', 'the', 'a', 'an', 'i', 'you', 'to', 'for', 'of', 'in', 'on', 'and', 'or',
  ]);
  const qTokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !stopwords.has(t));

  const picked: string[] = [];
  for (const c of chunks) {
    const sentences = c.text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const candidates = sentences.filter((s) => {
      const lower = s.toLowerCase();
      if (s.length < 40 || s.length > 260) return false;
      if (/cookie|privacy policy|terms of use|copyright|all rights reserved/i.test(lower)) return false;
      if (/birth controlhow|stis-conditions|menu|breadcrumb/i.test(lower)) return false;
      if (/effectiveness rate of birth control methods how pregnancy \(conception\) occurs/i.test(lower)) return false;
      if (!emergencyQuery && /emergency contraception|plan b|copper iud/.test(lower)) return false;
      if (/^[a-z]{1,3}\s+control\b/.test(lower)) return false;
      if (!/^[A-Z0-9]/.test(s) && !lower.startsWith('birth control')) return false;
      return qTokens.length === 0 || qTokens.some((t) => lower.includes(t));
    });
    if (candidates.length === 0) continue;

    const scoredCandidates = candidates
      .map((s) => {
        const lower = s.toLowerCase();
        const tokenHits = qTokens.reduce((acc, t) => (lower.includes(t) ? acc + 1 : acc), 0);
        const startsClean = /^[A-Z0-9]/.test(s) ? 1 : 0;
        const hasBirthControl = lower.includes('birth control') ? 1 : 0;
        const score = tokenHits * 2 + startsClean + hasBirthControl;
        return { s, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = scoredCandidates[0]?.s;
    if (!best) continue;

    const cleaned = best
      .replace(/\s+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^[^A-Za-z0-9]*th control\b/i, 'Birth control')
      .replace(/^[^A-Za-z0-9]*irth control\b/i, 'Birth control')
      .replace(/^[^A-Za-z0-9]*rth control\b/i, 'Birth control')
      .trim();
    if (cleaned.length < 30) continue;
    if (picked.some((p) => p.toLowerCase() === cleaned.toLowerCase())) continue;
    picked.push(cleaned);
    if (picked.length >= 2) break;
  }

  if (picked.length === 0) return null;

  if (
    (lowerQuery.includes('what is birth control') || lowerQuery.includes('what birth control')) &&
    picked.length > 0
  ) {
    return (
      `${picked[0]}\n\n` +
      'Most methods do not protect against STIs. Condoms are still needed for STI prevention.'
    );
  }

  return (
    `${picked.join('\n\n')}\n\n` +
    'I can give more detail if you want.'
  );
}

function shouldUseLlmGeneralAnswer(
  query: string,
  _fallbackContent: string,
  triageLock: boolean,
  triageStage: TriageStage,
  awaitingTriageShareConsent: boolean,
  awaitingSummaryConsent: boolean,
  summaryChatStage: SummaryChatStage
): boolean {
  const lower = query.toLowerCase();
  const clinicCommand =
    lower.includes('open clinics') ||
    lower.includes('nearest clinic') ||
    lower.includes('find a clinic') ||
    lower.includes('find clinic') ||
    lower.includes('clinic near me');
  const gcoCommand =
    lower.includes('getcheckedonline') ||
    lower.includes('get checked online') ||
    lower.includes('get checkedonline');
  const deterministicCondomOrMissedPill =
    (lower.includes('need') && lower.includes('condom')) ||
    ((lower.includes('miss') || lower.includes('forgot')) && lower.includes('pill'));
  const asksContraceptionTypes =
    (lower.includes('birth control') || lower.includes('contraception') || lower.includes('contraceptive')) &&
    (lower.includes('type') || lower.includes('types') || lower.includes('method') || lower.includes('methods') || lower.includes('kind') || lower.includes('kinds') || lower.includes('option') || lower.includes('options'));
  const asksContraceptivesOverview = lower.trim() === 'contraceptives' || lower.trim() === 'birth control';
  const asksWhatIsPill =
    lower.includes('what is the pill') ||
    lower.includes('what is pill') ||
    lower.includes('tell me about the pill') ||
    lower.trim() === 'the pill';
  const asksPillEffectiveness =
    (lower.includes('pill') || lower.includes('birth control pill') || lower.includes('oral contraceptive')) &&
    (lower.includes('effective') || lower.includes('effectiveness') || lower.includes('how effective'));
  const asksStiTypes =
    (lower.includes('types of sti') ||
      lower.includes('type of sti') ||
      lower.includes('different types of sti') ||
      lower.includes('different types of stis') ||
      lower.includes('different stis') ||
      lower.includes('stis types')) &&
    (lower.includes('sti') || lower.includes('std'));
  const asksHowOftenTest = lower.includes('how often') && (lower.includes('test') || lower.includes('testing'));
  const asksWhatIsGonorrhea =
    lower.includes('what is gonorrhea') ||
    lower.includes('what is the clap') ||
    lower.includes('gonorrhea (the clap)') ||
    ((lower.includes('gonorrhea') || lower.includes('the clap')) &&
      (lower.includes('what is') || lower.includes('explain') || lower.includes('tell me')));
  const asksIudHurt =
    (lower.includes('iud') || lower.includes('intrauterine')) &&
    (lower.includes('hurt') || lower.includes('painful') || lower.includes('pain'));
  const asksMostCommonSti =
    (lower.includes('most common sti') || lower.includes('most common std')) ||
    ((lower.includes('common') || lower.includes('most common')) &&
      (lower.includes('sti') || lower.includes('std')));
  const asksYouthBirthControlAccess =
    (lower.includes('youth') || lower.includes('teen') || lower.includes('minor') || lower.includes('under 19') || lower.includes('under 18')) &&
    (lower.includes('birth control') || lower.includes('contraception')) &&
    (lower.includes('how can i get') ||
      lower.includes('how do i get') ||
      lower.includes('where can i get') ||
      lower.includes('is it free') ||
      lower.includes('cost') ||
      lower.includes('pay') ||
      lower.includes('privacy') ||
      lower.includes('confidential'));
  const asksGeneralBirthControlEffectiveness =
    (lower.includes('birth control') || lower.includes('contraception')) &&
    (lower.includes('effective') || lower.includes('effectiveness') || lower.includes('how effective'));
  const asksMigraineOnPill =
    (lower.includes('migraine') || lower.includes('headache')) &&
    (lower.includes('pill') || lower.includes('birth control') || lower.includes('contraception'));
  const priorityStiConcern = isPriorityStiConcernQuery(query);
  if (triageLock) return false;
  if (triageStage !== 'idle') return false;
  if (deterministicCondomOrMissedPill) return false;
  if (
    asksContraceptionTypes ||
    asksContraceptivesOverview ||
    asksWhatIsPill ||
    asksPillEffectiveness ||
    asksGeneralBirthControlEffectiveness ||
    asksMigraineOnPill ||
    asksStiTypes ||
    asksHowOftenTest ||
    asksWhatIsGonorrhea ||
    asksIudHurt ||
    asksMostCommonSti ||
    asksYouthBirthControlAccess
  ) return false;
  if (priorityStiConcern) return false;
  if (clinicCommand || gcoCommand) return false;
  if (awaitingTriageShareConsent) return false;
  if (awaitingSummaryConsent) return false;
  if (summaryChatStage !== 'idle') return false;

  // LLM-first mode for chat responses, including triage conversational phrasing.
  return true;
}

function isFastDeterministicQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const clinicCommand =
    lower.includes('open clinics') ||
    lower.includes('nearest clinic') ||
    lower.includes('find a clinic') ||
    lower.includes('find clinic') ||
    lower.includes('clinic near me');
  const gcoCommand =
    lower.includes('getcheckedonline') ||
    lower.includes('get checked online') ||
    lower.includes('get checkedonline');
  const asksContraceptionTypes =
    (lower.includes('birth control') || lower.includes('contraception') || lower.includes('contraceptive')) &&
    (lower.includes('type') || lower.includes('types') || lower.includes('method') || lower.includes('methods') || lower.includes('kind') || lower.includes('kinds') || lower.includes('option') || lower.includes('options'));
  const asksContraceptivesOverview = lower.trim() === 'contraceptives' || lower.trim() === 'birth control';
  const asksWhatIsPill =
    lower.includes('what is the pill') ||
    lower.includes('what is pill') ||
    lower.includes('tell me about the pill') ||
    lower.trim() === 'the pill';
  const asksPillEffectiveness =
    (lower.includes('pill') || lower.includes('birth control pill') || lower.includes('oral contraceptive')) &&
    (lower.includes('effective') || lower.includes('effectiveness') || lower.includes('how effective'));
  const asksStiTypes =
    (lower.includes('types of sti') ||
      lower.includes('type of sti') ||
      lower.includes('different types of sti') ||
      lower.includes('different types of stis') ||
      lower.includes('different stis') ||
      lower.includes('stis types')) &&
    (lower.includes('sti') || lower.includes('std'));
  const asksHowOftenTest = lower.includes('how often') && (lower.includes('test') || lower.includes('testing'));
  const asksWhatIsGonorrhea =
    lower.includes('what is gonorrhea') ||
    lower.includes('what is the clap') ||
    lower.includes('gonorrhea (the clap)') ||
    ((lower.includes('gonorrhea') || lower.includes('the clap')) &&
      (lower.includes('what is') || lower.includes('explain') || lower.includes('tell me')));
  const asksIudHurt =
    (lower.includes('iud') || lower.includes('intrauterine')) &&
    (lower.includes('hurt') || lower.includes('painful') || lower.includes('pain'));
  const asksMostCommonSti =
    (lower.includes('most common sti') || lower.includes('most common std')) ||
    ((lower.includes('common') || lower.includes('most common')) &&
      (lower.includes('sti') || lower.includes('std')));
  const asksYouthBirthControlAccess =
    (lower.includes('youth') || lower.includes('teen') || lower.includes('minor') || lower.includes('under 19') || lower.includes('under 18')) &&
    (lower.includes('birth control') || lower.includes('contraception')) &&
    (lower.includes('how can i get') ||
      lower.includes('how do i get') ||
      lower.includes('where can i get') ||
      lower.includes('is it free') ||
      lower.includes('cost') ||
      lower.includes('pay') ||
      lower.includes('privacy') ||
      lower.includes('confidential'));
  const asksGeneralBirthControlEffectiveness =
    (lower.includes('birth control') || lower.includes('contraception')) &&
    (lower.includes('effective') || lower.includes('effectiveness') || lower.includes('how effective'));
  const asksMigraineOnPill =
    (lower.includes('migraine') || lower.includes('headache')) &&
    (lower.includes('pill') || lower.includes('birth control') || lower.includes('contraception'));
  return (
    clinicCommand ||
    gcoCommand ||
    asksContraceptivesOverview ||
    asksWhatIsPill ||
    (lower.includes('need') && lower.includes('condom')) ||
    ((lower.includes('miss') || lower.includes('forgot')) && lower.includes('pill')) ||
    asksContraceptionTypes ||
    asksPillEffectiveness ||
    asksGeneralBirthControlEffectiveness ||
    asksMigraineOnPill ||
    asksStiTypes ||
    asksHowOftenTest ||
    asksWhatIsGonorrhea ||
    asksIudHurt ||
    asksMostCommonSti ||
    asksYouthBirthControlAccess
  );
}

function isBirthControlBasicsQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return (
    ((lower.includes('what') || lower.includes('explain')) && lower.includes('birth control')) ||
    lower.includes('what is contraception') ||
    ((lower.includes('do i need') || lower.includes('should i use')) && lower.includes('birth control'))
  );
}

function getPreferredSourcesForQuery(query: string, fallbackSources: { label: string; url: string }[]): { label: string; url: string }[] {
  const lower = query.toLowerCase();
  const contraceptionLike =
    lower.includes('contraception') ||
    lower.includes('contraceptive') ||
    lower.includes('birth control') ||
    lower.includes('pregnan') ||
    lower.includes('pregnant') ||
    lower.includes('plan b') ||
    lower.includes('iud') ||
    lower.includes('ring') ||
    lower.includes('nuvaring');
  if (contraceptionLike) {
    if (lower.includes('effective') || lower.includes('effectiveness') || lower.includes('typical') || lower.includes('perfect')) {
      return [
        { label: 'HealthLinkBC - The Pill (Combined)', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-pill' },
        { label: 'HealthLinkBC - The Mini-Pill (Progestin)', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-mini-pill' },
      ];
    }
    if (lower.includes('medication') || lower.includes('medications') || lower.includes('medicine') || lower.includes('drug')) {
      return [
        { label: 'HealthLinkBC File #91a - Hormonal Contraception', url: 'https://www.healthlinkbc.ca/healthlinkbc-files/hormonal-contraception' },
        { label: 'HealthLinkBC - Hormonal Methods Overview', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' },
      ];
    }
    if (lower.includes('emergency') || lower.includes('plan b') || lower.includes('condom broke') || lower.includes('missed pill')) {
      return [
        { label: 'HealthLinkBC - Emergency Contraception', url: 'https://www.healthlinkbc.ca/health-topics/emergency-contraception' },
        { label: 'HealthLinkBC - IUD (Intrauterine Device)', url: 'https://www.healthlinkbc.ca/health-topics/intrauterine-device-iud-birth-control' },
      ];
    }
    return [
      { label: 'HealthLinkBC - Hormonal Methods Overview', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' },
      { label: 'HealthLinkBC - Barrier Methods', url: 'https://www.healthlinkbc.ca/health-topics/barrier-methods-birth-control' },
    ];
  }

  if (
    lower.includes('sti') ||
    lower.includes('std') ||
    lower.includes('hiv') ||
    lower.includes('gonorrhea') ||
    lower.includes('chlamydia') ||
    lower.includes('syphilis') ||
    lower.includes('herpes') ||
    lower.includes('hpv') ||
    lower.includes('testing')
  ) {
    return [
      { label: 'SmartSexResource - STIs and Conditions', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' },
      { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' },
    ];
  }

  return fallbackSources;
}

function shouldAttemptLlmExtraction(query: string, stage: TriageStage): boolean {
  if (stage !== 'idle') return true;
  const lower = query.toLowerCase();
  return (
    lower.length >= 8 &&
    (
      lower.includes('sti') ||
      lower.includes('std') ||
      lower.includes('symptom') ||
      lower.includes('sex') ||
      lower.includes('partner') ||
      lower.includes('condom') ||
      lower.includes('unprotected') ||
      lower.includes('discharge') ||
      lower.includes('burning') ||
      lower.includes('pain when peeing') ||
      lower.includes('rash') ||
      lower.includes('itch') ||
      lower.includes('test')
    )
  );
}

function isLikelyHealthQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const healthTerms = [
    'sti', 'std', 'sex', 'sexual', 'test', 'testing', 'clinic', 'symptom', 'pregnan', 'pregnant',
    'birth control', 'contraception', 'contraceptive', 'contraceptives', 'iud', 'pill', 'ring', 'nuvaring', 'condom', 'plan b',
    'hiv', 'gonorrhea', 'chlamydia', 'syphilis', 'herpes', 'hpv', 'hepatitis', 'prep', 'pep',
    'discharge', 'burning', 'pain when peeing', 'rash', 'itch',
  ];
  return healthTerms.some((t) => lower.includes(t));
}

function extractUserName(query: string): string | null {
  const fromMyNameIs = query.match(/\bmy name is\s+([a-zA-Z][a-zA-Z0-9'\- ]{0,30})/i);
  if (fromMyNameIs?.[1]) {
    return fromMyNameIs[1].trim().split(/\s+/)[0];
  }

  const fromIm = query.match(/\b(?:i am|i'm)\s+([a-zA-Z][a-zA-Z0-9'\-]{1,30})\b/i);
  if (fromIm?.[1]) {
    const candidate = fromIm[1].trim();
    const banned = new Set(['worried', 'concerned', 'scared', 'unsure', 'not', 'fine']);
    if (!banned.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return null;
}

function extractUserAge(query: string): number | null {
  const q = query.toLowerCase();
  const m1 = q.match(/\b(?:i am|i'm|im)\s+(\d{1,3})\b/);
  if (m1?.[1]) {
    const age = Number(m1[1]);
    if (age >= 10 && age <= 110) return age;
  }
  const m2 = q.match(/\b(?:my age is|age is)\s+(\d{1,3})\b/);
  if (m2?.[1]) {
    const age = Number(m2[1]);
    if (age >= 10 && age <= 110) return age;
  }
  return null;
}

function buildRecentHistoryText(messages: ChatMessage[], currentInput: string, maxTurns = 6): string {
  const recent = messages.slice(-maxTurns * 2);
  const lines = recent.map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`);
  lines.push(`User: ${currentInput}`);
  return lines.join('\n');
}

function normalizeDuration(value: string): string | undefined {
  const text = value.toLowerCase().trim();
  if (
    text === 'less than 1 week' ||
    text === '<1 week' ||
    text.includes('few day') ||
    text.includes('2 day') ||
    text.includes('3 day')
  ) {
    return 'Less than 1 week';
  }
  if (text === '1-2 weeks' || text.includes('one week') || text.includes('two week')) {
    return '1-2 weeks';
  }
  if (text === '2-4 weeks' || text.includes('three week') || text.includes('four week')) {
    return '2-4 weeks';
  }
  if (text === 'more than 4 weeks' || text.includes('month') || text.includes('over 4 week')) {
    return 'More than 4 weeks';
  }
  return undefined;
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Continue to object slicing fallback.
  }

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) {
    const slice = trimmed.slice(first, last + 1);
    try {
      const parsed = JSON.parse(slice);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function validateAndMapLlmExtraction(obj: Record<string, unknown>): Partial<StoredTriageDraft> {
  const mapped: Partial<StoredTriageDraft> = {};

  if (obj.hasSymptoms === 'yes' || obj.hasSymptoms === 'no' || obj.hasSymptoms === 'unsure') {
    mapped.hasSymptoms = obj.hasSymptoms;
  }

  if (Array.isArray(obj.selectedSymptoms)) {
    const symptoms = obj.selectedSymptoms
      .filter((s): s is string => typeof s === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    if (symptoms.length > 0) {
      mapped.selectedSymptoms = symptoms;
    }
  }

  if (typeof obj.duration === 'string') {
    const normalized = normalizeDuration(obj.duration);
    if (normalized) {
      mapped.duration = normalized;
    }
  }

  if (
    obj.condomUse === 'used throughout' ||
    obj.condomUse === 'used sometimes' ||
    obj.condomUse === 'no condom' ||
    obj.condomUse === 'condom broke'
  ) {
    mapped.condomUse = obj.condomUse;
  }

  if (obj.partnerKnownSti === 'yes' || obj.partnerKnownSti === 'no' || obj.partnerKnownSti === 'unsure') {
    mapped.partnerKnownSti = obj.partnerKnownSti;
  }

  if (Array.isArray(obj.sexTypes)) {
    const allowed = new Set(['oral', 'vaginal', 'anal', 'other']);
    const types = obj.sexTypes
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.toLowerCase().trim())
      .filter((t) => allowed.has(t));
    if (types.length > 0) {
      mapped.sexTypes = Array.from(new Set(types));
    }
  }

  if (typeof obj.whatHappened === 'string' && obj.whatHappened.trim()) {
    mapped.whatHappened = obj.whatHappened.trim().slice(0, 220);
  }

  return mapped;
}

async function extractTriageFieldsWithLLM(query: string): Promise<Partial<StoredTriageDraft> | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch('/ollama/api/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3',
        stream: false,
        options: {
          num_predict: 220,
          temperature: 0,
        },
        messages: [
          {
            role: 'system',
            content:
              'You are an information extraction engine for STI triage. ' +
              'Return ONLY valid JSON with no markdown, comments, or extra text. ' +
              'Extract fields from user text when explicitly stated or clearly implied. ' +
              'Do not diagnose. If unknown, omit the field. ' +
              'JSON schema keys: hasSymptoms, selectedSymptoms, duration, condomUse, partnerKnownSti, sexTypes, whatHappened, confidence. ' +
              'Allowed values: hasSymptoms: yes|no|unsure; condomUse: used throughout|used sometimes|no condom|condom broke; ' +
              'partnerKnownSti: yes|no|unsure; sexTypes: oral|vaginal|anal|other. ' +
              'Duration must be one of: Less than 1 week, 1-2 weeks, 2-4 weeks, More than 4 weeks.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      return null;
    }

    const parsed = parseJsonObject(content);
    if (!parsed) {
      return null;
    }

    if (typeof parsed.confidence === 'number' && parsed.confidence < 0.5) {
      return null;
    }

    const mapped = validateAndMapLlmExtraction(parsed);
    return Object.keys(mapped).length > 0 ? mapped : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const STI_QUERY_ALIASES: Record<string, string> = {
  chlamydia: 'chlamydia',
  clamydia: 'chlamydia',
  chlamidia: 'chlamydia',
  gonorrhea: 'gonorrhea',
  gonorea: 'gonorrhea',
  gonorhea: 'gonorrhea',
  syphilis: 'syphilis',
  syfilis: 'syphilis',
  sifilis: 'syphilis',
  hiv: 'hiv',
  herpes: 'herpes',
  herpies: 'herpes',
  hpv: 'hpv',
  'hepatitis b': 'hepatitis b',
  'hep b': 'hep b',
  'hepatitis c': 'hepatitis c',
  'hep c': 'hep c',
  trichomoniasis: 'trichomoniasis',
  trich: 'trich',
  mycoplasma: 'mycoplasma',
  mgen: 'mycoplasma',
};

function detectStiTermInQuery(query: string): string | null {
  const normalized = query.toLowerCase().replace(/[^\w\s-]/g, ' ');
  for (const [alias, canonical] of Object.entries(STI_QUERY_ALIASES)) {
    if (normalized.includes(alias)) return canonical;
  }
  return null;
}

function parseSymptomList(input: string): string[] {
  const normalized = input
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const found: string[] = [];
  if (
    normalized.includes('burning when peeing') ||
    normalized.includes('burning when i pee') ||
    normalized.includes('burning pee') ||
    normalized.includes('burning')
  ) found.push('burning when peeing');
  if (
    normalized.includes('pain when peeing') ||
    normalized.includes('pain peeing') ||
    normalized.includes('painful urination') ||
    normalized.includes('hurts when i pee')
  ) found.push('pain when peeing');
  if (normalized.includes('discharge')) found.push('discharge');
  if (normalized.includes('sore') || normalized.includes('ulcer')) found.push('sores');
  if (normalized.includes('bump') || normalized.includes('blister') || normalized.includes('wart')) found.push('bumps');
  if (normalized.includes('rash')) found.push('rash');
  if (normalized.includes('itch') || normalized.includes('irritation')) found.push('itching');
  if (normalized.includes('pelvic pain')) found.push('pelvic pain');
  if (normalized.includes('abdominal pain') || normalized.includes('lower abdominal pain')) found.push('abdominal pain');
  if (normalized.includes('testicle pain') || normalized.includes('testicular pain')) found.push('testicle pain');
  if (normalized.includes('bleeding after sex')) found.push('bleeding after sex');
  if (found.length > 0) return Array.from(new Set(found));

  return input
    .split(/,| and /i)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function parseSymptomDuration(input: string): string | null {
  const text = input.toLowerCase();
  if (text.trim() === '1') return 'Less than 1 week';
  if (text.trim() === '2') return '1-2 weeks';
  if (text.trim() === '3') return '2-4 weeks';
  if (text.trim() === '4') return 'More than 4 weeks';
  if (text.includes('less than 1 week') || text.includes('few days') || text.includes('3 days') || text.includes('2 days')) {
    return 'Less than 1 week';
  }
  if (text.includes('1-2 weeks') || text.includes('one week') || text.includes('two weeks')) {
    return '1-2 weeks';
  }
  if (text.includes('2-4 weeks') || text.includes('three weeks') || text.includes('four weeks')) {
    return '2-4 weeks';
  }
  if (text.includes('more than 4 weeks') || text.includes('over a month') || text.includes('month')) {
    return 'More than 4 weeks';
  }
  return null;
}

function inferTriagePrefillFromQuery(input: string): Partial<StoredTriageDraft> {
  const lower = input.toLowerCase();
  const updates: Partial<StoredTriageDraft> = {};
  const parsedDate = parseFlexibleDateInput(input) || parseRelativeAgoDateInput(input);
  if (parsedDate) {
    updates.contactDate = parsedDate;
  }

  // Condom context
  if (
    lower.includes('condom broke') ||
    lower.includes('condom break') ||
    lower.includes('condom slipped') ||
    lower.includes('slipped off')
  ) {
    updates.condomUse = 'condom broke';
  } else if (
    lower.includes('no condom') ||
    lower.includes('without condom') ||
    lower.includes('unprotected') ||
    lower.includes("didn't use condom") ||
    lower.includes('did not use condom')
  ) {
    updates.condomUse = 'no condom';
  } else if (
    lower.includes('used condom throughout') ||
    lower.includes('always used condom') ||
    lower.includes('used a condom the whole time')
  ) {
    updates.condomUse = 'used throughout';
  } else if (
    lower.includes('used condom sometimes') ||
    lower.includes('sometimes used condom') ||
    lower.includes('not every time')
  ) {
    updates.condomUse = 'used sometimes';
  }

  // Partner known STI status
  if (
    (lower.includes('partner') ||
      lower.includes('boyfriend') ||
      lower.includes('girlfriend') ||
      lower.includes('husband') ||
      lower.includes('wife')) &&
    (lower.includes('positive') ||
      lower.includes('diagnosed') ||
      lower.includes('has sti') ||
      lower.includes('has std') ||
      lower.includes('has chlamydia') ||
      lower.includes('has gonorrhea') ||
      lower.includes('has syphilis') ||
      lower.includes('has hiv') ||
      lower.includes('has herpes'))
  ) {
    updates.partnerKnownSti = 'yes';
  } else if (
    (lower.includes('partner') ||
      lower.includes('boyfriend') ||
      lower.includes('girlfriend') ||
      lower.includes('husband') ||
      lower.includes('wife')) &&
    (lower.includes('negative') ||
      lower.includes('no sti') ||
      lower.includes('no std') ||
      lower.includes('clean'))
  ) {
    updates.partnerKnownSti = 'no';
  }

  // Sex type context
  const sexTypes: string[] = [];
  if (lower.includes('oral')) sexTypes.push('oral');
  if (lower.includes('vaginal')) sexTypes.push('vaginal');
  if (lower.includes('anal')) sexTypes.push('anal');
  if (sexTypes.length > 0) {
    updates.sexTypes = sexTypes;
  }

  // Optional short free-text reason for visit
  if (
    lower.includes('new partner') ||
    lower.includes('condom') ||
    lower.includes('unprotected') ||
    lower.includes('possible exposure') ||
    lower.includes('worried') ||
    lower.includes('symptom')
  ) {
    updates.whatHappened = input.trim().slice(0, 220);
  }

  return updates;
}

function normalizeYesNoUnsure(text: string): 'yes' | 'no' | 'unsure' | null {
  const lower = text
    .toLowerCase()
    .replace(/[.!?,;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    /^(yes|yeah|yep|yup)\b/.test(lower) ||
    /^i (do|have)\b/.test(lower)
  ) {
    return 'yes';
  }

  if (
    /^(no|nope|nah)\b/.test(lower) ||
    /^i (do not|don't)\b/.test(lower) ||
    /^don't think so\b/.test(lower) ||
    /^not really\b/.test(lower)
  ) {
    return 'no';
  }

  if (
    lower === 'unsure' ||
    lower === 'not sure' ||
    lower === 'maybe' ||
    lower === 'idk' ||
    lower.includes("don't know") ||
    lower.includes('not certain')
  ) {
    return 'unsure';
  }

  return null;
}

function parseSexTypesInput(text: string): string[] {
  const lower = text.toLowerCase();
  const types: string[] = [];
  if (lower.includes('oral')) types.push('oral');
  if (lower.includes('vaginal')) types.push('vaginal');
  if (lower.includes('anal')) types.push('anal');
  if (lower.includes('other')) types.push('other');
  return Array.from(new Set(types));
}

function parseCondomUseInput(text: string): PatientSummaryFormData['condom_use'] | null {
  const lower = text.toLowerCase().trim();
  if (lower === '1' || lower.includes('used throughout') || lower.includes('always')) return 'used throughout';
  if (lower === '2' || lower.includes('used sometimes') || lower.includes('sometimes')) return 'used sometimes';
  if (lower === '3' || lower.includes('no condom') || lower.includes('without condom') || lower.includes('unprotected')) return 'no condom';
  if (lower === '4' || lower.includes('condom broke') || lower.includes('broke') || lower.includes('slipped')) return 'condom broke';
  return null;
}

function parseLanguageInput(text: string): string | null {
  const lower = text.toLowerCase().trim();
  const match = SUPPORTED_SUMMARY_LANGUAGES.find((lang) => lower === lang.toLowerCase() || lower.includes(lang.toLowerCase()));
  return match || null;
}

function parseFlexibleDateInput(input: string): string | null {
  const raw = input.trim();
  const lower = raw.toLowerCase();
  if (!raw) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  if (lower === 'today') {
    return formatDateTimeLocalInput(new Date(now));
  }
  if (lower === 'yesterday') {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return formatDateTimeLocalInput(d);
  }
  if (lower === 'tomorrow') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return formatDateTimeLocalInput(d);
  }

  // Accept common separators and optional time.
  const normalized = raw.replace(/\./g, '/').replace(/-/g, '/');
  const monthDayMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/i);
  if (monthDayMatch) {
    let hour = monthDayMatch[3] ? Number(monthDayMatch[3]) : 12;
    const minute = monthDayMatch[4] ? Number(monthDayMatch[4]) : 0;
    const meridiem = monthDayMatch[5]?.toLowerCase();

    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    const date = new Date(currentYear, Number(monthDayMatch[1]) - 1, Number(monthDayMatch[2]), hour, minute, 0, 0);
    if (!Number.isNaN(date.getTime())) {
      return formatDateTimeLocalInput(date);
    }
  }

  const match = normalized.match(/^(\d{1,4})\/(\d{1,2})\/(\d{1,4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/i);
  if (match) {
    let a = Number(match[1]);
    let b = Number(match[2]);
    let c = Number(match[3]);
    let hour = match[4] ? Number(match[4]) : 12;
    const minute = match[5] ? Number(match[5]) : 0;
    const meridiem = match[6]?.toLowerCase();

    // Decide which token is year.
    let year: number;
    let month: number;
    let day: number;
    if (a > 1900) {
      year = a;
      month = b;
      day = c;
    } else if (c > 1900) {
      year = c;
      // Assume month/day for North America when ambiguous.
      month = a;
      day = b;
    } else {
      // Fallback: assume mm/dd/yy.
      year = c + 2000;
      month = a;
      day = b;
    }

    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    const date = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (!Number.isNaN(date.getTime())) {
      return formatDateTimeLocalInput(date);
    }
  }

  const monthNameMatch = raw.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,\s*|\s+)?(\d{4})?(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/i);
  if (monthNameMatch) {
    const inferredYear = monthNameMatch[3] ? Number(monthNameMatch[3]) : currentYear;
    let hour = monthNameMatch[4] ? Number(monthNameMatch[4]) : 12;
    const minute = monthNameMatch[5] ? Number(monthNameMatch[5]) : 0;
    const meridiem = monthNameMatch[6]?.toLowerCase();

    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    const date = new Date(`${monthNameMatch[1]} ${monthNameMatch[2]} ${inferredYear} ${hour}:${String(minute).padStart(2, '0')}`);
    if (!Number.isNaN(date.getTime())) {
      return formatDateTimeLocalInput(date);
    }
  }

  const parsedMs = Date.parse(raw);
  if (!Number.isNaN(parsedMs)) {
    return formatDateTimeLocalInput(new Date(parsedMs));
  }
  return null;
}

function parseRelativeAgoDateInput(input: string): string | null {
  const lower = input.toLowerCase();
  const match = lower.match(/\b(\d{1,2})\s*(day|days|week|weeks|month|months)\s*ago\b/);
  if (!match) return null;
  const value = Number(match[1]);
  if (Number.isNaN(value) || value <= 0) return null;
  const unit = match[2];
  const d = new Date();
  if (unit.startsWith('day')) d.setDate(d.getDate() - value);
  if (unit.startsWith('week')) d.setDate(d.getDate() - (value * 7));
  if (unit.startsWith('month')) d.setMonth(d.getMonth() - value);
  return formatDateTimeLocalInput(d);
}

export function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [triageStage, setTriageStage] = useState<TriageStage>('idle');
  const [triageLock, setTriageLock] = useState(false);
  const [symptomStatus, setSymptomStatus] = useState<'yes' | 'no' | 'unsure' | null>(null);
  const [chatSymptomDraft, setChatSymptomDraft] = useState<ChatSymptomTriageDraft>({
    symptoms: [],
    duration: '',
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Health check for multilingual resources
  const { validatedResources, isChecking } = useResourceHealthCheck(true);
  
  // Patient summary state
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summaryData, setSummaryData] = useState<PatientSummaryData | null>(null);
  const [summaryFormData, setSummaryFormData] = useState<PatientSummaryFormData | null>(null);
  const [showSummaryView, setShowSummaryView] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [awaitingTriageShareConsent, setAwaitingTriageShareConsent] = useState(false);
  const [triageConsentContext, setTriageConsentContext] = useState<'symptomatic' | 'asymptomatic' | null>(null);
  const [awaitingSummaryConsent, setAwaitingSummaryConsent] = useState(false);
  const [summaryChatStage, setSummaryChatStage] = useState<SummaryChatStage>('idle');
  const [summaryChatDraft, setSummaryChatDraft] = useState<PatientSummaryFormData>(EMPTY_SUMMARY_FORM_DATA);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);

  const persistTriageDraft = (updates: Partial<StoredTriageDraft>) => {
    try {
      const raw = sessionStorage.getItem(TRIAGE_DRAFT_STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as Partial<StoredTriageDraft>) : {};
      const merged: StoredTriageDraft = {
        hasSymptoms:
          existing.hasSymptoms === 'yes' || existing.hasSymptoms === 'no' || existing.hasSymptoms === 'unsure'
            ? existing.hasSymptoms
            : null,
        selectedSymptoms: Array.isArray(existing.selectedSymptoms) ? existing.selectedSymptoms : [],
        duration: typeof existing.duration === 'string' ? existing.duration : '',
        condomUse:
          existing.condomUse === 'used throughout' ||
          existing.condomUse === 'used sometimes' ||
          existing.condomUse === 'no condom' ||
          existing.condomUse === 'condom broke'
            ? existing.condomUse
            : undefined,
        partnerKnownSti:
          existing.partnerKnownSti === 'yes' || existing.partnerKnownSti === 'no' || existing.partnerKnownSti === 'unsure'
            ? existing.partnerKnownSti
            : undefined,
        sexTypes: Array.isArray(existing.sexTypes) ? existing.sexTypes : [],
        contactDate: typeof existing.contactDate === 'string' ? existing.contactDate : '',
        whatHappened: typeof existing.whatHappened === 'string' ? existing.whatHappened : '',
        updatedAtISO: new Date().toISOString(),
        ...updates,
      };
      sessionStorage.setItem(TRIAGE_DRAFT_STORAGE_KEY, JSON.stringify(merged));

      const shouldRefreshSummaryDraft =
        updates.whatHappened !== undefined ||
        updates.sexTypes !== undefined ||
        updates.condomUse !== undefined ||
        updates.partnerKnownSti !== undefined ||
        updates.hasSymptoms !== undefined ||
        updates.selectedSymptoms !== undefined ||
        updates.duration !== undefined;

      if (shouldRefreshSummaryDraft) {
        const nextPrefill = buildSummaryPrefill();
        setSummaryFormData(nextPrefill);
        sessionStorage.setItem(SUMMARY_FORM_STORAGE_KEY, JSON.stringify(nextPrefill));
        setSummaryData(null);
        sessionStorage.removeItem(SUMMARY_STORAGE_KEY);
      }
    } catch {
      // Ignore storage failures and continue chat flow.
    }
  };

  const buildSummaryPrefill = (): PatientSummaryFormData => {
    const base: PatientSummaryFormData = {
      ...EMPTY_SUMMARY_FORM_DATA,
      ...(summaryFormData || {}),
    };
    base.contact_date = normalizeDateTimeLocalValue(base.contact_date);

    try {
      const raw = sessionStorage.getItem(TRIAGE_DRAFT_STORAGE_KEY);
      if (!raw) return base;
      const triage = JSON.parse(raw) as Partial<StoredTriageDraft>;
      return {
        ...base,
        what_happened: base.what_happened || (triage.whatHappened || ''),
        contact_date: base.contact_date,
        sex_types: base.sex_types.length > 0 ? base.sex_types : (Array.isArray(triage.sexTypes) ? triage.sexTypes : []),
        condom_use:
          base.condom_use !== EMPTY_SUMMARY_FORM_DATA.condom_use
            ? base.condom_use
            : (triage.condomUse || base.condom_use),
        has_symptoms: base.has_symptoms || triage.hasSymptoms === 'yes',
        symptoms_list:
          base.symptoms_list || (Array.isArray(triage.selectedSymptoms) ? triage.selectedSymptoms.join(', ') : ''),
        symptom_duration: base.symptom_duration || (triage.duration || ''),
        partner_known_sti:
          base.partner_known_sti !== EMPTY_SUMMARY_FORM_DATA.partner_known_sti
            ? base.partner_known_sti
            : (triage.partnerKnownSti || base.partner_known_sti),
      };
    } catch {
      return base;
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    try {
      const storedChat = sessionStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      const storedSummary = sessionStorage.getItem(SUMMARY_STORAGE_KEY);
      const storedForm = sessionStorage.getItem(SUMMARY_FORM_STORAGE_KEY);
      const storedUserName = sessionStorage.getItem(USER_NAME_STORAGE_KEY);
      const storedUserAge = sessionStorage.getItem(USER_AGE_STORAGE_KEY);
      if (storedChat) {
        const parsed = JSON.parse(storedChat) as Array<{
          id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          sources?: Array<{ label: string; url: string }>;
          timestamp?: string | Date;
        }>;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hydrated = parsed
            .filter((m) => typeof m.id === 'string' && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .map((m) => ({
              id: m.id as string,
              role: m.role as 'user' | 'assistant',
              content: m.content as string,
              sources: Array.isArray(m.sources) ? m.sources : [],
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            }));
          if (hydrated.length > 0) {
            setMessages(hydrated);
          }
        }
      }
      if (storedSummary) {
        setSummaryData(JSON.parse(storedSummary));
      }
      if (storedForm) {
        setSummaryFormData(JSON.parse(storedForm));
      }
      if (storedUserName) {
        setUserName(storedUserName);
      }
      if (storedUserAge) {
        const parsed = Number(storedUserAge);
        if (!Number.isNaN(parsed)) setUserAge(parsed);
      }
    } catch {
      // Ignore malformed storage values and continue with empty state.
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage write failures.
    }
  }, [messages]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      return;
    }

    let cancelled = false;

    const runPrewarm = async (force = false) => {
      try {
        if (!cancelled) {
          await prewarmRagContext(force);
        }
      } catch {
        // Keep UI responsive even if background prewarm fails.
      }
    };

    // Start warming soon after mount to avoid blocking first paint.
    const warmTimeout = window.setTimeout(() => {
      void runPrewarm(false);
    }, 1200);

    const refreshInterval = window.setInterval(() => {
      void runPrewarm(true);
    }, RAG_BACKGROUND_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(warmTimeout);
      window.clearInterval(refreshInterval);
    };
  }, []);

  const handleSend = async () => {
    if (isGenerating) return;
    if (!input.trim()) return;

    const currentInput = input.trim();
    const hasShownBirthControlDisclaimer = messages.some(
      (m) => m.role === 'assistant' && typeof m.content === 'string' && m.content.includes(MANDATORY_BIRTH_CONTROL_DISCLAIMER)
    );
    const latestAssistantContent = [...messages]
      .reverse()
      .find((m) => m.role === 'assistant')?.content || '';
    const asymptomaticQuickChoicePrompt =
      latestAssistantContent.includes('Type **"GetCheckedOnline"**') &&
      latestAssistantContent.includes('Type **"open clinics"**');
    const legacyNoSymptomPrompt =
      latestAssistantContent.includes('Start with GetCheckedOnline') &&
      latestAssistantContent.includes('Find a nearby clinic');
    const directClinicOrNotePrompt =
      latestAssistantContent.includes('1. **Show the closest clinics**') &&
      latestAssistantContent.includes('2. **Create a patient summary note**');
    const noSymptomThreeChoicePrompt =
      latestAssistantContent.includes('1. **Start with GetCheckedOnline**') &&
      latestAssistantContent.includes('2. **Find a nearby clinic**') &&
      latestAssistantContent.includes('3. **Create a patient summary note**');
    const normalizedNumericInput = currentInput.toLowerCase().trim();
    const wantsOptionOne =
      normalizedNumericInput === '1' || normalizedNumericInput === '1.' || normalizedNumericInput === 'option 1';
    const wantsOptionTwo =
      normalizedNumericInput === '2' || normalizedNumericInput === '2.' || normalizedNumericInput === 'option 2';
    const wantsOptionThree =
      normalizedNumericInput === '3' || normalizedNumericInput === '3.' || normalizedNumericInput === 'option 3';
    const normalizedCommandInput =
      asymptomaticQuickChoicePrompt && wantsOptionOne
            ? 'getcheckedonline'
            : asymptomaticQuickChoicePrompt && wantsOptionTwo
              ? 'open clinics'
              : directClinicOrNotePrompt && wantsOptionOne
                ? 'open clinics'
                : directClinicOrNotePrompt && wantsOptionTwo
                  ? 'open clinics'
                  : noSymptomThreeChoicePrompt && wantsOptionOne
                    ? 'getcheckedonline'
                    : noSymptomThreeChoicePrompt && wantsOptionTwo
                      ? 'open clinics'
                      : noSymptomThreeChoicePrompt && wantsOptionThree
                        ? 'open clinics'
              : legacyNoSymptomPrompt && wantsOptionOne
                ? 'getcheckedonline'
                : legacyNoSymptomPrompt && wantsOptionTwo
                  ? 'find a clinic'
                  : legacyNoSymptomPrompt && wantsOptionThree
                    ? 'find a clinic'
                    : currentInput;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (normalizedCommandInput !== currentInput || isFastDeterministicQuery(normalizedCommandInput)) {
      const direct = getResponse(normalizedCommandInput);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: postProcessAssistantContent(normalizedCommandInput, direct.content, {
          hasShownBirthControlDisclaimer,
        }),
        sources: normalizeResponseSources(direct.sources),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      return;
    }

    if (triageStage === 'idle' && isPriorityStiConcernQuery(normalizedCommandInput)) {
      const direct = getResponse(normalizedCommandInput);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: postProcessAssistantContent(normalizedCommandInput, direct.content, {
          hasShownBirthControlDisclaimer,
        }),
        sources: normalizeResponseSources(direct.sources),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      return;
    }

    setIsGenerating(true);
    try {
      const detectedName = extractUserName(currentInput);
      if (detectedName) {
        setUserName(detectedName);
        sessionStorage.setItem(USER_NAME_STORAGE_KEY, detectedName);
      }
      const detectedAge = extractUserAge(currentInput);
      if (detectedAge) {
        setUserAge(detectedAge);
        sessionStorage.setItem(USER_AGE_STORAGE_KEY, String(detectedAge));
      }

      const healthQuery = isLikelyHealthQuery(currentInput);
      const inferredPrefill = inferTriagePrefillFromQuery(currentInput);
      if (Object.keys(inferredPrefill).length > 0) {
        persistTriageDraft(inferredPrefill);
      }
      if (healthQuery && shouldAttemptLlmExtraction(currentInput, triageStage)) {
        const llmPrefill = await extractTriageFieldsWithLLM(currentInput);
        if (llmPrefill && Object.keys(llmPrefill).length > 0) {
          persistTriageDraft(llmPrefill);
        }
      }

      const inDeterministicFlow =
        awaitingTriageShareConsent || awaitingSummaryConsent || summaryChatStage !== 'idle' || triageStage !== 'idle' || triageLock;

      const initialFallback = inDeterministicFlow
        ? getResponse(currentInput)
        : { content: '', sources: [] as { label: string; url: string }[] };

      let content = initialFallback.content;
      let responseSources = initialFallback.sources;
      const useLlmGeneral = shouldUseLlmGeneralAnswer(
        currentInput,
        initialFallback.content,
        triageLock,
        triageStage,
        awaitingTriageShareConsent,
        awaitingSummaryConsent,
        summaryChatStage
      );
      if (useLlmGeneral) {
        const birthControlBasics = isBirthControlBasicsQuery(currentInput);
        const ragChunks = healthQuery ? await retrieveRagContext(currentInput) : [];
        const ragContextText = ragChunks
          .map(
            (c, i) =>
              `[${i + 1}] ${c.sourceLabel} (${c.sourceUrl})\n${c.text.slice(0, 700)}`
          )
          .join('\n\n');
        const inferredTriageStage = inDeterministicFlow
          ? (triageStage === 'idle' ? 'symptomCheck' : triageStage)
          : 'idle';
        const llmGeneral = await getLLMGeneralResponse(currentInput, {
          triageStage: inferredTriageStage,
          fallbackContent: inferredTriageStage !== 'idle' ? initialFallback.content : undefined,
          ragContextText: ragContextText || undefined,
          userName: detectedName || userName,
          userAge: detectedAge || userAge,
          chatHistoryText: buildRecentHistoryText(messages, currentInput),
          timeoutMs: birthControlBasics ? 24000 : undefined,
        });
        if (llmGeneral) {
          content = postProcessAssistantContent(currentInput, llmGeneral, {
            hasShownBirthControlDisclaimer,
          });
          responseSources =
            ragChunks.length > 0
              ? Array.from(
                  new Map(
                    ragChunks.map((c) => [c.sourceUrl, { label: c.sourceLabel, url: c.sourceUrl }])
                  ).values()
                )
              : (healthQuery ? getPreferredSourcesForQuery(currentInput, fallback.sources) : []);
        } else if (healthQuery && ragChunks.length > 0) {
          const llmHealthRetry = await getLLMGeneralResponse(currentInput, {
            triageStage: inferredTriageStage,
            fallbackContent: inferredTriageStage !== 'idle' ? initialFallback.content : undefined,
            ragContextText: ragContextText || undefined,
            userName: detectedName || userName,
            userAge: detectedAge || userAge,
            chatHistoryText: buildRecentHistoryText(messages, currentInput),
            timeoutMs: birthControlBasics ? 30000 : 24000,
          });

          if (llmHealthRetry) {
            content = postProcessAssistantContent(currentInput, llmHealthRetry, {
              hasShownBirthControlDisclaimer,
            });
            responseSources = Array.from(
              new Map(
                ragChunks.map((c) => [c.sourceUrl, { label: c.sourceLabel, url: c.sourceUrl }])
              ).values()
            );
          } else {
            const resourceFallback = buildResourceFallbackAnswer(currentInput, ragChunks);
            if (resourceFallback) {
              content = resourceFallback;
              responseSources = Array.from(
                new Map(
                  ragChunks.map((c) => [c.sourceUrl, { label: c.sourceLabel, url: c.sourceUrl }])
                ).values()
              );
            }
          }
        } else if (!healthQuery) {
          const llmRetry = await getLLMGeneralResponse(currentInput, {
            triageStage: 'idle',
            userName: detectedName || userName,
            userAge: detectedAge || userAge,
            chatHistoryText: buildRecentHistoryText(messages, currentInput),
          });
          if (llmRetry) {
            content = postProcessAssistantContent(currentInput, llmRetry, {
              hasShownBirthControlDisclaimer,
            });
            responseSources = [];
          } else if (detectedAge) {
            const name = detectedName || userName;
            content = name
              ? `Thanks ${name}, I noted you are ${detectedAge}. What would you like help with next?`
              : `Thanks, I noted you are ${detectedAge}. What would you like help with next?`;
            responseSources = [];
          } else {
            content = detectedName || userName
              ? `Hi ${detectedName || userName}. I am here and ready to help. Ask me anything about sexual health, STI testing, contraception, or pregnancy.`
              : 'Hi. I am here and ready to help with sexual health, STI testing, contraception, and pregnancy questions.';
            responseSources = [];
          }
        }
      }

      if (!content) {
        const fallback = getResponse(currentInput);
        content = fallback.content;
        responseSources = fallback.sources;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: postProcessAssistantContent(currentInput, content, {
          hasShownBirthControlDisclaimer,
        }),
        sources: normalizeResponseSources(responseSources),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const recoveryMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Sorry, I hit a temporary issue. Please try your question again now, and I will answer right away.',
        sources: [],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, recoveryMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const getResponse = (query: string): { content: string; sources: { label: string; url: string }[] } => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('need') && lowerQuery.includes('condom')) {
      return {
        content:
          '**Short answer: condoms are still recommended.**\n\n' +
          '- Condoms lower STI risk.\n' +
          '- If you also want pregnancy prevention, combine condoms with another birth control method.\n' +
          '- Even with one partner, condoms are helpful unless both partners are tested and mutually monogamous.\n\n' +
          'If you want, I can suggest options based on your situation.',
        sources: [
          { label: 'SmartSexResource - Safer Sex', url: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/safer-sex/' },
          { label: 'HealthLinkBC - Birth Control Overview', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' },
        ],
      };
    }

    // In-chat consent gate before opening patient summary
    if (awaitingSummaryConsent) {
      if (
        lowerQuery === 'yes' ||
        lowerQuery.startsWith('yes ') ||
        lowerQuery === 'i consent' ||
        lowerQuery === 'consent' ||
        lowerQuery === 'agree' ||
        lowerQuery.includes('i agree')
      ) {
        setAwaitingSummaryConsent(false);
        const prefill = buildSummaryPrefill();
        setSummaryChatDraft(prefill);
        setSummaryChatStage('what_happened');
        return {
          content:
            'Thank you. You consented to create a summary note for clinic sharing.\n\n' +
            'I will ask a few quick questions in chat.\n\n' +
            '**1/10** What happened? (brief description)\n' +
            `Current draft: ${prefill.what_happened || 'Not set yet'}\n\n` +
            'You can type **skip** to keep the current value.',
          sources: [
            { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
          ],
        };
      }

      if (
        lowerQuery === 'no' ||
        lowerQuery.startsWith('no ') ||
        lowerQuery === 'cancel' ||
        lowerQuery === 'not now' ||
        lowerQuery.includes("don't consent") ||
        lowerQuery.includes('do not consent')
      ) {
        setAwaitingSummaryConsent(false);
        return {
          content:
            'No problem. I will not open or share a summary note.\n\n' +
            'If you change your mind later, type **"use this for my note"**.',
          sources: [
            { label: 'SmartSexResource - Privacy', url: 'https://smartsexresource.com' }
          ],
        };
      }

        return {
          content: 'Before I open the note, please confirm consent.\n\nReply **"yes"** to continue, or **"no"** to cancel.',
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ],
      };
    }

    // Consent gate before quick triage-prefill questions for provider sharing
    if (awaitingTriageShareConsent) {
      const consentReply = normalizeYesNoUnsure(query);
      if (consentReply === 'yes') {
        setAwaitingTriageShareConsent(false);
        setTriageStage('whatHappened');
        return {
          content:
            'Thank you. I will ask **4 quick questions** to prefill a note you can choose to share with a provider.\n\n' +
            '**Quick 1/4:** One-line reason for visit (for the note)\n' +
            'Example: "New partner, condom broke, now burning when peeing".\n' +
            'You can type **skip**.',
          sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
        };
      }

      if (consentReply === 'no') {
        const wasAsymptomatic = triageConsentContext === 'asymptomatic';
        setAwaitingTriageShareConsent(false);
        setTriageConsentContext(null);
        setTriageStage('idle');
        setTriageLock(false);
        return {
          content:
            'No problem. I will not ask the provider-share questions.\n\n' +
            (wasAsymptomatic
              ? '**Next steps:**\n1. Type **"GetCheckedOnline"** for online testing.\n2. Type **"open clinics"** for in-person care.'
              : '**Next steps:**\n1. Type **"open clinics"** to find nearby in-person care.'),
          sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
        };
      }

      return {
        content:
          'Before I continue with the provider-share questions, please confirm consent.\n\n' +
          'Reply **"yes"** to continue or **"no"** to skip.',
        sources: [{ label: 'SmartSexResource - Privacy', url: 'https://smartsexresource.com' }],
      };
    }

    // Conversational summary intake flow
    if (summaryChatStage !== 'idle') {
      const skipRequested = lowerQuery === 'skip' || lowerQuery === 'n/a' || lowerQuery === 'na';

      if (summaryChatStage === 'what_happened') {
        if (!query.trim() && !summaryChatDraft.what_happened) {
          return {
            content: 'Please share a short description of what happened. You can also type **skip**.',
            sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
          };
        }
        const next = {
          ...summaryChatDraft,
          what_happened: skipRequested ? (summaryChatDraft.what_happened || '') : query.trim(),
        };
        setSummaryChatDraft(next);
        setSummaryChatStage('contact_date');
        return {
          content:
            '**2/10** When was the most recent sexual contact that concerns you?\n\n' +
            'Enter date/time in any common format (for example: `2026-03-01 14:30`, `March 1 2026`, `03/01/2026`, `yesterday`) or type **skip**.',
          sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
        };
      }

      if (summaryChatStage === 'contact_date') {
        let contactDate = summaryChatDraft.contact_date;
        if (!skipRequested) {
          const parsedDate = parseFlexibleDateInput(query);
          if (!parsedDate) {
            return {
              content:
                'I could not read that date/time. Try formats like `2026-03-01 14:30`, `March 1 2026`, `03/01/2026`, or `yesterday`. You can also type **skip**.',
              sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
            };
          }
          contactDate = parsedDate;
        } else {
          contactDate = '';
        }

        const next = { ...summaryChatDraft, contact_date: contactDate };
        setSummaryChatDraft(next);
        setSummaryChatStage('sex_types');
        return {
          content:
            '**3/10** Types of sex during that contact? (you can list multiple)\n' +
            'Options: oral, vaginal, anal, other. You can type **skip**.',
          sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
        };
      }

      if (summaryChatStage === 'sex_types') {
        const sexTypes = skipRequested ? [] : parseSexTypesInput(query);
        if (!skipRequested && sexTypes.length === 0) {
          return {
            content: 'Please include at least one option: oral, vaginal, anal, or other. You can also type **skip**.',
            sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
          };
        }
        const next = { ...summaryChatDraft, sex_types: sexTypes };
        setSummaryChatDraft(next);
        setSummaryChatStage('condom_use');
        return {
          content:
            '**4/10** Condom use?\n' +
            '1. used throughout\n' +
            '2. used sometimes\n' +
            '3. no condom\n' +
            '4. condom broke\n\n' +
            'You can type **skip** to keep current value.',
          sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
        };
      }

      if (summaryChatStage === 'condom_use') {
        if (skipRequested) {
          setSummaryChatStage('has_symptoms');
          return {
            content: '**5/10** Any symptoms now? Reply **yes**, **no**, or **unsure**. You can type **skip**.',
            sources: [{ label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
          };
        }
        const condomUse = parseCondomUseInput(query);
        if (!condomUse) {
          return {
            content: 'Please choose 1-4, or reply with: used throughout, used sometimes, no condom, condom broke.',
            sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
          };
        }
        const next = { ...summaryChatDraft, condom_use: condomUse };
        setSummaryChatDraft(next);
        setSummaryChatStage('has_symptoms');
        return {
          content: '**5/10** Any symptoms now? Reply **yes**, **no**, or **unsure**. You can type **skip**.',
          sources: [{ label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
        };
      }

      if (summaryChatStage === 'has_symptoms') {
        if (skipRequested) {
          setSummaryChatStage('partner_known_sti');
          return {
            content: '**7/10** Any partner with a known STI or recent positive test? Reply **yes**, **no**, or **unsure**. You can type **skip**.',
            sources: [{ label: 'SmartSexResource - Partner Notification', url: 'https://smartsexresource.com/sexually-transmitted-infections/partner-notification/' }],
          };
        }
        const status = normalizeYesNoUnsure(query);
        if (!status) {
          return {
            content: 'Please reply **yes**, **no**, or **unsure**.',
            sources: [{ label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
          };
        }
        const hasSymptoms = status === 'yes';
        const next = {
          ...summaryChatDraft,
          has_symptoms: hasSymptoms,
        };
        setSummaryChatDraft(next);
        if (hasSymptoms) {
          setSummaryChatStage('symptoms_list');
          return {
            content: '**6/10** List your symptoms (for example: discharge, burning when peeing, sores). You can type **skip**.',
            sources: [{ label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
          };
        }
        setSummaryChatStage('partner_known_sti');
        return {
          content: '**7/10** Any partner with a known STI or recent positive test? Reply **yes**, **no**, or **unsure**.',
          sources: [{ label: 'SmartSexResource - Partner Notification', url: 'https://smartsexresource.com/sexually-transmitted-infections/partner-notification/' }],
        };
      }

      if (summaryChatStage === 'symptoms_list') {
        const symptoms = skipRequested ? '' : query.trim();
        if (!symptoms) {
          return {
            content: 'Please list symptoms, or type **skip**.',
            sources: [{ label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
          };
        }
        const next = { ...summaryChatDraft, symptoms_list: symptoms };
        setSummaryChatDraft(next);
        setSummaryChatStage('symptom_duration');
        return {
          content:
            '**6b/10** How long have symptoms been present?\n' +
            '1. Less than 1 week\n' +
            '2. 1-2 weeks\n' +
            '3. 2-4 weeks\n' +
            '4. More than 4 weeks\n\n' +
            'You can type **skip**.',
          sources: [{ label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
        };
      }

      if (summaryChatStage === 'symptom_duration') {
        const duration = parseSymptomDuration(query);
        if (!duration && !skipRequested) {
          return {
            content: 'Please choose 1-4 or type one option exactly (for example: **1-2 weeks**), or **skip**.',
            sources: [{ label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
          };
        }
        const next = { ...summaryChatDraft, symptom_duration: duration || '' };
        setSummaryChatDraft(next);
        setSummaryChatStage('partner_known_sti');
        return {
          content: '**7/10** Any partner with a known STI or recent positive test? Reply **yes**, **no**, or **unsure**. You can type **skip**.',
          sources: [{ label: 'SmartSexResource - Partner Notification', url: 'https://smartsexresource.com/sexually-transmitted-infections/partner-notification/' }],
        };
      }

      if (summaryChatStage === 'partner_known_sti') {
        const status = normalizeYesNoUnsure(query);
        if (!status && !skipRequested) {
          return {
            content: 'Please reply **yes**, **no**, or **unsure**.',
            sources: [{ label: 'SmartSexResource - Partner Notification', url: 'https://smartsexresource.com/sexually-transmitted-infections/partner-notification/' }],
          };
        }
        const next = { ...summaryChatDraft, partner_known_sti: status || summaryChatDraft.partner_known_sti || 'unsure' };
        setSummaryChatDraft(next);
        setSummaryChatStage('current_medications');
        return {
          content: '**8/10** Any STI medications started recently? Reply **yes** or **no**. You can type **skip**.',
          sources: [{ label: 'SmartSexResource - STIs and Conditions', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
        };
      }

      if (summaryChatStage === 'current_medications') {
        const lower = query.toLowerCase().trim();
        if (!['yes', 'no'].includes(lower) && !skipRequested) {
          return {
            content: 'Please reply **yes** or **no**.',
            sources: [{ label: 'SmartSexResource - STIs and Conditions', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
          };
        }
        const hasMeds = skipRequested ? summaryChatDraft.current_medications : lower === 'yes';
        const next = { ...summaryChatDraft, current_medications: hasMeds };
        setSummaryChatDraft(next);
        if (hasMeds) {
          setSummaryChatStage('medications_list');
          return {
            content: '**8b/10** Which medication(s) and start date? You can type **skip**.',
            sources: [{ label: 'SmartSexResource - STIs and Conditions', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }],
          };
        }
        setSummaryChatStage('pregnancy_possible');
        return {
          content: '**9/10** Pregnancy possibility or trying to conceive? Reply **yes**, **no**, or **unsure**. You can type **skip**.',
          sources: [{ label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }],
        };
      }

      if (summaryChatStage === 'medications_list') {
        const next = {
          ...summaryChatDraft,
          medications_list: skipRequested ? '' : query.trim(),
        };
        setSummaryChatDraft(next);
        setSummaryChatStage('pregnancy_possible');
        return {
          content: '**9/10** Pregnancy possibility or trying to conceive? Reply **yes**, **no**, or **unsure**.',
          sources: [{ label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }],
        };
      }

      if (summaryChatStage === 'pregnancy_possible') {
        const status = normalizeYesNoUnsure(query);
        if (!status && !skipRequested) {
          return {
            content: 'Please reply **yes**, **no**, or **unsure**.',
            sources: [{ label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }],
          };
        }
        const next = {
          ...summaryChatDraft,
          pregnancy_possible: status || summaryChatDraft.pregnancy_possible || 'unsure',
        };
        setSummaryChatDraft(next);
        setSummaryChatStage('allergies_meds');
        return {
          content: '**10/10** Any allergies or medications the clinic should know? (or type **none** or **skip**)',
          sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
        };
      }

      if (summaryChatStage === 'allergies_meds') {
        const allergyText =
          skipRequested || lowerQuery === 'none' || lowerQuery === 'no'
            ? 'NKDA'
            : query.trim();
        const next = { ...summaryChatDraft, allergies_meds: allergyText || 'NKDA' };
        setSummaryChatDraft(next);
        setSummaryChatStage('preferred_language');
        return {
          content:
            'Last question: Preferred language for handouts?\n' +
            `${SUPPORTED_SUMMARY_LANGUAGES.join(', ')}\n\nYou can type **skip** to use English.`,
          sources: [{ label: 'SmartSexResource - Language Resources', url: 'https://smartsexresource.com' }],
        };
      }

      if (summaryChatStage === 'preferred_language') {
        const language = skipRequested ? 'English' : parseLanguageInput(query) || 'English';
        const finalData: PatientSummaryFormData = {
          ...summaryChatDraft,
          preferred_language: language,
        };
        setSummaryChatDraft(finalData);
        setSummaryChatStage('idle');

        const summary = generatePatientSummary(finalData);
        setSummaryFormData(finalData);
        setSummaryData(summary);
        sessionStorage.setItem(SUMMARY_FORM_STORAGE_KEY, JSON.stringify(finalData));
        sessionStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summary));
        setShowSummaryView(true);

        return {
          content:
            'Summary complete. I generated your patient summary note and opened it for review.\n\n' +
            'You can edit details before sharing with clinic staff.',
          sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
        };
      }
    }

    // Ongoing symptom triage follow-up
    if (triageStage === 'symptomCheck') {
      const symptomStatusReply = normalizeYesNoUnsure(lowerQuery);

      // User confirms symptoms
      if (symptomStatusReply === 'yes') {
        setTriageStage('symptomDetails');
        setSymptomStatus('yes');
        persistTriageDraft({ hasSymptoms: 'yes' });
        return {
          content:
            '**Thanks for telling me.**\n\n' +
            'Because you have symptoms, it is safest to be seen in person instead of using GetCheckedOnline.\n\n' +
            '**While you wait for care:**\n' +
            '- Avoid sex until you are assessed\n' +
            '- Avoid douching or harsh soaps on genitals\n' +
            '- Do not start leftover antibiotics\n' +
            '- Seek urgent care now if severe pain, fever, or swelling develops\n\n' +
            'Please list the symptoms you are noticing now (for example: burning when peeing, discharge, sores, rash).',
          sources: [
            {
              label: 'SmartSexResource - Clinics & Testing',
              url: 'https://smartsexresource.com/clinics-testing/',
            },
          ],
        };
      }

      // User reports no symptoms
      if (symptomStatusReply === 'no') {
        setTriageStage('idle');
        setTriageLock(false);
        setSymptomStatus('no');
        setAwaitingTriageShareConsent(false);
        setTriageConsentContext(null);
        persistTriageDraft({
          hasSymptoms: 'no',
          selectedSymptoms: [],
          duration: '',
        });
        return {
          content:
            '**Okay, you do not have symptoms right now.**\n\n' +
            'That lowers immediate urgency, but testing can still be important after new exposure.\n\n' +
            '**When GetCheckedOnline is usually a good fit:**\n' +
            '- Routine STI screening\n' +
            '- A change in sexual behaviours\n' +
            '- Testing after a sexual contact (often around **3 weeks** and again at **3 months**)\n\n' +
            '**How often to test (general guide):**\n' +
            '- Usually every **3-12 months** based on risk\n' +
            '- If you or partners have new/casual partners, every **3-6 months** is common\n' +
            '- Testing more often than every 3 months is usually not needed\n\n' +
            '**Next step:**\n' +
            '1. Type **"GetCheckedOnline"** to start online testing now.\n' +
            '2. Type **"open clinics"** if you prefer in-person care.',
          sources: [
            { label: 'GetCheckedOnline', url: 'https://getcheckedonline.com' },
            { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' },
          ],
        };
      }

      // User is unsure about symptoms
      if (symptomStatusReply === 'unsure') {
        setSymptomStatus('unsure');
        persistTriageDraft({ hasSymptoms: 'unsure' });
        return {
          content:
            '**That is okay - many people are not sure.**\n\n' +
            'Here are some common STI symptoms people notice:\n' +
            '- Burning or pain when you pee\n' +
            '- New discharge from the genitals\n' +
            '- Sores, bumps, or rashes\n' +
            '- Itching in the genital area\n\n' +
            'Do **any** of these sound like you? You can reply **"yes"**, **"no"**, or **"not sure"**.',
          sources: [
            {
              label: 'SmartSexResource - STI Symptoms',
              url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/',
            },
          ],
        };
      }
    }

    if (triageStage === 'symptomDetails') {
      const symptoms = parseSymptomList(query);
      if (symptoms.length === 0) {
        return {
          content:
            'I did not catch the symptoms yet. Please list what you are feeling now (for example: burning when peeing, discharge, sores, rash).',
          sources: [
            {
              label: 'SmartSexResource - STIs and Conditions',
              url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/',
            },
          ],
        };
      }

      setChatSymptomDraft((prev) => ({ ...prev, symptoms }));
      persistTriageDraft({
        hasSymptoms: 'yes',
        selectedSymptoms: symptoms,
      });
      setTriageStage('symptomDuration');
      return {
        content:
          `Thanks. I noted these symptoms: **${symptoms.join(', ')}**.\n\n` +
          'How long have these symptoms been present?\n' +
          '1. Less than 1 week\n' +
          '2. 1-2 weeks\n' +
          '3. 2-4 weeks\n' +
          '4. More than 4 weeks',
        sources: [
          {
            label: 'SmartSexResource - Clinics & Testing',
            url: 'https://smartsexresource.com/clinics-testing/',
          },
        ],
      };
    }

    if (triageStage === 'symptomDuration') {
      const duration = parseSymptomDuration(query);
      if (!duration) {
        return {
          content:
            'Please choose one duration: **Less than 1 week**, **1-2 weeks**, **2-4 weeks**, or **More than 4 weeks**.',
          sources: [
            {
              label: 'SmartSexResource - Clinics & Testing',
              url: 'https://smartsexresource.com/clinics-testing/',
            },
          ],
        };
      }

      setChatSymptomDraft((prev) => ({ ...prev, duration }));
      persistTriageDraft({
        hasSymptoms: 'yes',
        duration,
      });
      setTriageStage('idle');
      setAwaitingTriageShareConsent(true);
      setTriageConsentContext('symptomatic');

      return {
        content:
          `Got it - symptoms for **${duration}**.\n\n` +
          'Based on your symptoms, in-person assessment is recommended.\n\n' +
          '**How to manage symptoms while waiting for care:**\n' +
          '- Avoid sex until assessed\n' +
          '- Drink fluids and avoid irritants in the genital area\n' +
          '- Do not self-start old antibiotics\n' +
          '- Go to urgent care now for severe pain, fever, or swelling\n\n' +
          'Would you like me to ask **4 quick triage questions** to prefill a note you can choose to share with your provider?\n\n' +
          'Reply **"yes"** or **"no"**.',
        sources: [
          {
            label: 'SmartSexResource - Clinics & Testing',
            url: 'https://smartsexresource.com/clinics-testing/',
          },
        ],
      };
    }

    if (triageStage === 'sexTypes') {
      const skipRequested = lowerQuery === 'skip' || lowerQuery === 'n/a' || lowerQuery === 'na';
      if (!skipRequested) {
        const sexTypes = parseSexTypesInput(query);
        if (sexTypes.length === 0) {
          return {
            content: 'Please include at least one option: oral, vaginal, anal, or other. You can also type **skip**.',
            sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
          };
        }
        persistTriageDraft({ sexTypes });
      }

      setTriageStage('condomUse');
      return {
        content:
          '**Quick 3/4:** Condom use?\n' +
          '1. used throughout\n' +
          '2. used sometimes\n' +
          '3. no condom\n' +
          '4. condom broke\n\n' +
          'You can type **skip**.',
        sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
      };
    }

    if (triageStage === 'condomUse') {
      const skipRequested = lowerQuery === 'skip' || lowerQuery === 'n/a' || lowerQuery === 'na';
      if (!skipRequested) {
        const condomUse = parseCondomUseInput(query);
        if (!condomUse) {
          return {
            content: 'Please choose 1-4, or reply with: used throughout, used sometimes, no condom, condom broke.',
            sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
          };
        }
        persistTriageDraft({ condomUse });
      }

      setTriageStage('partnerKnownSti');
      return {
        content: '**Quick 4/4:** Any partner with a known STI or recent positive test? Reply **yes**, **no**, or **unsure**. You can type **skip**.',
        sources: [{ label: 'SmartSexResource - Partner Notification', url: 'https://smartsexresource.com/sexually-transmitted-infections/partner-notification/' }],
      };
    }

    if (triageStage === 'partnerKnownSti') {
      const skipRequested = lowerQuery === 'skip' || lowerQuery === 'n/a' || lowerQuery === 'na';
      if (!skipRequested) {
        const status = normalizeYesNoUnsure(query);
        if (!status) {
          return {
            content: 'Please reply **yes**, **no**, or **unsure**. You can also type **skip**.',
            sources: [{ label: 'SmartSexResource - Partner Notification', url: 'https://smartsexresource.com/sexually-transmitted-infections/partner-notification/' }],
          };
        }
        persistTriageDraft({ partnerKnownSti: status });
      }

      setTriageStage('idle');
      setTriageConsentContext(null);
      setTriageLock(false);

      let savedDraft: StoredTriageDraft | null = null;
      try {
        const raw = sessionStorage.getItem(TRIAGE_DRAFT_STORAGE_KEY);
        if (raw) {
          savedDraft = JSON.parse(raw) as StoredTriageDraft;
        }
      } catch {
        // Ignore malformed storage and continue with chat-only values.
      }

      const prefilledForm: PatientSummaryFormData = {
        what_happened:
          savedDraft?.whatHappened ||
          (savedDraft?.hasSymptoms === 'yes' ? 'Symptoms requiring in-person STI assessment' : 'Recent STI exposure concern'),
        contact_date: '',
        sex_types: savedDraft?.sexTypes || [],
        condom_use: savedDraft?.condomUse || 'no condom',
        has_symptoms: savedDraft?.hasSymptoms === 'yes',
        symptoms_list:
          chatSymptomDraft.symptoms.join(', ') ||
          (savedDraft?.selectedSymptoms && savedDraft.selectedSymptoms.length > 0
            ? savedDraft.selectedSymptoms.join(', ')
            : ''),
        symptom_duration: savedDraft?.duration || chatSymptomDraft.duration || '',
        partner_known_sti: savedDraft?.partnerKnownSti || 'unsure',
        current_medications: false,
        medications_list: '',
        pregnancy_possible: 'unsure',
        allergies_meds: 'NKDA',
        preferred_language: 'English',
      };
      setSummaryFormData(prefilledForm);
      sessionStorage.setItem(SUMMARY_FORM_STORAGE_KEY, JSON.stringify(prefilledForm));

      return {
        content:
          '**Thanks - I prefilled more of your triage form.**\n\n' +
          '**Next steps:**\n' +
          '1. **Clinics Near You:** http://localhost:5173/clinics?from=chat&autoLocate=1\n' +
          '2. Choose the clinic that fits your needs.\n' +
          '3. After selecting a clinic, you can generate and review a patient summary note to share with clinicians.\n\n' +
          'I recommend opening the clinic list now so you can compare your options.',
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' },
        ],
      };
    }

    if (triageStage === 'whatHappened') {
      const skipRequested = lowerQuery === 'skip' || lowerQuery === 'n/a' || lowerQuery === 'na';
      if (!skipRequested && query.trim()) {
        persistTriageDraft({ whatHappened: query.trim().slice(0, 220) });
      }
      setTriageStage('sexTypes');
      return {
        content:
          '**Quick 2/4:** Types of sex during that contact?\n' +
          'Options: oral, vaginal, anal, other.\n' +
          'You can list multiple or type **skip**.',
        sources: [{ label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }],
      };
    }

    if (
      lowerQuery.includes('access code') ||
      lowerQuery.includes('show my code') ||
      lowerQuery.includes('share code')
    ) {
      try {
        const raw = localStorage.getItem(ACCESS_CODE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { code?: string; expiresAtISO?: string };
          const expiryMs = parsed.expiresAtISO ? Date.parse(parsed.expiresAtISO) : Number.NaN;
          const hasValidCode =
            typeof parsed.code === 'string' &&
            parsed.code.length === 6 &&
            !Number.isNaN(expiryMs) &&
            Date.now() < expiryMs;

          if (hasValidCode) {
            navigate('/share');
            return {
              content: 'Opening your secure access code now.',
              sources: [],
            };
          }
        }
      } catch {
        // Ignore malformed stored code.
      }

      return {
        content:
          'I could not find an active access code yet. Generate one by opening **Share with Clinic** after creating your summary note.',
        sources: [{ label: 'SIA Privacy', url: 'https://sia.bccdc.ca/privacy' }],
      };
    }

    const triagePromptedOpenClinics =
      (lowerQuery === '1' || lowerQuery === '1.' || lowerQuery === 'option 1') &&
      messages.length > 0 &&
      messages[messages.length - 1]?.content.includes('Type **"open clinics"**');

    const triagePromptedGetCheckedOnline =
      (lowerQuery === '1' || lowerQuery === '1.' || lowerQuery === 'option 1') &&
      messages.length > 0 &&
      messages[messages.length - 1]?.content.includes('Type **"GetCheckedOnline"**');

    if (
      lowerQuery.includes('getcheckedonline') ||
      lowerQuery.includes('get checked online') ||
      lowerQuery.includes('get checkedonline') ||
      triagePromptedGetCheckedOnline
    ) {
      return {
        content:
          '**GetCheckedOnline (BC) - next steps**\n\n' +
          '1. Open: https://getcheckedonline.com\n' +
          '2. Create/sign in to your account\n' +
          '3. Complete the testing questionnaire\n' +
          '4. Get your lab form and go to a participating lab (such as LifeLabs)\n' +
          '5. Check results online\n\n' +
          'If you develop symptoms, had sex with someone known to have an STI, need tests not offered online, want support after sexual assault, or need a printed named result, choose **"open clinics"** instead.',
        sources: [
          { label: 'GetCheckedOnline', url: 'https://getcheckedonline.com' },
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' },
        ],
      };
    }

    if (
      lowerQuery.includes('open clinics') ||
      lowerQuery.includes('nearest clinic') ||
      lowerQuery.includes('find a clinic') ||
      lowerQuery.includes('find clinic') ||
      lowerQuery.includes('clinic near me') ||
      triagePromptedOpenClinics
    ) {
      navigate('/clinics?from=chat&autoLocate=1');
      return {
        content: 'Opening nearby clinic options now.',
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ],
      };
    }

    if (lowerQuery.includes('use this for my note') || lowerQuery.includes('use this note')) {
      return {
        content:
          'This chatbot flow is focused on helping you find the best clinic option.\n\nType **"open clinics"** to see nearby in-person care, or **"GetCheckedOnline"** if you want online testing guidance.',
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ],
      };
    }

    if (lowerQuery.trim() === 'contraceptives' || lowerQuery.trim() === 'birth control') {
      return {
        content:
          '**Main birth control types**\n\n' +
          '- **Barrier:** condoms, internal condoms, diaphragm\n' +
          '- **Hormonal:** pill, patch, ring, shot\n' +
          '- **Long-acting reversible (LARC):** IUDs, implant\n' +
          '- **Emergency contraception:** Plan B, ulipristal (Ella), copper IUD\n' +
          '- **Permanent:** tubal ligation, vasectomy\n\n' +
          'Most methods prevent pregnancy, but only condoms help protect against STIs. Want a quick comparison by effectiveness?',
        sources: [
          { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/healthwise/birth-control' },
        ],
      };
    }

    if (
      (lowerQuery.includes('birth control') || lowerQuery.includes('contraception')) &&
      (lowerQuery.includes('how can i get') ||
        lowerQuery.includes('how do i get') ||
        lowerQuery.includes('where can i get') ||
        lowerQuery.includes('is it free') ||
        lowerQuery.includes('cost') ||
        lowerQuery.includes('pay') ||
        lowerQuery.includes('privacy') ||
        lowerQuery.includes('confidential'))
    ) {
      return {
        content:
          '**Yes. In BC, many prescription birth control options are free if you are enrolled in MSP, including for youth.**\n\n' +
          '**How to get it as a youth:**\n' +
          '- You can speak with a doctor, walk-in clinic, youth clinic, or pharmacist.\n' +
          '- Bring your BC Services Card/Personal Health Number.\n' +
          '- Ask what methods are covered.\n\n' +
          '**Privacy:** You can get sexual health care on your own. Your visit is confidential, and parents are not automatically notified.\n\n' +
          'If you want, I can help you choose a method and show youth-friendly clinics.',
        sources: [
          {
            label: 'HealthLinkBC - Birth Control for Teens',
            url: 'https://www.healthlinkbc.ca/healthwise/birth-control-teens',
          },
        ],
      };
    }

    if (
      (lowerQuery.includes('birth control') || lowerQuery.includes('contraception') || lowerQuery.includes('contraceptive')) &&
      (lowerQuery.includes('type') || lowerQuery.includes('types') || lowerQuery.includes('method') || lowerQuery.includes('methods') || lowerQuery.includes('option') || lowerQuery.includes('options'))
    ) {
      return {
        content:
          '**Different types of birth control**\n\n' +
          '**Hormonal methods:** pill, patch, shot (Depo-Provera), vaginal ring, implant.\n\n' +
          '**Long-acting reversible contraception (LARC):** IUDs (hormonal or copper).\n\n' +
          '**Barrier methods:** external condoms, internal condoms, diaphragms, spermicides.\n\n' +
          '**Permanent methods:** tubal ligation and vasectomy.',
        sources: [
          { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/healthwise/birth-control' },
        ],
      };
    }

    if (
      (lowerQuery.includes('what is the pill') ||
        lowerQuery.includes('what is pill') ||
        lowerQuery.includes('tell me about the pill') ||
        lowerQuery.includes('how effective is the pill') ||
        (lowerQuery.includes('pill') && lowerQuery.includes('effective'))) &&
      (lowerQuery.includes('what') || lowerQuery.includes('how'))
    ) {
      return {
        content:
          '**The pill** is a daily hormone medication that helps prevent pregnancy, mainly by stopping ovulation.\n\n' +
          '**Effectiveness:**\n' +
          '- **Perfect use:** about **99%** effective\n' +
          '- **Typical use:** about **91%** effective\n\n' +
          'It works best when taken every day at the same time.',
        sources: [
          { label: 'HealthLinkBC - Birth Control Pill', url: 'https://www.healthlinkbc.ca/healthwise/birth-control-hormones-pill' },
        ],
      };
    }

    if (
      lowerQuery.includes('what is the pill') ||
      lowerQuery.includes('what is pill') ||
      lowerQuery.includes('tell me about the pill') ||
      lowerQuery.trim() === 'the pill'
    ) {
      return {
        content:
          '**What is the pill?**\n\n' +
          'The pill is a daily birth control medication. There are two main types:\n' +
          '- **Combined pill** (estrogen + progestin)\n' +
          '- **Mini-pill** (progestin only)\n\n' +
          'It works mainly by preventing ovulation. It does not protect against STIs, so condoms are still recommended for STI prevention.',
        sources: [
          { label: 'HealthLinkBC - The Pill (Combined)', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-pill' },
          { label: 'HealthLinkBC - The Mini-Pill', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-mini-pill' },
        ],
      };
    }

    if (
      (lowerQuery.includes('pill') || lowerQuery.includes('birth control pill') || lowerQuery.includes('oral contraceptive')) &&
      (lowerQuery.includes('effective') || lowerQuery.includes('effectiveness') || lowerQuery.includes('how effective'))
    ) {
      return {
        content:
          '**How effective is the pill?**\n\n' +
          '- With **perfect use**: about **99% effective**\n' +
          '- With **typical use**: about **91% effective**\n\n' +
          'Missing pills lowers protection. Using condoms too gives STI protection and extra pregnancy prevention.',
        sources: [
          { label: 'HealthLinkBC - Birth Control Pill', url: 'https://www.healthlinkbc.ca/healthwise/birth-control-hormones-pill' },
        ],
      };
    }

    if (
      (lowerQuery.includes('types of sti') ||
        lowerQuery.includes('type of sti') ||
        lowerQuery.includes('different types of sti') ||
        lowerQuery.includes('different types of stis') ||
        lowerQuery.includes('different stis') ||
        lowerQuery.includes('stis types')) &&
      (lowerQuery.includes('sti') || lowerQuery.includes('std'))
    ) {
      return {
        content:
          '**Different types of STIs**\n\n' +
          '- Chlamydia\n' +
          '- Gonorrhea\n' +
          '- Syphilis\n' +
          '- Herpes (HSV)\n' +
          '- HPV\n' +
          '- HIV\n\n' +
          '**Most common in BC:** chlamydia is the most commonly reported STI.\n\n' +
          'Many STIs have no symptoms, so testing is important.',
        sources: [
          { label: 'SmartSexResource - STIs and Conditions', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' },
        ],
      };
    }

    if (
      lowerQuery.includes('what is gonorrhea') ||
      lowerQuery.includes('what is the clap') ||
      lowerQuery.includes('gonorrhea (the clap)') ||
      ((lowerQuery.includes('gonorrhea') || lowerQuery.includes('the clap')) &&
        (lowerQuery.includes('what is') || lowerQuery.includes('explain') || lowerQuery.includes('tell me')))
    ) {
      return {
        content:
          '**What is gonorrhea (the clap)?**\n\n' +
          'Gonorrhea is a bacterial infection spread through vaginal, oral, or anal sex.\n\n' +
          '**Symptoms:** many people have no symptoms. If symptoms happen, they can include painful urination or unusual discharge.\n\n' +
          '**Treatment:** gonorrhea is curable with antibiotics, and treatment is available through clinics in BC.',
        sources: [
          { label: 'SmartSexResource - Gonorrhea', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/gonorrhea/' },
        ],
      };
    }

    if (
      (lowerQuery.includes('iud') || lowerQuery.includes('intrauterine')) &&
      (lowerQuery.includes('hurt') || lowerQuery.includes('painful') || lowerQuery.includes('pain'))
    ) {
      return {
        content:
          '**Do IUDs hurt?**\n\n' +
          'An IUD is a small T-shaped device placed in the uterus by a healthcare provider.\n\n' +
          'Most people feel discomfort, pinching, or cramping during insertion.\n\n' +
          '**Pain management:** ask your provider about taking ibuprofen before the visit or using a local anesthetic (numbing).',
        sources: [
          { label: 'HealthLinkBC - IUD', url: 'https://www.healthlinkbc.ca/healthwise/intrauterine-device-iud-birth-control' },
        ],
      };
    }

    if (
      lowerQuery.includes('most common sti') ||
      lowerQuery.includes('most common std') ||
      ((lowerQuery.includes('common') || lowerQuery.includes('most common')) &&
        (lowerQuery.includes('sti') || lowerQuery.includes('std')))
    ) {
      return {
        content:
          '**What is the most common STI?**\n\n' +
          'In British Columbia, **chlamydia** is the most commonly reported STI.\n\n' +
          'Many people have no symptoms, so testing is the best way to know your status.',
        sources: [
          { label: 'SmartSexResource - STIs and Conditions', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' },
        ],
      };
    }

    // CHECK FOR BASIC DEFINITION - "what is an STI/STD"
    if (
      (lowerQuery.includes('what is') || lowerQuery.includes("what's") || lowerQuery.includes('define')) &&
      (lowerQuery.includes('sti') || lowerQuery.includes('std') || lowerQuery.includes('sexually transmitted infection'))
    ) {
      return {
        content:
          '**An STI is a sexually transmitted infection.**\n\n' +
          'STIs can pass between partners during oral, vaginal, or anal sex.\n\n' +
          'Some STIs cause symptoms, but many do not, so testing is the only way to know for sure.\n\n' +
          'If you want, I can explain common STI symptoms, when to test, or how to find a clinic in BC.',
        sources: [
          {
            label: 'SmartSexResource - STIs and Conditions',
            url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/',
          },
          {
            label: 'SmartSexResource - Get Tested',
            url: 'https://smartsexresource.com/clinics-testing/',
          },
        ],
      };
    }

    // CHECK FOR STI BASICS - "types of STIs", "basic STI information"
    if (
      (lowerQuery.includes('types of sti') ||
        lowerQuery.includes('type of sti') ||
        lowerQuery.includes('what stis are there') ||
        lowerQuery.includes('what stds are there') ||
        lowerQuery.includes('basic sti') ||
        lowerQuery.includes('sti information') ||
        lowerQuery.includes('info about sti') ||
        lowerQuery.includes('about sti')) &&
      (lowerQuery.includes('sti') || lowerQuery.includes('std'))
    ) {
      return {
        content:
          '**Common STIs include:**\n' +
          '- Chlamydia\n' +
          '- Gonorrhea\n' +
          '- Syphilis\n' +
          '- HIV\n' +
          '- Herpes (HSV)\n' +
          '- HPV\n' +
          '- Hepatitis B and C\n' +
          '- Trichomoniasis\n\n' +
          'Some STIs are curable (like chlamydia, gonorrhea, and syphilis), while others are manageable with treatment (like HIV and herpes).\n\n' +
          'Many STIs have no symptoms, so regular testing is important. If you want, I can explain testing windows or help find a clinic.',
        sources: [
          {
            label: 'SmartSexResource - STIs and Conditions',
            url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/',
          },
          {
            label: 'STIs at a Glance PDF',
            url: 'https://smartsexresource.com/wp-content/uploads/resources/STIs-at-a-Glance-pages_October_2024-1.pdf',
          },
        ],
      };
    }

    // CHECK FOR CLINIC FINDER REQUEST after missed pill / EC discussion
    if ((lowerQuery.includes('yes') || lowerQuery.includes('find') || lowerQuery.includes('near me') || 
         lowerQuery.includes('location') || lowerQuery === 'clinic' || lowerQuery === 'clinics') &&
        messages.length > 0 && 
        messages[messages.length - 1]?.content.includes('Would you like')) {
      // User is responding to a "would you like help finding...?" prompt
      if (messages[messages.length - 1]?.content.includes('emergency contraception') ||
          messages[messages.length - 1]?.content.includes('clinic') ||
          messages[messages.length - 1]?.content.includes('other birth control options')) {
        return {
          content: `**Finding Sexual Health Clinics Near You**\n\nI can help you locate sexual health clinics that offer:\n- Emergency contraception (Plan B, ella, copper IUD)\n- Birth control consultations and prescriptions\n- Contraceptive counseling\n- Confidential, youth-friendly services\n- Free or low-cost care\n\n**To find clinics:**\nClick the \"Find Clinics\" button below, or tell me your city/postal code and I'll show you the closest options.\n\n**Can't get to a clinic right away?**\n- Plan B is available at any pharmacy - no prescription needed\n- Many pharmacies are open late or 24 hours\n- Call HealthLinkBC at 8-1-1 for immediate guidance`,
          sources: [
            { label: 'SmartSexResource - Clinic Finder', url: 'https://smartsexresource.com/clinics-testing/' },
            { label: 'HealthLinkBC - Emergency Contraception', url: 'https://www.healthlinkbc.ca/healthlinkbc-files/emergency-contraception' }
          ]
        };
      }
    }
    
    // CHECK FOR PATIENT SUMMARY REQUEST
    if ((lowerQuery.includes('note') && (lowerQuery.includes('clinic') || lowerQuery.includes('nurse') || lowerQuery.includes('doctor'))) || 
        (lowerQuery.includes('summary') && (lowerQuery.includes('share') || lowerQuery.includes('create') || lowerQuery.includes('make'))) ||
        lowerQuery.includes('something for the nurse') ||
        lowerQuery.includes('something for the doctor') ||
        lowerQuery.includes('patient summary')) {
      return {
        content:
          'I can help you figure out the best clinic option for your situation.\n\nType **"open clinics"** to find nearby in-person care, or **"GetCheckedOnline"** if you want online testing guidance.',
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ]
      };
    }
    
    // CHECK FOR UNCERTAIN RESPONSE - "I don't know", "not sure", "maybe"
    if (lowerQuery === "i don't know" || lowerQuery === "idk" || lowerQuery === "not sure" || 
        lowerQuery === "unsure" || lowerQuery === "maybe" || lowerQuery === "i think so" || 
        lowerQuery === "i'm not sure") {
      return {
        content: `**Thanks - it's totally normal not to be sure.**\n\nLet's figure this out together.\n\nThe BC CDC notes that you should get tested if you notice **changes in your body**, have a **new partner**, had **sex without a condom**, or were exposed to a partner with an STI.\n\n**Here are a few common symptoms people sometimes miss:**\n- Burning or pain when you pee\n- Itching or irritation\n- New discharge\n- Sores, bumps, or rashes\n- Pelvic or lower abdominal pain\n\n**Do any of these sound familiar?**\n\n(You can say "maybe", "some", "none", or describe anything you've noticed.)`,
        sources: [
          { label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' },
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ]
      };
    }
    
    // CHECK FOR SYMPTOMS PRESENT - User mentions specific symptoms
    if (lowerQuery.includes('hurt when i pee') || lowerQuery.includes('hurts when i pee') || 
        lowerQuery.includes('burning') || lowerQuery.includes('stinging') || lowerQuery.includes('sting when') || lowerQuery.includes('burns') ||
        lowerQuery.includes('pain peeing') || lowerQuery.includes('pee hurts') || lowerQuery.includes('peeing hurts') ||
        lowerQuery.includes('discharge') || lowerQuery.includes('sore') || lowerQuery.includes('bump') ||
        lowerQuery.includes('rash') || lowerQuery.includes('itch')) {
      return {
        content: `**Thanks for telling me.**\n\nPain when peeing can be an STI symptom.\n\nBC CDC recommends an **in-person assessment** instead of GetCheckedOnline when symptoms are present.\n\nType **"open clinics"** and I can help you look at clinic options near you.`,
        sources: [
          { label: 'Pathways BC - Sexual Health Clinics', url: 'https://vancouver.pathwaysbc.ca/programs/1286' },
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ]
      };
    }
    
    // CHECK FOR "NO SYMPTOMS" RESPONSE - Route to GetCheckedOnline
    if ((lowerQuery === "no" || lowerQuery === "none" || lowerQuery === "no symptoms" || 
         lowerQuery === "don't think so" || lowerQuery === "i don't think so" || lowerQuery === "not really") &&
        messages.length > 2) { // Only if in conversation context
      return {
        content: `**Okay - since you don't have symptoms, GetCheckedOnline can be a good option.**\n\nYou create a lab form online and visit a participating LifeLabs for samples.\n\n**How often to test (general):**\n- Usually every **3-12 months**\n- If you/partners have new or casual partners, every **3-6 months** is common\n- Testing monthly is usually not recommended\n\n**After a specific exposure:** testing is often done around **3 weeks** and again at **3 months**.\n\nWould you like to:\n\n1. **Start with GetCheckedOnline**\n2. **Find a nearby clinic**`,
        sources: [
          { label: 'GetCheckedOnline', url: 'https://getcheckedonline.com' },
          { label: 'SmartSexResource - Testing', url: 'https://smartsexresource.com/testing/' },
          { label: 'Pathways BC - Sexual Health Clinics', url: 'https://vancouver.pathwaysbc.ca/programs/1286' }
        ]
      };
    }
    
    // CHECK FOR "I THINK I HAVE AN STI" - PRIORITY CONCERN
    if ((lowerQuery.includes('think') || lowerQuery.includes('might') || lowerQuery.includes('maybe') || lowerQuery.includes('worried') || lowerQuery.includes('concerned') || lowerQuery.includes('anxious') || lowerQuery.includes('scared')) && 
        (lowerQuery.includes('have') || lowerQuery.includes('got')) && 
        (lowerQuery.includes('sti') || lowerQuery.includes('std') || lowerQuery.includes('infection'))) {
      setTriageStage('symptomCheck');
      setTriageLock(true);
      setSymptomStatus(null);
      return {
        content:
          '**I am really glad you reached out - feeling worried about STIs is very common, and you are not alone.**\n\n' +
          'I cannot diagnose you, but I can help with next steps.\n\n' +
          'To guide you safely, I will ask a few short triage questions.\n\n' +
          '**First question:** Are you having any symptoms right now, like:\n' +
          '- Burning or pain when you pee\n' +
          '- New discharge\n' +
          '- Sores, bumps, rashes, or itching?\n\n' +
          'You can reply **"yes"**, **"no"**, or **"not sure"**.',
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' },
          { label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' }
        ]
      };
    }

    // CHECK FOR POSSIBLE EXPOSURE (without explicitly saying STI)
    if (
      lowerQuery.includes('new partner') ||
      lowerQuery.includes('unprotected') ||
      lowerQuery.includes('without condom') ||
      lowerQuery.includes('no condom') ||
      lowerQuery.includes('condom broke') ||
      lowerQuery.includes('condom slipped') ||
      (lowerQuery.includes('oral') && lowerQuery.includes('sex')) ||
      (lowerQuery.includes('vaginal') && lowerQuery.includes('sex')) ||
      (lowerQuery.includes('anal') && lowerQuery.includes('sex'))
    ) {
      setTriageStage('symptomCheck');
      setTriageLock(true);
      return {
        content:
          '**Thanks for sharing that.**\n\n' +
          'That can be a reason to consider STI testing, even if you feel okay.\n' +
          'If you stay without symptoms, online testing is often used around **3 weeks** and again at **3 months** after contact.\n\n' +
          '**Quick check:** do you have any symptoms right now (burning when peeing, discharge, sores, rash, or itching)?\n\n' +
          'Reply **"yes"**, **"no"**, or **"not sure"** and I will guide your next step.',
        sources: [
          { label: 'SmartSexResource - STI Basics', url: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/' },
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ]
      };
    }
    
    // CHECK FOR PARTNER NOTIFICATION - "My partner has an STI"
    if ((lowerQuery.includes('partner') || lowerQuery.includes('boyfriend') || lowerQuery.includes('girlfriend') || 
         lowerQuery.includes('husband') || lowerQuery.includes('wife') || lowerQuery.includes('someone i')) && 
        (lowerQuery.includes('has') || lowerQuery.includes('got') || lowerQuery.includes('tested positive') || 
         lowerQuery.includes('diagnosed')) && 
        (lowerQuery.includes('sti') || lowerQuery.includes('std') || lowerQuery.includes('infection') || 
         lowerQuery.includes('chlamydia') || lowerQuery.includes('gonorrhea') || lowerQuery.includes('syphilis') || 
         lowerQuery.includes('herpes') || lowerQuery.includes('hpv') || lowerQuery.includes('hiv'))) {
      return {
        content: `**I'm here to support you.**\n\nIt takes courage to reach out. Let me help you figure out what to do next.\n\nBecause you had sex with someone who has an STI, it's best to **see a health care provider** rather than relying only on online testing.\n\nFirst - **do you know which STI your partner was diagnosed with?**\n\n(Different STIs have different testing timelines, so this helps me give you the right guidance. If you're not sure, that's okay - just let me know.)`,
        sources: [
          { label: 'SmartSexResource - Partner Notification', url: 'https://smartsexresource.com/sexually-transmitted-infections/partner-notification/' },
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ]
      };
    }
    
    // CHECK FOR "DO I HAVE AN STI" - Direct question
    if ((lowerQuery.includes('do i have') ||
         lowerQuery.includes('could i have') ||
         lowerQuery.includes('how do i know if i have') ||
         lowerQuery.includes('how can i know if i have') ||
         lowerQuery.includes('how do i tell if i have') ||
         lowerQuery.includes('how to know if i have')) && 
        (lowerQuery.includes('sti') || lowerQuery.includes('std') || lowerQuery.includes('infection'))) {
      setTriageStage('symptomCheck');
      setTriageLock(true);
      setSymptomStatus(null);
      return {
        content:
          '**I cannot tell you for sure if you have an STI, but I can guide you.**\n\n' +
          'The only way to know for sure is to get tested, but first let us check about symptoms.\n\n' +
          '**Right now, do you have any symptoms**, like:\n' +
          '- Burning or pain when you pee\n' +
          '- New discharge\n' +
          '- Sores, bumps, rashes, or itching?\n\n' +
          'You can reply **"yes"**, **"no"**, or **"not sure"**.',
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' },
          { label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' },
          { label: 'STIs at a Glance PDF', url: 'https://smartsexresource.com/wp-content/uploads/resources/STIs-at-a-Glance-pages_October_2024-1.pdf' }
        ]
      };
    }
    
    // PRIORITY 1: Check for multilingual resource requests
    const detectedTopic = detectSTITopic(lowerQuery);
    const detectedLanguage = detectLanguage(lowerQuery);
    
    if (detectedTopic && detectedLanguage) {
      const multilingualData = getMultilingualResource(detectedTopic, detectedLanguage, validatedResources);
      
      if (multilingualData) {
        const { resource, languageData, hasDirectPDF } = multilingualData;
        
        if (hasDirectPDF) {
          // Direct PDF available
          return {
            content: `**${resource.display} - ${detectedLanguage}**\n\nI've found the ${detectedLanguage} information sheet for ${resource.display}.\n\nPDF **${UX_COPY.cta_pdf}** using the link below.\n\n_${UX_COPY.footnote}_`,
            sources: [
              { label: `${resource.display} (${detectedLanguage})`, url: languageData.direct_pdf! }
            ]
          };
        } else {
          // No direct PDF - guide to resource page
          return {
            content: `**${resource.display} - ${detectedLanguage}**\n\nThe ${detectedLanguage} information sheet for ${resource.display} is available on SmartSexResource.\n\nPDF **${UX_COPY.cta_page}** using the link below, then select **"${detectedLanguage}"** under the language options on the page.\n\n${resource.notes ? `_Note: ${resource.notes}_\n\n` : ''}_${UX_COPY.footnote}_`,
            sources: [
              { label: `${resource.display} Resource Page`, url: resource.source_page }
            ]
          };
        }
      }
    }
    
    // If topic detected but no language, prompt for language
    if (detectedTopic && !detectedLanguage && (lowerQuery.includes('language') || lowerQuery.includes('translation'))) {
      const availableLanguages = getAvailableLanguages(detectedTopic);
      const resourceData = MULTILINGUAL_RESOURCES[detectedTopic];
      
      if (availableLanguages.length > 0) {
        return {
          content: `**${resourceData.display} - ${UX_COPY.prompt_language}**\n\nI can provide ${resourceData.display} information in the following languages:\n\n${availableLanguages.map(lang => `- ${lang}`).join('\n')}\n\nPlease tell me which language you need, for example:\n"${resourceData.display} in Farsi" or "${resourceData.display} in Spanish"`,
          sources: [
            { label: `${resourceData.display} Resources`, url: resourceData.source_page }
          ]
        };
      }
    }
    
    // Check for specific STI names (including common misspellings)
    const detectedStiTerm = detectStiTermInQuery(lowerQuery);
    if (detectedStiTerm) {
      const sti = getSTIInfo(detectedStiTerm);
      if (sti) {
        const sources: { label: string; url: string }[] = [
          { label: `SmartSexResource - ${sti.name}`, url: sti.source_url }
        ];
        
        return {
          content: formatSTIResponse(sti, lowerQuery),
          sources
        };
      }
    }

    // Check for symptom-related queries
    if (lowerQuery.includes('discharge') || lowerQuery.includes('burning') || 
        lowerQuery.includes('pain') || lowerQuery.includes('sore') || 
        lowerQuery.includes('itch') || lowerQuery.includes('rash')) {
      const stis = searchSTIsBySymptom(lowerQuery);
      if (stis.length > 0) {
        return {
          content: `Based on the symptoms you mentioned, several STIs could cause similar symptoms:\n\n${stis.slice(0, 3).map(sti => `- **${sti.name}**: ${sti.symptoms.common.slice(0, 2).join(', ')}`).join('\n')}\n\n**Important:** Many STIs have similar or no symptoms. The only way to know for sure is to get tested. ${stis[0].symptoms.often_asymptomatic ? 'Many people with STIs have no symptoms at all.' : ''}\n\nIf you're experiencing symptoms, I recommend:\n1. Get tested at a sexual health clinic\n2. Avoid sexual contact until tested\n3. Inform recent partners\n\nWould you like help finding a clinic near you?`,
          sources: [
            { label: 'SmartSexResource - STI Symptoms', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' },
            { label: 'STIs at a Glance PDF', url: 'https://smartsexresource.com/wp-content/uploads/resources/STIs-at-a-Glance-pages_October_2024-1.pdf' }
          ]
        };
      }
    }
    
    // Testing-related queries (short + interactive)
    if (lowerQuery.includes('test') || lowerQuery.includes('testing')) {
      if (lowerQuery.includes('how often') || lowerQuery.includes('frequency') || lowerQuery.includes('regularly')) {
        return {
          content:
            '**How often should I get tested?**\n\n' +
            '- Test every **3 to 12 months** if you have a new partner or more than one partner.\n' +
            '- Test sooner if you have symptoms.\n' +
            '- Test if a partner tells you they have an STI.',
          sources: [
            { label: 'SmartSexResource - STI Checklist', url: 'https://smartsexresource.com/clinics-testing/#sti-checklist' },
          ],
        };
      }

      // Recent exposure / risky behaviour
      if (
        (lowerQuery.includes('new partner') ||
          lowerQuery.includes('no condom') ||
          lowerQuery.includes('without condom') ||
          lowerQuery.includes('unprotected') ||
          lowerQuery.includes('condom broke') ||
          lowerQuery.includes('last week') ||
          lowerQuery.includes('recently')) &&
        (lowerQuery.includes('need') || lowerQuery.includes('should'))
      ) {
        return {
          content:
            '**Testing after recent sex that worries you**\n\n' +
            'If you had a new partner, no condom, or a condom break, testing is a good idea.\n\n' +
            '**Rough timing guide:**\n' +
            '- Chlamydia & gonorrhea: about **2 weeks** after sex\n' +
            '- HIV & syphilis: about **6 weeks** (sometimes a second test at 3 months)\n\n' +
            'What would you like to do next?\n' +
            '1. Type **"GetCheckedOnline"** for online testing.\n' +
            '2. Type **"find a clinic"** for in-person testing.\n' +
            '3. Or tell me more about your situation.',
          sources: [
            { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' },
            { label: 'GetCheckedOnline', url: 'https://getcheckedonline.com' },
            { label: 'SmartSexResource - Testing', url: 'https://smartsexresource.com/testing/' },
          ],
        };
      }

      // Window period question
      if (lowerQuery.includes('window') || lowerQuery.includes('how long') || lowerQuery.includes('when')) {
        return {
          content:
            '**STI testing "window periods" (short version)**\n\n' +
            '- Chlamydia & gonorrhea: test from **2 weeks** after sex\n' +
            '- HIV & syphilis: test around **6 weeks**, often repeat at **3 months**\n\n' +
            'If you test very early, some infections might not show up yet. Do you want a **link for online testing** or to **find a clinic**?',
          sources: [
            { label: 'SmartSexResource - Testing', url: 'https://smartsexresource.com/testing/' },
            {
              label: 'STIs at a Glance PDF',
              url: 'https://smartsexresource.com/wp-content/uploads/resources/STIs-at-a-Glance-pages_October_2024-1.pdf',
            },
          ],
        };
      }

      // General testing question
      return {
        content:
          '**STI testing options in BC**\n\n' +
          '- **No symptoms?** GetCheckedOnline can work well for routine screening and behaviour-change follow-up.\n' +
          '- **Have symptoms or partner known STI?** It is better to see a sexual health clinic/provider in person.\n' +
          '- **After exposure:** many people test around **3 weeks** and again at **3 months**.\n' +
          '- **How often:** usually every **3-12 months** (every **3-6 months** if higher risk; monthly is usually not needed).\n\n' +
          'See a provider if you need tests not offered online, support after sexual assault, or a printed named result.\n\n' +
          'You can type **"GetCheckedOnline"**, **"find a clinic"**, or tell me more about your situation.',
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' },
          { label: 'GetCheckedOnline', url: 'https://getcheckedonline.com' },
        ],
      };
    }
    
    // Clinic/location queries
    if (lowerQuery.includes('clinic') || lowerQuery.includes('location') || lowerQuery.includes('where')) {
      return {
        content: `**Finding Sexual Health Clinics in BC**\n\nI can help you locate sexual health clinics that offer:\n- Confidential STI testing & treatment\n- Contraception & birth control\n- Pregnancy testing & counseling\n- LGBTQ2S+ friendly services\n- No-cost or low-cost care\n\n**Clinic Features:**\n- Walk-in and appointment options\n- Youth-friendly environments\n- Multilingual services\n- Accessible facilities\n\nWould you like me to show clinics near you? I'll need your location or city.`,
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ]
      };
    }

    // PrEP/Prevention queries
    if (lowerQuery.includes('prep') || lowerQuery.includes('pep')) {
      const prepInfo = getPreventionInfo('prep');
      const pepInfo = getPreventionInfo('pep');
      
      if (lowerQuery.includes('pep')) {
        return {
          content: `**PEP (Post-Exposure Prophylaxis)**\n\n${pepInfo.name} is emergency medication to prevent HIV after potential exposure.\n\n**Critical Timing**: Must start within **72 hours** of exposure (sooner is better - ideally within 24 hours)\n\n**Duration**: ${pepInfo.duration}\n\n**When to consider PEP:**\n- Condom broke during sex with HIV+ partner or unknown status\n- Sexual assault\n- Needle stick injury\n- Shared needles\n\n**How to access**: Available 24/7 at:\n- Emergency departments\n- Sexual health clinics (during hours)\n- Some pharmacies (check BC PrEP program)\n\n**Cost**: Covered by BC PharmaCare and most insurance plans\n\nNote: **Time-sensitive**: If you need PEP, seek care immediately.`,
          sources: [
            { label: 'SmartSexResource - PEP', url: 'https://smartsexresource.com/hiv/pep/' },
            { label: 'SmartSexResource - PrEP', url: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/prep/' }
          ]
        };
      }
      
      return {
        content: `**PrEP (Pre-Exposure Prophylaxis)**\n\nPrEP is a medication that prevents HIV infection when taken as prescribed. It's ${prepInfo.effectiveness}.\n\n**Who should consider PrEP:**\n- Sexual partners of people with HIV\n- People who don't consistently use condoms\n- People with recent STI diagnosis\n- People who inject drugs\n- Men who have sex with men (MSM)\n\n**How it works:**\n- Daily pill (Truvada or generic)\n- Injectable option (Apretude) - every 2 months\n- Requires prescription and regular monitoring (every 3 months)\n\n**Coverage in BC:**\n${prepInfo.coverage}\n\n**How to access:**\n1. Talk to your doctor or sexual health clinic\n2. Get baseline HIV/kidney tests\n3. Start medication\n4. Regular follow-ups for monitoring\n\n**Cost**: Free or low-cost through BC PharmaCare\n\nWould you like help finding a PrEP provider?`,
        sources: [
          { label: 'SmartSexResource - PrEP', url: 'https://smartsexresource.com/hiv/prep/' },
          { label: 'SmartSexResource - PrEP', url: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/prep/' }
        ]
      };
    }

    // Prevention/condom queries (short overview)
    if (lowerQuery.includes('prevent') || lowerQuery.includes('condom') || lowerQuery.includes('protection')) {
      const condomInfo = getPreventionInfo('condoms');
      return {
        content:
          '**Ways to lower your STI risk**\n\n' +
          '**Condoms and barriers**\n' +
          `- ${condomInfo.effectiveness}\n` +
          `- Protects against many STIs, especially those in fluids (like chlamydia and gonorrhea)\n\n` +
          '**Other tools**\n' +
          '- Vaccines for HPV and hepatitis B\n' +
          '- PrEP to prevent HIV for people at higher risk\n' +
          '- Regular testing and honest talks with partners\n\n' +
          'Is there one method you want to know more about (condoms, PrEP, vaccines, or something else)?',
        sources: [
          { label: 'SmartSexResource - Safer Sex', url: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/safer-sex/' },
          { label: 'STIs at a Glance PDF', url: 'https://smartsexresource.com/wp-content/uploads/resources/STIs-at-a-Glance-pages_October_2024-1.pdf' }
        ]
      };
    }
    
    // Birth control / contraception queries
    if (lowerQuery.includes('birth control') || lowerQuery.includes('contraception') || lowerQuery.includes('contraceptive') ||
        lowerQuery.includes('the pill') || lowerQuery.includes('iud') || lowerQuery.includes('plan b') ||
        lowerQuery.includes('ring') || lowerQuery.includes('nuvaring') ||
        lowerQuery.includes('emergency contraception') || lowerQuery.includes('morning after') ||
        lowerQuery.includes('condom broke') || 
        ((lowerQuery.includes('miss') || lowerQuery.includes('forgot')) && lowerQuery.includes('pill')) ||
        (lowerQuery.includes('hormonal') && (lowerQuery.includes('method') || lowerQuery.includes('option')))) {

      // Missed pill guidance
      if ((lowerQuery.includes('miss') || lowerQuery.includes('forgot')) && lowerQuery.includes('pill')) {
        return {
          content:
            '**Missed birth control pill - what to do**\n\n' +
            '- Take the missed pill as soon as you remember.\n' +
            '- Then take your next pill at the usual time (this can mean 2 pills in one day).\n' +
            '- Use condoms until you have taken active pills for at least 7 days in a row.\n' +
            '- If unprotected sex happened after missed pills, emergency contraception may help.\n\n' +
            'If you want, I can help step-by-step based on how many pills were missed and when sex happened.',
          sources: [
            { label: 'HealthLinkBC File #91a - Hormonal Contraception', url: 'https://www.healthlinkbc.ca/healthlinkbc-files/hormonal-contraception' },
            { label: 'HealthLinkBC - Emergency Contraception', url: 'https://www.healthlinkbc.ca/health-topics/emergency-contraception' },
          ]
        };
      }

      // IUD type question (must come before generic "types of contraception")
      if (
        (lowerQuery.includes('iud') || lowerQuery.includes('intrauterine')) &&
        (lowerQuery.includes('type') || lowerQuery.includes('types') || lowerQuery.includes('what are'))
      ) {
        return {
          content:
            '**Types of IUDs**\n\n' +
            '- **Hormonal IUDs**: release progestin; often make periods lighter and less painful.\n' +
            '- **Copper IUD**: no hormones; can make periods heavier at first for some people.\n\n' +
            'Both are highly effective, long-acting, and reversible. The best choice depends on your period pattern, side effect preferences, and medical history.\n\n' +
            'If you want, I can compare hormonal vs copper IUDs in a quick side-by-side format.',
          sources: [
            { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' },
            { label: 'HealthLinkBC - IUD', url: 'https://www.healthlinkbc.ca/health-topics/intrauterine-device-iud-birth-control' }
          ]
        };
      }

      // Types/options overview
      if (
        lowerQuery.includes('different types') ||
        lowerQuery.includes('types of contraception') ||
        lowerQuery.includes('what are different types') ||
        lowerQuery.includes('what types') ||
        lowerQuery.includes('different methods') ||
        lowerQuery.includes('methods of birth control') ||
        lowerQuery.includes('methods of contraception') ||
        lowerQuery.includes('what methods') ||
        lowerQuery.includes('what kinds') ||
        lowerQuery.includes('kinds of birth control') ||
        lowerQuery.includes('options of contraception') ||
        lowerQuery.includes('contraception options') ||
        lowerQuery.includes('birth control options')
      ) {
        return {
          content:
            '**Main types of contraception**\n\n' +
            '- **Long-acting reversible contraception (LARC):** IUDs and implants (most effective, low maintenance)\n' +
            '- **Hormonal methods:** pill, patch, ring, injection\n' +
            '- **Barrier methods:** external/internal condoms, diaphragm\n' +
            '- **Emergency contraception:** Plan B, ella, copper IUD after unprotected sex\n' +
            '- **Permanent methods:** vasectomy, tubal sterilization\n\n' +
            'If you want, I can compare these by effectiveness, side effects, and cost in BC.',
          sources: [
            { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' },
            { label: 'HealthLinkBC - Hormonal Methods', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }
          ]
        };
      }

      // Most effective methods question
      if (
        lowerQuery.includes('most effective') ||
        lowerQuery.includes('best') ||
        lowerQuery.includes('highest effective') ||
        lowerQuery.includes('most reliable')
      ) {
        return {
          content:
            '**Most effective contraception options**\n\n' +
            '- **Implant** and **IUDs** are among the most effective (over 99%).\n' +
            '- **Sterilization** is also very effective and permanent.\n' +
            '- **Pill/patch/ring/shot** work well when used correctly, but are less effective with typical use.\n' +
            '- **Condoms** are important for STI protection, but are less effective for pregnancy prevention alone.\n\n' +
            'If you want, I can help compare options by effectiveness, side effects, and how long they last.',
          sources: [
            { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' },
            { label: 'SmartSexResource - Safer Sex', url: 'https://smartsexresource.com/sexually-transmitted-infections/sti-basics/safer-sex/' }
          ]
        };
      }

      // Pill effectiveness question
      if (
        (lowerQuery.includes('birth control') || lowerQuery.includes('contraception')) &&
        (lowerQuery.includes('effective') || lowerQuery.includes('effectiveness') || lowerQuery.includes('how effective')) &&
        !lowerQuery.includes('pill')
      ) {
        return {
          content:
            '**How effective is birth control overall?**\n\n' +
            '- **Most effective:** IUDs and implants (over 99%).\n' +
            '- **Pill/patch/ring/shot:** effective, but lower with typical use than with perfect use.\n' +
            '- **Condoms:** help prevent pregnancy and also reduce STI risk, but pregnancy prevention alone is less effective than LARC methods.\n\n' +
            'If you want, I can compare methods side-by-side for effectiveness and side effects.',
          sources: [
            { label: 'HealthLinkBC - Effectiveness Rate of Birth Control Methods', url: 'https://www.healthlinkbc.ca/healthwise/effectiveness-rate-birth-control-methods' },
            { label: 'HealthLinkBC - IUD (Intrauterine Device)', url: 'https://www.healthlinkbc.ca/healthwise/intrauterine-device-iud-birth-control' },
          ]
        };
      }

      // Pill effectiveness question
      if (
        (lowerQuery.includes('pill') || lowerQuery.includes('birth control pill') || lowerQuery.includes('oral contraceptive')) &&
        (lowerQuery.includes('effective') || lowerQuery.includes('effectiveness') || lowerQuery.includes('how effective'))
      ) {
        return {
          content:
            '**How effective is the birth control pill?**\n\n' +
            '- With **perfect use** (taken correctly every day): about **99% effective**.\n' +
            '- With **typical use**: about **91-93% effective**.\n' +
            '- Missing pills, taking pills late, or vomiting/diarrhea can lower effectiveness.\n' +
            '- The pill does **not** protect against STIs, so condoms are still important.\n\n' +
            'If you want, I can explain how to make pill use more effective or compare it with IUD/implant.',
          sources: [
            { label: 'HealthLinkBC - Birth Control Pills', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-pill' },
            { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }
          ]
        };
      }
      
      // Check for teen-friendly contraception FAQs first
      const contraceptionFAQ = searchContraceptionFAQs(lowerQuery);
      if (contraceptionFAQ) {
        return {
          content: contraceptionFAQ.answer,
          sources: contraceptionFAQ.sources
        };
      }
      
      // Emergency contraception specific (short)
      if (lowerQuery.includes('emergency') || lowerQuery.includes('plan b') || lowerQuery.includes('morning after') ||
          lowerQuery.includes('ella') || lowerQuery.includes('copper iud') && lowerQuery.includes('emergency')) {
        return {
          content:
            '**Emergency contraception (EC)**\n\n' +
            'EC can lower the chance of pregnancy after sex without protection or a condom problem.\n\n' +
            '**Main options in BC:**\n' +
            '- **Plan B** (pill you can buy at a pharmacy without a prescription)\n' +
            '- **ella** (prescription pill)\n' +
            '- **Copper IUD** (placed in the uterus at a clinic; most effective and can also be long-term birth control)\n\n' +
            'The sooner you take EC after sex, the better it works. Do you want help **finding a clinic or pharmacy**, or to know **which option might fit you**?',
          sources: [
            { label: 'HealthLinkBC - Emergency Contraception', url: 'https://www.healthlinkbc.ca/healthlinkbc-files/emergency-contraception' },
            { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }
          ]
        };
      }
      
      // IUD specific (short)
      if (lowerQuery.includes('iud') || lowerQuery.includes('intrauterine')) {
        return {
          content:
            '**IUDs (intrauterine devices)**\n\n' +
            'An IUD is a small device that sits inside the uterus and gives long-term birth control.\n\n' +
            '**Types in BC:**\n' +
            '- **Hormonal IUDs** - last 3-5 years, often make periods lighter\n' +
            '- **Copper IUD** - no hormones, lasts up to 10 years, can also be used as emergency contraception\n\n' +
            'Both are over 99% effective. They must be put in and taken out by a clinician. Do you want help **finding a clinic** or knowing **which type might fit you**?',
          sources: [
            { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' },
            { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }
          ]
        };
      }

      // Vaginal ring specific (short)
      if (lowerQuery.includes('ring') || lowerQuery.includes('nuvaring') || lowerQuery.includes('birth control ring')) {
        return {
          content:
            '**Birth control ring (vaginal ring)**\n\n' +
            '- The ring is a small flexible ring placed in the vagina that releases hormones to prevent pregnancy.\n' +
            '- Typical use is less effective than IUD/implant, but effective when used correctly.\n' +
            '- Common schedule: in for 3 weeks, out for 1 week (depends on product).\n' +
            '- It does **not** protect against STIs, so condoms may still be needed.\n\n' +
            'If you want, I can compare the ring with the pill, patch, IUD, or implant.',
          sources: [
            { label: 'HealthLinkBC - Birth Control Ring', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-ring' },
            { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }
          ]
        };
      }
      
      // The Pill specific (short)
      if (lowerQuery.includes('pill') || lowerQuery.includes('oral contraceptive')) {
        return {
          content:
            '**Birth control pills**\n\n' +
            'The pill is a daily hormone pill that helps prevent pregnancy.\n\n' +
            '**Big ideas:**\n' +
            '- Works well when taken every day around the same time\n' +
            '- Periods are often lighter and more regular\n' +
            '- Does **not** protect against STIs - you still need condoms for STI protection\n\n' +
            'Do you want to talk about **how to start the pill**, **side effects**, or **what to do if you miss a pill**?',
          sources: [
            { label: 'HealthLinkBC - Birth Control Pills', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-hormones-pill' },
            { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }
          ]
        };
      }
      
      // General birth control/contraception overview (short)
      return {
        content:
          '**Birth control options in BC (quick view)**\n\n' +
          '- **Long-acting**: IUDs and implants - "set it and forget it", very effective\n' +
          '- **Pills / patch / ring / shot**: Hormones you take regularly\n' +
          '- **Condoms**: Help prevent both pregnancy and STIs\n' +
          '- **Emergency contraception**: Used after sex if something went wrong\n\n' +
          'Is there one method you would like to focus on (IUD, pill, condoms, emergency contraception)?',
        sources: [
          { label: 'HealthLinkBC - Hormonal Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' },
          { label: 'HealthLinkBC - Birth Control Overview', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' },
          { label: 'HealthLinkBC - Birth Control', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }
        ]
      };
    }

    // Pregnancy questions (rule fallback when LLM is unavailable)
    if (
      lowerQuery.includes('pregnan') ||
      lowerQuery.includes('pregnant') ||
      lowerQuery.includes('missed period') ||
      lowerQuery.includes('pregnancy test')
    ) {
      return {
        content:
          '**How to know if you might be pregnant**\n\n' +
          '- The most reliable first step is a **home pregnancy test**.\n' +
          '- Tests are most accurate after a **missed period**.\n' +
          '- If negative but your period still does not come, repeat in **48-72 hours**.\n' +
          '- If you have severe pain, heavy bleeding, dizziness, or fainting, seek urgent care.\n\n' +
          'If you want, I can help with next steps based on when sex happened.',
        sources: [
          { label: 'HealthLinkBC - Pregnancy Tests', url: 'https://www.healthlinkbc.ca/healthwise/pregnancy-tests' },
          { label: 'HealthLinkBC - Family Planning', url: 'https://www.healthlinkbc.ca/health-topics/birth-control-pros-and-cons-hormonal-methods' }
        ]
      };
    }

    // Treatment queries
    if (lowerQuery.includes('treat') || lowerQuery.includes('cure')) {
      return {
        content: `**STI Treatment Overview**\n\n**Curable STIs (with antibiotics):**\n- Chlamydia\n- Gonorrhea\n- Syphilis\n- Trichomoniasis\n- Mycoplasma genitalium\n\n**Manageable but not curable (viral):**\n- **HIV**: Antiretroviral therapy (ART) - can achieve undetectable viral load (U=U)\n- **Herpes**: Antiviral medication reduces outbreaks and transmission\n- **HPV**: No treatment for virus; treatments available for warts and pre-cancerous changes\n- **Hepatitis B**: Monitored; antiviral therapy if chronic\n- **Hepatitis C**: Curable with direct-acting antivirals (8-12 weeks, 95%+ cure rate)\n\n**Important:**\n- Early treatment prevents complications\n- Partners should also be tested and treated\n- Complete full course of antibiotics\n- Avoid sex until treatment is complete\n- Retest after treatment (3 months for most STIs)\n\nAll STI treatment in BC is confidential and often free at sexual health clinics.`,
        sources: [
          { label: 'SmartSexResource - Treatment', url: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/' },
          { label: 'STIs at a Glance PDF', url: 'https://smartsexresource.com/wp-content/uploads/resources/STIs-at-a-Glance-pages_October_2024-1.pdf' }
        ]
      };
    }
    
    // Safety rail: out-of-scope requests should route users to nearby clinics
    const inScopeKeywords = [
      'sti', 'std', 'test', 'testing', 'symptom', 'clinic', 'contraception', 'birth control',
      'pregnan', 'hiv', 'prep', 'pep', 'condom', 'gonorrhea', 'chlamydia', 'syphilis',
      'herpes', 'hpv', 'hepatitis', 'plan b', 'emergency contraception', 'sexual health',
      'access code', 'privacy', 'share summary', 'handoff', 'unprotected', 'new partner',
      'oral sex', 'vaginal sex', 'anal sex', 'exposure', 'partner'
    ];
    const smallTalk = ['hi', 'hello', 'hey', 'yo', 'thanks', 'thank you', 'ok', 'okay', 'yes', 'no'];
    const isOutOfScope =
      lowerQuery.length > 6 &&
      !inScopeKeywords.some((k) => lowerQuery.includes(k)) &&
      !smallTalk.includes(lowerQuery.trim());

    if (isOutOfScope) {
      return {
        content:
          "We can't answer this - here are nearby clinics.\n\n" +
          'If you want, I can help you find a sexual health clinic near you in BC right now.',
        sources: [
          { label: 'SmartSexResource - Clinics & Testing', url: 'https://smartsexresource.com/clinics-testing/' }
        ],
      };
    }

    // FAQ queries - check before default response
    const faqs = searchFAQs(lowerQuery);
    if (faqs.length > 0) {
      const topFAQ = faqs[0];
      return {
        content: `${topFAQ.answer}`,
        sources: [
          { label: 'SmartSexResource - Answered Questions', url: 'https://smartsexresource.com/answered-questions/' }
        ]
      };
    }
    
    // Default response - short, simple overview
    return {
      content: `I can help you with questions about sexual health and STI testing.\n\n**I can help with:**\n- Basic STI information\n- When to get tested\n- Online testing with GetCheckedOnline\n- Finding nearby sexual health clinics\n- Safer sex and birth control\n\nTell me what you are worried or curious about.`,
      sources: [
        { label: 'SmartSexResource', url: 'https://smartsexresource.com' },
        { label: 'GetCheckedOnline', url: 'https://getcheckedonline.com' }
      ]
    };
  };

  const formatSTIResponse = (sti: any, query: string): string => {
    const lowerQuery = query.toLowerCase();
    const cleanTreatment = String(sti.treatment.type || '').replace(/\s+/g, ' ').trim();
    const symptomList = sti.symptoms.common.slice(0, 5).map((s: string) => `• ${s}`).join('\n');
    const transmissionList = sti.transmission.map((t: string) => `• ${t}`).join('\n');
    const preventionList = sti.prevention.slice(0, 3).map((p: string) => `• ${p}`).join('\n');
    const methodList = sti.testing.methods.map((m: string) => `• ${m}`).join('\n');
    const asymptomaticNote = sti.symptoms.often_asymptomatic
      ? '\n\n**Note:** Many people have no symptoms. Testing is the only way to know for sure.'
      : '';

    if (lowerQuery.includes('test')) {
      return (
        `**${sti.name} Testing**\n\n` +
        `**Test methods:**\n${methodList}\n\n` +
        `**When to test:** ${sti.testing.window_period}\n\n` +
        `**How often:** ${sti.testing.frequency_recommendation || 'Test if you have symptoms or a possible exposure.'}` +
        `${asymptomaticNote}\n\n` +
        'Would you like help finding a testing location in BC?'
      );
    }

    if (lowerQuery.includes('symptom')) {
      return (
        `**${sti.name} Symptoms**\n\n` +
        `**Common symptoms:**\n${symptomList}\n\n` +
        `**Typical timing:** ${sti.symptoms.timeline || 'Varies by person and exposure.'}` +
        `${asymptomaticNote}\n\n` +
        'If you have symptoms, in-person clinic testing is best. Do you want nearby clinic options?'
      );
    }

    if (lowerQuery.includes('treat') || lowerQuery.includes('cure')) {
      const complicationText =
        sti.complications && sti.complications.length > 0
          ? `\n\n**Without treatment, complications can include:**\n${sti.complications
              .slice(0, 4)
              .map((c: string) => `• ${c}`)
              .join('\n')}`
          : '';

      return (
        `**${sti.name} Treatment**\n\n` +
        `**Status:** ${sti.treatment.available ? cleanTreatment : 'Treatment options are available.'}\n\n` +
        `${sti.treatment.details}` +
        `${complicationText}\n\n` +
        '**Important:**\n' +
        '• Complete the full treatment\n' +
        '• Avoid sex until your provider says it is okay\n' +
        '• Partners should be tested and treated\n' +
        '• Retest in about 3 months when advised'
      );
    }

    if (lowerQuery.includes('prevent') || lowerQuery.includes('avoid')) {
      return (
        `**Preventing ${sti.name}**\n\n` +
        `**Lower your risk:**\n${preventionList}\n\n` +
        `**How it spreads:**\n${transmissionList}\n\n` +
        `${sti.name === 'HPV' ? '**Vaccine:** Gardasil 9 helps protect against common HPV types.\n\n' : ''}` +
        `${sti.name === 'Hepatitis B' ? '**Vaccine:** Hepatitis B vaccination is routine in BC.\n\n' : ''}` +
        `${sti.name === 'HIV' ? '**PrEP:** A daily prevention medication is available in BC.\n\n' : ''}` +
        'Want a prevention plan based on your situation?'
      );
    }

    return (
      `**${sti.name}** ${sti.alternativeNames ? `(${sti.alternativeNames.join(', ')})` : ''}\n\n` +
      `**Type:** ${sti.category.charAt(0).toUpperCase() + sti.category.slice(1)} infection\n\n` +
      `**How it spreads:**\n${transmissionList}\n\n` +
      `**Common symptoms:**\n${symptomList}` +
      `${asymptomaticNote}\n\n` +
      `**Testing:** ${sti.testing.methods[0]} (window period: ${sti.testing.window_period})\n\n` +
      `**Treatment:** ${cleanTreatment}\n\n` +
      `**Prevention:**\n${preventionList}\n\n` +
      'Would you like testing details, symptom details, or prevention details next?'
    );
  };
  const handleSummarySubmit = (formData: PatientSummaryFormData) => {
    const summary = generatePatientSummary(formData);
    setSummaryFormData(formData);
    setSummaryData(summary);
    sessionStorage.setItem(SUMMARY_FORM_STORAGE_KEY, JSON.stringify(formData));
    sessionStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summary));
    setShowSummaryForm(false);
    setShowSummaryView(true);
  };

  const handleSummaryEdit = () => {
    const prefill = buildSummaryPrefill();
    setSummaryFormData(prefill);
    sessionStorage.setItem(SUMMARY_FORM_STORAGE_KEY, JSON.stringify(prefill));
    setShowSummaryView(false);
    setShowSummaryForm(true);
  };

  const handleSummaryClose = () => {
    setShowSummaryView(false);
  };

  const handleStartNewSummary = () => {
    const prefill = buildSummaryPrefill();
    setSummaryFormData(prefill);
    setSummaryData(null);
    localStorage.removeItem(TRIAGE_DRAFT_STORAGE_KEY);
    sessionStorage.setItem(SUMMARY_FORM_STORAGE_KEY, JSON.stringify(prefill));
    sessionStorage.removeItem(SUMMARY_STORAGE_KEY);
    localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
    setShowSummaryView(false);
    setShowSummaryForm(true);
  };

  const handleFindClinic = () => {
    setShowSummaryView(false);
    // Navigate to clinic list page
    navigate('/clinics?from=chat&autoLocate=1');
  };

  const handleGetAccessCode = () => {
    setShowSummaryView(false);
    navigate('/share');
  };

  const summaryUpdatedLabel = summaryData
    ? new Date(summaryData.meta.created_at_iso).toLocaleString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="bg-[#003366] text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-semibold">SIA</h2>
            <p className="text-xs text-white/80">Private & Confidential</p>
          </div>
        </div>
        <button>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map(message => (
          <ChatBubble
            key={message.id}
            role={message.role}
            content={message.content}
            sources={message.sources}
          />
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <QuickActionChips />
        {summaryData && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSummaryView(true)}
            >
              View/Edit Summary
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartNewSummary}
            >
              Start New Note
            </Button>
            {summaryUpdatedLabel && (
              <p className="self-center text-xs text-gray-500 dark:text-gray-400">
                Last updated: {summaryUpdatedLabel}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!isGenerating) void handleSend();
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            size="icon"
            className="bg-[#003366] hover:bg-[#00A3A3]"
            disabled={isGenerating}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Patient Summary Form Overlay */}
      {showSummaryForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 md:p-6 overflow-y-auto">
          <div className="my-2 md:my-6 w-full">
            <PatientSummaryForm
              onSubmit={handleSummarySubmit}
              onCancel={() => setShowSummaryForm(false)}
              initialData={summaryFormData}
            />
          </div>
        </div>
      )}

      {/* Patient Summary View Overlay */}
      {showSummaryView && summaryData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="my-8">
            <PatientSummaryView
              data={summaryData}
              onEdit={handleSummaryEdit}
              onClose={handleSummaryClose}
              onFindClinic={handleFindClinic}
              onGetAccessCode={handleGetAccessCode}
            />
          </div>
        </div>
      )}
    </div>
  );
}











