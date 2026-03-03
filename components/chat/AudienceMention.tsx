import React from 'react'
import type { PickerAudience } from './AudiencePicker'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipArrow,
} from '@/components/ui/tooltip'
import { Users } from 'lucide-react'

interface AudienceMentionProps {
  audience: PickerAudience
  displayText: string
  onNavigate?: (audienceId: string) => void
}

export const AudienceMention: React.FC<AudienceMentionProps> = ({
  audience,
  displayText,
  onNavigate,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="font-medium cursor-pointer hover:underline"
            style={{ color: '#6366f1' }}
            onClick={() => onNavigate?.(audience.id)}
          >
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] p-3 bg-gray-900 text-white border-gray-900">
          <TooltipArrow className="fill-gray-900" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-semibold text-sm">{audience.label}</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {audience.description}
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400 tabular-nums">
                {audience.agents.toLocaleString()} respondents
              </span>
              {onNavigate && (
                <button
                  className="text-xs font-medium hover:underline"
                  style={{ color: '#6366f1' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigate(audience.id)
                  }}
                >
                  View details
                </button>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
