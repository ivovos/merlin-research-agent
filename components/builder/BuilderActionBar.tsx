import React, { useCallback } from 'react'
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BuilderStepId } from '@/hooks/useSurveyBuilder'
import { STEP_LABELS } from '@/hooks/useSurveyBuilder'

interface BuilderActionBarProps {
  currentStep: BuilderStepId
  currentIndex: number
  totalSteps: number
  canGoNext: boolean
  canGoBack: boolean
  isLastStep: boolean
  onBack: () => void
  onNext: () => void
  onLaunch: () => void
  /** Called when trying to leave Questions step with incomplete questions */
  onShowQuestionErrors?: () => void
}

function getCtaLabel(step: BuilderStepId, isLast: boolean): string {
  if (isLast) return 'Launch Survey'
  if (step === 'type') return 'Continue'
  return 'Next'
}

export const BuilderActionBar: React.FC<BuilderActionBarProps> = ({
  currentStep,
  currentIndex,
  totalSteps,
  canGoNext,
  canGoBack,
  isLastStep,
  onBack,
  onNext,
  onLaunch,
  onShowQuestionErrors,
}) => {
  const ctaLabel = getCtaLabel(currentStep, isLastStep)

  const handleCtaClick = useCallback(() => {
    if (isLastStep) {
      onLaunch()
      return
    }
    // If leaving questions step and can't go next, trigger error display
    if (currentStep === 'questions' && !canGoNext) {
      onShowQuestionErrors?.()
      return
    }
    onNext()
  }, [isLastStep, currentStep, canGoNext, onLaunch, onNext, onShowQuestionErrors])

  return (
    <div className="shrink-0 border-t bg-background px-6 py-3 flex items-center justify-between">
      {/* Left: step context */}
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          Step {currentIndex + 1}
        </span>
        {' '}of {totalSteps}
        <span className="mx-1.5">&middot;</span>
        {STEP_LABELS[currentStep]}
      </div>

      {/* Right: navigation buttons */}
      <div className="flex items-center gap-2">
        {canGoBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleCtaClick}
          disabled={currentStep === 'questions' ? false : !canGoNext}
        >
          {isLastStep ? (
            <>
              <Rocket className="w-3.5 h-3.5 mr-1.5" />
              {ctaLabel}
            </>
          ) : (
            <>
              {ctaLabel}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
