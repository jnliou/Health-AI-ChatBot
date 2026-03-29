import { ArrowLeft, MapPin, Phone, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MOCK_CLINICS } from '../data/mockData';

export function ClinicDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const clinic = MOCK_CLINICS.find(c => c.id === id);

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Clinic not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/clinics')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{clinic.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clinic Details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Map Placeholder */}
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-48 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Map location: {clinic.address}
            </p>
          </div>
        </div>

        {/* Location Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{clinic.address}</p>
            <p>{clinic.city}, BC {clinic.postal}</p>
            {clinic.distance && (
              <Badge variant="secondary">{clinic.distance.toFixed(1)} km away</Badge>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={`tel:${clinic.phone}`}
              className="text-[#00A3A3] hover:underline"
            >
              {clinic.phone}
            </a>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{clinic.hours}</p>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Services Offered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {clinic.services.map(service => (
                <li key={service} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle>Languages Spoken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {clinic.languages.map(lang => (
                <Badge key={lang} variant="outline">{lang}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {clinic.features.map(feature => (
                <Badge key={feature} className="bg-[#003366]">{feature}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            className="w-full bg-[#003366] hover:bg-[#00A3A3]"
            size="lg"
            onClick={() => navigate('/handoff')}
          >
            Select This Clinic and Create Summary
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(clinic.sourceUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on SmartSexResource
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>Note:</strong> Please call ahead to confirm hours and services. Some clinics may require appointments.
          </p>
        </div>
      </div>
    </div>
  );
}
