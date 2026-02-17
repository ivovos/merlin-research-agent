import React, { useState } from 'react'
import { MoreHorizontal, Copy, Download, Trash2, Bookmark, BookmarkCheck, SquareArrowOutUpRight } from 'lucide-react'
import type { Finding, Stimulus } from '@/types'
import { cn } from '@/lib/utils'
import { DEFAULT_BRAND_COLORS } from '@/lib/brandDefaults'
import { StimulusThumbnails } from './StimulusStrip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FindingCardProps {
  finding: Finding
  index: number
  respondents?: number
  /** Per-finding stimuli (shown as bigger thumbnails when findings have different stimulus sets) */
  stimuli?: Stimulus[]
  /** Shared stimulus names (shown as small text indicator when all findings share same set) */
  sharedStimuliNames?: string[]
  compact?: boolean
  onInsightEdit?: (questionId: string, newText: string) => void
  onDelete?: (questionId: string) => void
  className?: string
}

/** Primary brand colour used for bars and audience dot */
const BAR_COLOR = DEFAULT_BRAND_COLORS.primary

/**
 * Pure CSS horizontal bar row.
 *
 * Layout — fixed 3-column grid so every row aligns:
 *   [label ·right-aligned, fixed 40%]  [█████ bar + 12px + pct%]
 *
 * The bar column uses a CSS calc: the bar is barPct% of 75% of the column,
 * so the widest bar leaves ~25% for the percentage label + gap.
 * The percentage label sits inline immediately after the bar.
 */
const MAX_BAR_FRACTION = 0.75 // bar area uses at most 75% of the column

function BarRow({
  label,
  value,
  maxValue,
}: {
  label: string
  value: number
  maxValue: number
}) {
  // barPct is 0–100 relative to maxValue. Scale it into 0–MAX_BAR_FRACTION of
  // the column so the label always fits.
  const barPct = maxValue > 0 ? (value / maxValue) * MAX_BAR_FRACTION * 100 : 0

  return (
    <div className="grid items-center" style={{ gridTemplateColumns: '40% 1fr' }}>
      {/* Label — right-aligned, consistent column width */}
      <span className="text-sm text-muted-foreground text-right leading-snug pr-3 line-clamp-2">
        {label}
      </span>

      {/* Bar + percentage inline — pct sits right after bar end */}
      <div className="flex items-center h-6">
        <div
          className="h-full rounded-sm shrink-0"
          style={{
            width: `${barPct}%`,
            backgroundColor: BAR_COLOR,
            minWidth: value > 0 ? 4 : 0,
          }}
        />
        <span className="text-sm font-medium text-foreground tabular-nums shrink-0 pl-3">
          {value}%
        </span>
      </div>
    </div>
  )
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  index: _index,
  respondents,
  stimuli,
  sharedStimuliNames,
  compact: _compact = false,
  onInsightEdit: _onInsightEdit,
  onDelete,
  className,
}) => {
  // Extract chart rows from chartData
  // For grouped_bar charts the data uses segment keys (e.g. techSavvy, general)
  // instead of a plain `value` — pick the first numeric field that isn't `name`.
  const rows = (finding.chartData ?? []).map(d => {
    let val = Number(d.value ?? 0)
    if (!val) {
      // Fallback: grab first numeric property (skipping `name`)
      for (const [k, v] of Object.entries(d)) {
        if (k !== 'name' && typeof v === 'number') { val = v; break }
      }
    }
    return { label: String(d.name ?? ''), value: val }
  })
  const maxValue = Math.max(...rows.map(r => r.value), 1)

  // Audience + respondent line (from segmentBreakdowns or finding metadata)
  const audienceLabel =
    finding.segmentBreakdowns?.[0]?.segmentName ?? 'General Population'

  const [saved, setSaved] = useState(false)

  return (
    <div
      className={cn(
        'bg-background border border-border rounded-xl p-5 space-y-5',
        className,
      )}
    >
      {/* Top line: audience dot + respondent count + kebab */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: BAR_COLOR }}
          />
          <span>{audienceLabel}</span>
          {respondents && (
            <span className="text-muted-foreground/60">
              {respondents.toLocaleString()} Respondents
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1 rounded"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSaved(prev => !prev)}>
              {saved ? (
                <BookmarkCheck className="w-4 h-4 mr-2" />
              ) : (
                <Bookmark className="w-4 h-4 mr-2" />
              )}
              {saved ? 'Saved as finding' : 'Save as finding'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(finding.questionId)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Question text as prominent headline */}
      <h3 className="text-lg font-semibold text-foreground leading-snug font-display">
        {finding.questionText || finding.headline}
      </h3>

      {/* Per-finding stimulus thumbnails (when findings have different stimulus sets) */}
      {stimuli && stimuli.length > 0 && (
        <StimulusThumbnails stimuli={stimuli} className="pt-1" />
      )}

      {/* Shared stimulus indicator (small text when all findings share same set) */}
      {sharedStimuliNames && sharedStimuliNames.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="opacity-60">Stimulus:</span>
          <span>{sharedStimuliNames.join(' · ')}</span>
        </div>
      )}

      {/* Clean horizontal bar chart */}
      {rows.length > 0 && (
        <div className="space-y-2.5 p-4">
          {rows.map((row, i) => (
            <BarRow
              key={i}
              label={row.label}
              value={row.value}
              maxValue={maxValue}
            />
          ))}
        </div>
      )}
    </div>
  )
}
