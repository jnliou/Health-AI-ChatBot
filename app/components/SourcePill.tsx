import { ExternalLink } from 'lucide-react';

interface SourcePillProps {
  label: string;
  url: string;
}

export function SourcePill({ label, url }: SourcePillProps) {
  const displayLabel = label.length > 42 ? `${label.slice(0, 39)}...` : label;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={`Source: ${label}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
    >
      <ExternalLink className="w-3 h-3" />
      <span>{displayLabel}</span>
    </a>
  );
}
