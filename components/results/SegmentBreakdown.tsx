import React from 'react'
import type { SegmentBreakdown as SegmentBreakdownType } from '@/types'
import { getBrandColorArray } from '@/lib/brandDefaults'
import { cn } from '@/lib/utils'

interface SegmentBreakdownProps {
  segments: SegmentBreakdownType[]
  compact?: boolean
  className?: string
}

export const SegmentBreakdown: React.FC<SegmentBreakdownProps> = ({
  segments,
  compact = false,
  className,
}) => {
  const brandColors = getBrandColorArray()

  if (!segments || segments.length === 0) return null

  // Find max value for relative bar sizing
  const maxValue = Math.max(...segments.map(s => s.value), 1)

  return (
    <div className={cn('space-y-1.5', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Segment comparison
      </p>
      <div className="space-y-1">
        {segments.map((seg, i) => (
          <div key={seg.segmentName} className="flex items-center gap-2">
            <span className={cn(
              'text-muted-foreground truncate flex-shrink-0',
              compact ? 'text-[10px] w-28' : 'text-xs w-36',
            )}>
              {seg.segmentName}
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(seg.value / maxValue) * 100}%`,
                  backgroundColor: brandColors[i % brandColors.length],
                }}
              />
            </div>
            <span
              className={cn(
                'font-semibold flex-shrink-0 tabular-nums',
                compact ? 'text-[10px] w-8' : 'text-xs w-10',
              )}
              style={{ color: brandColors[i % brandColors.length] }}
            >
              {Math.round(seg.value)}%
            </span>
          </div>
        ))}
      </div>
      {segments[0]?.label && (
        <p className="text-[10px] text-muted-foreground italic">
          {segments[0].label}
        </p>
      )}
    </div>
  )
}
