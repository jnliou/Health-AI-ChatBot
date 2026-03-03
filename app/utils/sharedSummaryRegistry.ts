import { PatientSummaryData } from '../types/patientSummary';

export const SHARED_SUMMARY_REGISTRY_KEY = 'sia_shared_summaries_v1';

export interface ProviderEdits {
  reason_for_visit: string;
  symptoms_details: string;
  exposure_notes: string;
  provider_assessment: string;
  provider_plan: string;
}

export interface PatientIdentity {
  fullName: string;
  dateOfBirthISO: string;
  consentedAtISO?: string;
}

export interface SharedSummaryRecord {
  code: string;
  expiresAtISO: string;
  sharedAtISO: string;
  summary: PatientSummaryData;
  patientIdentity?: PatientIdentity;
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

export function upsertSharedSummaryRecord(
  code: string,
  expiresAtISO: string,
  summary: PatientSummaryData,
  patientIdentity?: PatientIdentity
): void {
  const registry = loadSharedSummaryRegistry();
  const existing = registry[code];
  registry[code] = {
    code,
    expiresAtISO,
    sharedAtISO: existing?.sharedAtISO || new Date().toISOString(),
    summary,
    patientIdentity: patientIdentity || existing?.patientIdentity,
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

export function buildEmrIntakeNote(record: SharedSummaryRecord, edits?: ProviderEdits): string {
  const s = record.summary;
  const e = edits || record.providerEdits;
  const patientName = record.patientIdentity?.fullName || '[Not provided]';
  const patientDob = record.patientIdentity?.dateOfBirthISO
    ? new Date(record.patientIdentity.dateOfBirthISO).toLocaleDateString('en-CA')
    : '[Not provided]';
  const bundleId = s.fhir_r4_bundle?.id || '[Not available]';
  const compositionEntry = s.fhir_r4_bundle?.entry?.find((x) => x.resource.resourceType === 'Composition');
  const compositionId = compositionEntry?.resource?.id || '[Not available]';

  return (
    `FHIR R4 Clinical Document - STI Triage Summary\n` +
    `Bundle ID: ${bundleId}\n` +
    `Composition ID: ${compositionId}\n` +
    `Access Code: ${record.code}\n` +
    `Patient Name: ${patientName}\n` +
    `Date of Birth: ${patientDob}\n` +
    `Shared: ${new Date(record.sharedAtISO).toLocaleString('en-CA')}\n` +
    `Reviewed: ${record.reviewedAtISO ? new Date(record.reviewedAtISO).toLocaleString('en-CA') : 'Not yet confirmed'}\n\n` +
    `SECTION: CHIEF CONCERN\n${e?.reason_for_visit || s.encounter.reason_for_visit}\n\n` +
    `SECTION: ENCOUNTER\n` +
    `- Most recent contact: ${new Date(s.encounter.most_recent_contact_iso).toLocaleString('en-CA')}\n` +
    `- Sex types: ${s.encounter.sex_types.join(', ') || 'Not provided'}\n` +
    `- Condom use: ${s.encounter.condom_use}\n\n` +
    `SECTION: SYMPTOMS\n` +
    `- Current symptoms: ${s.symptoms.has_symptoms ? 'Yes' : 'No'}\n` +
    `- Details: ${e?.symptoms_details || s.symptoms.details.join(', ') || 'None documented'}\n` +
    `- Duration: ${s.symptoms.duration || 'Not documented'}\n\n` +
    `SECTION: EXPOSURE\n` +
    `- Partner known STI: ${s.exposure.partner_known_sti}\n` +
    `- Notes: ${e?.exposure_notes || s.exposure.notes || 'None'}\n\n` +
    `SECTION: PROVIDER ASSESSMENT\n${e?.provider_assessment || '[Pending provider entry]'}\n\n` +
    `SECTION: PLAN\n${e?.provider_plan || '[Pending provider entry]'}\n\n` +
    `FHIR RESOURCES INCLUDED\n` +
    `${(s.fhir_r4_bundle?.entry || []).map((entry) => `- ${entry.resource.resourceType}/${entry.resource.id}`).join('\n') || '- [Not available]'}\n`
  );
}
