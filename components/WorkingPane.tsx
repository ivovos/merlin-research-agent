import React from 'react';
import { Conversation, Report } from '../types';
import { ProcessSteps } from './ProcessSteps';
import { QueryInput } from './QueryInput';
import { SuggestionRow } from './SuggestionRow';
import { FileText, Clock } from 'lucide-react';

interface WorkingPaneProps {
  conversation: Conversation;
  onSelectReport: (report?: Report) => void;
  onFollowUp: (query: string) => void;
}

const MOCK_SUGGESTIONS = [
  "Deep dive into the first question",
  "Segment results by @age-groups",
  "Run a /focus-group to explore why",
  "Compare sentiment with @uk-market",
  "Visualize data as a /heatmap",
  "Summarize key takeaways for stakeholders"
];

export const WorkingPane: React.FC<WorkingPaneProps> = ({ conversation, onSelectReport, onFollowUp }) => {
  // Auto-scroll logic
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, conversation.processSteps]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--background)] relative">
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Query History */}
          <div className="space-y-8">
            {conversation.messages.map((msg, idx) => {
              // Render USER message
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end animate-slide-up">
                    <div className="bg-[var(--background-card)] border border-[var(--border)] px-6 py-4 rounded-2xl rounded-tr-sm shadow-sm max-w-xl text-[var(--text-primary)] text-[1rem] leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content.split(/([@/#][\w-]+)/g).map((part, i) => {
                        if (part.startsWith('@') || part.startsWith('/') || part.startsWith('#')) {
                          return <span key={i} className="text-gray-400 font-medium">{part}</span>;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </div>
                  </div>
                );
              }

              // Render ASSISTANT (Result) message
              // Takes care of steps, thinking time, and report link
              if (msg.role === 'assistant') {
                return (
                  <div key={msg.id} className="space-y-6 animate-fade-in">
                    {/* 1. Process Steps */}
                    {msg.processSteps && (
                      <ProcessSteps
                        steps={msg.processSteps}
                        isComplete={true} // Historical steps are always complete
                      />
                    )}

                    {/* 2. Explanation & Metadata */}
                    <div className="space-y-4">
                      {msg.thinkingTime && (
                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider pl-1">
                          <Clock className="w-3 h-3" />
                          Thoughts for {msg.thinkingTime} seconds
                        </div>
                      )}

                      <p className="text-[var(--text-secondary)] leading-relaxed text-[1rem]">
                        {msg.content}
                      </p>

                      {/* 3. Report Card */}
                      {msg.report && (
                        <div
                          onClick={() => onSelectReport(msg.report)}
                          className="group bg-[var(--background-card)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--text-secondary)] transition-all shadow-sm w-full max-w-md"
                        >
                          <div className="w-12 h-12 rounded-lg bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="w-6 h-6 text-[var(--text-primary)]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[var(--text-primary)]">{msg.report.title}</h4>
                            <p className="text-sm text-[var(--text-muted)]">Report • {msg.report.audience.name}</p>
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
            <div className="space-y-4 animate-fade-in">
              <ProcessSteps
                steps={conversation.processSteps}
                isComplete={false}
              />
            </div>
          )}

          {/* Scroll Anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky Bottom Input */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent">
        <QueryInput
          onSubmit={onFollowUp}
          placeholder="Ask another question"
          className="shadow-lg"
          compact={true}
        />
      </div>
    </div>
  );
};