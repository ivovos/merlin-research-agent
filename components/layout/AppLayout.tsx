import * as React from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { RightPanel } from "./RightPanel"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  rightPanelContent?: React.ReactNode
  rightPanelOpen?: boolean
  rightPanelTitle?: string
  onRightPanelClose?: () => void
  onRightPanelExpand?: () => void
  isRightPanelFullscreen?: boolean
}

export function AppLayout({
  children,
  rightPanelContent,
  rightPanelOpen = false,
  rightPanelTitle = "Details",
  onRightPanelClose,
  onRightPanelExpand,
  isRightPanelFullscreen = false,
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        view={{ screen: 'home' }}
        projects={[]}
        onSelectProject={() => {}}
        onGoHome={() => {}}
        onNewProject={() => {}}
      />
      <SidebarInset className="flex flex-row overflow-hidden">
        {/* Main content area */}
        <main
          className={cn(
            "flex flex-1 flex-col overflow-hidden transition-all duration-200",
            rightPanelOpen && !isRightPanelFullscreen && "mr-0"
          )}
        >
          {children}
        </main>

        {/* Right panel for artifacts/reports */}
        <RightPanel
          open={rightPanelOpen}
          title={rightPanelTitle}
          onClose={onRightPanelClose}
          onExpand={onRightPanelExpand}
          isFullscreen={isRightPanelFullscreen}
        >
          {rightPanelContent}
        </RightPanel>
      </SidebarInset>
    </SidebarProvider>
  )
}
