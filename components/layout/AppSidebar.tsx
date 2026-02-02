import * as React from "react"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Trash2,
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
import { Input } from "@/components/ui/input"
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
  onRenameConversation?: (id: string, newTitle: string) => void
  onDeleteConversation?: (id: string) => void
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
  onRenameConversation,
  onDeleteConversation,
  selectedResearchProject,
  onResearchProjectSelect,
}: AppSidebarProps) {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingTitle, setEditingTitle] = React.useState("")

  // Use history as-is, don't reorder based on current conversation
  // This keeps the list stable during the session
  const allItems = React.useMemo(() => {
    // If current conversation is new (not in history), we could add it
    // But for stability, just use history directly
    if (!conversation) return history

    // Check if current conversation is already in history
    const isInHistory = history.some(h => h.id === conversation.id)

    if (isInHistory) {
      // Just return history as-is, the current one will be highlighted
      return history
    }

    // Current conversation is new - add at top only if it has content
    if (conversation.status !== 'idle' || conversation.query) {
      return [conversation, ...history]
    }

    return history
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
                // When expanded, show list with hover actions
                allItems.map((item) => {
                  if (item.status === "idle" && item.query === "") return null
                  const isActive =
                    item.id === conversation?.id && activeView === "conversation"
                  const isEditing = editingId === item.id

                  const displayTitle = item.title || item.query || "New Conversation"

                  // Handle save rename
                  const handleSaveRename = () => {
                    if (editingTitle.trim() && onRenameConversation) {
                      onRenameConversation(item.id, editingTitle.trim())
                    }
                    setEditingId(null)
                    setEditingTitle("")
                  }

                  return (
                    <SidebarMenuItem key={item.id} className="group/item">
                      {isEditing ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={handleSaveRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename()
                            if (e.key === "Escape") {
                              setEditingId(null)
                              setEditingTitle("")
                            }
                          }}
                          autoFocus
                          className="h-8 text-sm mx-2"
                        />
                      ) : (
                        <div className="flex items-center w-full">
                          <SidebarMenuButton
                            onClick={() => onSelectHistory?.(item)}
                            isActive={isActive}
                            tooltip={displayTitle}
                            className="pl-2 flex-1"
                          >
                            <span className="truncate">
                              {displayTitle}
                            </span>
                          </SidebarMenuButton>
                          {/* Hover actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="h-6 w-6 p-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity mr-1 hover:bg-muted rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingId(item.id)
                                  setEditingTitle(displayTitle)
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDeleteConversation?.(item.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
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
  onTitleChange,
}: {
  title?: string
  children?: React.ReactNode
  onTitleChange?: (newTitle: string) => void
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(title || "")
  const [isHovered, setIsHovered] = React.useState(false)

  React.useEffect(() => {
    setEditValue(title || "")
  }, [title])

  const handleSave = () => {
    if (editValue.trim() && onTitleChange) {
      onTitleChange(editValue.trim())
    }
    setIsEditing(false)
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />
      {title && (
        isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") {
                setEditValue(title)
                setIsEditing(false)
              }
            }}
            autoFocus
            className="h-8 text-base font-medium max-w-xs"
          />
        ) : (
          <div
            className="group/title flex items-center gap-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <h1 className="text-base font-medium">{title}</h1>
            {onTitleChange && (
              <button
                onClick={() => setIsEditing(true)}
                className={cn(
                  "h-6 w-6 p-0 flex items-center justify-center hover:bg-muted rounded transition-opacity",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        )
      )}
      {children}
    </header>
  )
}
