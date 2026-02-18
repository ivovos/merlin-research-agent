import React from 'react'
import { Quote } from 'lucide-react'
import type { Finding } from '@/types'
import { DEFAULT_BRAND_COLORS } from '@/lib/brandDefaults'

interface MiniChartThumbProps {
  finding: Finding
}

/**
 * Tiny chart thumbnail (56×40px) for the findings list.
 * Shows miniature horizontal bars for chart findings,
 * or a Quote icon for quote-only findings.
 */
export const MiniChartThumb: React.FC<MiniChartThumbProps> = ({ finding }) => {
  const rows = (finding.chartData ?? []).map(d => ({
    value: Number(d.value ?? 0),
  }))
  const max = Math.max(...rows.map(r => r.value), 1)

  if (rows.length > 0) {
    return (
      <div className="w-14 h-10 rounded-md border border-border bg-muted/50 p-1.5 flex flex-col justify-center gap-0.5 shrink-0">
        {rows.slice(0, 4).map((r, i) => (
          <div key={i} className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(r.value / max) * 100}%`,
                backgroundColor: DEFAULT_BRAND_COLORS.primary,
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  // Quote-only finding
  if (finding.sourceQuote) {
    return (
      <div className="w-14 h-10 rounded-md border border-border bg-muted/50 flex items-center justify-center shrink-0">
        <Quote className="w-4 h-4 text-muted-foreground" />
      </div>
    )
  }

  return null
}
