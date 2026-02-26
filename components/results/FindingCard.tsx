import React from 'react'
import { MoreHorizontal, Copy, Download, Trash2, Bookmark, BookmarkCheck, SquareArrowOutUpRight, Quote } from 'lucide-react'
import type { Finding, Stimulus, SelectedSegment } from '@/types'
import { cn } from '@/lib/utils'
import { DEFAULT_BRAND_COLORS, getBrandColorArray } from '@/lib/brandDefaults'
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
  /** Stimuli associated with this finding (shown as small clickable thumbnails) */
  stimuli?: Stimulus[]
  compact?: boolean
  onInsightEdit?: (questionId: string, newText: string) => void
  onDelete?: (questionId: string) => void
  /** Save this finding to the findings store */
  onSave?: (finding: Finding) => void
  /** Remove this finding from the findings store */
  onUnsave?: (questionId: string) => void
  /** Whether this finding is currently saved */
  isSaved?: boolean
  /** Called when a bar is clicked — provides segment data for follow-up scoping */
  onBarClick?: (segment: SelectedSegment) => void
  /** Currently selected segments — used to highlight/dim bars */
  selectedSegments?: SelectedSegment[]
  className?: string
}

/** Primary brand colour used for bars and audience dot */
export const BAR_COLOR = DEFAULT_BRAND_COLORS.primary

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

export function BarRow({
  label,
  value,
  maxValue,
  onClick,
  isSelected,
  isDimmed,
}: {
  label: string
  value: number
  maxValue: number
  onClick?: () => void
  /** This bar is currently selected */
  isSelected?: boolean
  /** Another bar in this card is selected — dim this one */
  isDimmed?: boolean
}) {
  // barPct is 0–100 relative to maxValue. Scale it into 0–MAX_BAR_FRACTION of
  // the column so the label always fits.
  const barPct = maxValue > 0 ? (value / maxValue) * MAX_BAR_FRACTION * 100 : 0

  return (
    <div
      className={cn(
        'grid items-center transition-opacity',
        onClick && 'cursor-pointer rounded-md -mx-1 px-1 hover:bg-muted/60 transition-colors',
        isDimmed && 'opacity-20',
      )}
      style={{ gridTemplateColumns: '40% 1fr' }}
      onClick={onClick}
    >
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

/**
 * Grouped bar row for multi-segment comparisons.
 * Shows one bar per segment side-by-side with different colours.
 */
function GroupedBarRow({
  label,
  segments,
  colors,
  maxValue,
  onSegmentClick,
  selectedSegmentKeys,
  hasAnySelection,
}: {
  label: string
  segments: { key: string; value: number; displayName?: string }[]
  colors: string[]
  maxValue: number
  onSegmentClick?: (segmentKey: string, segmentDisplayName: string, value: number) => void
  /** Keys of segments in this row that are currently selected */
  selectedSegmentKeys?: Set<string>
  /** Whether any segment in the parent card is selected */
  hasAnySelection?: boolean
}) {
  return (
    <div className="grid items-center" style={{ gridTemplateColumns: '40% 1fr' }}>
      <span className="text-sm text-muted-foreground text-right leading-snug pr-3 line-clamp-2">
        {label}
      </span>
      <div className="flex flex-col gap-1">
        {segments.map((seg, i) => {
          const barPct = maxValue > 0 ? (seg.value / maxValue) * MAX_BAR_FRACTION * 100 : 0
          const segLabel = `${label} (${seg.displayName ?? seg.key})`
          const isThisSelected = selectedSegmentKeys?.has(segLabel)
          const isDimmed = hasAnySelection && !isThisSelected
          return (
            <div
              key={seg.key}
              className={cn(
                'flex items-center h-5 transition-opacity',
                onSegmentClick && 'cursor-pointer rounded-sm hover:opacity-80 transition-opacity',
                isDimmed && 'opacity-20',
              )}
              onClick={onSegmentClick ? () => onSegmentClick(seg.key, seg.displayName ?? seg.key, seg.value) : undefined}
            >
              <div
                className="h-full rounded-sm shrink-0"
                style={{
                  width: `${barPct}%`,
                  backgroundColor: colors[i % colors.length],
                  minWidth: seg.value > 0 ? 4 : 0,
                }}
              />
              <span className="text-xs font-medium text-foreground tabular-nums shrink-0 pl-2">
                {Math.round(seg.value)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  index: _index,
  respondents,
  stimuli,
  compact: _compact = false,
  onInsightEdit: _onInsightEdit,
  onDelete,
  onSave,
  onUnsave,
  isSaved: isSavedProp = false,
  onBarClick,
  selectedSegments,
  className,
}) => {
  const isQualitative = finding.chartType === 'qualitative'

  // Compute which bars in THIS card are selected
  const selectedInThisCard = (selectedSegments ?? []).filter(
    s => s.questionId === finding.questionId
  )
  const selectedLabels = new Set(selectedInThisCard.map(s => s.answerLabel))
  const hasAnySelection = selectedInThisCard.length > 0

  // Detect segment keys for grouped_bar charts
  const chartData = finding.chartData ?? []
  const allNumericKeys = finding.chartType === 'grouped_bar' && chartData.length > 0
    ? Object.keys(chartData[0]).filter(k => k !== 'name' && typeof chartData[0][k] === 'number')
    : []
  // If segmentBreakdowns exists, only take matching count of keys (excludes computed cols like "gap")
  const segmentCount = finding.segmentBreakdowns?.length
  const segmentKeys = segmentCount ? allNumericKeys.slice(0, segmentCount) : allNumericKeys
  const isGrouped = segmentKeys.length >= 2

  const brandColors = getBrandColorArray()

  // Extract chart rows — single-segment path (skip for qualitative)
  const rows = (isGrouped || isQualitative) ? [] : chartData.map(d => {
    let val = Number(d.value ?? 0)
    if (!val) {
      for (const [k, v] of Object.entries(d)) {
        if (k !== 'name' && typeof v === 'number') { val = v; break }
      }
    }
    return { label: String(d.name ?? ''), value: val }
  })
  const maxValue = isGrouped
    ? Math.max(...chartData.flatMap(d => segmentKeys.map(k => Number(d[k] ?? 0))), 1)
    : Math.max(...rows.map(r => r.value), 1)

  // Audience labels — for grouped bars, prefer human-readable names from segmentBreakdowns
  // (chartData keys like "techSavvy" map to segmentBreakdowns[0].segmentName "Tech-Savvy Families")
  const audienceLabels = isGrouped
    ? segmentKeys.map((key, i) =>
        finding.segmentBreakdowns?.[i]?.segmentName ?? key
      )
    : [finding.segmentBreakdowns?.[0]?.segmentName ?? 'General Population']

  const saved = isSavedProp

  return (
    <div
      className={cn(
        'bg-background-pure border border-border rounded-xl p-5 space-y-5',
        className,
      )}
    >
      {/* Top line: audience dot(s) + respondent count + kebab */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {isQualitative ? (
            <>
              <Quote className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Focus Group</span>
            </>
          ) : isGrouped ? (
            audienceLabels.map((label, i) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: brandColors[i % brandColors.length] }}
                />
                <span>{label}</span>
              </span>
            ))
          ) : (
            <>
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: BAR_COLOR }}
              />
              <span>{audienceLabels[0]}</span>
            </>
          )}
          {respondents && (
            <span className="text-muted-foreground/60">
              {respondents.toLocaleString()} {isQualitative ? 'Participants' : 'Respondents'}
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
            <DropdownMenuItem
              onSelect={() => {
                if (saved) {
                  onUnsave?.(finding.questionId)
                } else {
                  onSave?.(finding)
                }
              }}
            >
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

      {/* Collapsible stimulus section */}
      {stimuli && stimuli.length > 0 && (
        <StimulusThumbnails stimuli={stimuli} />
      )}

      {/* Chart — qualitative quotes, grouped bars, or single bars */}
      {isQualitative && chartData.length > 0 ? (
        <div className="space-y-3">
          {chartData.map((d, i) => (
            <div key={i} className="relative pl-4 border-l-2 border-primary/30">
              <p className="text-sm text-foreground leading-relaxed italic">
                &ldquo;{String(d.quote ?? '')}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                &mdash; {String(d.name ?? '')}
              </p>
            </div>
          ))}
        </div>
      ) : isGrouped && chartData.length > 0 ? (
        <div className="space-y-3 p-4">
          {chartData.map((d, i) => (
            <GroupedBarRow
              key={i}
              label={String(d.name ?? '')}
              segments={segmentKeys.map((k, si) => ({
                key: k,
                value: Number(d[k] ?? 0),
                displayName: audienceLabels[si],
              }))}
              colors={brandColors}
              maxValue={maxValue}
              selectedSegmentKeys={selectedLabels}
              hasAnySelection={hasAnySelection}
              onSegmentClick={onBarClick ? (_segKey, segDisplayName, value) => onBarClick({
                questionId: finding.questionId,
                questionText: finding.questionText || finding.headline,
                answerLabel: `${String(d.name ?? '')} (${segDisplayName})`,
                percentage: Math.round(value),
                respondents: respondents ?? 0,
              }) : undefined}
            />
          ))}
        </div>
      ) : rows.length > 0 ? (
        <div className="space-y-2.5 p-4">
          {rows.map((row, i) => (
            <BarRow
              key={i}
              label={row.label}
              value={row.value}
              maxValue={maxValue}
              isSelected={selectedLabels.has(row.label)}
              isDimmed={hasAnySelection && !selectedLabels.has(row.label)}
              onClick={onBarClick ? () => onBarClick({
                questionId: finding.questionId,
                questionText: finding.questionText || finding.headline,
                answerLabel: row.label,
                percentage: row.value,
                respondents: respondents ?? 0,
              }) : undefined}
            />
          ))}
        </div>
      ) : null}

      {/* Insight text for qualitative findings */}
      {isQualitative && finding.insight && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {finding.insight}
        </p>
      )}
    </div>
  )
}
