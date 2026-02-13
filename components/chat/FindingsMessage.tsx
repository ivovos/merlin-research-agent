import React from 'react'
import type { ChatMessageFindings } from '@/types'
import { FindingsCanvas } from '@/components/results/FindingsCanvas'

interface FindingsMessageProps {
  message: ChatMessageFindings
}

export const FindingsMessage: React.FC<FindingsMessageProps> = ({ message }) => {
  return (
    <div className="flex justify-center animate-in fade-in duration-500">
      <FindingsCanvas
        findings={message.findings}
        title={message.studyName}
        typeBadge={message.typeBadge}
        respondents={message.respondents}
        compact
        className="w-full max-w-3xl"
      />
    </div>
  )
}
