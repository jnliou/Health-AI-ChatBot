import { MapPin, Stethoscope, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router';

const ACTIONS = [
  { id: 'triage', label: 'Symptoms & Testing', icon: Stethoscope, route: '/triage' },
  { id: 'clinics', label: 'Clinics Near Me', icon: MapPin, route: '/clinics' },
  { id: 'learn', label: 'Learn', icon: BookOpen, route: '/education' },
];

export function QuickActionChips() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(action => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => navigate(action.route)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#00A3A3] hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all text-sm"
          >
            <Icon className="w-4 h-4" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
