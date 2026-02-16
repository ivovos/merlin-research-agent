import * as React from "react"
import {
  ChevronDown,
  LayoutDashboard,
  PanelLeft,
  Plus,
  Settings,
  Users,
  X,
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
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  onDeleteProject?: (id: string) => void
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
  onDeleteProject,
}: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  const activeProjectId = view.screen === 'project' ? view.projectId : null

  // All projects sorted by most recently updated
  const sortedProjects = React.useMemo(
    () => [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [projects],
  )

  return (
    <Sidebar collapsible="icon">
      {/* Header — Logo left, collapse toggle right */}
      <SidebarHeader className={cn(
        "h-14 flex-row items-center border-b",
        isCollapsed ? "justify-center px-2" : "justify-between pl-2 pr-2"
      )}>
        {isCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors p-1"
          >
            <img
              src="/assets/ElectricTwin-Logo-Black.png"
              alt="Electric Twin"
              className="w-6 h-6 rounded-sm"
            />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 pl-1">
              <img
                src="/assets/ElectricTwin-Logo-Black.png"
                alt="Electric Twin"
                className="w-6 h-6 rounded-sm"
              />
              <span className="text-sm font-semibold">Electric Twin</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors p-1.5 text-muted-foreground hover:text-foreground"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* + New Study — opens homepage with centered input */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onNewProject}
                  tooltip="New Study"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Study</span>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects — flat list under header */}
        {sortedProjects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sortedProjects.map((project) => (
                  <SidebarMenuItem key={project.id} className="group/project">
                    <SidebarMenuButton
                      onClick={() => onSelectProject(project.id)}
                      isActive={activeProjectId === project.id}
                      tooltip={project.name}
                      className="pr-1"
                    >
                      <span className="truncate flex-1">
                        {project.name}
                      </span>
                      {onDeleteProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteProject(project.id)
                          }}
                          className="opacity-0 group-hover/project:opacity-100 ml-auto flex-shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer — Account switcher + Settings */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          {/* Account switcher */}
          {currentAccount && onAccountChange ? (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    tooltip={currentAccount.name}
                    className="w-full"
                  >
                    <MonoIcon
                      text={currentAccount.icon}
                      src={currentAccount.logo}
                      size="sm"
                      className="rounded-md"
                    />
                    <span className="flex-1 text-left truncate">
                      {currentAccount.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
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
            </SidebarMenuItem>
          ) : null}

          {/* Settings */}
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
