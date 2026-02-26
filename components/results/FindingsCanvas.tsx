import React, { useState, useMemo } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  SquareArrowOutUpRight,
  MoreVertical,
  BarChart3,
  FileText,
  Bookmark,
} from 'lucide-react'
import type { Finding, Stimulus } from '@/types'
import { FindingCard } from './FindingCard'
import { FindingsLightbox } from './FindingsLightbox'
import { StimulusStrip } from './StimulusStrip'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useFindingsContext } from '@/hooks/useFindingsStore'

interface FindingsCanvasProps {
  findings: Finding[]
  title: string
  typeBadge?: string
  respondents?: number
  /** Study ID — used to scope saved findings */
  studyId?: string
  /** All stimuli from the project — used to resolve finding.stimuliIds */
  stimuli?: Stimulus[]
  compact?: boolean
  onExpand?: () => void
  onOpenPlan?: () => void
  onInsightEdit?: (questionId: string, newText: string) => void
  onSaveToProject?: () => void
  onRefineInBuilder?: () => void
  defaultCollapsed?: boolean
  className?: string
}

export const FindingsCanvas: React.FC<FindingsCanvasProps> = ({
  findings,
  title,
  respondents,
  studyId,
  stimuli = [],
  onOpenPlan,
  defaultCollapsed = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [findingsOpen, setFindingsOpen] = useState(false)

  // Findings store (null if no FindingsProvider in tree — save/unsave will be no-ops)
  const store = useFindingsContext()

  const savedCount = studyId && store ? store.getCount(studyId) : 0

  // Callbacks for FindingCard save/unsave
  const handleSave = (finding: Finding) => {
    if (studyId && store) store.saveFinding(studyId, finding)
  }

  const handleUnsave = (questionId: string) => {
    if (studyId && store) store.removeFinding(studyId, questionId)
  }

  // Determine if all findings share the same stimulus set
  const { sharedStimuli, isShared } = useMemo(() => {
    if (stimuli.length === 0) return { sharedStimuli: [], isShared: false }

    const findingsWithStimuli = findings.filter(f => f.stimuliIds && f.stimuliIds.length > 0)
    if (findingsWithStimuli.length === 0) return { sharedStimuli: [], isShared: false }

    // Check if all findings have the same stimuliIds set
    const firstSet = [...(findingsWithStimuli[0].stimuliIds ?? [])].sort().join(',')
    const allSame = findingsWithStimuli.every(
      f => [...(f.stimuliIds ?? [])].sort().join(',') === firstSet
    )

    if (allSame) {
      const ids = findingsWithStimuli[0].stimuliIds ?? []
      const resolved = ids.map(id => stimuli.find(s => s.id === id)).filter(Boolean) as Stimulus[]
      return { sharedStimuli: resolved, isShared: true }
    }

    return { sharedStimuli: [], isShared: false }
  }, [findings, stimuli])

  /** Resolve stimuliIds to Stimulus objects for a specific finding */
  const resolveFindingStimuli = (finding: Finding): Stimulus[] => {
    if (!finding.stimuliIds || finding.stimuliIds.length === 0) return []
    return finding.stimuliIds
      .map(id => stimuli.find(s => s.id === id))
      .filter(Boolean) as Stimulus[]
  }

  const handleCopy = () => {
    const text = findings
      .map(
        (f, i) =>
          `Q${i + 1}: ${f.questionText || f.headline}\n${(f.chartData ?? []).map(d => `  ${d.name}: ${d.value}%`).join('\n')}`,
      )
      .join('\n\n')
    navigator.clipboard.writeText(`${title}\n\n${text}`)
  }

  const hasStore = !!(studyId && store)

  return (
    <div
      className={cn(
        'bg-muted/50 border border-border rounded-xl overflow-hidden',
        className,
      )}
    >
      {/* Header — left-aligned title + right actions */}
      <div className="flex items-center px-4 py-3 bg-background-pure border-b border-border">
        {/* Left-aligned title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BarChart3 className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-semibold text-foreground truncate">
            {title}
          </span>
          {respondents && (
            <span className="text-xs text-muted-foreground shrink-0">
              {respondents.toLocaleString()} respondents
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* Findings badge — only visible when 1+ saved */}
          {savedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 font-semibold text-foreground hover:bg-accent"
              onClick={() => setFindingsOpen(true)}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{savedCount}</span>
            </Button>
          )}

          {/* Open Plan */}
          {onOpenPlan && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onOpenPlan}
            >
              <FileText className="w-3.5 h-3.5" />
              Open Plan
            </Button>
          )}

          {/* Collapse */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>

          {/* More */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy all
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards */}
      {!isCollapsed && (
        <div className="p-3 space-y-3">
          {/* Shared stimulus strip — shown once above all findings */}
          {isShared && sharedStimuli.length > 0 && (
            <StimulusStrip
              stimuli={sharedStimuli}
              className="px-3 py-3 mb-1 bg-background-pure rounded-lg border border-border"
            />
          )}

          {findings.map((finding, i) => (
            <FindingCard
              key={finding.questionId}
              finding={finding}
              index={i}
              respondents={respondents}
              stimuli={isShared ? sharedStimuli : resolveFindingStimuli(finding)}
              isSaved={hasStore ? store!.isSaved(studyId!, finding.questionId) : false}
              onSave={hasStore ? handleSave : undefined}
              onUnsave={hasStore ? handleUnsave : undefined}
            />
          ))}

          {findings.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              No findings available
            </div>
          )}
        </div>
      )}

      {/* Collapsed preview */}
      {isCollapsed && findings.length > 0 && (
        <div className="px-4 py-3 bg-background/50">
          <p className="text-sm text-muted-foreground truncate">
            <span className="font-medium text-foreground">
              {findings[0].questionText || findings[0].headline}
            </span>
            {findings.length > 1 && (
              <span className="ml-2">+{findings.length - 1} more</span>
            )}
          </p>
        </div>
      )}

      {/* Findings lightbox */}
      {studyId && (
        <FindingsLightbox
          open={findingsOpen}
          onOpenChange={setFindingsOpen}
          studyId={studyId}
          studyName={title}
        />
      )}
    </div>
  )
}
