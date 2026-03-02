import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Download, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { generateAccessCode } from '../data/mockData';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

export function SharePage() {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAccessCode(generateAccessCode());
  }, []);

  const shareUrl = `https://sia.bccdc.ca/view/${accessCode}`;

  const handleCopy = () => {
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
          url: shareUrl,
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

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Scan QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-6 bg-white dark:bg-gray-800 rounded-lg">
              <QRCodeSVG
                value={shareUrl}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Your provider can scan this code at their office
            </p>
          </CardContent>
        </Card>

        {/* Access Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Or Share This Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-4xl font-mono font-bold tracking-widest text-[#003366] dark:text-[#00A3A3] mb-2">
                {accessCode}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                6-character access code
              </p>
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
                  Show the QR code or tell them your access code at your appointment.
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
