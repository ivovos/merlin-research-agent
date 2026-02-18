import React from 'react'
import {
  X,
  ClipboardList,
  Lightbulb,
  MessageCircle,
  Image,
  Users,
  BarChart3,
  Bookmark,
  Pencil,
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
  onEdit?: (study: Survey) => void
  onSaveAsTemplate?: (studyId: string) => void
}

export const StudyPlanOverlay: React.FC<StudyPlanOverlayProps> = ({
  study,
  onClose,
  onEdit,
  onSaveAsTemplate,
}) => {
  const typeConfig = SURVEY_TYPE_CONFIGS.find(c => c.key === study.type)
  const TypeIcon = typeConfig ? (ICON_MAP[typeConfig.icon] || ClipboardList) : ClipboardList

  // Resolve audiences
  const parentAudienceIds = getSelectedAudienceIds(study.audiences)
  const audiences = MOCK_AUDIENCES.filter(a => parentAudienceIds.includes(a.id))
  const totalRespondents = study.sampleSize ?? getSelectedRespondentCount(study.audiences)
  const isMultiSegment = study.audiences.some(id => id.includes(':'))

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
              onClick={() => {
                onEdit?.(study)
                onClose()
              }}
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

