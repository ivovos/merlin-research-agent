import React from 'react'
import type { ChatMessageFindings } from '@/types'
import { FindingsCanvas } from '@/components/results/FindingsCanvas'

interface FindingsMessageProps {
  message: ChatMessageFindings
  onOpenPlan?: (studyId: string) => void
}

export const FindingsMessage: React.FC<FindingsMessageProps> = ({ message, onOpenPlan }) => {
  return (
    <div className="flex justify-center animate-in fade-in duration-500">
      <FindingsCanvas
        findings={message.findings}
        title={message.studyName}
        typeBadge={message.typeBadge}
        respondents={message.respondents}
        stimuli={message.stimuli}
        compact
        className="w-full max-w-3xl"
        onOpenPlan={onOpenPlan ? () => onOpenPlan(message.studyId) : undefined}
      />
    </div>
  )
}
