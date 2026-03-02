import { ArrowLeft, Lock, Shield, Clock, Eye, Database, Key } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Privacy & Security</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How we protect your information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <Card className="bg-gradient-to-br from-[#003366] to-[#00A3A3] text-white border-none">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl mb-3">Privacy-First Design</h2>
            <p className="text-white/90">
              SIA is built from the ground up to protect your privacy. We use industry-leading encryption and never store your personal information.
            </p>
          </CardContent>
        </Card>

        {/* Core Principles */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Our Core Principles</h3>
          <div className="space-y-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Lock className="w-6 h-6 text-[#003366] shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Client-Side Encryption</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your conversations are encrypted on your device before any data leaves. We never see your unencrypted data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Eye className="w-6 h-6 text-[#003366] shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Zero-Knowledge Architecture</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Even our servers can't read your data. Only you, with your access code, can decrypt your information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Key className="w-6 h-6 text-[#003366] shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">You Control Access</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your 6-character access code is the only way to view your data. No one else has a copy, not even us.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Clock className="w-6 h-6 text-[#003366] shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Automatic Deletion</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All data is permanently deleted after 14 days. No backups, no archives, no exceptions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* How It Works */}
        <div>
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Start a Conversation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When you start using SIA, a unique encryption key is generated on your device.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Everything Gets Encrypted</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All your messages, triage information, and health data are encrypted locally before being stored.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Share When Ready</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    If you choose to share with a clinic, you generate a temporary access code. Only someone with this code can decrypt your data.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Auto-Delete</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    After 14 days, all encrypted data is permanently deleted from our servers. No trace remains.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* What We Don't Do */}
        <div>
          <h3 className="text-lg font-semibold mb-4">What We Don't Do</h3>
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>We don't collect your name, email, or phone number</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>We don't track your location beyond what you explicitly share</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>We don't share your data with third parties</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>We don't use your data for marketing or advertising</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>We don't keep backups after the 14-day period</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✗</span>
                  <span>We don't link your conversations across different sessions</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Data Sources */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Our Data Sources</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 mb-4">
                <Database className="w-6 h-6 text-[#003366] shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Evidence-Based Information</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All health information comes from verified sources:
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm ml-9">
                <li>
                  <a
                    href="https://smartsexresource.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00A3A3] hover:underline"
                  >
                    BCCDC SmartSexResource
                  </a>
                  {' '}– Sexual health education and guidelines
                </li>
                <li>
                  <a
                    href="https://smartsexresource.com/clinics-testing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00A3A3] hover:underline"
                  >
                    BC Sexual Health Clinic Directory
                  </a>
                  {' '}– Location-based clinic information
                </li>
                <li>
                  <a
                    href="https://getcheckedonline.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00A3A3] hover:underline"
                  >
                    GetCheckedOnline
                  </a>
                  {' '}– Online STI testing service
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Important Notice */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Important Notice
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              SIA is designed for sexual health information and triage support. This is not a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing a medical emergency, call 911 or visit your nearest emergency department.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Questions about privacy?
          </p>
          <p className="text-sm">
            Contact:{' '}
            <a href="mailto:privacy@bccdc.ca" className="text-[#00A3A3] hover:underline">
              privacy@bccdc.ca
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
