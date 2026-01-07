import React from 'react';
import { Conversation } from '../types';
import { PanelLeftClose, PanelLeftOpen, Plus, Folder, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  conversation: Conversation;
  history?: Conversation[];
  onSelectHistory?: (conv: Conversation) => void;
  onNewChat?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  conversation, 
  history = [], 
  onSelectHistory, 
  onNewChat,
  isCollapsed = false,
  onToggleCollapse
}) => {
  // Combine current conversation and history into one list
  const allItems = [conversation, ...history].filter((item, index, self) =>
    index === self.findIndex((t) => (
      t.id === item.id
    ))
  );

  return (
    <aside
      className="flex h-full w-full max-w-[320px] flex-col bg-background border-r border-border"
    >
      <div className={cn(
        "flex h-16 items-center border-b",
        isCollapsed ? "justify-center px-2" : "px-4"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm">
              JP
            </div>
          </div>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
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
        {/* Action buttons */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full gap-2",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={onNewChat}
            title={isCollapsed ? "New conversation" : undefined}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span>New conversation</span>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full gap-2",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            title={isCollapsed ? "Audiences" : undefined}
          >
            <Users className="h-4 w-4" />
            {!isCollapsed && <span>Audiences</span>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full gap-2",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            title={isCollapsed ? "Projects" : undefined}
          >
            <Folder className="h-4 w-4" />
            {!isCollapsed && <span>Projects</span>}
          </Button>
        </div>

        {/* Recent conversations */}
        <div className="space-y-1">
          {isCollapsed ? (
            // When collapsed, show single icon that expands sidebar
            <Button
              variant="ghost"
              className="w-full justify-center px-0"
              onClick={onToggleCollapse}
              title="Conversations"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          ) : (
            // When expanded, show full conversation list
            <>
              <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent
              </div>
              <div className="space-y-1">
                {allItems.map((item) => {
                  if (item.status === 'idle' && item.query === '') return null;
                  const isActive = item.id === conversation.id;

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
    </aside>
  );
};