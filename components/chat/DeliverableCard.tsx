import React from 'react'
import type { ChatMessageDeliverable } from '@/types'
import { FileOutput, ScrollText, FileBarChart } from 'lucide-react'

const FORMAT_ICONS: Record<ChatMessageDeliverable['format'], React.ElementType> = {
  narrative: ScrollText,
  report: FileBarChart,
  summary: FileOutput,
}

const FORMAT_LABELS: Record<ChatMessageDeliverable['format'], string> = {
  narrative: 'Narrative',
  report: 'Report',
  summary: 'Executive Summary',
}

interface DeliverableCardProps {
  message: ChatMessageDeliverable
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({ message }) => {
  const Icon = FORMAT_ICONS[message.format] ?? FileOutput
  const label = FORMAT_LABELS[message.format] ?? 'Deliverable'

  return (
    <div className="animate-in fade-in duration-500">
      <div className="border rounded-lg bg-card overflow-hidden max-w-[80%] lg:max-w-[60%]">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
        </div>
        <div className="px-4 py-3 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  )
}
