import React from 'react';
import type { Conversation, Canvas, SelectedSegment, SelectedSegments } from '@/types';
import { ProcessSteps } from './ProcessSteps';
import { QueryInput } from './QueryInput';
import { InlineCanvas } from './InlineCanvas';
import { ClarificationMessage } from './ClarificationMessage';

interface WorkingPaneProps {
  conversation: Conversation;
  onSelectCanvas: (canvas?: Canvas) => void;
  onExpandCanvas?: (canvas: Canvas) => void;
  onFollowUp: (query: string) => void;
  onClarificationClick?: (suggestion: string) => void;
  availableAudiences?: any[];
  onCreateAudience?: any;
  selectedSegments?: SelectedSegments;
  /** Canvas ID that the selection belongs to */
  selectionCanvasId?: string | null;
  onBarSelect?: (segment: SelectedSegment, canvasId: string) => void;
  onClearSegments?: () => void;
  onRemoveSegment?: (questionId: string, answerLabel: string) => void;
  onAskSegment?: (query: string, segments: SelectedSegments) => void;
}

export const WorkingPane: React.FC<WorkingPaneProps> = ({
  conversation,
  onExpandCanvas,
  onFollowUp,
  onClarificationClick,
  availableAudiences,
  onCreateAudience,
  selectedSegments,
  selectionCanvasId,
  onBarSelect,
  onClearSegments,
  onRemoveSegment,
  onAskSegment,
}) => {
  // Auto-scroll logic
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, conversation.processSteps]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Main content area with 100px padding on sides */}
        <div className="px-[100px] py-6 space-y-8">

          {/* Query History */}
          <div className="space-y-8">
            {conversation.messages.map((msg) => {
              // Render USER message - right aligned, max 50% width
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="bg-muted px-6 py-4 rounded-2xl rounded-tr-sm max-w-[50%] text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
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

              // Render ASSISTANT (Result) message - left aligned, centered canvas
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

                    {/* 2. Clarification Request - agent needs more info */}
                    {msg.clarification && (
                      <ClarificationMessage
                        clarification={msg.clarification}
                        onSuggestionClick={(suggestion) => {
                          if (onClarificationClick) {
                            onClarificationClick(suggestion)
                          } else {
                            onFollowUp(suggestion)
                          }
                        }}
                      />
                    )}

                    {/* 3. Explanation & Metadata (only if no clarification) */}
                    {!msg.clarification && (
                      <div className="space-y-4">
                        <p className="text-foreground/90 leading-relaxed text-sm">
                          {msg.content}
                        </p>

                        {/* 4. Inline Canvas - centered, full width within padding */}
                        {msg.canvas && (
                          <div className="flex justify-center">
                            <InlineCanvas
                              canvas={msg.canvas}
                              onExpand={() => onExpandCanvas?.(msg.canvas!)}
                              selectedSegments={selectedSegments}
                              isSelectionForThisCanvas={selectionCanvasId === msg.canvas.id}
                              onBarSelect={onBarSelect}
                              onClearSegments={onClearSegments}
                              onRemoveSegment={onRemoveSegment}
                              onAskSegment={onAskSegment}
                              className="w-full max-w-3xl"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Current Active Processing State (Only if status is processing/not complete yet) */}
          {conversation.status === 'processing' && (
            <div className="space-y-4 animate-pulse">
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

      {/* Sticky Bottom Input - same 100px padding */}
      <div className="flex-shrink-0 bg-background px-[100px] py-6 z-10">
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
  );
};