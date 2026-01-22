import * as React from "react"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  MessageSquare,
  Plus,
  Settings,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { MonoIcon } from "@/components/MonoIcon"
import type { Account, Conversation, ResearchProject } from "@/types"

interface AppSidebarProps {
  // Account
  currentAccount?: Account
  accounts?: Account[]
  onAccountChange?: (account: Account) => void
  // Navigation
  activeView?: "conversation" | "audiences" | "audienceDetail" | "project"
  selectedProject?: string | null
  onProjectSelect?: (projectId: string) => void
  onAudiencesClick?: () => void
  onNewChat?: () => void
  // History
  conversation?: Conversation
  history?: Conversation[]
  onSelectHistory?: (conv: Conversation) => void
  // Research Projects
  selectedResearchProject?: ResearchProject | null
  onResearchProjectSelect?: (project: ResearchProject) => void
}

export function AppSidebar({
  currentAccount,
  accounts = [],
  onAccountChange,
  activeView = "conversation",
  selectedProject,
  onProjectSelect,
  onAudiencesClick,
  onNewChat,
  conversation,
  history = [],
  onSelectHistory,
  selectedResearchProject,
  onResearchProjectSelect,
}: AppSidebarProps) {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true)

  // Combine current conversation and history into one list
  const allItems = React.useMemo(() => {
    if (!conversation) return history
    return [conversation, ...history].filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    )
  }, [conversation, history])

  return (
    <Sidebar collapsible="icon">
      {/* Header with Account Switcher */}
      <SidebarHeader className={cn(
        "h-14 flex-row items-center border-b",
        isCollapsed ? "justify-center px-2" : "justify-start pl-2 pr-4"
      )}>
        {currentAccount && onAccountChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 rounded-lg transition-colors hover:bg-sidebar-accent",
                  isCollapsed ? "justify-center p-0" : "p-1"
                )}
              >
                <MonoIcon
                  text={currentAccount.icon}
                  src={currentAccount.logo}
                  size="base"
                  className="rounded-md"
                />
                {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold">
                        {currentAccount.name}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {currentAccount.type}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {accounts.map((account) => (
                <DropdownMenuItem
                  key={account.id}
                  onClick={() => onAccountChange(account)}
                  className="flex items-center gap-3"
                >
                  <MonoIcon
                    text={account.icon}
                    src={account.logo}
                    size="sm"
                    className="rounded-md"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{account.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {account.type}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Account settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className={cn(
            "flex items-center gap-2",
            isCollapsed ? "justify-center pl-1 pr-1" : "pl-1"
          )}>
            <MonoIcon
              src="/assets/ElectricTwin-Logo-Black.png"
              alt="Electric Twin"
              size="base"
            />
            {!isCollapsed && (
              <span className="text-sm font-semibold">Electric Twin</span>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* New Chat Button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onNewChat}
                  tooltip="Ask question"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ask question</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Audiences */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onAudiencesClick}
                  isActive={activeView === "audiences" && selectedProject === null}
                  tooltip="Audiences"
                >
                  <Users className="h-4 w-4" />
                  <span>Audiences</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Research Projects (collapsible) */}
              {currentAccount?.researchProjects && currentAccount.researchProjects.length > 0 && (
                <Collapsible
                  open={isProjectsOpen}
                  onOpenChange={setIsProjectsOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Projects">
                        <Folder className="h-4 w-4" />
                        <span>Projects</span>
                        {isProjectsOpen ? (
                          <ChevronDown className="ml-auto h-4 w-4" />
                        ) : (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {currentAccount.researchProjects.map((project) => (
                          <SidebarMenuSubItem key={project.id}>
                            <SidebarMenuSubButton
                              onClick={() => onResearchProjectSelect?.(project)}
                              isActive={selectedResearchProject?.id === project.id}
                            >
                              <span className="truncate">{project.name}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Conversations */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isCollapsed ? (
                // When collapsed, show single icon that opens sidebar
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setOpen(true)}
                    tooltip="Recent conversations"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Recent</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                // When expanded, show list without icons
                allItems.map((item) => {
                  if (item.status === "idle" && item.query === "") return null
                  const isActive =
                    item.id === conversation?.id && activeView === "conversation"

                  const displayTitle = item.title || item.query || "New Conversation"
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectHistory?.(item)}
                        isActive={isActive}
                        tooltip={displayTitle}
                        className="pl-2"
                      >
                        <span className="truncate">
                          {displayTitle}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

// Export a header component for the main content area
export function MainHeader({
  title,
  children,
}: {
  title?: string
  children?: React.ReactNode
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />
      {title && <h1 className="text-base font-medium">{title}</h1>}
      {children}
    </header>
  )
}
