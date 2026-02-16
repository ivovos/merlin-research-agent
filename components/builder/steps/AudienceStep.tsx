import React, { useEffect, useState } from 'react'
import { Check, Minus, ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { SurveyType } from '@/types'
import { MOCK_AUDIENCES, getSelectedRespondentCount } from '@/hooks/useSurveyBuilder'

const TYPE_AUDIENCE_HEADERS: Record<SurveyType, { title: string; description: string }> = {
  simple: { title: 'Who should take this poll?', description: 'Select the audience for your poll.' },
  concept: { title: 'Who will evaluate these propositions?', description: 'Choose respondents to review your propositions.' },
  message: { title: 'Who will see these messages?', description: 'Choose respondents to evaluate your messaging.' },
  creative: { title: 'Who will see this creative?', description: 'Choose respondents to review your creative assets.' },
  audience_exploration: { title: 'Who do you want to understand?', description: 'Select the audience you want to explore.' },
}

interface AudienceStepProps {
  surveyType: SurveyType
  audienceMode: 'single' | 'multi' | null
  selectedAudiences: string[]
  onSetMode: (mode: 'single' | 'multi') => void
  onToggleAudience: (audienceId: string) => void
  onToggleSegment: (segmentId: string) => void
  onToggleAllSegments: (audienceId: string) => void
}

export const AudienceStep: React.FC<AudienceStepProps> = ({
  surveyType,
  audienceMode,
  selectedAudiences,
  onSetMode,
  onToggleAudience,
  onToggleSegment,
  onToggleAllSegments,
}) => {
  const header = TYPE_AUDIENCE_HEADERS[surveyType]

  // Default to 'single' if no mode set yet
  useEffect(() => {
    if (!audienceMode) {
      onSetMode('single')
    }
  }, [audienceMode, onSetMode])

  const mode = audienceMode ?? 'single'

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-display font-semibold">{header.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{header.description}</p>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted w-fit">
        <button
          onClick={() => onSetMode('single')}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
            mode === 'single'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Single Audience
        </button>
        <button
          onClick={() => onSetMode('multi')}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
            mode === 'multi'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Multi-Segment
        </button>
      </div>

      {/* Content based on mode */}
      {mode === 'single' ? (
        <SingleAudienceList
          selectedAudiences={selectedAudiences}
          onToggleAudience={onToggleAudience}
        />
      ) : (
        <MultiSegmentList
          selectedAudiences={selectedAudiences}
          onToggleSegment={onToggleSegment}
          onToggleAllSegments={onToggleAllSegments}
        />
      )}
    </div>
  )
}

// ── Single mode: flat radio list ──

function SingleAudienceList({
  selectedAudiences,
  onToggleAudience,
}: {
  selectedAudiences: string[]
  onToggleAudience: (id: string) => void
}) {
  return (
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
            <span
              className={cn(
                'flex items-center justify-center w-4 h-4 rounded-full shrink-0 border transition-colors',
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

      <CreateAudienceButton />
    </div>
  )
}

// ── Multi mode: expandable audience sections with segments ──

function MultiSegmentList({
  selectedAudiences,
  onToggleSegment,
  onToggleAllSegments,
}: {
  selectedAudiences: string[]
  onToggleSegment: (id: string) => void
  onToggleAllSegments: (id: string) => void
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalN = getSelectedRespondentCount(selectedAudiences)

  return (
    <div className="space-y-1.5">
      {MOCK_AUDIENCES.map((audience) => {
        const segments = audience.segments ?? []
        const segIds = segments.map(s => s.id)
        const selectedCount = segIds.filter(id => selectedAudiences.includes(id)).length
        const allSelected = segments.length > 0 && selectedCount === segments.length
        const someSelected = selectedCount > 0 && !allSelected
        const isOpen = expandedIds.has(audience.id)

        return (
          <Collapsible
            key={audience.id}
            open={isOpen}
            onOpenChange={() => toggleExpanded(audience.id)}
          >
            {/* Audience header row */}
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm border',
                selectedCount > 0
                  ? 'bg-accent border-foreground/15'
                  : 'hover:bg-accent/50 border-transparent',
              )}
            >
              {/* Select-all checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleAllSegments(audience.id) }}
                className={cn(
                  'flex items-center justify-center w-4 h-4 rounded-sm shrink-0 border transition-colors',
                  (allSelected || someSelected)
                    ? 'bg-foreground border-foreground'
                    : 'border-border',
                )}
              >
                {allSelected && <Check className="w-2.5 h-2.5 text-background" />}
                {someSelected && <Minus className="w-2.5 h-2.5 text-background" />}
              </button>

              {/* Audience info */}
              <CollapsibleTrigger asChild>
                <button className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{audience.name}</span>
                    {selectedCount > 0 && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {selectedCount}/{segments.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {audience.description}
                  </p>
                </button>
              </CollapsibleTrigger>

              {/* Expand/collapse chevron */}
              <CollapsibleTrigger asChild>
                <button className="p-1 hover:bg-muted rounded shrink-0">
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
              </CollapsibleTrigger>
            </div>

            {/* Sub-segments */}
            <CollapsibleContent>
              <div className="ml-7 mt-1 space-y-0.5 pb-1">
                {segments.map((segment) => {
                  const isSelected = selectedAudiences.includes(segment.id)
                  return (
                    <button
                      key={segment.id}
                      onClick={() => onToggleSegment(segment.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors text-sm',
                        isSelected
                          ? 'bg-accent/70'
                          : 'hover:bg-accent/40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex items-center justify-center w-3.5 h-3.5 rounded-sm shrink-0 border transition-colors',
                          isSelected
                            ? 'bg-foreground border-foreground'
                            : 'border-border',
                        )}
                      >
                        {isSelected && <Check className="w-2 h-2 text-background" />}
                      </span>

                      <span className="flex-1 truncate">{segment.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        n={segment.size.toLocaleString()}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}

      <CreateAudienceButton />

      {selectedAudiences.length > 0 && (
        <p className="text-xs text-muted-foreground pt-1">
          {selectedAudiences.length} sub-segment{selectedAudiences.length !== 1 ? 's' : ''} selected
          {' '}&middot;{' '}
          Total: n={totalN.toLocaleString()}
        </p>
      )}
    </div>
  )
}

// ── Shared "Create new audience" button ──

function CreateAudienceButton() {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-2 px-3 py-2.5 mt-2 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
      onClick={() => {/* placeholder — no-op for now */}}
    >
      <Plus className="w-4 h-4" />
      Create new audience
    </button>
  )
}
