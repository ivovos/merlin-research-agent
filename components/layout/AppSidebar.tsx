import * as React from "react"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  LayoutDashboard,
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
import type { Account, AppView, ProjectState } from "@/types"

interface AppSidebarProps {
  // Account
  currentAccount?: Account
  accounts?: Account[]
  onAccountChange?: (account: Account) => void
  // Navigation (new two-state model)
  view: AppView
  projects: ProjectState[]
  onSelectProject: (id: string) => void
  onGoHome: () => void
  onNewProject: () => void
  onAudiencesClick?: () => void
}

export function AppSidebar({
  currentAccount,
  accounts = [],
  onAccountChange,
  view,
  projects,
  onSelectProject,
  onGoHome,
  onNewProject,
  onAudiencesClick,
}: AppSidebarProps) {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true)

  const activeProjectId = view.screen === 'project' ? view.projectId : null

  // Sort projects by updatedAt (most recent first) for the Recent section
  const recentProjects = React.useMemo(
    () => [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [projects],
  )

  // Pinned/demo projects (first 5)
  const pinnedProjects = React.useMemo(
    () => projects.slice(0, 5),
    [projects],
  )

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
                  "flex items-center gap-3 rounded-lg transition-colors hover:bg-sidebar-accent w-full",
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
                    <span className="text-sm font-semibold flex-1 text-left">
                      {currentAccount.name}
                    </span>
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
                  <span className="text-sm font-medium">{account.name}</span>
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
              {/* + Ask question (creates new project) */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onNewProject}
                  tooltip="Ask question"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ask question</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Dashboard / Home */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onGoHome}
                  isActive={view.screen === 'home'}
                  tooltip="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Audiences */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onAudiencesClick}
                  tooltip="Audiences"
                >
                  <Users className="h-4 w-4" />
                  <span>Audiences</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Projects (collapsible — pinned/demo projects) */}
              {pinnedProjects.length > 0 && (
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
                        {pinnedProjects.map((project) => (
                          <SidebarMenuSubItem key={project.id}>
                            <SidebarMenuSubButton
                              onClick={() => onSelectProject(project.id)}
                              isActive={activeProjectId === project.id}
                            >
                              <span className="truncate">
                                {project.icon ?? '📊'} {project.name}
                              </span>
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

        {/* Recent Projects */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isCollapsed ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setOpen(true)}
                    tooltip="Recent projects"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Recent</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                recentProjects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectProject(project.id)}
                      isActive={activeProjectId === project.id}
                      tooltip={project.name}
                      className="pl-2 pr-1"
                    >
                      <span className="truncate flex-1">
                        {project.icon ?? '📊'} {project.name}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
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
