import React from 'react'
import type { Finding } from '@/types'
import { FindingChart } from './FindingChart'
import { EditableInsight } from './EditableInsight'
import { SegmentBreakdown } from './SegmentBreakdown'
import { cn } from '@/lib/utils'

interface FindingCardProps {
  finding: Finding
  index: number
  compact?: boolean
  onInsightEdit?: (questionId: string, newText: string) => void
  className?: string
}

/** Extract the leading number from a headline like "67% prefer Concept A" */
function extractHeadlineStat(headline: string): { stat: string; rest: string } | null {
  const match = headline.match(/^(\d+%?)(.*)$/)
  if (match) {
    return { stat: match[1], rest: match[2].trim() }
  }
  return null
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  index,
  compact = false,
  onInsightEdit,
  className,
}) => {
  const headlineParts = extractHeadlineStat(finding.headline)

  return (
    <div className={cn(
      'bg-background border border-border rounded-lg overflow-hidden',
      compact ? 'p-4' : 'p-5',
      className,
    )}>
      {/* Finding number */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Finding {index + 1}
        </span>
        {finding.percentile !== undefined && (
          <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
            {finding.percentile}th percentile
          </span>
        )}
      </div>

      {/* Two-column layout: text left, chart right */}
      <div className={cn(
        'flex gap-5',
        compact ? 'flex-col' : 'flex-col lg:flex-row',
      )}>
        {/* Left: Headline + Question + Insight */}
        <div className={cn(
          'flex flex-col gap-2 min-w-0',
          compact ? 'w-full' : 'lg:w-[38%] lg:flex-shrink-0',
        )}>
          {/* Headline stat */}
          {headlineParts ? (
            <div>
              <span className={cn(
                'font-display font-bold text-foreground leading-tight block',
                compact ? 'text-xl' : 'text-2xl',
              )}>
                {headlineParts.stat}
              </span>
              {headlineParts.rest && (
                <span className={cn(
                  'text-muted-foreground leading-snug block mt-0.5',
                  compact ? 'text-xs' : 'text-sm',
                )}>
                  {headlineParts.rest}
                </span>
              )}
            </div>
          ) : (
            <h3 className={cn(
              'font-display font-semibold text-foreground leading-tight',
              compact ? 'text-sm' : 'text-base',
            )}>
              {finding.headline}
            </h3>
          )}

          {/* Question text */}
          {finding.questionText && (
            <p className={cn(
              'text-muted-foreground',
              compact ? 'text-[10px] line-clamp-2' : 'text-xs',
            )}>
              {finding.questionText}
            </p>
          )}

          {/* Editable insight */}
          <EditableInsight
            text={finding.insight}
            editable={finding.editable && !compact}
            compact={compact}
            onSave={onInsightEdit ? (text) => onInsightEdit(finding.questionId, text) : undefined}
            className={compact ? 'mt-1' : 'mt-2'}
          />

          {/* Segment breakdown (below insight in left column) */}
          {finding.segmentBreakdowns && finding.segmentBreakdowns.length > 0 && (
            <SegmentBreakdown
              segments={finding.segmentBreakdowns}
              compact={compact}
              className={compact ? 'mt-2' : 'mt-3'}
            />
          )}
        </div>

        {/* Right: Chart */}
        <div className={cn(
          'flex-1 min-w-0',
          compact ? 'w-full' : '',
        )}>
          <FindingChart
            finding={finding}
            compact={compact}
          />
        </div>
      </div>
    </div>
  )
}
