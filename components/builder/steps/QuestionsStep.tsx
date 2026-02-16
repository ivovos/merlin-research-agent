import React, { useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SurveyType, SurveyQuestion } from '@/types'
import type { QuestionSourceTab } from '@/hooks/useSurveyBuilder'
import { QuestionCard } from './questions/QuestionCard'
import { QuestionEditor } from './questions/QuestionEditor'
import { ImportBriefPanel } from './questions/ImportBriefPanel'
import { TemplatesPanel } from './questions/TemplatesPanel'
import { ScratchPanel } from './questions/ScratchPanel'

// ── Helpers ──

function createEmptyQuestion(): SurveyQuestion {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'single_select',
    text: '',
    options: ['Option 1', 'Option 2', 'Option 3'],
    required: true,
  }
}

// ── Tab definition ──

const TABS: { key: QuestionSourceTab; label: string }[] = [
  { key: 'import', label: 'Import from Brief' },
  { key: 'templates', label: 'Templates' },
  { key: 'scratch', label: 'From Scratch' },
]

// ── Props ──

interface QuestionsStepProps {
  surveyType: SurveyType
  questions: SurveyQuestion[]
  questionSourceTab: QuestionSourceTab
  editingQuestionIndex: number
  showQuestionErrors: boolean
  selectedTemplate: string | null
  importBriefText: string
  importBriefUploaded: boolean
  importBriefExtracted: boolean
  onSetSourceTab: (tab: QuestionSourceTab) => void
  onSetEditingIndex: (index: number) => void
  onSelectTemplate: (key: string) => void
  onResetTemplate: () => void
  onSetImportBriefText: (text: string) => void
  onSetImportBriefUploaded: (uploaded: boolean) => void
  onExtractFromBrief: (questions: SurveyQuestion[]) => void
  onAddQuestion: (question: SurveyQuestion) => void
  onUpdateQuestion: (id: string, updates: Partial<SurveyQuestion>) => void
  onRemoveQuestion: (id: string) => void
  onGenerateQuestions: (questions: SurveyQuestion[]) => void
  onCloseEditor: () => void
}

// ── Main QuestionsStep ──

export const QuestionsStep: React.FC<QuestionsStepProps> = ({
  questions,
  questionSourceTab,
  editingQuestionIndex,
  showQuestionErrors,
  selectedTemplate,
  importBriefText,
  importBriefUploaded,
  importBriefExtracted,
  onSetSourceTab,
  onSetEditingIndex,
  onSelectTemplate,
  onResetTemplate,
  onSetImportBriefText,
  onSetImportBriefUploaded,
  onExtractFromBrief,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onGenerateQuestions,
  onCloseEditor,
}) => {
  // ── Tab switching with confirmation guard ──
  const handleTabSwitch = useCallback(
    (tab: QuestionSourceTab) => {
      if (tab === questionSourceTab) return
      if (questions.length > 0) {
        const confirmed = window.confirm(
          `You have ${questions.length} question${questions.length !== 1 ? 's' : ''}. Switching will start over. Continue?`,
        )
        if (!confirmed) return
      }
      onSetSourceTab(tab)
    },
    [questionSourceTab, questions.length, onSetSourceTab],
  )

  // ── Add question ──
  const handleAddQuestion = useCallback(() => {
    const q = createEmptyQuestion()
    onAddQuestion(q)
  }, [onAddQuestion])

  // ── Template select ──
  const handleTemplateSelect = useCallback(
    (key: string, templateQuestions: SurveyQuestion[]) => {
      onSelectTemplate(key)
      onGenerateQuestions(templateQuestions)
    },
    [onSelectTemplate, onGenerateQuestions],
  )

  // ── Template reset ──
  const handleTemplateReset = useCallback(() => {
    if (questions.length > 0) {
      const confirmed = window.confirm(
        'Changing the template will clear your current questions. Continue?',
      )
      if (!confirmed) return
    }
    onResetTemplate()
  }, [questions.length, onResetTemplate])

  // ── Brief reset ──
  const handleBriefReset = useCallback(() => {
    if (questions.length > 0) {
      const confirmed = window.confirm(
        'Changing the source will clear your current questions. Continue?',
      )
      if (!confirmed) return
    }
    onSetSourceTab('import')
  }, [questions.length, onSetSourceTab])

  // Determine if we should show the "extracted" badge on question cards
  const isExtractedSource = questionSourceTab === 'import' && importBriefExtracted

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div>
        <h2 className="text-lg font-display font-semibold">Build your questions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how to create your questionnaire, then customise each question.
        </p>
      </div>

      {/* Segmented tab control */}
      <div className="inline-flex rounded-lg bg-zinc-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabSwitch(tab.key)}
            className={cn(
              'px-4 py-1.5 text-xs font-medium rounded-md transition-all',
              questionSourceTab === tab.key
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Source panel */}
      {questionSourceTab === 'import' && (
        <ImportBriefPanel
          briefText={importBriefText}
          uploaded={importBriefUploaded}
          extracted={importBriefExtracted}
          onSetBriefText={onSetImportBriefText}
          onSetUploaded={onSetImportBriefUploaded}
          onExtract={onExtractFromBrief}
          onReset={handleBriefReset}
        />
      )}

      {questionSourceTab === 'templates' && (
        <TemplatesPanel
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleTemplateSelect}
          onResetTemplate={handleTemplateReset}
        />
      )}

      {questionSourceTab === 'scratch' && (
        <ScratchPanel hasQuestions={questions.length > 0} />
      )}

      {/* Questions section */}
      {questions.length > 0 && (
        <div className="space-y-3">
          {/* Section header */}
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your Questions ({questions.length})
          </p>

          {/* Question cards */}
          <div className="space-y-2">
            {questions.map((q, index) =>
              editingQuestionIndex === index ? (
                <QuestionEditor
                  key={q.id}
                  question={q}
                  index={index}
                  onUpdate={(updates) => onUpdateQuestion(q.id, updates)}
                  onClose={onCloseEditor}
                />
              ) : (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={index}
                  showErrors={showQuestionErrors}
                  isExtracted={isExtractedSource}
                  onExpand={() => onSetEditingIndex(index)}
                  onDelete={() => onRemoveQuestion(q.id)}
                />
              ),
            )}
          </div>

          {/* Add a question button (hidden while editing) */}
          {editingQuestionIndex === -1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddQuestion}
              className="text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add a question
            </Button>
          )}
        </div>
      )}

      {/* When "From Scratch" and no questions yet, show add button */}
      {questionSourceTab === 'scratch' && questions.length === 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddQuestion}
          className="text-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add your first question
        </Button>
      )}
    </div>
  )
}
