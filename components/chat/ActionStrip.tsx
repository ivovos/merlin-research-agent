import React, { useState, useEffect, useCallback } from 'react'
import {
  Bookmark,
  BookmarkCheck,
  SquareArrowOutUpRight,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/* ── Types ── */

interface ActionStripProps {
  variant: 'data-card' | 'ai-interpretation'
  onSave?: () => void
  onShare?: () => void
  onCopy?: () => void
  onThumbsUp?: () => void
  onThumbsDown?: () => void
  onExpand?: () => void
  isSaved?: boolean
  isExpanded?: boolean
  className?: string
}

/* ── Tooltip icon button helper ── */

function StripButton({
  icon: Icon,
  label,
  onClick,
  pressed,
  active,
  className,
}: {
  icon: React.ElementType
  label: string
  onClick?: () => void
  pressed?: boolean
  active?: boolean
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 active:scale-95 transition-all duration-100',
            active
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
            className,
          )}
          onClick={onClick}
          aria-label={label}
          aria-pressed={pressed}
        >
          <Icon className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

/* ── Component ── */

export const ActionStrip: React.FC<ActionStripProps> = ({
  variant,
  onSave,
  onShare,
  onCopy,
  onThumbsUp,
  onThumbsDown,
  onExpand,
  isSaved = false,
  isExpanded = false,
  className,
}) => {
  const [thumbs, setThumbs] = useState<'up' | 'down' | null>(null)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(isSaved)

  // Sync external isSaved prop
  useEffect(() => setSaved(isSaved), [isSaved])

  const handleCopy = useCallback(() => {
    onCopy?.()
    setCopied(true)
  }, [onCopy])

  // Reset copy icon after 1.5s
  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(id)
  }, [copied])

  const handleThumbsUp = useCallback(() => {
    setThumbs(prev => (prev === 'up' ? null : 'up'))
    onThumbsUp?.()
  }, [onThumbsUp])

  const handleThumbsDown = useCallback(() => {
    setThumbs(prev => (prev === 'down' ? null : 'down'))
    onThumbsDown?.()
  }, [onThumbsDown])

  const handleSave = useCallback(() => {
    setSaved(prev => !prev)
    onSave?.()
  }, [onSave])

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'flex items-center gap-0.5 pt-1.5 mt-1',
          variant === 'data-card' && 'px-3 py-1.5 border-t border-border',
          className,
        )}
      >
        {/* Data card: expand first */}
        {variant === 'data-card' && onExpand && (
          <StripButton
            icon={isExpanded ? Minimize2 : Maximize2}
            label={isExpanded ? 'Collapse details' : 'Expand details'}
            onClick={onExpand}
          />
        )}

        {/* AI interpretation: thumbs + copy first */}
        {variant === 'ai-interpretation' && (
          <>
            {onThumbsUp && (
              <StripButton
                icon={ThumbsUp}
                label="Good response"
                onClick={handleThumbsUp}
                pressed={thumbs === 'up'}
                active={thumbs === 'up'}
              />
            )}
            {onThumbsDown && (
              <StripButton
                icon={ThumbsDown}
                label="Bad response"
                onClick={handleThumbsDown}
                pressed={thumbs === 'down'}
                active={thumbs === 'down'}
              />
            )}
            {onCopy && (
              <StripButton
                icon={copied ? Check : Copy}
                label={copied ? 'Copied!' : 'Copy'}
                onClick={handleCopy}
                active={copied}
              />
            )}
          </>
        )}

        {/* Save + Share — always last */}
        {onSave && (
          <StripButton
            icon={saved ? BookmarkCheck : Bookmark}
            label={saved ? 'Saved as finding' : 'Save as finding'}
            onClick={handleSave}
            pressed={saved}
            active={saved}
          />
        )}
        {onShare && (
          <StripButton
            icon={SquareArrowOutUpRight}
            label="Share"
            onClick={onShare}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
