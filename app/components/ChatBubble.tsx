import { SourcePill } from './SourcePill';
import { cn } from './ui/utils';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: { label: string; url: string }[];
}

export function ChatBubble({ role, content, sources }: ChatBubbleProps) {
  const isUser = role === 'user';

  // Convert markdown bold (**text**) to HTML
  const formatContent = (text: string) => {
    const renderLinkifiedText = (plain: string, keyPrefix: string) => {
      const urlRegex = /(https?:\/\/[^\s)]+)/g;
      const parts = plain.split(urlRegex);
      return parts.map((part, idx) => {
        if (/^https?:\/\/[^\s)]+$/i.test(part)) {
          return (
            <a
              key={`${keyPrefix}-url-${idx}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'underline underline-offset-2',
                isUser ? 'text-white' : 'text-teal-700 dark:text-teal-300'
              )}
            >
              {part}
            </a>
          );
        }
        return <span key={`${keyPrefix}-txt-${idx}`}>{part}</span>;
      });
    };

    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={idx}>{renderLinkifiedText(boldText, `b-${idx}`)}</strong>;
      }
      return <span key={idx}>{renderLinkifiedText(part, `p-${idx}`)}</span>;
    });
  };

  return (
    <div className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-3',
        isUser 
          ? 'bg-[#003366] text-white rounded-br-sm'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatContent(content)}</p>
        {sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {sources.map((source, idx) => (
              <SourcePill key={idx} label={source.label} url={source.url} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
