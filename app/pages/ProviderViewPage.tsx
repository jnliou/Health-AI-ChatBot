import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Copy, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import {
  ProviderEdits,
  getSharedSummaryRecord,
  saveSharedSummaryRecord,
} from '../utils/sharedSummaryRegistry';

function buildProviderEditsFromSummary(code: string): ProviderEdits {
  const record = getSharedSummaryRecord(code);
  const s = record?.summary;
  if (!s) {
    return {
      reason_for_visit: '',
      symptoms_details: '',
      exposure_notes: '',
      provider_assessment: '',
      provider_plan: '',
    };
  }
  return {
    reason_for_visit: s.encounter.reason_for_visit || '',
    symptoms_details: s.symptoms.details.join(', ') || '',
    exposure_notes: s.exposure.notes || '',
    provider_assessment: '',
    provider_plan: '',
  };
}

export function ProviderViewPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [codeInput, setCodeInput] = useState((params.code || '').toUpperCase());
  const [isEditing, setIsEditing] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const activeCode = useMemo(() => (params.code || codeInput || '').toUpperCase(), [params.code, codeInput]);
  const record = useMemo(
    () => (activeCode ? getSharedSummaryRecord(activeCode) : null),
    [activeCode]
  );

  const [edits, setEdits] = useState<ProviderEdits>(() => buildProviderEditsFromSummary(params.code || ''));

  const emrNoteText = useMemo(() => {
    if (!record) return '';
    const s = record.summary;
    return (
      `EMR Import - STI Triage Summary (Patient-Provided)\n` +
      `Access Code: ${record.code}\n` +
      `Shared: ${new Date(record.sharedAtISO).toLocaleString('en-CA')}\n` +
      `Reviewed: ${record.reviewedAtISO ? new Date(record.reviewedAtISO).toLocaleString('en-CA') : 'Not yet confirmed'}\n\n` +
      `CHIEF CONCERN\n${edits.reason_for_visit || s.encounter.reason_for_visit}\n\n` +
      `ENCOUNTER DETAILS\n` +
      `- Most recent contact: ${new Date(s.encounter.most_recent_contact_iso).toLocaleString('en-CA')}\n` +
      `- Sex types: ${s.encounter.sex_types.join(', ') || 'Not provided'}\n` +
      `- Condom use: ${s.encounter.condom_use}\n\n` +
      `SYMPTOMS\n` +
      `- Current symptoms: ${s.symptoms.has_symptoms ? 'Yes' : 'No'}\n` +
      `- Details: ${edits.symptoms_details || s.symptoms.details.join(', ') || 'None documented'}\n` +
      `- Duration: ${s.symptoms.duration || 'Not documented'}\n\n` +
      `EXPOSURE\n` +
      `- Partner known STI: ${s.exposure.partner_known_sti}\n` +
      `- Notes: ${edits.exposure_notes || s.exposure.notes || 'None'}\n\n` +
      `PROVIDER ASSESSMENT\n${edits.provider_assessment || '[Pending provider entry]'}\n\n` +
      `PLAN\n${edits.provider_plan || '[Pending provider entry]'}\n`
    );
  }, [record, edits]);

  const loadCode = () => {
    if (!codeInput.trim()) return;
    navigate(`/view/${codeInput.trim().toUpperCase()}`);
  };

  const persistEdits = () => {
    if (!record) return;
    const next = {
      ...record,
      providerEdits: edits,
      providerEditedAtISO: new Date().toISOString(),
    };
    saveSharedSummaryRecord(next);
    toast.success('Provider edits saved');
    setIsEditing(false);
  };

  const handleConfirmReviewed = () => {
    if (!record) return;
    const next = {
      ...record,
      providerEdits: edits,
      providerEditedAtISO: new Date().toISOString(),
      reviewedAtISO: new Date().toISOString(),
    };
    saveSharedSummaryRecord(next);
    setReviewConfirmed(true);
    toast.success('Review confirmation saved');
  };

  const handleAddToEmr = async () => {
    if (!record) return;
    if (!reviewConfirmed && !record.reviewedAtISO) {
      toast.error('Confirm you reviewed the note before adding to EMR');
      return;
    }
    try {
      await navigator.clipboard.writeText(emrNoteText);
      const next = {
        ...record,
        providerEdits: edits,
        providerEditedAtISO: new Date().toISOString(),
        reviewedAtISO: record.reviewedAtISO || new Date().toISOString(),
        addedToEmrAtISO: new Date().toISOString(),
      };
      saveSharedSummaryRecord(next);
      toast.success('EMR note copied and marked as added');
    } catch {
      toast.error('Could not copy note to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster />
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Provider View</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Access patient summary by code and add to EMR</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Enter Access Code</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="6-character code"
              maxLength={6}
            />
            <Button onClick={loadCode}>Open</Button>
          </CardContent>
        </Card>

        {!record && activeCode && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="pt-6 text-sm text-amber-900 dark:text-amber-100">
              No active summary found for code <strong>{activeCode}</strong>. The code may be invalid, expired, or not shared from this device/session.
            </CardContent>
          </Card>
        )}

        {record && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>EMR Intake Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <div>Code: <strong>{record.code}</strong></div>
                  <div>Shared: {new Date(record.sharedAtISO).toLocaleString('en-CA')}</div>
                  <div>Expires: {new Date(record.expiresAtISO).toLocaleString('en-CA')}</div>
                  <div>Reviewed: {record.reviewedAtISO ? new Date(record.reviewedAtISO).toLocaleString('en-CA') : 'Not confirmed yet'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="review-confirmed"
                    type="checkbox"
                    checked={reviewConfirmed || Boolean(record.reviewedAtISO)}
                    onChange={(e) => setReviewConfirmed(e.target.checked)}
                  />
                  <Label htmlFor="review-confirmed">I confirm I reviewed this patient note</Label>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsEditing((v) => !v)}>
                    {isEditing ? 'Close Edit Mode' : 'Edit Note'}
                  </Button>
                  <Button variant="outline" onClick={persistEdits}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Edits
                  </Button>
                  <Button onClick={handleConfirmReviewed}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Reviewed
                  </Button>
                  <Button className="bg-[#003366] hover:bg-[#00A3A3]" onClick={handleAddToEmr}>
                    <Copy className="w-4 h-4 mr-2" />
                    Add to EMR (Copy Note)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Provider Edits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="edit-reason">Chief concern</Label>
                    <textarea
                      id="edit-reason"
                      className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-800"
                      rows={2}
                      value={edits.reason_for_visit}
                      onChange={(e) => setEdits((p) => ({ ...p, reason_for_visit: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-symptoms">Symptoms details</Label>
                    <textarea
                      id="edit-symptoms"
                      className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-800"
                      rows={2}
                      value={edits.symptoms_details}
                      onChange={(e) => setEdits((p) => ({ ...p, symptoms_details: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-exposure">Exposure notes</Label>
                    <textarea
                      id="edit-exposure"
                      className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-800"
                      rows={2}
                      value={edits.exposure_notes}
                      onChange={(e) => setEdits((p) => ({ ...p, exposure_notes: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-assessment">Provider assessment</Label>
                    <textarea
                      id="edit-assessment"
                      className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-800"
                      rows={3}
                      value={edits.provider_assessment}
                      onChange={(e) => setEdits((p) => ({ ...p, provider_assessment: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-plan">Plan</Label>
                    <textarea
                      id="edit-plan"
                      className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-800"
                      rows={3}
                      value={edits.provider_plan}
                      onChange={(e) => setEdits((p) => ({ ...p, provider_plan: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>EMR-Ready Note Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-[60vh]">
                  {emrNoteText}
                </pre>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
