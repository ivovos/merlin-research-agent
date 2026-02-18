import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BuilderStepId } from '@/hooks/useSurveyBuilder'
import { STEP_LABELS } from '@/hooks/useSurveyBuilder'

interface BuilderSidebarProps {
  steps: BuilderStepId[]
  currentIndex: number
  stepValidity: Record<BuilderStepId, boolean>
  onStepClick: (index: number) => void
}

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  steps,
  currentIndex,
  stepValidity,
  onStepClick,
}) => {
  return (
    <div className="w-[200px] shrink-0 border-r bg-muted/30 p-4 pt-6">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-6">
        Survey Builder
      </p>
      <nav className="flex flex-col gap-1">
        {steps.map((stepId, index) => {
          const isActive = index === currentIndex
          const isDone = index < currentIndex || (index < currentIndex && stepValidity[stepId])
          const isLocked = index > currentIndex
          const isClickable = index <= currentIndex

          return (
            <button
              key={stepId}
              onClick={() => isClickable && onStepClick(index)}
              disabled={isLocked}
              className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors text-sm',
                isActive && 'bg-accent text-foreground font-medium',
                isDone && !isActive && 'text-muted-foreground hover:bg-accent/50 cursor-pointer',
                isLocked && 'text-muted-foreground/40 cursor-not-allowed',
                isClickable && !isActive && 'cursor-pointer',
              )}
            >
              {/* Step indicator dot */}
              <span
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs shrink-0 transition-colors',
                  isActive && 'bg-foreground text-background font-semibold',
                  isDone && !isActive && 'bg-foreground/15 text-foreground',
                  isLocked && 'bg-muted text-muted-foreground/40 border border-border',
                )}
              >
                {isDone && !isActive ? (
                  <Check className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </span>

              {/* Step label */}
              <span className="truncate">{STEP_LABELS[stepId]}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
