import React, { useEffect, useState } from 'react';
import { ProcessStep } from '../types';
import { Check, Loader2, Search, Users, FileText, PieChart, MessageSquare, ClipboardList, BarChart, MessageCircle, Layers } from 'lucide-react';

interface ProcessStepsProps {
  steps: ProcessStep[];
  isComplete: boolean;
}

export const ProcessSteps: React.FC<ProcessStepsProps> = ({ steps, isComplete }) => {
  // Find the current active step index
  const activeIndex = steps.findIndex(s => s.status === 'in-progress');

  // If complete, we treat the last step as the "active" context for display purposes 
  // (or just show all done, but user wants collapsing).
  // If complete, activeIndex is -1. Let's set it to length-1 so we show the result.
  const currentIndex = activeIndex === -1 ? (isComplete ? steps.length - 1 : 0) : activeIndex;

  // Determine indices to group
  // We want: [0 ... currentIndex-2] -> Collapsed Summary
  //          [currentIndex-1]       -> Previous Visible
  //          [currentIndex]         -> Active Visible

  const collapsedCount = Math.max(0, currentIndex - 1);
  const showPreviousIndex = currentIndex > 0 ? currentIndex - 1 : -1;
  const showActiveIndex = currentIndex;

  // Helper to get icon based on specific labels
  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('plan') || l.includes('design')) return <ClipboardList className="w-4 h-4" />;
    if (l.includes('recruit') || l.includes('participant') || l.includes('panel')) return <Users className="w-4 h-4" />;
    if (l.includes('review') || l.includes('response') || l.includes('moderat')) return <Search className="w-4 h-4" />;
    if (l.includes('additional') || l.includes('asking') || l.includes('transcri')) return <MessageCircle className="w-4 h-4" />;
    if (l.includes('analys') || l.includes('coding')) return <BarChart className="w-4 h-4" />;
    if (l.includes('report') || l.includes('synthesiz')) return <FileText className="w-4 h-4" />;
    return <Loader2 className="w-4 h-4" />;
  };

  const activeStep = steps[currentIndex];

  // Random thoughts generator for active step
  const [thought, setThought] = useState('');
  useEffect(() => {
    if (!activeStep || activeStep.status !== 'in-progress') return;
    const thoughts = [
      "Calibrating...", "Reviewing constraints...", "Checking database...", "Cross-referencing...", "Optimizing...", "Validating..."
    ];
    let t = 0;
    const interval = setInterval(() => {
      setThought(thoughts[t % thoughts.length]);
      t++;
    }, 2000);
    return () => clearInterval(interval);
  }, [activeStep?.id, activeStep?.status]);

  if (steps.length === 0) return null;

  return (
    <div className="w-full max-w-2xl animate-fade-in transition-all duration-300">
      <style>{`
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-gradient-text {
          background: linear-gradient(
            to right, 
            var(--text-primary) 20%, 
            var(--text-secondary) 40%, 
            var(--text-secondary) 60%, 
            var(--text-primary) 80%
          );
          background-size: 200% auto;
          color: #000;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
        }
      `}</style>

      <div className="space-y-4">
        {/* 1. Collapsed Summary (if applicable) */}
        {collapsedCount > 0 && (
          <div className="flex gap-4 items-center opacity-60">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--background-card)] border border-[var(--border)] text-[var(--text-muted)]">
                <Layers className="w-3 h-3" />
              </div>
              {/* Connector to next */}
              <div className="w-0.5 h-6 bg-[var(--border)] my-1"></div>
            </div>
            <div className="flex-1 pt-1 pb-4">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {collapsedCount} steps completed
              </span>
            </div>
          </div>
        )}

        {/* 2. Previous Step (if applicable) */}
        {showPreviousIndex !== -1 && (
          <div className="flex gap-4 items-center animate-slide-up">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--background-card)] border border-[var(--border)] text-green-600 transition-colors">
                <Check className="w-4 h-4" />
              </div>
              {/* Connector to active */}
              <div className="w-0.5 h-6 bg-[var(--border)] my-1"></div>
            </div>
            <div className="flex-1 pt-1 pb-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                {steps[showPreviousIndex].label}
              </h3>
            </div>
          </div>
        )}

        {/* 3. Active Step */}
        <div className="flex gap-4 items-start animate-slide-up">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 bg-[var(--accent)] text-white shadow-md scale-110`}>
              {(activeStep.status === 'complete' || isComplete) ? <Check className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          </div>

          <div className="flex-1 pt-1">
            <div className="flex justify-between items-center">
              <h3 className={`text-base font-medium transition-all duration-500 ${(activeStep.status === 'in-progress' && !isComplete) ? 'animate-gradient-text' : 'text-[var(--text-primary)]'}`}>
                {activeStep.label}
              </h3>
              {activeStep.status === 'in-progress' && !isComplete && (
                <span className="text-xs font-mono text-[var(--accent)] animate-pulse">{thought}</span>
              )}
            </div>

            {/* Active Details Box */}
            {activeStep.status === 'in-progress' && !isComplete && (
              <div className="mt-2 bg-[var(--background-card)] border border-[var(--border)] rounded-lg p-3 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(activeStep.label)}
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Current Activity</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Executing phase {currentIndex + 1}: {activeStep.label}...
                </p>

                {/* Response Progress Bar (Feature Flag) */}
                {typeof activeStep.progress === 'number' && (
                  <div className="mt-3 space-y-1.5 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-muted)] font-medium">Collecting responses...</span>
                      <span className="text-[var(--text-primary)] font-mono">
                        {Math.round(activeStep.progress)}%
                        {activeStep.totalResponses ? ` (${activeStep.totalResponses})` : ''}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] transition-all duration-100 ease-out"
                        style={{ width: `${activeStep.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};