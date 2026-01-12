import React, { useState } from 'react';
import type { ProcessStep } from '@/types';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(false);

  // Find the current active step (in-progress) or the last completed step
  const activeStep = steps.find(s => s.status === 'in-progress');
  const completedSteps = steps.filter(s => s.status === 'complete');

  // If complete, show the "Thought for X s" row with optional expansion
  if (isComplete) {
    if (!expanded) {
      return (
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors group"
          onClick={() => setExpanded(true)}
        >
          <div className="flex items-center gap-1 font-medium">
            <span>Thought for {thinkingTime || 0}s</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      );
    }

    // Expanded view - show all completed steps
    return (
      <div className="animate-in fade-in duration-200">
        <div
          className="flex items-center gap-2 mb-3 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          onClick={() => setExpanded(false)}
        >
          <span>Thought for {thinkingTime || 0}s</span>
          <ChevronDown className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 pl-1">
          {completedSteps.map((step) => (
            <div key={step.id} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Processing state - show single line with current activity
  const currentLabel = activeStep?.label || completedSteps[completedSteps.length - 1]?.label || 'Starting...';

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-200">
      <Loader2 className="w-4 h-4 animate-spin text-primary" />
      <span className="animate-pulse">{currentLabel}</span>
    </div>
  );
};