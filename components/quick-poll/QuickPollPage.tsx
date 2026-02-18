import React, { useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Survey } from '@/types'
import { generateMockFindings } from '@/lib/generateMockFindings'
import { useQuickPoll, isQuestionComplete } from './useQuickPoll'
import { QuickPollAudience } from './QuickPollAudience'
import { QuickPollQuestions } from './QuickPollQuestions'
import { QuickPollFooter } from './QuickPollFooter'

interface QuickPollPageProps {
  onClose: () => void
  onLaunch: (survey: Survey) => void
}

export const QuickPollPage: React.FC<QuickPollPageProps> = ({ onClose, onLaunch }) => {
  const {
    state,
    dispatch,
    selectedAudience,
    validQuestionCount,
    totalQuestionCount,
    allQuestionsComplete,
    canLaunch,
  } = useQuickPoll()

  // Scroll to first error when showErrors is toggled
  useEffect(() => {
    if (!state.showErrors) return
    const firstIncomplete = state.questions.findIndex(q => !isQuestionComplete(q))
    if (firstIncomplete >= 0) {
      document
        .getElementById(`qp-question-${firstIncomplete}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [state.showErrors, state.questions])

  const handleLaunch = useCallback(() => {
    if (!canLaunch) {
      dispatch({ type: 'SHOW_ERRORS' })
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const survey: Survey = {
      id: `survey_${Date.now()}`,
      type: 'simple',
      name: 'Quick Poll',
      status: 'completed',
      questions: state.questions,
      audiences: [state.selectedAudienceId],
      stimuli: [],
      findings: generateMockFindings(state.questions, false),
      sampleSize: selectedAudience?.size ?? 1000,
      createdAt: today,
      updatedAt: today,
    }
    onLaunch(survey)
  }, [canLaunch, state, selectedAudience, dispatch, onLaunch])

  return (
    <div className="flex-1 flex flex-col bg-background animate-in slide-in-from-bottom-2 fade-in duration-300">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-6 py-3 flex items-start justify-between">
        <div>
          <h1 className="text-base font-semibold font-display tracking-tight">Quick Poll</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fast feedback on a single topic. Pick your audience and add your questions.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 mt-0.5" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-6 py-8 space-y-7">
          {/* Audience section */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Audience
            </h3>
            <QuickPollAudience
              selectedAudienceId={state.selectedAudienceId}
              onSelectAudience={(id) => dispatch({ type: 'SELECT_AUDIENCE', payload: id })}
            />
          </section>

          <hr className="border-border" />

          {/* Questions section */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Questions
            </h3>
            <QuickPollQuestions
              questions={state.questions}
              editingIndex={state.editingIndex}
              showErrors={state.showErrors}
              onUpdateQuestion={(index, updates) =>
                dispatch({ type: 'UPDATE_QUESTION', payload: { index, updates } })
              }
              onDeleteQuestion={(index) =>
                dispatch({ type: 'DELETE_QUESTION', payload: index })
              }
              onSetEditingIndex={(index) =>
                dispatch({ type: 'SET_EDITING_INDEX', payload: index })
              }
              onCloseEditor={() => dispatch({ type: 'CLOSE_EDITOR' })}
              onAddQuestion={() => dispatch({ type: 'ADD_QUESTION' })}
            />
          </section>
        </div>
      </div>

      {/* Footer */}
      <QuickPollFooter
        audienceName={selectedAudience?.name ?? 'Select audience'}
        audienceSize={selectedAudience?.size ?? 0}
        validQuestionCount={validQuestionCount}
        totalQuestionCount={totalQuestionCount}
        allComplete={allQuestionsComplete}
        onLaunch={handleLaunch}
      />
    </div>
  )
}
