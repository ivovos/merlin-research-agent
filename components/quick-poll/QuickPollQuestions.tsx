import React from 'react'
import { Plus } from 'lucide-react'
import type { SurveyQuestion } from '@/types'
import { QuestionCard } from '@/components/builder/steps/questions/QuestionCard'
import { QuestionEditor } from '@/components/builder/steps/questions/QuestionEditor'

interface QuickPollQuestionsProps {
  questions: SurveyQuestion[]
  editingIndex: number
  showErrors: boolean
  onUpdateQuestion: (index: number, updates: Partial<SurveyQuestion>) => void
  onDeleteQuestion: (index: number) => void
  onSetEditingIndex: (index: number) => void
  onCloseEditor: () => void
  onAddQuestion: () => void
}

export const QuickPollQuestions: React.FC<QuickPollQuestionsProps> = ({
  questions,
  editingIndex,
  showErrors,
  onUpdateQuestion,
  onDeleteQuestion,
  onSetEditingIndex,
  onCloseEditor,
  onAddQuestion,
}) => {
  return (
    <div className="space-y-2">
      {questions.map((question, index) => (
        <div key={question.id} id={`qp-question-${index}`}>
          {index === editingIndex ? (
            <QuestionEditor
              question={question}
              index={index}
              onUpdate={(updates) => onUpdateQuestion(index, updates)}
              onClose={onCloseEditor}
            />
          ) : (
            <QuestionCard
              question={question}
              index={index}
              showErrors={showErrors}
              onExpand={() => onSetEditingIndex(index)}
              onDelete={() => onDeleteQuestion(index)}
            />
          )}
        </div>
      ))}

      {/* Add a question */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-border rounded-lg bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 hover:bg-accent/30 transition-all mt-1"
        onClick={onAddQuestion}
      >
        <Plus className="w-3.5 h-3.5" />
        Add a question
      </button>
    </div>
  )
}
