import { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Download, Edit } from 'lucide-react';
import { PatientSummaryData } from '../types/patientSummary';

interface PatientSummaryViewProps {
  data: PatientSummaryData;
  onEdit: () => void;
  onClose: () => void;
  onFindClinic?: () => void;
}

export function PatientSummaryView({ data, onEdit, onClose, onFindClinic }: PatientSummaryViewProps) {
  const [copied, setCopied] = useState(false);

  const generateTextSummary = () => {
    const formatDate = (iso: string) => {
      const date = new Date(iso);
      return date.toLocaleString('en-CA', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return `SIA Patient Summary (for Public Health/Clinic Use)
Date/Time created: ${formatDate(data.meta.created_at_iso)}

REASON FOR VISIT
- ${data.encounter.reason_for_visit}

MOST RECENT SEXUAL CONTACT
- Date/Time (approx): ${formatDate(data.encounter.most_recent_contact_iso)}
- Types of sex: ${data.encounter.sex_types.join(', ')}
- Condom use: ${data.encounter.condom_use}${data.encounter.condom_issue ? `\n- Condom issue: ${data.encounter.condom_issue}` : ''}

SYMPTOMS
- Current symptoms: ${data.symptoms.has_symptoms ? 'Yes' : 'No'}${data.symptoms.has_symptoms ? `\n- Details: ${data.symptoms.details.join('; ')}` : ''}${data.symptoms.duration ? `\n- Duration: ${data.symptoms.duration}` : ''}

KNOWN EXPOSURE
- Partner known STI or recent positive: ${data.exposure.partner_known_sti}${data.exposure.notes ? `\n- Notes: ${data.exposure.notes}` : ''}

CURRENT MEDICATIONS FOR STI
- Receiving STI treatment now: ${data.medications.current_sti_tx ? 'Yes' : 'No'}${data.medications.list.length > 0 ? `\n- Meds: ${data.medications.list.join('; ')}` : ''}

OTHER CONTEXT
- Pregnancy possibility: ${data.risks_context.pregnancy_possible}
- Allergies/medications: ${data.risks_context.allergies_meds}

BC CDC–ALIGNED TESTING GUIDANCE (for staff discussion)
- Indications present today (per SmartSexResource/BC CDC): ${data.bc_cdc_testing_guidance.indications_met.join(', ')}
  [Source: SmartSexResource - https://smartsexresource.com/clinics-testing/]
- Window periods: ${data.bc_cdc_testing_guidance.window_period_note}
  [Source: SmartSexResource - https://smartsexresource.com/testing/]
- Clinic access: Testing locations can be found via the BC CDC Clinic Finder
  [Source: SmartSexResource - https://smartsexresource.com/get-tested/clinic-finder/]

PATIENT COMMUNICATION PREFERENCES
- Preferred language for handouts: ${data.patient.preferred_language}${data.language_resources.request_language_handouts ? `\n- Requested topics: ${data.language_resources.topics_requested.join(', ')} (links available on request)` : ''}

SOURCES (BC-APPROVED)
- SmartSexResource (BC CDC): When to test & clinic finder
  → https://smartsexresource.com/clinics-testing/
- SmartSexResource: STI Basics & window periods
  → https://smartsexresource.com/testing/
- SmartSexResource: STIs at a Glance PDF
  → https://smartsexresource.com/wp-content/uploads/resources/STIs-at-a-Glance-pages_October_2024-1.pdf

(Operated by BC Centre for Disease Control under PHSA, aligned with BC Ministry of Health.)`;
  };

  const handleCopy = async () => {
    const text = generateTextSummary();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const text = generateTextSummary();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIA-Patient-Summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-[#003366] text-white px-6 py-4 rounded-t-lg">
        <h3 className="text-xl font-semibold">Your Patient Summary</h3>
        <p className="text-sm text-white/80 mt-1">
          Review your summary below. You can copy, download, or edit before sharing.
        </p>
      </div>

      {/* Summary Content */}
      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {generateTextSummary()}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Save as Text
          </Button>
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            What would you like to do next?
          </p>
          <div className="flex gap-3">
            {onFindClinic && (
              <Button
                onClick={onFindClinic}
                className="flex-1 bg-[#00A3A3] hover:bg-[#003366] text-white"
              >
                Find Nearby Clinic
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
