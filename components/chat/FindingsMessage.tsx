import React from 'react'
import type { ChatMessageFindings, SelectedSegment } from '@/types'
import { FindingsCanvas } from '@/components/results/FindingsCanvas'

interface FindingsMessageProps {
  message: ChatMessageFindings
  onOpenPlan?: (studyId: string) => void
  onBarClick?: (segment: SelectedSegment) => void
  selectedSegments?: SelectedSegment[]
}

export const FindingsMessage: React.FC<FindingsMessageProps> = ({ message, onOpenPlan, onBarClick, selectedSegments }) => {
  return (
    <div className="flex justify-center animate-in fade-in duration-500">
      <FindingsCanvas
        findings={message.findings}
        title={message.studyName}
        studyId={message.studyId}
        typeBadge={message.typeBadge}
        respondents={message.respondents}
        stimuli={message.stimuli}
        compact
        className="w-full max-w-3xl"
        onOpenPlan={onOpenPlan ? () => onOpenPlan(message.studyId) : undefined}
        onBarClick={onBarClick}
        selectedSegments={selectedSegments}
      />
    </div>
  )
}
