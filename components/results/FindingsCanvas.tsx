import React, { useState } from 'react'
import {
  Maximize2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Share2,
  MoreVertical,
  BarChart3,
} from 'lucide-react'
import type { Finding } from '@/types'
import { FindingCard } from './FindingCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface FindingsCanvasProps {
  findings: Finding[]
  title: string
  typeBadge?: string
  respondents?: number
  compact?: boolean
  onExpand?: () => void
  onInsightEdit?: (questionId: string, newText: string) => void
  defaultCollapsed?: boolean
  className?: string
}

export const FindingsCanvas: React.FC<FindingsCanvasProps> = ({
  findings,
  title,
  typeBadge,
  respondents,
  compact = false,
  onExpand,
  onInsightEdit,
  defaultCollapsed = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const handleCopy = () => {
    const text = findings.map((f, i) => `Finding ${i + 1}: ${f.headline}\n${f.insight}`).join('\n\n')
    navigator.clipboard.writeText(`${title}\n\n${text}`)
  }

  return (
    <div className={cn(
      'bg-muted border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300',
      'hover:border-primary/30 hover:shadow-md',
      className,
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {title}
            </span>
            <div className="flex items-center gap-2">
              {respondents && (
                <span className="text-xs text-muted-foreground">
                  {respondents.toLocaleString()} respondents
                </span>
              )}
            </div>
          </div>

          {/* Type badge */}
          {typeBadge && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {typeBadge}
            </Badge>
          )}

          {/* Finding count */}
          <Badge variant="outline" className="text-xs flex-shrink-0 gap-1">
            {findings.length} finding{findings.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand findings' : 'Collapse findings'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>

          {/* More options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy all findings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Download findings')}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Share findings')}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Expand to full page */}
          {onExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onExpand}
              title="Open in full view"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Body: finding cards */}
      {!isCollapsed && (
        <div className="overflow-y-auto scrollbar-hide">
          <div className={cn(
            'space-y-3',
            compact ? 'p-3' : 'p-4',
          )}>
            {findings.map((finding, i) => (
              <FindingCard
                key={finding.questionId}
                finding={finding}
                index={i}
                compact={compact}
                onInsightEdit={onInsightEdit}
              />
            ))}

            {findings.length === 0 && (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                No findings available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed preview: show first headline */}
      {isCollapsed && findings.length > 0 && (
        <div className="px-4 py-3 bg-background/50">
          <p className="text-sm text-muted-foreground truncate">
            <span className="font-semibold text-foreground">{findings[0].headline}</span>
            {findings.length > 1 && (
              <span className="ml-2">+{findings.length - 1} more</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
