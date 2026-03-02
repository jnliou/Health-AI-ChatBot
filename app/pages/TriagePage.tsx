import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';

export function TriagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  
  const [step, setStep] = useState(0);
  const [hasSymptoms, setHasSymptoms] = useState<string | null>(
    type === 'symptomatic' ? 'yes' : type === 'asymptomatic' ? 'no' : null
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('');
  const TRIAGE_STORAGE_KEY = 'sia_triage_draft_v1';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TRIAGE_STORAGE_KEY);
      if (!stored) return;
      const draft = JSON.parse(stored) as {
        step: number;
        hasSymptoms: string | null;
        selectedSymptoms: string[];
        duration: string;
      };

      setStep(draft.step ?? 0);
      setHasSymptoms(draft.hasSymptoms ?? null);
      setSelectedSymptoms(Array.isArray(draft.selectedSymptoms) ? draft.selectedSymptoms : []);
      setDuration(draft.duration ?? '');
    } catch {
      // Ignore invalid localStorage values.
    }
  }, []);

  useEffect(() => {
    const payload = {
      step,
      hasSymptoms,
      selectedSymptoms,
      duration,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(TRIAGE_STORAGE_KEY, JSON.stringify(payload));
  }, [step, hasSymptoms, selectedSymptoms, duration]);

  const symptoms = [
    'Unusual discharge',
    'Pain or burning during urination',
    'Genital sores or bumps',
    'Rash or itching',
    'Abdominal pain',
    'Other symptoms',
  ];

  const handleNext = () => {
    if (hasSymptoms === 'no') {
      // Asymptomatic flow - show GetCheckedOnline option
      setStep(99); // Final asymptomatic screen
    } else if (hasSymptoms === 'yes') {
      if (step === 0) {
        setStep(1); // Symptom selection
      } else if (step === 1) {
        setStep(2); // Duration
      } else if (step === 2) {
        // Navigate to clinic finder
        navigate('/clinics?from=triage');
      }
    } else {
      setStep(step + 1);
    }
  };

  const canProceed = () => {
    if (step === 0 && !hasSymptoms) return false;
    if (step === 1 && selectedSymptoms.length === 0) return false;
    if (step === 2 && !duration) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/chat')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Health Triage</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help us understand your situation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 99 ? (
          // Asymptomatic Result
          <Card className="border-[#00A3A3]">
            <CardHeader>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#00A3A3] shrink-0 mt-1" />
                <div>
                  <CardTitle className="text-xl mb-2">Online Testing Available</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 font-normal">
                    Since you don't have symptoms, you may be eligible for online STI testing through GetCheckedOnline.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">What is GetCheckedOnline?</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Order a free STI test kit online</li>
                  <li>• Provide a sample at a lab near you</li>
                  <li>• Get results online in 3-7 days</li>
                  <li>• 100% confidential</li>
                </ul>
              </div>

              <Button 
                className="w-full bg-[#003366] hover:bg-[#00A3A3]"
                size="lg"
                onClick={() => window.open('https://getcheckedonline.com', '_blank')}
              >
                Continue to GetCheckedOnline
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/clinics')}
              >
                Or find a clinic near me
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 0 && 'Are you experiencing any symptoms?'}
                {step === 1 && 'What symptoms are you experiencing?'}
                {step === 2 && 'How long have you had these symptoms?'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 0 && (
                <RadioGroup value={hasSymptoms || ''} onValueChange={setHasSymptoms}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="flex-1 cursor-pointer">Yes, I have symptoms</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="flex-1 cursor-pointer">No symptoms, just want to get tested</Label>
                  </div>
                </RadioGroup>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  {symptoms.map((symptom) => (
                    <div
                      key={symptom}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Checkbox
                        id={symptom}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSymptoms([...selectedSymptoms, symptom]);
                          } else {
                            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
                          }
                        }}
                      />
                      <Label htmlFor={symptom} className="flex-1 cursor-pointer">
                        {symptom}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <RadioGroup value={duration} onValueChange={setDuration}>
                  {['Less than 1 week', '1-2 weeks', '2-4 weeks', 'More than 4 weeks'].map((option) => (
                    <div key={option} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              <Button
                className="w-full bg-[#003366] hover:bg-[#00A3A3]"
                size="lg"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            <strong>Important:</strong> This triage is for guidance only. If you're experiencing severe symptoms, pain, or discomfort, please seek immediate medical attention.
          </p>
        </div>
      </div>
    </div>
  );
}
