import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import type { ClarificationRequest } from '@/types'

interface ClarificationMessageProps {
  clarification: ClarificationRequest
  onSuggestionClick: (suggestion: string) => void
}

export function ClarificationMessage({ clarification, onSuggestionClick }: ClarificationMessageProps) {
  // Ensure suggestions is always an array
  const suggestions = Array.isArray(clarification.suggestions) ? clarification.suggestions : []

  return (
    <div className="space-y-4">
      {/* Text response like normal assistant message */}
      <p className="text-foreground/90 leading-relaxed text-sm">
        {clarification.missing_info}
        {clarification.reason && (
          <span className="text-muted-foreground"> {clarification.reason}</span>
        )}
      </p>

      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto whitespace-normal py-2 px-3 text-left text-xs hover:bg-primary/5 hover:border-primary/30"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <Sparkles className="mr-1.5 h-3 w-3 shrink-0 text-primary/60" />
              <span className="line-clamp-2">{suggestion}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
