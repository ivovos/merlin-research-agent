import React, { useCallback, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  onClose,
  onLaunch,
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
  } = useSurveyBuilder()

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
            surveyType={state.selectedType!}
            buildMethod={state.questionBuildMethod}
            buildPhase={state.questionBuildPhase}
            questions={state.questions}
            stimuli={state.stimuli}
            activeQuestionId={state.activeQuestionId}
            onSetBuildMethod={(m) => dispatch({ type: 'SET_BUILD_METHOD', payload: m })}
            onSetBuildPhase={(p) => dispatch({ type: 'SET_BUILD_PHASE', payload: p })}
            onAddQuestion={(q) => dispatch({ type: 'ADD_QUESTION', payload: q })}
            onUpdateQuestion={(id, updates) => dispatch({ type: 'UPDATE_QUESTION', payload: { id, updates } })}
            onRemoveQuestion={(id) => dispatch({ type: 'REMOVE_QUESTION', payload: id })}
            onReorderQuestions={(qs) => dispatch({ type: 'REORDER_QUESTIONS', payload: qs })}
            onSetActiveQuestion={(id) => dispatch({ type: 'SET_ACTIVE_QUESTION', payload: id })}
            onGenerateQuestions={(qs) => dispatch({ type: 'GENERATE_QUESTIONS', payload: qs })}
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
      <div className="flex-1 flex flex-col bg-background animate-in fade-in duration-200">
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
    <div className="flex-1 flex flex-col bg-background animate-in fade-in duration-200">
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
        <div className={cn('flex-1 overflow-hidden')}>
          {currentStep === 'questions' && state.questionBuildPhase === 'editor' ? (
            // Questions editor fills entire content area (no padding/max-width)
            <div className="h-full">
              {renderStep()}
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto">
              {renderStep()}
            </div>
          )}
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
      />
    </div>
  )
}
