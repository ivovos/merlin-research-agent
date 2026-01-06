import React, { useState } from 'react';
import { ProcessStep } from '../types';
import { Loader2, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessStepsProps {
  steps: ProcessStep[];
  isComplete: boolean;
  thinkingTime?: number;
}

export const ProcessSteps: React.FC<ProcessStepsProps> = ({
  steps,
  isComplete,
  thinkingTime
}) => {
  const [expanded, setExpanded] = useState(!isComplete);

  // If complete and NOT expanded, show the "Thought for X s" row (Image 2 style)
  if (isComplete && !expanded) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors group" onClick={() => setExpanded(true)}>
        <div className="flex items-center gap-1 font-medium">
          <span>Thought for {thinkingTime || 0}s</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    );
  }

  // If Expanded (or Processing), show the vertical list (Image 1 style)
  return (
    <div className="w-full max-w-2xl animate-in fade-in duration-300">
      {/* If complete, show header to collapse */}
      {isComplete && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => setExpanded(false)}>
          <span>Thought for {thinkingTime || 0}s</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      )}

      <div className="space-y-0 pl-1">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isActive = step.status === 'in-progress';
          const isCompleted = step.status === 'complete';
          const isPending = step.status === 'pending';

          if (isPending) return null;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Icon / Timeline Column */}
              <div className="flex flex-col items-center w-6">
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-background border border-muted transition-colors",
                  isActive ? "border-primary text-primary" : "",
                  isCompleted ? "border-transparent text-muted-foreground" : "border-border"
                )}>
                  {isActive && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />}
                </div>
                {/* Vertical Line */}
                {!isLast && (
                  <div className="w-px flex-1 bg-border/40 my-1 min-h-[20px]" />
                )}
              </div>

              {/* Content Column */}
              <div className="pb-6 pt-0.5 flex-1">
                <p className={cn(
                  "text-sm font-medium leading-tight",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>

                {/* Sub-details (e.g. Activity or Progress) */}
                {isActive && step.progress !== undefined && (
                  <div className="mt-2 text-xs text-muted-foreground font-mono bg-muted/20 px-2 py-1 rounded w-fit">
                    {step.totalResponses ? `Count: ${step.totalResponses}` : 'Processing...'} ({Math.round(step.progress)}%)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};