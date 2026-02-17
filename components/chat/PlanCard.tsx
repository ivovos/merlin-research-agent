import React from 'react'
import type { ChatMessagePlan } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  CheckCircle2,
  Clock,
} from 'lucide-react'

interface PlanCardProps {
  message: ChatMessagePlan
  onApprove?: (messageId: string) => void
  onReviewPlan?: (messageId: string) => void
}

export const PlanCard: React.FC<PlanCardProps> = ({
  message,
  onApprove,
  onReviewPlan,
}) => {
  const isApproved = message.status === 'approved'

  // ── Collapsed one-liner when approved ──
  if (isApproved) {
    return (
      <div className="animate-in fade-in duration-300">
        <Card className="flex items-center gap-2.5 px-4 py-2.5 border">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            {message.planTitle}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">— approved</span>
        </Card>
      </div>
    )
  }

  // ── Full card when pending ──
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="overflow-hidden border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agent Plan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onReviewPlan?.(message.id)}
            >
              Review plan
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onApprove?.(message.id)}
            >
              Approve
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Title */}
          <h3 className="text-sm font-semibold text-foreground font-display leading-snug">
            {message.planTitle}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message.planDescription}
          </p>

          {/* Setup bullet points */}
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1.5">Setup:</p>
            <ul className="space-y-1">
              {message.bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expected runtime */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">Expected runtime {message.expectedRuntime}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
