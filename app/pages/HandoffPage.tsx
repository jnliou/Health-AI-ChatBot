import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Share2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
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
import { buildEmrIntakeNote, SharedSummaryRecord } from '../utils/sharedSummaryRegistry';

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
  const [patientFullName, setPatientFullName] = useState('');
  const [patientDobISO, setPatientDobISO] = useState('');
  const [summaryPreview, setSummaryPreview] = useState<ReturnType<typeof generatePatientSummary> | null>(null);

  const consentComplete = Object.values(consents).every(v => v);
  const canProceed = consentComplete && patientFullName.trim().length > 1 && !!patientDobISO;

  const SUMMARY_STORAGE_KEY = 'sia_patient_summary_v1';
  const SUMMARY_FORM_STORAGE_KEY = 'sia_patient_summary_form_v1';
  const HANDOFF_IDENTITY_STORAGE_KEY = 'sia_handoff_identity_v1';

  useEffect(() => {
    try {
      const identityRaw = sessionStorage.getItem(HANDOFF_IDENTITY_STORAGE_KEY);
      if (identityRaw) {
        const parsed = JSON.parse(identityRaw) as { fullName?: string; dateOfBirthISO?: string };
        if (typeof parsed.fullName === 'string') setPatientFullName(parsed.fullName);
        if (typeof parsed.dateOfBirthISO === 'string') setPatientDobISO(parsed.dateOfBirthISO);
      }
      const formRaw = sessionStorage.getItem(SUMMARY_FORM_STORAGE_KEY);
      if (formRaw) {
        setSavedFormData(JSON.parse(formRaw) as PatientSummaryFormData);
      }
      const summaryRaw = sessionStorage.getItem(SUMMARY_STORAGE_KEY);
      if (summaryRaw) {
        setSummaryPreview(JSON.parse(summaryRaw));
      }
    } catch {
      // Ignore malformed storage values.
    }
  }, []);

  const handleGenerateSummary = () => {
    if (canProceed) {
      sessionStorage.setItem(
        HANDOFF_IDENTITY_STORAGE_KEY,
        JSON.stringify({
          fullName: patientFullName.trim(),
          dateOfBirthISO: patientDobISO,
          consentedAtISO: new Date().toISOString(),
        })
      );
      setShowConsentDialog(false);
      setShowTriageForm(true);
    }
  };

  const handleTriageSubmit = (formData: PatientSummaryFormData) => {
    const summary = generatePatientSummary(formData);
    setSavedFormData(formData);
    sessionStorage.setItem(SUMMARY_FORM_STORAGE_KEY, JSON.stringify(formData));
    sessionStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summary));
    setSummaryPreview(summary);
    setShowTriageForm(false);
    navigate('/share');
  };

  const handoffPreviewText = useMemo(() => {
    if (!summaryPreview) {
      return (
        'EMR Import - STI Triage Summary (Patient-Provided)\n' +
        `Patient Name: ${patientFullName.trim() || '[Not provided]'}\n` +
        `Date of Birth: ${patientDobISO || '[Not provided]'}\n\n` +
        'Complete triage questions to generate full summary preview.'
      );
    }

    const previewRecord: SharedSummaryRecord = {
      code: 'PREVIEW',
      expiresAtISO: new Date(Date.now() + (1000 * 60 * 60 * 24 * 14)).toISOString(),
      sharedAtISO: new Date().toISOString(),
      summary: summaryPreview,
      patientIdentity: {
        fullName: patientFullName.trim(),
        dateOfBirthISO: patientDobISO,
      },
    };

    return buildEmrIntakeNote(previewRecord);
  }, [summaryPreview, patientDobISO, patientFullName]);

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
              Your Health Summary (Provider View Preview)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-[40vh]">
              {handoffPreviewText}
            </pre>
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
                <span>Anything you did not consent to share</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>Your chat messages</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Identity (Required for Handoff)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handoff-full-name">Full name</Label>
              <Input
                id="handoff-full-name"
                value={patientFullName}
                onChange={(e) => setPatientFullName(e.target.value)}
                placeholder="Enter patient full name"
                disabled={!consentComplete}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handoff-dob">Date of birth</Label>
              <Input
                id="handoff-dob"
                type="date"
                value={patientDobISO}
                onChange={(e) => setPatientDobISO(e.target.value)}
                disabled={!consentComplete}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {consentComplete
                ? 'Name and DOB will be included in the provider note.'
                : 'Complete consent checkboxes first, then enter name and date of birth.'}
            </p>
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
              Next, you'll answer standard STI triage questions to create a clearer clinic summary. After that, we will generate your secure 6-character access code.
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
