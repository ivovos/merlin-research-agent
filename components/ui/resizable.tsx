import { GripVertical } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
    className,
    ...props
}: React.ComponentProps<typeof Group>) => (
    <Group
        className={cn(
            "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
            className
        )}
        {...props}
    />
)

const ResizablePanel = ({
    className,
    style,
    ...props
}: React.ComponentProps<typeof Panel>) => (
    <Panel
        className={cn("h-full", className)}
        style={{ height: '100%', ...style }}
        {...props}
    />
)

const ResizableHandle = ({
    withHandle,
    className,
    disabled,
    ...props
}: React.ComponentProps<typeof Separator> & {
    withHandle?: boolean
    disabled?: boolean
}) => (
    <Separator
        className={cn(
            "relative flex items-center justify-center bg-transparent hover:bg-border/50 transition-colors cursor-col-resize after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 after:hover:bg-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 group",
            disabled && "pointer-events-none opacity-0 cursor-default",
            !disabled && "w-1 hover:w-2",
            className
        )}
        disabled={disabled}
        {...props}
    >
        {withHandle && !disabled && (
            <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-background border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
            </div>
        )}
    </Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
