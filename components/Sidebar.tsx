import React, { useState } from 'react';
import { Conversation } from '../types';
import { Zap, PanelLeftClose, PanelLeftOpen, MessageSquare } from 'lucide-react';

interface SidebarProps {
  conversation: Conversation;
  history?: Conversation[];
  onSelectHistory?: (conv: Conversation) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ conversation, history = [], onSelectHistory }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Combine current conversation and history into one list
  // The current conversation should act like just another item in the list if it has an ID
  const allItems = [conversation, ...history].filter((item, index, self) =>
    index === self.findIndex((t) => (
      t.id === item.id
    ))
  );

  return (
    <aside
      className={`${isCollapsed ? 'w-[70px]' : 'w-[240px]'} h-full border-r border-[var(--border)] bg-[var(--background)] flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 relative group z-20`}
    >
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-4`}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Merlin" className="w-8 h-8" />
        </div>
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Collapse sidebar">
            <PanelLeftClose className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Floating expand button that appears when collapsed */}
      {isCollapsed && (
        <div className="absolute top-6 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute top-0 right-[-12px] bg-white border border-gray-200 rounded-full p-1 shadow-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] z-50"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {!isCollapsed && <h3 className="text-xs font-bold text-[var(--text-muted)] mb-4 uppercase tracking-wider pl-2">History</h3>}

        {allItems.map((item) => {
          const isActive = item.id === conversation.id;
          // If item is 'idle' (default empty state), maybe don't show it in history or show as "New Chat"
          if (item.status === 'idle' && item.query === '') return null;

          return (
            <div
              key={item.id}
              onClick={() => onSelectHistory?.(item)}
              className={`group flex items-center gap-3 py-2 px-2 rounded-lg cursor-pointer transition-all border ${isActive
                ? 'bg-[var(--accent-light)] border-[var(--accent)]/50'
                : 'hover:bg-[var(--accent-light)] border-transparent hover:border-[var(--border)]'
                }`}
            >
              {isCollapsed ? (
                <div className="mx-auto" title={item.query}>
                  <MessageSquare className={`w-5 h-5 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                </div>
              ) : (
                <>
                  <p className={`pl-1 text-sm truncate font-medium ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                    {item.query}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};