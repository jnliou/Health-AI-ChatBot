import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Filter, List } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ClinicCard } from '../components/ClinicCard';
import { MOCK_CLINICS, calculateDistance } from '../data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function ClinicListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromTriage = searchParams.get('from') === 'triage';
  const autoLocate = searchParams.get('autoLocate') === '1';
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filters = ['Walk-in', 'Appointment required', 'Youth-friendly', 'LGBTQ2S+ friendly', 'Accessible'];

  useEffect(() => {
    if ((fromTriage || autoLocate) && !locationRequested) {
      requestLocation();
    }
  }, [fromTriage, autoLocate, locationRequested]);

  const requestLocation = () => {
    setLocationRequested(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Silently default to Vancouver downtown if location access is denied
          setUserLocation({ lat: 49.2827, lng: -123.1207 });
        }
      );
    } else {
      // Default to Vancouver downtown
      setUserLocation({ lat: 49.2827, lng: -123.1207 });
    }
  };

  const clinicsWithDistance = userLocation
    ? MOCK_CLINICS.map(clinic => ({
        ...clinic,
        distance: calculateDistance(userLocation.lat, userLocation.lng, clinic.lat, clinic.lng),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0))
    : MOCK_CLINICS;

  const filteredClinics = selectedFilters.length > 0
    ? clinicsWithDistance.filter(clinic =>
        selectedFilters.some(filter => clinic.features.includes(filter))
      )
    : clinicsWithDistance;

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(fromTriage ? '/triage' : '/chat')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Sexual Health Clinics</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredClinics.length} clinics found
              </p>
            </div>
          </div>

          {!userLocation && (
            <Button
              variant="outline"
              className="w-full mb-3"
              onClick={requestLocation}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Enable Location for Nearest Clinics
            </Button>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            {filters.map(filter => (
              <Badge
                key={filter}
                variant={selectedFilters.includes(filter) ? 'default' : 'outline'}
                className={`cursor-pointer whitespace-nowrap ${
                  selectedFilters.includes(filter)
                    ? 'bg-[#003366] hover:bg-[#00A3A3]'
                    : ''
                }`}
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapPin className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {filteredClinics.map(clinic => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </TabsContent>

          <TabsContent value="map">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Interactive map view</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Prototype: Map integration with clinic pins
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {filteredClinics.map(clinic => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Source Attribution */}
        <div className="text-center py-8 border-t border-gray-200 dark:border-gray-800 mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">
            Clinic data from BCCDC
          </p>
          <a
            href="https://smartsexresource.com/clinics-testing/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#00A3A3] hover:underline"
          >
            View full directory on SmartSexResource
          </a>
        </div>
      </div>
    </div>
  );
}
