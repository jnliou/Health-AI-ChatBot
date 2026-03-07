import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { generateAccessCode } from '../data/mockData';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { PatientSummaryData } from '../types/patientSummary';
import { PatientIdentity, upsertSharedSummaryRecord } from '../utils/sharedSummaryRegistry';

const ACCESS_CODE_STORAGE_KEY = 'sia_access_code_v1';
const ACCESS_CODE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const SUMMARY_STORAGE_KEY = 'sia_patient_summary_v1';
const HANDOFF_IDENTITY_STORAGE_KEY = 'sia_handoff_identity_v1';

interface StoredAccessCode {
  code: string;
  expiresAtISO: string;
}

export function SharePage() {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [expiresAtISO, setExpiresAtISO] = useState<string | null>(null);
  const [hasSummary, setHasSummary] = useState(false);

  useEffect(() => {
    const readIdentity = (): PatientIdentity | undefined => {
      try {
        const raw = sessionStorage.getItem(HANDOFF_IDENTITY_STORAGE_KEY);
        if (!raw) return undefined;
        const parsed = JSON.parse(raw) as Partial<PatientIdentity>;
        if (typeof parsed.fullName !== 'string' || typeof parsed.dateOfBirthISO !== 'string') return undefined;
        if (!parsed.fullName.trim() || !parsed.dateOfBirthISO.trim()) return undefined;
        return {
          fullName: parsed.fullName.trim(),
          dateOfBirthISO: parsed.dateOfBirthISO,
          consentedAtISO: parsed.consentedAtISO || new Date().toISOString(),
        };
      } catch {
        return undefined;
      }
    };

    const identity = readIdentity();

    try {
      const raw = localStorage.getItem(ACCESS_CODE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredAccessCode>;
        const expiryMs = parsed.expiresAtISO ? Date.parse(parsed.expiresAtISO) : Number.NaN;
        if (
          typeof parsed.code === 'string' &&
          parsed.code.length === 6 &&
          !Number.isNaN(expiryMs) &&
          Date.now() < expiryMs
        ) {
          try {
            const summaryRaw = sessionStorage.getItem(SUMMARY_STORAGE_KEY);
            if (summaryRaw) {
              const summary = JSON.parse(summaryRaw) as PatientSummaryData;
              upsertSharedSummaryRecord(parsed.code, parsed.expiresAtISO as string, summary, identity);
              setHasSummary(true);
            }
          } catch {
            // Ignore malformed local/session data.
          }
          setAccessCode(parsed.code);
          setExpiresAtISO(parsed.expiresAtISO as string);
          return;
        }
      }
    } catch {
      // Ignore malformed storage and generate a fresh code.
    }

    const code = generateAccessCode();
    const expiresAtISOValue = new Date(Date.now() + ACCESS_CODE_TTL_MS).toISOString();
    const payload: StoredAccessCode = { code, expiresAtISO: expiresAtISOValue };
    localStorage.setItem(ACCESS_CODE_STORAGE_KEY, JSON.stringify(payload));
    try {
      const summaryRaw = sessionStorage.getItem(SUMMARY_STORAGE_KEY);
      if (summaryRaw) {
        const summary = JSON.parse(summaryRaw) as PatientSummaryData;
        upsertSharedSummaryRecord(code, expiresAtISOValue, summary, identity);
        setHasSummary(true);
      }
    } catch {
      // Ignore malformed local/session data.
    }
    setAccessCode(code);
    setExpiresAtISO(expiresAtISOValue);
  }, []);

  const handleCopy = () => {
    if (!accessCode) return;
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    toast.success('Access code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SIA Health Summary',
          text: `Access Code: ${accessCode}`,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/handoff')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Share with Clinic</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your secure access code
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Success Message */}
        <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Secure Share Code Generated
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Share this code with your healthcare provider to give them access to your encrypted health summary.
              </p>
            </div>
          </CardContent>
        </Card>

        {!hasSummary && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="pt-6 text-sm text-amber-900 dark:text-amber-100">
              No patient summary found in this session yet. Create or open a summary note first, then return here to share it with providers.
            </CardContent>
          </Card>
        )}

        {/* Access Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Share This Access Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-4xl font-mono font-bold tracking-widest text-[#003366] dark:text-[#00A3A3] mb-2">
                {accessCode}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                6-character access code
              </p>
              {expiresAtISO && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Expires {new Date(expiresAtISO).toLocaleDateString('en-CA')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="border-[#00A3A3]">
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <p className="font-semibold mb-1">Encrypted Storage</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Your health summary is encrypted with this access code. No one can read it without the code.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <p className="font-semibold mb-1">Share with Provider</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Give your provider the 6-character access code at your appointment.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <p className="font-semibold mb-1">Auto-Delete After 14 Days</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Your data will be permanently deleted after 14 days. No trace left behind.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Important
            </h3>
            <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
              <li>• Keep this code private until your appointment</li>
              <li>• Don't share your code over unsecured channels</li>
              <li>• Take a screenshot or write down the code</li>
              <li>• The code expires in 14 days</li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full bg-[#003366] hover:bg-[#00A3A3]"
            size="lg"
            onClick={() => navigate('/chat')}
          >
            Return to Chat
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/privacy')}
          >
            Learn More About Privacy
          </Button>
        </div>
      </div>
    </div>
  );
}
