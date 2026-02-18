import * as React from "react"
import { X, Maximize2, Minimize2, SquareArrowOutUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface RightPanelProps {
  children: React.ReactNode
  open: boolean
  title?: string
  onClose?: () => void
  onExpand?: () => void
  onShare?: () => void
  isFullscreen?: boolean
}

export function RightPanel({
  children,
  open,
  title = "Details",
  onClose,
  onExpand,
  onShare,
  isFullscreen = false,
}: RightPanelProps) {
  if (!open) return null

  // Fullscreen mode - render as overlay
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* The sidebar will still be visible based on its state */}
        <div className="flex flex-1 flex-col bg-background">
          {/* Panel Header */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <h2 className="text-lg font-medium">{title}</h2>
            <div className="flex items-center gap-1">
              {onShare && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onShare}
                  className="h-8 w-8"
                >
                  <SquareArrowOutUpRight className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              )}
              {onExpand && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onExpand}
                  className="h-8 w-8"
                >
                  <Minimize2 className="h-4 w-4" />
                  <span className="sr-only">Exit fullscreen</span>
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              )}
            </div>
          </header>

          {/* Panel Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">{children}</div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  // Normal side panel mode
  return (
    <div
      className={cn(
        "flex w-[400px] shrink-0 flex-col border-l border-border bg-background transition-all duration-200"
      )}
    >
      {/* Panel Header - same height as other headers (h-14) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <div className="flex items-center gap-1">
          {onShare && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShare}
              className="h-8 w-8"
            >
              <SquareArrowOutUpRight className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          )}
          {onExpand && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onExpand}
              className="h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Fullscreen</span>
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </header>

      {/* Panel Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">{children}</div>
      </ScrollArea>
    </div>
  )
}
