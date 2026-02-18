import React, { useCallback, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSurveyBuilder } from '@/hooks/useSurveyBuilder'
import type { BuilderState } from '@/hooks/useSurveyBuilder'
import { BuilderSidebar } from './BuilderSidebar'
import { BuilderActionBar } from './BuilderActionBar'
import { ProcessingOverlay } from './ProcessingOverlay'
import { TypeStep } from './steps/TypeStep'
import { AudienceStep } from './steps/AudienceStep'
import { StimulusStep } from './steps/StimulusStep'
import { QuestionsStep } from './steps/QuestionsStep'
import { ReviewStep } from './steps/ReviewStep'

interface SurveyBuilderProps {
  onClose: () => void
  onLaunch?: (state: BuilderState) => void
  initialStudy?: import('@/types').Survey
  currentAccount?: import('@/types').Account
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  onClose,
  onLaunch,
  initialStudy,
  currentAccount,
}) => {
  const {
    state,
    dispatch,
    currentStep,
    stepValidity,
    canGoNext,
    canGoBack,
    isLastStep,
    goNext,
    goBack,
    reset,
  } = useSurveyBuilder(initialStudy)

  const [isProcessing, setIsProcessing] = useState(false)
  // Capture state at launch time so it persists through processing
  const [launchState, setLaunchState] = useState<BuilderState | null>(null)

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const handleLaunch = useCallback(() => {
    // Capture state and start processing animation
    setLaunchState(state)
    setIsProcessing(true)
  }, [state])

  const handleProcessingComplete = useCallback(() => {
    if (launchState) {
      onLaunch?.(launchState)
    }
    setIsProcessing(false)
    setLaunchState(null)
    reset()
    onClose()
  }, [launchState, onLaunch, reset, onClose])

  const handleStepClick = useCallback((index: number) => {
    dispatch({ type: 'GO_TO_STEP', payload: index })
  }, [dispatch])

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 'type':
        return (
          <TypeStep
            selectedType={state.selectedType}
            onSelectType={(type) => dispatch({ type: 'SELECT_TYPE', payload: type })}
          />
        )
      case 'audience':
        return (
          <AudienceStep
            surveyType={state.selectedType!}
            audienceMode={state.audienceMode}
            selectedAudiences={state.selectedAudiences}
            onSetMode={(mode) => dispatch({ type: 'SET_AUDIENCE_MODE', payload: mode })}
            onToggleAudience={(id) => dispatch({ type: 'TOGGLE_AUDIENCE', payload: id })}
            onToggleSegment={(id) => dispatch({ type: 'TOGGLE_SEGMENT', payload: id })}
            onToggleAllSegments={(id) => dispatch({ type: 'TOGGLE_ALL_SEGMENTS', payload: id })}
          />
        )
      case 'stimulus':
        return (
          <StimulusStep
            surveyType={state.selectedType!}
            stimuli={state.stimuli}
            onAddStimulus={(s) => dispatch({ type: 'ADD_STIMULUS', payload: s })}
            onRemoveStimulus={(id) => dispatch({ type: 'REMOVE_STIMULUS', payload: id })}
          />
        )
      case 'questions':
        return (
          <QuestionsStep
            accountId={currentAccount?.id}
            accountName={currentAccount?.name}
            surveyType={state.selectedType!}
            questions={state.questions}
            questionSourceTab={state.questionSourceTab}
            editingQuestionIndex={state.editingQuestionIndex}
            showQuestionErrors={state.showQuestionErrors}
            selectedTemplate={state.selectedTemplate}
            importBriefText={state.importBriefText}
            importBriefUploaded={state.importBriefUploaded}
            importBriefExtracted={state.importBriefExtracted}
            onSetSourceTab={(tab) => dispatch({ type: 'SET_QUESTION_SOURCE_TAB', payload: tab })}
            onSetEditingIndex={(idx) => dispatch({ type: 'SET_EDITING_QUESTION_INDEX', payload: idx })}
            onSelectTemplate={(key) => dispatch({ type: 'SELECT_TEMPLATE', payload: key })}
            onResetTemplate={() => dispatch({ type: 'RESET_TEMPLATE' })}
            onSetImportBriefText={(text) => dispatch({ type: 'SET_IMPORT_BRIEF_TEXT', payload: text })}
            onSetImportBriefUploaded={(uploaded) => dispatch({ type: 'SET_IMPORT_BRIEF_UPLOADED', payload: uploaded })}
            onExtractFromBrief={(qs) => dispatch({ type: 'EXTRACT_FROM_BRIEF', payload: qs })}
            onAddQuestion={(q) => dispatch({ type: 'ADD_QUESTION', payload: q })}
            onUpdateQuestion={(id, updates) => dispatch({ type: 'UPDATE_QUESTION', payload: { id, updates } })}
            onRemoveQuestion={(id) => dispatch({ type: 'REMOVE_QUESTION', payload: id })}
            onGenerateQuestions={(qs) => dispatch({ type: 'GENERATE_QUESTIONS', payload: qs })}
            onCloseEditor={() => dispatch({ type: 'CLOSE_QUESTION_EDITOR' })}
          />
        )
      case 'review':
        return (
          <ReviewStep
            surveyType={state.selectedType!}
            selectedAudiences={state.selectedAudiences}
            stimuli={state.stimuli}
            questions={state.questions}
            flowSteps={state.flowSteps}
            onGoToStep={handleStepClick}
          />
        )
      default:
        return null
    }
  }

  // Processing overlay replaces the entire builder body
  if (isProcessing) {
    return (
      <div className="flex-1 flex flex-col bg-background animate-in slide-in-from-bottom-2 fade-in duration-300">
        {/* Simplified header during processing */}
        <div className="shrink-0 border-b px-6 py-3 flex items-center">
          <h1 className="text-sm font-semibold font-display">
            Launching survey...
          </h1>
        </div>

        <ProcessingOverlay onComplete={handleProcessingComplete} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background animate-in slide-in-from-bottom-2 fade-in duration-300">
      {/* Header */}
      <div className="shrink-0 border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold font-display">
            {state.surveyName || 'New Survey'}
          </h1>
          {state.selectedType && (
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
              {state.selectedType.replace('_', ' ')}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Body: sidebar + content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <BuilderSidebar
          steps={state.flowSteps}
          currentIndex={state.currentStepIndex}
          stepValidity={stepValidity}
          onStepClick={handleStepClick}
        />

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
            {renderStep()}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <BuilderActionBar
        currentStep={currentStep}
        currentIndex={state.currentStepIndex}
        totalSteps={state.flowSteps.length}
        canGoNext={canGoNext}
        canGoBack={canGoBack}
        isLastStep={isLastStep}
        onBack={goBack}
        onNext={goNext}
        onLaunch={handleLaunch}
        onShowQuestionErrors={() => dispatch({ type: 'SET_SHOW_QUESTION_ERRORS', payload: true })}
      />
    </div>
  )
}
