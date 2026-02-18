import React, { useState, useEffect, useRef } from 'react'
import {
  Users,
  MessageCircle,
  BarChart3,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react'
import type { ElementType } from 'react'
import { cn } from '@/lib/utils'

interface Phase {
  label: string
  icon: ElementType
}

const PHASES: Phase[] = [
  { label: 'Reaching out to respondents...', icon: Users },
  { label: 'Collecting responses...', icon: MessageCircle },
  { label: 'Analysing data...', icon: BarChart3 },
  { label: 'Creating findings...', icon: Sparkles },
]

const PHASE_DURATION = 1100 // ms per phase

interface ProcessingOverlayProps {
  onComplete: () => void
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  onComplete,
}) => {
  const [activePhase, setActivePhase] = useState(0)
  const completedRef = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhase((prev) => {
        const next = prev + 1
        if (next >= PHASES.length) {
          clearInterval(timer)
          // Small delay after last phase completes to show the final checkmark
          if (!completedRef.current) {
            completedRef.current = true
            setTimeout(onComplete, 600)
          }
          return prev
        }
        return next
      })
    }, PHASE_DURATION)

    return () => clearInterval(timer)
  }, [onComplete])

  const progress = ((activePhase + 1) / PHASES.length) * 100

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background animate-in fade-in duration-300">
      {/* Phase list */}
      <div className="w-full max-w-sm space-y-3">
        {PHASES.map((phase, index) => {
          const Icon = phase.icon
          const isActive = index === activePhase
          const isDone = index < activePhase || (index === activePhase && activePhase >= PHASES.length - 1 && completedRef.current)

          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                isActive && 'bg-accent',
                isDone && 'opacity-60',
                index > activePhase && 'opacity-30',
              )}
            >
              {/* Icon / spinner / check */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                {isDone ? (
                  <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center animate-in zoom-in duration-200">
                    <Check className="w-3.5 h-3.5 text-background" />
                  </div>
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-foreground animate-spin" />
                ) : (
                  <Icon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-sm transition-colors duration-200',
                  isActive && 'font-medium text-foreground',
                  isDone && 'text-muted-foreground',
                  index > activePhase && 'text-muted-foreground',
                )}
              >
                {phase.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mt-6 px-4">
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
