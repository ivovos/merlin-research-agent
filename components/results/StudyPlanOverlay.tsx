import React, { useState } from 'react'
import {
  X,
  ClipboardList,
  Lightbulb,
  MessageCircle,
  Image,
  Users,
  BarChart3,
  RefreshCw,
  Bookmark,
  Pencil,
  CopyPlus,
} from 'lucide-react'
import type { ElementType } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Survey } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import { MOCK_AUDIENCES, getSelectedAudienceIds, getSelectedRespondentCount } from '@/hooks/useSurveyBuilder'

const ICON_MAP: Record<string, ElementType> = {
  ClipboardList,
  Lightbulb,
  MessageCircle,
  Image,
  Users,
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_select: 'Single Choice',
  multi_select: 'Multiple Choice',
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Choice',
  likert: 'Likert Scale',
  scale: 'Scale',
  open_text: 'Open Text',
  rating: 'Star Rating',
  nps: 'NPS',
  ranking: 'Ranking',
  matrix: 'Matrix',
  yes_no: 'Yes / No',
  slider: 'Slider',
}

interface StudyPlanOverlayProps {
  study: Survey
  onClose: () => void
  onRerun?: (studyId: string) => void
  onRunNew?: (studyId: string) => void
  onSaveAsTemplate?: (studyId: string) => void
}

export const StudyPlanOverlay: React.FC<StudyPlanOverlayProps> = ({
  study,
  onClose,
  onRerun,
  onRunNew,
  onSaveAsTemplate,
}) => {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [hasEdits, setHasEdits] = useState(false)

  const typeConfig = SURVEY_TYPE_CONFIGS.find(c => c.key === study.type)
  const TypeIcon = typeConfig ? (ICON_MAP[typeConfig.icon] || ClipboardList) : ClipboardList

  // Resolve audiences
  const parentAudienceIds = getSelectedAudienceIds(study.audiences)
  const audiences = MOCK_AUDIENCES.filter(a => parentAudienceIds.includes(a.id))
  const totalRespondents = study.sampleSize ?? getSelectedRespondentCount(study.audiences)
  const isMultiSegment = study.audiences.some(id => id.includes(':'))

  // Handler for section clicks in edit mode
  const handleSectionClick = (_section: string) => {
    // Mark as edited — in the future this could open an inline editor
    setHasEdits(true)
  }

  // ── Edit mode (full-screen) ──
  if (mode === 'edit') {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <div className="shrink-0 border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h1 className="text-sm font-semibold font-display">Edit Study Plan</h1>
            <span className="text-xs text-muted-foreground">{study.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable content — clickable section cards */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-display font-semibold">Edit your study</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Click any section to make changes. Once you've made edits you can re-run or create a new survey.
              </p>
            </div>

            <EditableStudyPlanContent
              study={study}
              typeConfig={typeConfig}
              TypeIcon={TypeIcon}
              audiences={audiences}
              totalRespondents={totalRespondents}
              isMultiSegment={isMultiSegment}
              onSectionClick={handleSectionClick}
            />
          </div>
        </div>

        {/* Bottom action bar — edit mode */}
        <div className="shrink-0 border-t bg-background px-6 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('preview')}
              className="text-muted-foreground"
            >
              Back to preview
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={!hasEdits}
                onClick={() => {
                  onRerun?.(study.id)
                  onClose()
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-run Survey
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                disabled={!hasEdits}
                onClick={() => {
                  onRunNew?.(study.id)
                  onClose()
                }}
              >
                <CopyPlus className="w-3.5 h-3.5" />
                Run New Survey
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Preview mode (slide-in panel) ──
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel — slides in from right */}
      <div className="relative w-full max-w-lg bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="shrink-0 border-b px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h1 className="text-sm font-semibold font-display">Study Plan</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Study name sub-header */}
        <div className="shrink-0 px-5 py-3 border-b bg-muted/30">
          <p className="text-sm font-medium text-foreground">{study.name}</p>
          {totalRespondents > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalRespondents.toLocaleString()} respondents
            </p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            <ReadOnlyStudyPlanContent
              study={study}
              typeConfig={typeConfig}
              TypeIcon={TypeIcon}
              audiences={audiences}
              totalRespondents={totalRespondents}
              isMultiSegment={isMultiSegment}
            />
          </div>
        </div>

        {/* Bottom action bar — preview mode: Edit Plan + Save as Template */}
        <div className="shrink-0 border-t bg-background px-5 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 flex-1"
              onClick={() => {
                onSaveAsTemplate?.(study.id)
              }}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save as Template
            </Button>
            <Button
              size="sm"
              className="gap-1.5 flex-1"
              onClick={() => setMode('edit')}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shared content props ──

interface StudyPlanContentProps {
  study: Survey
  typeConfig: typeof SURVEY_TYPE_CONFIGS[number] | undefined
  TypeIcon: ElementType
  audiences: ReturnType<typeof MOCK_AUDIENCES['filter']>
  totalRespondents: number
  isMultiSegment: boolean
}

// ── Read-only study plan content (preview mode) ──

function ReadOnlyStudyPlanContent({
  study,
  typeConfig,
  TypeIcon,
  audiences,
  totalRespondents,
  isMultiSegment,
}: StudyPlanContentProps) {
  return (
    <>
      {/* Survey Type */}
      <ReadOnlySectionCard label="Study type">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <TypeIcon className="w-4.5 h-4.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{typeConfig?.label ?? study.type}</p>
            <p className="text-xs text-muted-foreground">{typeConfig?.description}</p>
          </div>
        </div>
      </ReadOnlySectionCard>

      {/* Audience */}
      {audiences.length > 0 && (
        <ReadOnlySectionCard label="Audience">
          <AudienceContent
            study={study}
            audiences={audiences}
            totalRespondents={totalRespondents}
            isMultiSegment={isMultiSegment}
          />
        </ReadOnlySectionCard>
      )}

      {/* Sample size (when no mock audiences match) */}
      {audiences.length === 0 && study.sampleSize && (
        <ReadOnlySectionCard label="Sample">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>n={study.sampleSize.toLocaleString()} respondents</span>
          </div>
        </ReadOnlySectionCard>
      )}

      {/* Questions */}
      <ReadOnlySectionCard label={`Questions (${study.questions.length})`}>
        <QuestionsContent questions={study.questions} />
      </ReadOnlySectionCard>

      {/* Findings summary */}
      {study.findings && study.findings.length > 0 && (
        <ReadOnlySectionCard label={`Findings (${study.findings.length})`}>
          <div className="space-y-2">
            {study.findings.map((f, i) => (
              <div key={f.questionId} className="flex items-start gap-2.5 py-1 text-sm">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-[10px] font-semibold text-primary shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{f.headline}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </ReadOnlySectionCard>
      )}
    </>
  )
}

// ── Editable study plan content (edit mode — clickable sections) ──

interface EditableStudyPlanContentProps extends StudyPlanContentProps {
  onSectionClick: (section: string) => void
}

function EditableStudyPlanContent({
  study,
  typeConfig,
  TypeIcon,
  audiences,
  totalRespondents,
  isMultiSegment,
  onSectionClick,
}: EditableStudyPlanContentProps) {
  return (
    <>
      {/* Survey Type */}
      <EditableSectionCard label="Study type" onClick={() => onSectionClick('type')}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <TypeIcon className="w-4.5 h-4.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{typeConfig?.label ?? study.type}</p>
            <p className="text-xs text-muted-foreground">{typeConfig?.description}</p>
          </div>
        </div>
      </EditableSectionCard>

      {/* Audience */}
      {audiences.length > 0 && (
        <EditableSectionCard label="Audience" onClick={() => onSectionClick('audience')}>
          <AudienceContent
            study={study}
            audiences={audiences}
            totalRespondents={totalRespondents}
            isMultiSegment={isMultiSegment}
          />
        </EditableSectionCard>
      )}

      {/* Sample size (when no mock audiences match) */}
      {audiences.length === 0 && study.sampleSize && (
        <EditableSectionCard label="Sample" onClick={() => onSectionClick('sample')}>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>n={study.sampleSize.toLocaleString()} respondents</span>
          </div>
        </EditableSectionCard>
      )}

      {/* Questions */}
      <EditableSectionCard label={`Questions (${study.questions.length})`} onClick={() => onSectionClick('questions')}>
        <QuestionsContent questions={study.questions} />
      </EditableSectionCard>
    </>
  )
}

// ── Shared content fragments ──

function AudienceContent({
  study,
  audiences,
  totalRespondents,
  isMultiSegment,
}: {
  study: Survey
  audiences: ReturnType<typeof MOCK_AUDIENCES['filter']>
  totalRespondents: number
  isMultiSegment: boolean
}) {
  return (
    <>
      <div className="space-y-1.5">
        {audiences.map((a) => {
          const selectedSegments = isMultiSegment
            ? (a.segments ?? []).filter(s => study.audiences.includes(s.id))
            : []

          return (
            <div key={a.id}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{a.name}</span>
                </div>
                {!isMultiSegment && (
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    n={a.size.toLocaleString()}
                  </span>
                )}
                {isMultiSegment && (
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {selectedSegments.length}/{(a.segments ?? []).length} segments
                  </span>
                )}
              </div>
              {isMultiSegment && selectedSegments.length > 0 && (
                <div className="ml-5.5 mt-1 space-y-0.5">
                  {selectedSegments.map(seg => (
                    <div key={seg.id} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{seg.name}</span>
                      <span className="shrink-0 ml-2">n={seg.size.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
        Total: n={totalRespondents.toLocaleString()}
      </div>
    </>
  )
}

function QuestionsContent({ questions }: { questions: Survey['questions'] }) {
  return (
    <div className="space-y-1">
      {questions.map((q, index) => (
        <div
          key={q.id}
          className="flex items-start gap-2.5 py-1.5 text-sm"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-semibold shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="leading-snug">{q.text || 'Untitled question'}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {QUESTION_TYPE_LABELS[q.type] || q.type}
              </span>
              {q.required && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Required
                </span>
              )}
            </div>
            {/* Show options if present */}
            {q.options && q.options.length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {q.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    {opt}
                  </div>
                ))}
              </div>
            )}
            {/* Show scale if present */}
            {q.scale && (
              <div className="mt-1.5 text-xs text-muted-foreground">
                Scale: {q.scale.min}–{q.scale.max}
                {q.scale.minLabel && ` (${q.scale.minLabel} → ${q.scale.maxLabel})`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Section card variants ──

/** Read-only section card (preview mode — no click) */
function ReadOnlySectionCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </p>
      <Card className="p-4">
        {children}
      </Card>
    </div>
  )
}

/** Editable section card (edit mode — click to edit, hover shows pencil) */
function EditableSectionCard({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left group"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="w-3 h-3" />
          Edit
        </span>
      </div>
      <Card className="p-4 transition-all duration-150 group-hover:bg-accent/50 group-hover:border-foreground/10">
        {children}
      </Card>
    </button>
  )
}
