import { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Download, Edit } from 'lucide-react';
import { PatientSummaryData } from '../types/patientSummary';
import { buildEmrIntakeNote, SharedSummaryRecord } from '../utils/sharedSummaryRegistry';

interface PatientSummaryViewProps {
  data: PatientSummaryData;
  onEdit: () => void;
  onClose: () => void;
  onFindClinic?: () => void;
  onGetAccessCode?: () => void;
}

export function PatientSummaryView({ data, onEdit, onClose, onFindClinic, onGetAccessCode }: PatientSummaryViewProps) {
  const [copied, setCopied] = useState(false);

  const generateTextSummary = () => {
    const pseudoRecord: SharedSummaryRecord = {
      code: 'PATIENT',
      expiresAtISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      sharedAtISO: data.meta.created_at_iso,
      summary: data,
    };
    return buildEmrIntakeNote(pseudoRecord);
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
    a.download = `SIA-FHIR-Summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto">
      <div className="bg-[#003366] text-white px-6 py-4 rounded-t-lg">
        <h3 className="text-xl font-semibold">Your Patient Summary</h3>
        <p className="text-sm text-white/80 mt-1">
          FHIR R4-aligned summary preview shared with clinic/provider.
        </p>
      </div>

      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{generateTextSummary()}</pre>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 space-y-4">
        <div className="flex gap-3">
          <Button onClick={handleCopy} variant="outline" className="flex-1 flex items-center justify-center gap-2">
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Save as Text
          </Button>
          <Button onClick={onEdit} variant="outline" className="flex-1 flex items-center justify-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">What would you like to do next?</p>
          <div className="flex gap-3">
            {onFindClinic && (
              <Button onClick={onFindClinic} className="flex-1 bg-[#00A3A3] hover:bg-[#003366] text-white">
                Find Nearby Clinic
              </Button>
            )}
            {onGetAccessCode && (
              <Button onClick={onGetAccessCode} variant="outline" className="flex-1">
                Get Access Code
              </Button>
            )}
            <Button onClick={onClose} variant="outline" className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
