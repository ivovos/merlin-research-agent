import React, { useCallback, useRef } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { QUICK_POLL_AUDIENCES } from './quickPollAudiences'

interface QuickPollAudienceProps {
  selectedAudienceId: string
  onSelectAudience: (id: string) => void
}

export const QuickPollAudience: React.FC<QuickPollAudienceProps> = ({
  selectedAudienceId,
  onSelectAudience,
}) => {
  const prevAudienceRef = useRef(selectedAudienceId)
  const selectedAudience = QUICK_POLL_AUDIENCES.find(a => a.id === selectedAudienceId)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value
      if (val === '__create__') {
        // Reset to previous value — placeholder for future flow
        e.target.value = prevAudienceRef.current
        return
      }
      prevAudienceRef.current = val
      onSelectAudience(val)
    },
    [onSelectAudience],
  )

  return (
    <div>
      {/* Dropdown row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <select
            className="w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pr-9 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground"
            value={selectedAudienceId}
            onChange={handleChange}
          >
            {QUICK_POLL_AUDIENCES.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
            <option value="__sep__" disabled>
              ────────────
            </option>
            <option value="__create__">+ Create new audience</option>
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Sample size badge */}
        {selectedAudience && (
          <span className="text-xs text-muted-foreground font-medium tabular-nums shrink-0">
            n={selectedAudience.size.toLocaleString()}
          </span>
        )}
      </div>

      {/* Select segments link (placeholder) */}
      <button
        type="button"
        className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => {
          /* placeholder for future segment selection */
        }}
      >
        Select segments
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}
