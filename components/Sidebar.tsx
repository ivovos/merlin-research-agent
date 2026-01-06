import React from 'react';
import { Conversation } from '../types';
import { PanelLeftClose, Plus, Folder, Users } from 'lucide-react';
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
    <aside className="flex h-full w-full flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm">
            JP
          </div>
        </div>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-4 p-4 overflow-y-auto">
        {/* Action buttons */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" />
            <span>New conversation</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <Users className="h-4 w-4" />
            <span>Audiences</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <Folder className="h-4 w-4" />
            <span>Projects</span>
          </Button>
        </div>

        {/* Recent conversations */}
        <div className="space-y-1">
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
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
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
        </div>
      </div>
    </aside>
  );
};