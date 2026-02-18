import React from 'react'
import { Link, SquareArrowOutUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SharePopoverProps {
  /** Trigger element (typically a Button) */
  trigger: React.ReactNode
  /** Title shown at top of popover, e.g. "Share finding" or "Share 3 findings" */
  title: string
  /** Called when a team member is selected */
  onShareWithUser?: (userId: string) => void
  /** Called when "Copy link" is clicked */
  onCopyLink?: () => void
}

/** Mock team members for the share popover */
const MOCK_TEAM = [
  { id: 'sarah', initials: 'SC', name: 'Sarah Chen', role: 'Product' },
  { id: 'marcus', initials: 'MW', name: 'Marcus Webb', role: 'Design' },
  { id: 'priya', initials: 'PP', name: 'Priya Patel', role: 'Research' },
]

/**
 * Reusable share popover showing team members + copy link.
 * All actions are placeholder callbacks (no real sharing backend).
 */
export const SharePopover: React.FC<SharePopoverProps> = ({
  trigger,
  title,
  onShareWithUser,
  onCopyLink,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        {/* Title */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>

        {/* Team member rows */}
        <div className="px-1.5 pb-1.5">
          {MOCK_TEAM.map(member => (
            <button
              key={member.id}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
              onClick={() => onShareWithUser?.(member.id)}
            >
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {member.initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{member.name}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{member.role}</span>
            </button>
          ))}
        </div>

        {/* Divider + Copy link */}
        <div className="border-t border-border px-1.5 py-1.5">
          <button
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
            onClick={onCopyLink}
          >
            <Link className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Copy link</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Convenience wrapper: a primary "Share" button that opens the share popover.
 */
export const ShareButton: React.FC<{
  label: string
  title: string
  onShareWithUser?: (userId: string) => void
  onCopyLink?: () => void
}> = ({ label, title, onShareWithUser, onCopyLink }) => {
  return (
    <SharePopover
      trigger={
        <Button size="sm" className="gap-1.5">
          <SquareArrowOutUpRight className="w-3.5 h-3.5" />
          {label}
        </Button>
      }
      title={title}
      onShareWithUser={onShareWithUser}
      onCopyLink={onCopyLink}
    />
  )
}
