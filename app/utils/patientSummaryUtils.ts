import { FhirBundle, FhirBundleEntry, PatientSummaryData, PatientSummaryFormData } from '../types/patientSummary';

function makeId(prefix: string): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rnd}`;
}

function toIsoOrNow(value: string): string {
  if (!value) return new Date().toISOString();
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return new Date().toISOString();
  return new Date(parsed).toISOString();
}

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function generatePatientSummary(formData: PatientSummaryFormData): PatientSummaryData {
  // Determine testing indications based on form data
  const indications: string[] = [];
  
  if (formData.condom_use === 'no condom') {
    indications.push('Sex without a condom');
  }
  if (formData.condom_use === 'condom broke') {
    indications.push('Condom break');
  }
  if (formData.what_happened.toLowerCase().includes('new partner')) {
    indications.push('New sexual partner');
  }
  if (formData.has_symptoms) {
    indications.push('Symptoms present');
  }
  if (formData.partner_known_sti === 'yes') {
    indications.push('Partner with known STI');
  }
  
  // If no specific indications, add general one
  if (indications.length === 0) {
    indications.push('Recent sexual contact');
  }

  // Parse contact date
  const createdAtISO = new Date().toISOString();
  const contactDate = toIsoOrNow(formData.contact_date);
  const symptoms = formData.has_symptoms && formData.symptoms_list ? splitCsv(formData.symptoms_list) : [];
  const medications = formData.current_medications && formData.medications_list ? splitCsv(formData.medications_list) : [];

  // FHIR R4 document bundle resources
  const compositionId = makeId('composition');
  const patientId = makeId('patient');
  const encounterId = makeId('encounter');
  const conditionId = makeId('condition');
  const symptomObservationId = makeId('observation-symptoms');
  const exposureObservationId = makeId('observation-exposure');
  const allergiesId = makeId('allergy');
  const medsId = makeId('medicationstatement');
  const carePlanId = makeId('careplan');

  const composition = {
    resourceType: 'Composition',
    id: compositionId,
    status: 'final',
    type: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '60591-5',
          display: 'Patient summary Document',
        },
      ],
      text: 'STI triage patient summary',
    },
    date: createdAtISO,
    title: 'STI Triage Summary',
    confidentiality: 'N',
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
    author: [{ display: 'SIA Assistant' }],
    section: [
      {
        title: 'Reason for visit',
        code: { text: 'Chief concern' },
        entry: [{ reference: `Condition/${conditionId}` }],
      },
      {
        title: 'Symptoms',
        code: { text: 'Symptoms and duration' },
        entry: [{ reference: `Observation/${symptomObservationId}` }],
      },
      {
        title: 'Exposure and risk',
        code: { text: 'Exposure history' },
        entry: [{ reference: `Observation/${exposureObservationId}` }],
      },
      {
        title: 'Allergies and medications',
        code: { text: 'Medication and allergy context' },
        entry: [
          { reference: `AllergyIntolerance/${allergiesId}` },
          { reference: `MedicationStatement/${medsId}` },
        ],
      },
      {
        title: 'Testing plan',
        code: { text: 'Testing recommendations' },
        entry: [{ reference: `CarePlan/${carePlanId}` }],
      },
    ],
  };

  const patient = {
    resourceType: 'Patient',
    id: patientId,
    active: true,
    language: formData.preferred_language || 'English',
    identifier: [
      {
        system: 'urn:ietf:rfc:3986',
        value: 'urn:uuid:patient-alias',
      },
    ],
  };

  const encounter = {
    resourceType: 'Encounter',
    id: encounterId,
    status: 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory',
    },
    subject: { reference: `Patient/${patientId}` },
    period: {
      start: contactDate,
      end: createdAtISO,
    },
    reasonCode: [{ text: formData.what_happened || 'STI concern' }],
  };

  const condition = {
    resourceType: 'Condition',
    id: conditionId,
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
        },
      ],
    },
    verificationStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'unconfirmed',
        },
      ],
    },
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
    code: { text: 'Concern for sexually transmitted infection' },
    recordedDate: createdAtISO,
    note: [{ text: formData.what_happened || 'Patient requesting STI assessment' }],
  };

  const symptomObservation = {
    resourceType: 'Observation',
    id: symptomObservationId,
    status: 'final',
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '75325-1',
          display: 'Sexual health symptoms Narrative',
        },
      ],
      text: 'STI symptoms',
    },
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
    effectiveDateTime: createdAtISO,
    valueString: formData.has_symptoms
      ? `${symptoms.join(', ') || 'Symptoms reported'}${formData.symptom_duration ? ` (duration: ${formData.symptom_duration})` : ''}`
      : 'No current symptoms reported',
  };

  const exposureObservation = {
    resourceType: 'Observation',
    id: exposureObservationId,
    status: 'final',
    code: {
      text: 'Sexual exposure and condom use',
    },
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
    effectiveDateTime: contactDate,
    valueString: `Sex types: ${formData.sex_types.join(', ') || 'Not provided'}; Condom use: ${formData.condom_use}; Partner known STI: ${formData.partner_known_sti}`,
  };

  const allergyIntolerance = {
    resourceType: 'AllergyIntolerance',
    id: allergiesId,
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
          code: 'active',
        },
      ],
    },
    patient: { reference: `Patient/${patientId}` },
    code: {
      text: formData.allergies_meds || 'NKDA',
    },
    note: [{ text: formData.allergies_meds || 'NKDA' }],
  };

  const medicationStatement = {
    resourceType: 'MedicationStatement',
    id: medsId,
    status: formData.current_medications ? 'active' : 'not-taken',
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: createdAtISO,
    medicationCodeableConcept: {
      text: formData.current_medications ? medications.join(', ') || 'Current STI treatment (details not specified)' : 'No current STI medications',
    },
  };

  const carePlan = {
    resourceType: 'CarePlan',
    id: carePlanId,
    status: 'active',
    intent: 'plan',
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
    description: 'STI testing and follow-up plan based on current risk and symptoms.',
    activity: [
      ...indications.map((indication) => ({
        detail: {
          status: 'scheduled',
          description: `Testing indication: ${indication}`,
        },
      })),
      {
        detail: {
          status: 'scheduled',
          description:
            'Window period note: Some tests are most accurate after a delay (for example, 2 weeks for chlamydia/gonorrhea, around 6 weeks for HIV 4th generation; repeat testing may be needed).',
        },
      },
    ],
  };

  const entries: FhirBundleEntry[] = [
    { fullUrl: `urn:uuid:${compositionId}`, resource: composition },
    { fullUrl: `urn:uuid:${patientId}`, resource: patient },
    { fullUrl: `urn:uuid:${encounterId}`, resource: encounter },
    { fullUrl: `urn:uuid:${conditionId}`, resource: condition },
    { fullUrl: `urn:uuid:${symptomObservationId}`, resource: symptomObservation },
    { fullUrl: `urn:uuid:${exposureObservationId}`, resource: exposureObservation },
    { fullUrl: `urn:uuid:${allergiesId}`, resource: allergyIntolerance },
    { fullUrl: `urn:uuid:${medsId}`, resource: medicationStatement },
    { fullUrl: `urn:uuid:${carePlanId}`, resource: carePlan },
  ];

  const fhirBundle: FhirBundle = {
    resourceType: 'Bundle',
    type: 'document',
    id: makeId('bundle'),
    timestamp: createdAtISO,
    identifier: {
      system: 'urn:ietf:rfc:3986',
      value: `urn:uuid:${makeId('doc')}`,
    },
    entry: entries,
  };

  return {
    meta: {
      version: '1.0',
      created_at_iso: createdAtISO,
      source: 'SmartSexResource (BC CDC) guidance for testing triggers and window periods'
    },
    fhir_r4_bundle: fhirBundle,
    patient: {
      initials_or_alias: 'Patient',
      preferred_language: formData.preferred_language
    },
    encounter: {
      reason_for_visit: formData.what_happened,
      most_recent_contact_iso: contactDate,
      sex_types: formData.sex_types,
      condom_use: formData.condom_use,
      condom_issue: formData.condom_use === 'condom broke' ? 'Condom broke during contact' : null
    },
    symptoms: {
      has_symptoms: formData.has_symptoms,
      details: symptoms,
      duration: formData.has_symptoms && formData.symptom_duration
        ? formData.symptom_duration
        : null
    },
    exposure: {
      partner_known_sti: formData.partner_known_sti,
      notes: ''
    },
    medications: {
      current_sti_tx: formData.current_medications,
      list: medications
    },
    risks_context: {
      pregnancy_possible: formData.pregnancy_possible,
      allergies_meds: formData.allergies_meds || 'NKDA'
    },
    bc_cdc_testing_guidance: {
      indications_met: indications,
      window_period_note: 'Some tests are most accurate only after a certain number of days since contact (e.g., 2 weeks for chlamydia/gonorrhea, 6 weeks for HIV with 4th generation test). Consider repeat testing if done early.'
    },
    language_resources: {
      request_language_handouts: formData.preferred_language !== 'English',
      topics_requested: formData.has_symptoms 
        ? ['Chlamydia', 'Gonorrhea', 'Testing & Treatment']
        : ['General STI Information', 'Testing'],
      delivery_preference: 'links_only'
    }
  };
}
