import React, { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  X,
} from 'lucide-react'
import type { Finding } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useFindingsContextStrict } from '@/hooks/useFindingsStore'
import { BarRow, BAR_COLOR } from './FindingCard'
import { MiniChartThumb } from './MiniChartThumb'
import { ShareButton } from './SharePopover'

interface FindingsLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studyId: string
  studyName: string
}

/** Format a relative time string from a timestamp */
function timeAgo(ts?: number): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export const FindingsLightbox: React.FC<FindingsLightboxProps> = ({
  open,
  onOpenChange,
  studyId,
  studyName,
}) => {
  const store = useFindingsContextStrict()
  const savedFindings = store.getSavedFindings(studyId)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)

  // Reset to list when dialog closes
  useEffect(() => {
    if (!open) setSelectedQuestionId(null)
  }, [open])

  const selectedFinding = selectedQuestionId
    ? savedFindings.find(f => f.questionId === selectedQuestionId) ?? null
    : null

  const isDetail = !!selectedFinding

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'p-0 overflow-hidden flex flex-col gap-0',
          isDetail ? 'max-w-xl' : 'max-w-lg',
          'max-h-[88vh]',
        )}
      >
        <DialogTitle className="sr-only">
          {isDetail ? 'Finding Detail' : 'Saved Findings'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isDetail
            ? `Detail view for finding: ${selectedFinding?.headline}`
            : `View and share findings from ${studyName}`
          }
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            {isDetail && (
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSelectedQuestionId(null)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {isDetail ? 'Finding' : 'Saved Findings'}
              </h2>
              {!isDetail && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {savedFindings.length} finding{savedFindings.length !== 1 ? 's' : ''} from this study
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isDetail ? (
            <DetailView
              finding={selectedFinding!}
              studyId={studyId}
              studyName={studyName}
            />
          ) : (
            <ListView
              findings={savedFindings}
              onSelect={(qId) => setSelectedQuestionId(qId)}
            />
          )}
        </div>

        {/* Footer */}
        {isDetail ? (
          <DetailFooter finding={selectedFinding!} studyName={studyName} />
        ) : (
          <ListFooter findings={savedFindings} studyName={studyName} />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── List View ──

function ListView({
  findings,
  onSelect,
}: {
  findings: Finding[]
  onSelect: (questionId: string) => void
}) {
  return (
    <div className="px-3 py-2">
      {findings.map(f => (
        <button
          key={f.questionId}
          className="w-full flex items-start gap-3 p-3.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
          onClick={() => onSelect(f.questionId)}
        >
          <MiniChartThumb finding={f} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug mb-0.5">
              {f.headline}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">
              {f.insight}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
              <span>Survey</span>
              {f.savedAt && (
                <>
                  <span>·</span>
                  <span>{timeAgo(f.savedAt)}</span>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-border mt-0.5 shrink-0" />
        </button>
      ))}

      {findings.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No findings saved yet
        </div>
      )}
    </div>
  )
}

// ── Detail View ──

function DetailView({
  finding,
  studyId,
  studyName,
}: {
  finding: Finding
  studyId: string
  studyName: string
}) {
  const store = useFindingsContextStrict()
  const [editing, setEditing] = useState(false)
  const [conclusion, setConclusion] = useState(finding.conclusion ?? '')

  // Sync when finding changes
  useEffect(() => {
    setConclusion(finding.conclusion ?? '')
    setEditing(false)
  }, [finding.questionId, finding.conclusion])

  const handleSaveConclusion = useCallback(() => {
    store.updateConclusion(studyId, finding.questionId, conclusion)
    setEditing(false)
  }, [store, studyId, finding.questionId, conclusion])

  // Extract chart rows
  const rows = (finding.chartData ?? []).map(d => {
    let val = Number(d.value ?? 0)
    if (!val) {
      for (const [k, v] of Object.entries(d)) {
        if (k !== 'name' && typeof v === 'number') { val = v; break }
      }
    }
    return { label: String(d.name ?? ''), value: val }
  })
  const maxValue = Math.max(...rows.map(r => r.value), 1)

  return (
    <div className="px-5 py-5 space-y-5 animate-in fade-in duration-300">
      {/* Headline */}
      <h3 className="text-lg font-semibold text-foreground leading-snug font-display">
        {finding.headline}
      </h3>

      {/* Insight */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {finding.insight}
      </p>

      {/* Evidence panel */}
      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Evidence
        </span>
        <div className="mt-2 bg-muted/50 rounded-lg border border-border overflow-hidden">
          {/* Bar chart */}
          {rows.length > 0 && (
            <div className="p-4 space-y-2.5">
              {finding.questionText && (
                <p className="text-xs text-muted-foreground mb-2">
                  {finding.questionText}
                </p>
              )}
              {rows.map((row, i) => (
                <BarRow key={i} label={row.label} value={row.value} maxValue={maxValue} />
              ))}
            </div>
          )}

          {/* Quote */}
          {finding.sourceQuote && (
            <div className={cn('p-4', rows.length > 0 && 'border-t border-border')}>
              <blockquote className="text-sm text-foreground/80 italic leading-relaxed border-l-2 border-border pl-3">
                &ldquo;{finding.sourceQuote.text}&rdquo;
                <footer className="text-xs text-muted-foreground not-italic mt-1">
                  — {finding.sourceQuote.attribution}
                </footer>
              </blockquote>
            </div>
          )}
        </div>
      </div>

      {/* Conclusion — editable */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Conclusion
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-0 px-1 text-xs font-medium"
            onClick={() => {
              if (editing) handleSaveConclusion()
              else setEditing(true)
            }}
          >
            {editing ? 'Done' : 'Edit'}
          </Button>
        </div>

        {editing ? (
          <Textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            onBlur={handleSaveConclusion}
            autoFocus
            className="text-sm leading-relaxed min-h-[80px] resize-y"
          />
        ) : (
          <div
            onClick={() => setEditing(true)}
            className="text-sm text-foreground leading-relaxed p-3 rounded-lg border border-border
                       cursor-pointer hover:border-muted-foreground/30 transition-colors"
          >
            {conclusion || 'No conclusion yet — click to add one.'}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-1.5">AI-suggested · click to edit</p>
      </div>

      {/* Source */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: BAR_COLOR }}
        />
        <span>From: {studyName}</span>
        {finding.segmentBreakdowns?.[0]?.segmentName && (
          <>
            <span>·</span>
            <span>{finding.segmentBreakdowns[0].segmentName}</span>
          </>
        )}
      </div>
    </div>
  )
}

// ── Footer components ──

function ListFooter({
  findings,
  studyName,
}: {
  findings: Finding[]
  studyName: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = useCallback(() => {
    const text = findings
      .map(f => {
        const lines = [`**${f.headline}**`, '', f.insight]
        const data = (f.chartData ?? []).map(d => `${d.name}: ${d.value}%`).join('  ')
        if (data) lines.push('', data)
        if (f.sourceQuote) lines.push('', `"${f.sourceQuote.text}" — ${f.sourceQuote.attribution}`)
        if (f.conclusion) lines.push('', `Conclusion: ${f.conclusion}`)
        return lines.join('\n')
      })
      .join('\n\n---\n\n')
    navigator.clipboard.writeText(`Findings from ${studyName}\n\n${text}`)
    setCopied(true)
  }, [findings, studyName])

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(id)
  }, [copied])

  if (findings.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-5 py-3 border-t border-border shrink-0">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyAll}>
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied all' : 'Copy all'}
      </Button>
      <div className="flex-1" />
      <ShareButton
        label="Share all"
        title={`Share ${findings.length} finding${findings.length !== 1 ? 's' : ''}`}
      />
    </div>
  )
}

function DetailFooter({
  finding,
  studyName,
}: {
  finding: Finding
  studyName: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const lines = [`**${finding.headline}**`, '', finding.insight]
    const data = (finding.chartData ?? []).map(d => `${d.name}: ${d.value}%`).join('  ')
    if (data) lines.push('', data)
    if (finding.sourceQuote) lines.push('', `"${finding.sourceQuote.text}" — ${finding.sourceQuote.attribution}`)
    if (finding.conclusion) lines.push('', `Conclusion: ${finding.conclusion}`)
    navigator.clipboard.writeText(`Finding from ${studyName}\n\n${lines.join('\n')}`)
    setCopied(true)
  }, [finding, studyName])

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <div className="flex items-center gap-2 px-5 py-3 border-t border-border shrink-0">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <div className="flex-1" />
      <ShareButton label="Share" title="Share finding" />
    </div>
  )
}
