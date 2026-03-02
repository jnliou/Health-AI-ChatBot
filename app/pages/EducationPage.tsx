import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EDUCATION_CARDS } from '../data/mockData';

export function EducationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic');

  const getSourceCta = (url: string) =>
    url.includes('healthlinkbc.ca') ? 'View on HealthLink BC' : 'View on SmartSexResource';

  const filteredCards = topic
    ? EDUCATION_CARDS.filter(card => card.category.toLowerCase().includes(topic))
    : EDUCATION_CARDS;

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
              <h1 className="text-xl font-semibold">Learn</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Evidence-based sexual health information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {filteredCards.map(card => (
          <Card key={card.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start gap-3">
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <Badge variant="secondary" className="shrink-0">
                  {card.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                {card.summary}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(card.sourceUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {getSourceCta(card.sourceUrl)}
              </Button>
            </CardFooter>
          </Card>
        ))}

        {/* Source Attribution */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Content sourced from BCCDC SmartSexResource and HealthLink BC
          </p>
          <a
            href="https://smartsexresource.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#00A3A3] hover:underline"
          >
            smartsexresource.com
          </a>
        </div>
      </div>
    </div>
  );
}
