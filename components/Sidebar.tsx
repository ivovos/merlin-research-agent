import React, { useState } from 'react';
import type { Conversation } from '@/types';
import { PanelLeftClose, PanelLeftOpen, Plus, Users, MessageSquare, ChevronDown, ChevronRight, Settings, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { MonoIcon } from './MonoIcon';
import type { Account } from '@/types';
import { mockAccounts } from '../data/mockData';

interface SidebarProps {
  conversation: Conversation;
  history?: Conversation[];
  onSelectHistory?: (conv: Conversation) => void;
  onNewChat?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // Audience navigation props
  currentAccount?: Account;
  onAccountChange?: (account: Account) => void;
  selectedProject?: string | null;
  onProjectSelect?: (projectId: string) => void;
  onAudiencesClick?: () => void;
  activeView?: 'conversation' | 'audiences' | 'audienceDetail';
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversation,
  history = [],
  onSelectHistory,
  onNewChat,
  isCollapsed = false,
  onToggleCollapse,
  currentAccount,
  onAccountChange,
  selectedProject,
  onProjectSelect: _onProjectSelect,
  onAudiencesClick,
  activeView = 'conversation'
}) => {
  const [accounts] = useState(mockAccounts);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);

  // Combine current conversation and history into one list
  const allItems = [conversation, ...history].filter((item, index, self) =>
    index === self.findIndex((t) => (
      t.id === item.id
    ))
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-background border-r border-border transition-all duration-200",
        isCollapsed ? "w-16" : "w-full max-w-[320px]"
      )}
    >
      {/* Header with logo */}
      <div className={cn(
        "flex h-16 items-center border-b group relative",
        isCollapsed ? "justify-center px-2" : "px-4"
      )}>
        <div className={cn("flex items-center", isCollapsed ? "" : "flex-1")}>
          <MonoIcon src="/assets/ElectricTwin-Logo-Black.png" alt="Electric Twin" size="sm" />
        </div>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "h-8 w-8",
              isCollapsed ? "absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" : ""
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <div className={cn(
        "flex-1 space-y-4 overflow-y-auto",
        isCollapsed ? "p-2" : "p-4"
      )}>
        {/* Navigation buttons */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full gap-2",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={onNewChat}
            title={isCollapsed ? "Ask question" : undefined}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span>Ask question</span>}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "w-full gap-2",
              isCollapsed ? "justify-center px-0" : "justify-start",
              activeView === 'audiences' && selectedProject === null ? "bg-accent text-accent-foreground" : ""
            )}
            onClick={onAudiencesClick}
            title={isCollapsed ? "Audiences" : undefined}
          >
            <Users className="h-4 w-4" />
            {!isCollapsed && <span>Audiences</span>}
          </Button>

          {/* Projects navigation (collapsible) */}
          {!isCollapsed && currentAccount?.projects && currentAccount.projects.length > 0 && (
            <Collapsible
              open={isProjectsOpen}
              onOpenChange={setIsProjectsOpen}
              className="space-y-1"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full gap-2 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    <span>Projects</span>
                  </div>
                  {isProjectsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pl-2">
                {currentAccount.projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"
                  >
                    {currentAccount.id !== 'canva' && (
                      <MonoIcon text={project.icon} src={project.logo} size="sm" />
                    )}
                    <span>{project.name}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Recent conversations */}
        <div className="space-y-1">
          {isCollapsed ? (
            // When collapsed, show single icon that expands sidebar
            <Button
              variant="ghost"
              className="w-full justify-center px-0"
              onClick={onToggleCollapse}
              title="Recent"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          ) : (
            // When expanded, show full conversation list
            <>
              <div className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Recent
              </div>
              <div className="space-y-1">
                {allItems.map((item) => {
                  if (item.status === 'idle' && item.query === '') return null;
                  const isActive = item.id === conversation.id && activeView === 'conversation';

                  return (
                    <button
                      key={item.id}
                      className={cn(
                        "w-full rounded-md text-sm transition-colors text-left px-3 py-2",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => onSelectHistory?.(item)}
                    >
                      <span className="truncate block">{item.query || "New Conversation"}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Account switcher at bottom */}
      {!isCollapsed && currentAccount && onAccountChange && (
        <>
          <Separator />
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <MonoIcon text={currentAccount.icon} src={currentAccount.logo} size="md" className="rounded-md" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {currentAccount.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {currentAccount.type}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {accounts.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => onAccountChange(account)}
                    className="flex items-center gap-3"
                  >
                    <MonoIcon text={account.icon} src={account.logo} size="sm" className="rounded-md" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{account.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {account.type}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Account settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </aside>
  );
};