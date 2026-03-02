import { PatientSummaryData, PatientSummaryFormData } from '../types/patientSummary';

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
  const contactDate = formData.contact_date 
    ? new Date(formData.contact_date).toISOString() 
    : new Date().toISOString();

  return {
    meta: {
      version: '1.0',
      created_at_iso: new Date().toISOString(),
      source: 'SmartSexResource (BC CDC) guidance for testing triggers and window periods'
    },
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
      details: formData.has_symptoms && formData.symptoms_list 
        ? formData.symptoms_list.split(',').map(s => s.trim())
        : [],
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
      list: formData.current_medications && formData.medications_list
        ? formData.medications_list.split(',').map(m => m.trim())
        : []
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
