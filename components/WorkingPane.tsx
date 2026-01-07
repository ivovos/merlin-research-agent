import React from 'react';
import { Conversation, Report } from '../types';
import { ProcessSteps } from './ProcessSteps';
import { QueryInput } from './QueryInput';
import { SuggestionRow } from './SuggestionRow';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface WorkingPaneProps {
  conversation: Conversation;
  onSelectReport: (report?: Report) => void;
  onFollowUp: (query: string) => void;
  availableAudiences?: any[];
  onCreateAudience?: any;
}

const MOCK_SUGGESTIONS = [
  "Deep dive into the first question",
  "Segment results by @age-groups",
  "Run a /focus-group to explore why",
  "Compare sentiment with @uk-market",
  "Visualize data as a /heatmap",
  "Summarize key takeaways for stakeholders"
];

export const WorkingPane: React.FC<WorkingPaneProps> = ({ conversation, onSelectReport, onFollowUp, availableAudiences, onCreateAudience }) => {
  // Auto-scroll logic
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, conversation.processSteps]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Navigation Bar */}
      <div className="h-16 flex items-center justify-center px-4">
        <h2 className="text-sm font-medium text-foreground">
          {conversation.query || 'New conversation'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="max-w-6xl mx-auto space-y-8 w-full">

          {/* Query History */}
          <div className="space-y-8">
            {conversation.messages.map((msg, idx) => {
              // Render USER message
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="bg-secondary/50 border border-border px-6 py-4 rounded-2xl rounded-tr-sm shadow-sm max-w-xl text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content.split(/([@/#][\w-]+)/g).map((part, i) => {
                        if (part.startsWith('@') || part.startsWith('/') || part.startsWith('#')) {
                          return <span key={i} className="text-muted-foreground font-medium">{part}</span>;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </div>
                  </div>
                );
              }

              // Render ASSISTANT (Result) message
              if (msg.role === 'assistant') {
                return (
                  <div key={msg.id} className="space-y-6 animate-in fade-in duration-500">
                    {/* 1. Process Steps (Collapsed by default if historical) */}
                    {msg.processSteps && (
                      <ProcessSteps
                        steps={msg.processSteps}
                        isComplete={true}
                        thinkingTime={msg.thinkingTime}
                      />
                    )}

                    {/* 2. Explanation & Metadata */}
                    <div className="space-y-4 px-2">
                      <p className="text-foreground/90 leading-relaxed text-sm">
                        {msg.content}
                      </p>

                      {/* 3. Report Card */}
                      {msg.report && (
                        <div
                          onClick={() => onSelectReport(msg.report)}
                          className="group bg-card border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all w-full max-w-md"
                        >
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{msg.report.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">Report • {msg.report.audience.name}</p>
                          </div>
                        </div>
                      )}

                      {/* 4. Suggestions (Only for the latest message or if relevant) */}
                      {msg.id === conversation.messages[conversation.messages.length - 1].id && (
                        <SuggestionRow
                          suggestions={MOCK_SUGGESTIONS}
                          onSelect={onFollowUp}
                        />
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Current Active Processing State (Only if status is processing/not complete yet) */}
          {conversation.status === 'processing' && (
            <div className="space-y-4 animate-pulse px-2">
              <ProcessSteps
                steps={conversation.processSteps}
                isComplete={false}
              />
            </div>
          )}

          {/* Scroll Anchor */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Sticky Bottom Input */}
      <div className="flex-shrink-0 bg-background p-6 z-10">
        <div className="max-w-6xl mx-auto w-full">
          <QueryInput
            onSubmit={onFollowUp}
            placeholder="Ask another question"
            className=""
            compact={true}
            availableAudiences={availableAudiences}
            onCreateAudience={onCreateAudience}
          />
        </div>
      </div>
    </div>
  );
};