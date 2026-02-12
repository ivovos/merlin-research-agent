import { Sparkles } from 'lucide-react'
import type { ClarificationRequest } from '@/types'

interface ClarificationMessageProps {
  clarification: ClarificationRequest
  onSuggestionClick?: (suggestion: string) => void
}

// Simple renderer for numbered lists in clarification messages
function renderClarificationContent(content: string) {
  // Split by double newlines to get paragraphs
  const blocks = content.split(/\n\n+/);

  return blocks.map((block, blockIndex) => {
    // Check if this block is a numbered list
    const lines = block.split('\n');
    const isNumberedList = lines.every(line => /^\d+\.\s/.test(line.trim()) || line.trim() === '');

    if (isNumberedList && lines.some(line => /^\d+\.\s/.test(line.trim()))) {
      const listItems = lines.filter(line => /^\d+\.\s/.test(line.trim()));
      return (
        <ol key={blockIndex} className="list-decimal list-inside space-y-1 my-2">
          {listItems.map((item, itemIndex) => (
            <li key={itemIndex} className="text-foreground/90">
              {item.replace(/^\d+\.\s*/, '')}
            </li>
          ))}
        </ol>
      );
    }

    // Regular paragraph
    return (
      <p key={blockIndex} className="text-foreground/90 leading-relaxed">
        {block}
      </p>
    );
  });
}

export function ClarificationMessage({ clarification, onSuggestionClick }: ClarificationMessageProps) {
  // Ensure suggestions is always an array
  const suggestions = Array.isArray(clarification.suggestions) ? clarification.suggestions : []

  return (
    <div className="space-y-4 max-w-[80%] lg:max-w-[60%]">
      {/* Text response with numbered list support */}
      <div className="text-sm space-y-2">
        {renderClarificationContent(clarification.missing_info)}
        {clarification.reason && (
          <p className="text-muted-foreground">{clarification.reason}</p>
        )}
      </div>

      {/* Suggestion chips as text labels (not buttons) */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSuggestionClick?.(suggestion)}
              className="inline-flex items-center py-2 px-3 text-xs text-muted-foreground border border-border rounded-md bg-muted/30 cursor-pointer hover:bg-muted/60 hover:border-primary/30 transition-colors"
            >
              <Sparkles className="mr-1.5 h-3 w-3 shrink-0 text-primary/60" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
