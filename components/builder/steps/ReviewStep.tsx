import React from 'react'
import {
  ClipboardList,
  Lightbulb,
  MessageCircle,
  Image,
  Users,
  Pencil,
  ImageIcon,
  FileText,
} from 'lucide-react'
import type { ElementType } from 'react'
import { Card } from '@/components/ui/card'
import type { SurveyType, SurveyQuestion, Stimulus } from '@/types'
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
  single_select: 'Single Select',
  multi_select: 'Multi Select',
  likert: 'Likert Scale',
  scale: 'Numeric Scale',
  open_text: 'Open Text',
  rating: 'Star Rating',
  nps: 'NPS',
  ranking: 'Ranking',
  matrix: 'Matrix',
  yes_no: 'Yes / No',
  image_choice: 'Image Choice',
  slider: 'Slider',
  maxdiff: 'MaxDiff',
  paired_comparison: 'Paired Comparison',
  semantic_differential: 'Semantic Differential',
  conjoint: 'Conjoint',
  heatmap: 'Heatmap',
  video_response: 'Video Response',
  audio_response: 'Audio Response',
}

interface ReviewStepProps {
  surveyType: SurveyType
  selectedAudiences: string[]
  stimuli: Stimulus[]
  questions: SurveyQuestion[]
  flowSteps: string[]
  onGoToStep: (index: number) => void
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  surveyType,
  selectedAudiences,
  stimuli,
  questions,
  flowSteps,
  onGoToStep,
}) => {
  const typeConfig = SURVEY_TYPE_CONFIGS.find(c => c.key === surveyType)
  const TypeIcon = typeConfig ? (ICON_MAP[typeConfig.icon] || ClipboardList) : ClipboardList

  // Resolve audiences from both single-mode IDs ("uk-grocery") and multi-mode segment IDs ("uk-grocery:budget-families")
  const parentAudienceIds = getSelectedAudienceIds(selectedAudiences)
  const audiences = MOCK_AUDIENCES.filter(a => parentAudienceIds.includes(a.id))
  const totalRespondents = getSelectedRespondentCount(selectedAudiences)

  // Determine if we're in multi-segment mode (segment IDs contain colons)
  const isMultiSegment = selectedAudiences.some(id => id.includes(':'))

  const typeStepIndex = flowSteps.indexOf('type')
  const audienceStepIndex = flowSteps.indexOf('audience')
  const stimulusStepIndex = flowSteps.indexOf('stimulus')
  const questionsStepIndex = flowSteps.indexOf('questions')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold">Review your survey</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Everything look good? Click any section to make changes, or launch when you're ready.
        </p>
      </div>

      {/* Survey Type */}
      <SectionCard label="Survey type" onClick={() => onGoToStep(typeStepIndex)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <TypeIcon className="w-4.5 h-4.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{typeConfig?.label}</p>
            <p className="text-xs text-muted-foreground">{typeConfig?.description}</p>
          </div>
        </div>
      </SectionCard>

      {/* Audience */}
      <SectionCard label="Audience" onClick={() => onGoToStep(audienceStepIndex)}>
        <div className="space-y-1.5">
          {audiences.map((a) => {
            // In multi-segment mode, show which sub-segments are selected
            const selectedSegments = isMultiSegment
              ? (a.segments ?? []).filter(s => selectedAudiences.includes(s.id))
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
          {isMultiSegment
            ? `${selectedAudiences.length} sub-segment${selectedAudiences.length !== 1 ? 's' : ''}`
            : `${audiences.length} audience${audiences.length !== 1 ? 's' : ''}`
          }
          {' '}&middot; Total: n={totalRespondents.toLocaleString()}
        </div>
      </SectionCard>

      {/* Stimulus (conditional) */}
      {stimulusStepIndex !== -1 && stimuli.length > 0 && (
        <SectionCard label="Stimulus" onClick={() => onGoToStep(stimulusStepIndex)}>
          <div className="flex flex-wrap gap-2">
            {stimuli.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted text-sm"
              >
                {s.type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="truncate max-w-[180px]">{s.name}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stimuli.length} item{stimuli.length !== 1 ? 's' : ''}
          </p>
        </SectionCard>
      )}

      {/* Questions */}
      <SectionCard label={`Questions (${questions.length})`} onClick={() => onGoToStep(questionsStepIndex)}>
        <div className="space-y-1">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="flex items-start gap-2.5 py-1.5 text-sm"
            >
              {/* Number */}
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-semibold shrink-0 mt-0.5">
                {index + 1}
              </span>

              {/* Text */}
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
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ── Reusable section card ──

interface SectionCardProps {
  label: string
  onClick: () => void
  children: React.ReactNode
}

function SectionCard({ label, onClick, children }: SectionCardProps) {
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
