import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { Clinic } from '../data/mockData';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface ClinicCardProps {
  clinic: Clinic;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">{clinic.name}</CardTitle>
          {clinic.distance && (
            <Badge variant="secondary" className="shrink-0">
              {clinic.distance.toFixed(1)} km
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex gap-2 text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p>{clinic.address}</p>
            <p>{clinic.city}, {clinic.postal}</p>
          </div>
        </div>
        
        <div className="flex gap-2 text-gray-600 dark:text-gray-400">
          <Phone className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{clinic.phone}</p>
        </div>
        
        <div className="flex gap-2 text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{clinic.hours}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {clinic.features.map(feature => (
            <Badge key={feature} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-3">
        <Button 
          className="flex-1 bg-[#003366] hover:bg-[#00A3A3]"
          onClick={() => navigate(`/clinics/${clinic.id}`)}
        >
          View Details
        </Button>
        <Button 
          variant="outline"
          size="icon"
          onClick={() => window.open(clinic.sourceUrl, '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
