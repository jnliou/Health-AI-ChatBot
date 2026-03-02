import { Shield, Lock, Clock, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { LanguageSelector } from '../components/LanguageSelector';
import { useNavigate } from 'react-router';
import { useTheme } from 'next-themes';
import { Switch } from '../components/ui/switch';

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003366] to-[#00A3A3] text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <LanguageSelector />
          <div className="flex items-center gap-2">
            <span className="text-sm">Dark</span>
            <Switch
              checked={theme === 'light'}
              onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
            />
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-12 pt-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h1 className="text-4xl mb-4">SIA</h1>
          <p className="text-xl mb-2 font-light">Sexual Information Assistant</p>
          <p className="text-white/80 text-sm max-w-sm mx-auto">
            Private, multilingual sexual health support — no account required
          </p>
        </div>

        {/* CTA */}
        <Button 
          size="lg"
          className="w-full mb-6 bg-white text-[#003366] hover:bg-white/90 text-lg py-6"
          onClick={() => navigate('/chat')}
        >
          Start Chat
        </Button>

        {/* Privacy Features */}
        <div className="space-y-3 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-4">
            <div className="flex gap-3">
              <Lock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Client-Side Encryption</h3>
                <p className="text-sm text-white/80">
                  Your conversations are encrypted on your device. We never see your data.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Your Access Code</h3>
                <p className="text-sm text-white/80">
                  You control a 6-character code. Only you can access your information.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-4">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">14-Day Auto-Delete</h3>
                <p className="text-sm text-white/80">
                  All data is automatically deleted after 14 days. No trace left behind.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-3">
          <button
            onClick={() => navigate('/privacy')}
            className="text-sm text-white/80 hover:text-white underline"
          >
            Learn more about privacy & security
          </button>
          <p className="text-xs text-white/60">
            Powered by BCCDC SmartSexResource
          </p>
        </div>
      </div>
    </div>
  );
}
