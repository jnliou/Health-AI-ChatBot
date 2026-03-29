import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { PatientSummaryFormData } from '../types/patientSummary';
import { normalizeDateTimeLocalValue } from '../utils/dateUtils';

interface PatientSummaryFormProps {
  onSubmit: (data: PatientSummaryFormData) => void;
  onCancel: () => void;
  initialData?: PatientSummaryFormData | null;
}

interface StoredTriageDraft {
  hasSymptoms: string | null;
  selectedSymptoms: string[];
  duration: string;
  contactDate?: string;
  condomUse?: 'used throughout' | 'used sometimes' | 'no condom' | 'condom broke';
  partnerKnownSti?: 'yes' | 'no' | 'unsure';
  sexTypes?: string[];
  whatHappened?: string;
}

const DEFAULT_FORM_DATA: PatientSummaryFormData = {
  what_happened: '',
  contact_date: '',
  sex_types: [],
  condom_use: 'no condom',
  has_symptoms: false,
  symptoms_list: '',
  symptom_duration: '',
  partner_known_sti: 'unsure',
  current_medications: false,
  medications_list: '',
  pregnancy_possible: 'no',
  allergies_meds: 'NKDA',
  preferred_language: 'English'
};

function normalizeFormData(data: PatientSummaryFormData): PatientSummaryFormData {
  return {
    ...data,
    contact_date: normalizeDateTimeLocalValue(data.contact_date),
  };
}

export function PatientSummaryForm({ onSubmit, onCancel, initialData }: PatientSummaryFormProps) {
  const [formData, setFormData] = useState<PatientSummaryFormData>({
    ...normalizeFormData({
      ...DEFAULT_FORM_DATA,
      ...initialData
    })
  });
  const [shareConsentChecked, setShareConsentChecked] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(normalizeFormData({
        ...DEFAULT_FORM_DATA,
        ...initialData,
      }));
    }
  }, [initialData]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sia_triage_draft_v1');
      if (!raw) return;
      const draft = JSON.parse(raw) as StoredTriageDraft;
      if (!draft) return;

      const rememberedSymptoms =
        Array.isArray(draft.selectedSymptoms) && draft.selectedSymptoms.length > 0
          ? draft.selectedSymptoms.join(', ')
          : '';

      setFormData((prev) => ({
        ...prev,
        what_happened:
          prev.what_happened ||
          draft.whatHappened ||
          (rememberedSymptoms ? `Symptoms reported in chat: ${rememberedSymptoms}` : prev.what_happened),
        contact_date: normalizeDateTimeLocalValue(draft.contactDate) || prev.contact_date,
        sex_types:
          prev.sex_types.length > 0
            ? prev.sex_types
            : Array.isArray(draft.sexTypes) && draft.sexTypes.length > 0
              ? draft.sexTypes
              : prev.sex_types,
        condom_use:
          draft.condomUse && prev.condom_use === DEFAULT_FORM_DATA.condom_use
            ? draft.condomUse
            : prev.condom_use,
        partner_known_sti:
          draft.partnerKnownSti && prev.partner_known_sti === DEFAULT_FORM_DATA.partner_known_sti
            ? draft.partnerKnownSti
            : prev.partner_known_sti,
        has_symptoms: draft.hasSymptoms === 'yes' ? true : prev.has_symptoms,
        symptoms_list:
          draft.hasSymptoms === 'yes' ? prev.symptoms_list || rememberedSymptoms : prev.symptoms_list,
        symptom_duration:
          draft.hasSymptoms === 'yes' ? prev.symptom_duration || draft.duration || '' : prev.symptom_duration,
      }));
    } catch {
      // Ignore bad local data and keep defaults.
    }
  }, [initialData]);

  const handleSexTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      sex_types: prev.sex_types.includes(type)
        ? prev.sex_types.filter(t => t !== type)
        : [...prev.sex_types, type]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-w-2xl mx-auto max-h-[85vh] overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Create Patient Summary
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          I'll ask a few quick questions and then generate a clean note you can review and share with clinic staff.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question 1: What happened */}
        <div>
          <Label htmlFor="what_happened" className="text-sm font-medium mb-2">
            1. What happened? (Brief description)
          </Label>
          <textarea
            id="what_happened"
            value={formData.what_happened}
            onChange={(e) => setFormData({ ...formData, what_happened: e.target.value })}
            className="w-full min-h-[120px] max-h-[280px] overflow-y-auto resize-y px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#003366] dark:focus:ring-[#00A3A3] focus:border-transparent"
            rows={5}
            placeholder="e.g., Had sex with new partner, condom broke"
            autoFocus
            required
          />
        </div>

        {/* Question 2: When */}
        <div>
          <Label htmlFor="contact_date" className="text-sm font-medium mb-2">
            2. When was the most recent sexual contact that concerns you?
          </Label>
          <Input
            id="contact_date"
            type="datetime-local"
            value={formData.contact_date}
            onChange={(e) => setFormData({ ...formData, contact_date: e.target.value })}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Approximate date/time is fine
          </p>
        </div>

        {/* Question 3: Types of sex */}
        <div>
          <Label className="text-sm font-medium mb-2">
            3. Types of sex during that contact? (Select all that apply)
          </Label>
          <div className="space-y-2 mt-2">
            {['oral', 'vaginal', 'anal', 'other'].map(type => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`sex-${type}`}
                  checked={formData.sex_types.includes(type)}
                  onCheckedChange={() => handleSexTypeToggle(type)}
                />
                <Label htmlFor={`sex-${type}`} className="capitalize cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 4: Condom use */}
        <div>
          <Label htmlFor="condom_use" className="text-sm font-medium mb-2">
            4. Condom use?
          </Label>
          <select
            id="condom_use"
            value={formData.condom_use}
            onChange={(e) => setFormData({ ...formData, condom_use: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#003366] dark:focus:ring-[#00A3A3] focus:border-transparent"
            required
          >
            <option value="used throughout">Used throughout</option>
            <option value="used sometimes">Used sometimes</option>
            <option value="no condom">No condom</option>
            <option value="condom broke">Condom broke</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <strong>BC CDC</strong> recommends testing after new partners, condomless sex, condom break, symptoms, or exposure to a partner with an STI.
          </p>
        </div>

        {/* Question 5: Symptoms */}
        <div>
          <Label className="text-sm font-medium mb-2">
            5. Any symptoms now?
          </Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="has_symptoms"
                checked={formData.has_symptoms}
                onCheckedChange={(checked) => setFormData({ ...formData, has_symptoms: checked as boolean })}
              />
              <Label htmlFor="has_symptoms" className="cursor-pointer">
                I have symptoms
              </Label>
            </div>
            {formData.has_symptoms && (
              <div className="space-y-2">
                <Input
                  placeholder="List symptoms (e.g., discharge, burning, sores)"
                  value={formData.symptoms_list}
                  onChange={(e) => setFormData({ ...formData, symptoms_list: e.target.value })}
                />
                <select
                  value={formData.symptom_duration}
                  onChange={(e) => setFormData({ ...formData, symptom_duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#003366] dark:focus:ring-[#00A3A3] focus:border-transparent"
                >
                  <option value="">How long have symptoms been present?</option>
                  <option value="Less than 1 week">Less than 1 week</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="More than 4 weeks">More than 4 weeks</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Question 6: Partner known STI */}
        <div>
          <Label htmlFor="partner_known_sti" className="text-sm font-medium mb-2">
            6. Any partner with a known STI or recent positive test?
          </Label>
          <select
            id="partner_known_sti"
            value={formData.partner_known_sti}
            onChange={(e) => setFormData({ ...formData, partner_known_sti: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#003366] dark:focus:ring-[#00A3A3] focus:border-transparent"
            required
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
            <option value="unsure">Unsure</option>
          </select>
        </div>

        {/* Question 7: Current medications */}
        <div>
          <Label className="text-sm font-medium mb-2">
            7. Any medications recently started for an STI?
          </Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="current_medications"
                checked={formData.current_medications}
                onCheckedChange={(checked) => setFormData({ ...formData, current_medications: checked as boolean })}
              />
              <Label htmlFor="current_medications" className="cursor-pointer">
                Currently on STI medication
              </Label>
            </div>
            {formData.current_medications && (
              <Input
                placeholder="Which medication and start date?"
                value={formData.medications_list}
                onChange={(e) => setFormData({ ...formData, medications_list: e.target.value })}
              />
            )}
          </div>
        </div>

        {/* Question 8: Pregnancy */}
        <div>
          <Label htmlFor="pregnancy_possible" className="text-sm font-medium mb-2">
            8. Pregnancy possibility or trying to conceive?
          </Label>
          <select
            id="pregnancy_possible"
            value={formData.pregnancy_possible}
            onChange={(e) => setFormData({ ...formData, pregnancy_possible: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#003366] dark:focus:ring-[#00A3A3] focus:border-transparent"
            required
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
            <option value="unsure">Unsure</option>
          </select>
        </div>

        {/* Question 9: Allergies */}
        <div>
          <Label htmlFor="allergies_meds" className="text-sm font-medium mb-2">
            9. Allergies or medications the nurse should know?
          </Label>
          <Input
            id="allergies_meds"
            value={formData.allergies_meds}
            onChange={(e) => setFormData({ ...formData, allergies_meds: e.target.value })}
            placeholder="e.g., Penicillin allergy, taking birth control"
          />
        </div>

        {/* Question 10: Language preference */}
        <div>
          <Label htmlFor="preferred_language" className="text-sm font-medium mb-2">
            10. Preferred language for handouts?
          </Label>
          <select
            id="preferred_language"
            value={formData.preferred_language}
            onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#003366] dark:focus:ring-[#00A3A3] focus:border-transparent"
            required
          >
            <option value="English">English</option>
            <option value="Arabic">Arabic (العربية)</option>
            <option value="Chinese (Simplified)">Chinese - Simplified (简体中文)</option>
            <option value="Chinese (Traditional)">Chinese - Traditional (繁體中文)</option>
            <option value="Farsi">Farsi (فارسی)</option>
            <option value="French">French (Français)</option>
            <option value="Korean">Korean (한국어)</option>
            <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
            <option value="Spanish">Spanish (Español)</option>
            <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <strong>Window periods</strong>: Tests done too early can be inaccurate; we'll include timing guidance in your note.
          </p>
        </div>

        {/* Actions */}
        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="share_consent"
              checked={shareConsentChecked}
              onCheckedChange={(checked) => setShareConsentChecked(Boolean(checked))}
            />
            <div>
              <Label htmlFor="share_consent" className="cursor-pointer">
                I consent to share this summary with clinic staff.
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You can edit or remove details before sharing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-[#003366] hover:bg-[#00A3A3] text-white"
            disabled={!shareConsentChecked}
          >
            Generate Summary
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-gray-300 dark:border-gray-600"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
