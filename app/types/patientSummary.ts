// Patient Summary Types for Clinic Handoff

export interface PatientSummaryData {
  meta: {
    version: string;
    created_at_iso: string;
    source: string;
  };
  patient: {
    initials_or_alias: string;
    preferred_language: string;
  };
  encounter: {
    reason_for_visit: string;
    most_recent_contact_iso: string;
    sex_types: string[];
    condom_use: string;
    condom_issue: string | null;
  };
  symptoms: {
    has_symptoms: boolean;
    details: string[];
    duration: string | null;
  };
  exposure: {
    partner_known_sti: string;
    notes: string;
  };
  medications: {
    current_sti_tx: boolean;
    list: string[];
  };
  risks_context: {
    pregnancy_possible: string;
    allergies_meds: string;
  };
  bc_cdc_testing_guidance: {
    indications_met: string[];
    window_period_note: string;
  };
  language_resources: {
    request_language_handouts: boolean;
    topics_requested: string[];
    delivery_preference: string;
  };
}

export interface PatientSummaryFormData {
  what_happened: string;
  contact_date: string;
  sex_types: string[];
  condom_use: string;
  has_symptoms: boolean;
  symptoms_list: string;
  symptom_duration: string;
  partner_known_sti: string;
  current_medications: boolean;
  medications_list: string;
  pregnancy_possible: string;
  allergies_meds: string;
  preferred_language: string;
}
