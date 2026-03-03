import { PatientSummaryData } from '../types/patientSummary';

export const SHARED_SUMMARY_REGISTRY_KEY = 'sia_shared_summaries_v1';

export interface ProviderEdits {
  reason_for_visit: string;
  symptoms_details: string;
  exposure_notes: string;
  provider_assessment: string;
  provider_plan: string;
}

export interface SharedSummaryRecord {
  code: string;
  expiresAtISO: string;
  sharedAtISO: string;
  summary: PatientSummaryData;
  reviewedAtISO?: string;
  addedToEmrAtISO?: string;
  providerEditedAtISO?: string;
  providerEdits?: ProviderEdits;
}

type SharedSummaryRegistry = Record<string, SharedSummaryRecord>;

export function loadSharedSummaryRegistry(): SharedSummaryRegistry {
  try {
    const raw = localStorage.getItem(SHARED_SUMMARY_REGISTRY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SharedSummaryRegistry;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveSharedSummaryRegistry(registry: SharedSummaryRegistry): void {
  localStorage.setItem(SHARED_SUMMARY_REGISTRY_KEY, JSON.stringify(registry));
}

export function upsertSharedSummaryRecord(code: string, expiresAtISO: string, summary: PatientSummaryData): void {
  const registry = loadSharedSummaryRegistry();
  const existing = registry[code];
  registry[code] = {
    code,
    expiresAtISO,
    sharedAtISO: existing?.sharedAtISO || new Date().toISOString(),
    summary,
    reviewedAtISO: existing?.reviewedAtISO,
    addedToEmrAtISO: existing?.addedToEmrAtISO,
    providerEditedAtISO: existing?.providerEditedAtISO,
    providerEdits: existing?.providerEdits,
  };
  saveSharedSummaryRegistry(registry);
}

export function getSharedSummaryRecord(code: string): SharedSummaryRecord | null {
  const registry = loadSharedSummaryRegistry();
  const record = registry[code];
  if (!record) return null;
  const expiryMs = Date.parse(record.expiresAtISO);
  if (Number.isNaN(expiryMs) || Date.now() > expiryMs) return null;
  return record;
}

export function saveSharedSummaryRecord(record: SharedSummaryRecord): void {
  const registry = loadSharedSummaryRegistry();
  registry[record.code] = record;
  saveSharedSummaryRegistry(registry);
}
