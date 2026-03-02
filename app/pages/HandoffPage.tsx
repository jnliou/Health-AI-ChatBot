import { useState } from 'react';
import { ArrowLeft, FileText, Share2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { PatientSummaryForm } from '../components/PatientSummaryForm';
import { generatePatientSummary } from '../utils/patientSummaryUtils';
import { PatientSummaryFormData } from '../types/patientSummary';

export function HandoffPage() {
  const navigate = useNavigate();
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showTriageForm, setShowTriageForm] = useState(false);
  const [savedFormData, setSavedFormData] = useState<PatientSummaryFormData | null>(null);
  const [consents, setConsents] = useState({
    understand: false,
    share: false,
    encrypted: false,
  });

  const canProceed = Object.values(consents).every(v => v);

  const SUMMARY_STORAGE_KEY = 'sia_patient_summary_v1';
  const SUMMARY_FORM_STORAGE_KEY = 'sia_patient_summary_form_v1';

  const handleGenerateSummary = () => {
    if (canProceed) {
      setShowConsentDialog(false);
      setShowTriageForm(true);
    }
  };

  const handleTriageSubmit = (formData: PatientSummaryFormData) => {
    const summary = generatePatientSummary(formData);
    setSavedFormData(formData);
    localStorage.setItem(SUMMARY_FORM_STORAGE_KEY, JSON.stringify(formData));
    localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summary));
    setShowTriageForm(false);
    navigate('/share');
  };

  // Mock FHIR-style summary data
  const summaryData = {
    'Chief Concern': 'Routine STI testing / Symptomatic visit',
    'Symptoms': 'Unusual discharge, mild discomfort',
    'Onset': '5 days ago',
    'Sexual History': 'Active, multiple partners in last 6 months',
    'Recent Exposure': 'Within 2 weeks',
    'Previous Testing': 'Last tested 6 months ago - negative',
    'Current Medications': 'None',
    'Allergies': 'No known drug allergies',
    'Pregnancy Status': 'Not applicable / Not pregnant',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/clinics')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Switch to Patient</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consent to share your triage summary with your clinic
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <Card className="border-[#00A3A3]">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-[#00A3A3] shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">About Smart Handoff</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Smart Handoff creates a secure, encrypted summary of your triage that you can share with your healthcare provider. This helps them prepare for your visit and provide better care.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Health Summary (Preview)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(summaryData).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {key}
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {value}
                </dd>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* What Gets Shared */}
        <Card>
          <CardHeader>
            <CardTitle>What Gets Shared</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Symptoms and duration</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Sexual health history</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Current medications and allergies</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>Your name or personal identifiers</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>Your chat messages</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Consent Checkboxes */}
        <Card>
          <CardHeader>
            <CardTitle>Your Consent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="understand"
                checked={consents.understand}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, understand: checked as boolean })
                }
              />
              <Label htmlFor="understand" className="cursor-pointer leading-relaxed">
                I understand what information will be shared with my healthcare provider
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="share"
                checked={consents.share}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, share: checked as boolean })
                }
              />
              <Label htmlFor="share" className="cursor-pointer leading-relaxed">
                I consent to sharing this health summary with the clinic I selected
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="encrypted"
                checked={consents.encrypted}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, encrypted: checked as boolean })
                }
              />
              <Label htmlFor="encrypted" className="cursor-pointer leading-relaxed">
                I understand this data is encrypted and will auto-delete after 14 days
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full bg-[#003366] hover:bg-[#00A3A3]"
            size="lg"
            disabled={!canProceed}
            onClick={() => setShowConsentDialog(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Continue to Triage Questions
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/clinics')}
          >
            Go Back
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Continue to Triage Questions?</AlertDialogTitle>
            <AlertDialogDescription>
              Next, you'll answer standard STI triage questions to create a clearer clinic summary. After that, we will generate your secure 6-character code and QR.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#003366] hover:bg-[#00A3A3]"
              onClick={handleGenerateSummary}
            >
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showTriageForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="my-8">
            <PatientSummaryForm
              onSubmit={handleTriageSubmit}
              onCancel={() => setShowTriageForm(false)}
              initialData={savedFormData}
            />
          </div>
        </div>
      )}
    </div>
  );
}
