import React from 'react'
import { User, Users, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SurveyType } from '@/types'
import { MOCK_AUDIENCES } from '@/hooks/useSurveyBuilder'

const TYPE_AUDIENCE_HEADERS: Record<SurveyType, { title: string; description: string }> = {
  simple: { title: 'Who should take this survey?', description: 'Select the audience for your survey.' },
  concept: { title: 'Who will evaluate these concepts?', description: 'Choose respondents to review your concepts.' },
  message: { title: 'Who will see these messages?', description: 'Choose respondents to evaluate your messaging.' },
  creative: { title: 'Who will see this creative?', description: 'Choose respondents to review your creative assets.' },
  brand_tracking: { title: 'Whose brand perception are you tracking?', description: 'Select your target population for brand metrics.' },
  audience_exploration: { title: 'Who do you want to understand?', description: 'Select the audience you want to explore.' },
}

interface AudienceStepProps {
  surveyType: SurveyType
  audienceMode: 'single' | 'multi' | null
  selectedAudiences: string[]
  onSetMode: (mode: 'single' | 'multi') => void
  onToggleAudience: (audienceId: string) => void
}

export const AudienceStep: React.FC<AudienceStepProps> = ({
  surveyType,
  audienceMode,
  selectedAudiences,
  onSetMode,
  onToggleAudience,
}) => {
  const header = TYPE_AUDIENCE_HEADERS[surveyType]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold">{header.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{header.description}</p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          onClick={() => onSetMode('single')}
          className={cn(
            'cursor-pointer p-4 transition-all duration-150',
            audienceMode === 'single'
              ? 'border-foreground bg-accent ring-1 ring-foreground/10'
              : 'hover:bg-accent/50',
          )}
        >
          <User className="w-5 h-5 text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold">Single Audience</h3>
          <p className="text-xs text-muted-foreground mt-1">
            One target group sees all questions
          </p>
        </Card>

        <Card
          onClick={() => onSetMode('multi')}
          className={cn(
            'cursor-pointer p-4 transition-all duration-150',
            audienceMode === 'multi'
              ? 'border-foreground bg-accent ring-1 ring-foreground/10'
              : 'hover:bg-accent/50',
          )}
        >
          <Users className="w-5 h-5 text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold">Multi-Segment</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Compare responses across multiple audience segments
          </p>
        </Card>
      </div>

      {/* Audience list (shown after mode selection) */}
      {audienceMode && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {audienceMode === 'single' ? 'Select an audience' : 'Select segments'}
          </p>
          <div className="space-y-1.5">
            {MOCK_AUDIENCES.map((audience) => {
              const isSelected = selectedAudiences.includes(audience.id)
              return (
                <button
                  key={audience.id}
                  onClick={() => onToggleAudience(audience.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors text-sm',
                    isSelected
                      ? 'bg-accent border border-foreground/15'
                      : 'hover:bg-accent/50 border border-transparent',
                  )}
                >
                  {/* Selection indicator */}
                  <span
                    className={cn(
                      'flex items-center justify-center w-4 h-4 rounded shrink-0 border transition-colors',
                      audienceMode === 'single' ? 'rounded-full' : 'rounded-sm',
                      isSelected
                        ? 'bg-foreground border-foreground'
                        : 'border-border',
                    )}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-background" />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{audience.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        n={audience.size.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {audience.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {audienceMode === 'multi' && selectedAudiences.length > 0 && (
            <p className="text-xs text-muted-foreground pt-2">
              {selectedAudiences.length} segment{selectedAudiences.length !== 1 ? 's' : ''} selected
              {' '}&middot;{' '}
              Total: n={MOCK_AUDIENCES
                .filter(a => selectedAudiences.includes(a.id))
                .reduce((sum, a) => sum + a.size, 0)
                .toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
