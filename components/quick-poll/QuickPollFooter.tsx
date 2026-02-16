import React from 'react'
import { Button } from '@/components/ui/button'

interface QuickPollFooterProps {
  audienceName: string
  audienceSize: number
  validQuestionCount: number
  totalQuestionCount: number
  allComplete: boolean
  onLaunch: () => void
}

export const QuickPollFooter: React.FC<QuickPollFooterProps> = ({
  audienceName,
  audienceSize,
  validQuestionCount,
  totalQuestionCount,
  allComplete,
  onLaunch,
}) => {
  const incompleteCount = totalQuestionCount - validQuestionCount

  return (
    <div className="shrink-0 border-t border-border bg-background px-6 py-3">
      <div className="max-w-[640px] mx-auto flex items-center justify-between">
        {/* Summary text */}
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-foreground">{audienceName}</span>
          <span className="text-muted-foreground/50">&middot;</span>
          <span className="tabular-nums">n={audienceSize.toLocaleString()}</span>

          {validQuestionCount === 0 ? (
            <>
              <span className="text-muted-foreground/50">&middot;</span>
              <span>Complete your first question to launch</span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground/50">&middot;</span>
              <span>
                <span className="font-semibold text-foreground">{validQuestionCount}</span>{' '}
                {validQuestionCount === 1 ? 'question' : 'questions'}
              </span>
              {incompleteCount > 0 && (
                <>
                  <span className="text-muted-foreground/50">&middot;</span>
                  <span className="text-red-500 font-medium">
                    {incompleteCount} incomplete
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Launch button */}
        <Button
          size="sm"
          disabled={!allComplete}
          onClick={onLaunch}
          className="shrink-0 ml-4"
        >
          Launch Poll
        </Button>
      </div>
    </div>
  )
}
