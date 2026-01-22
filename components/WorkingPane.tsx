import React from 'react';
import type { Conversation, Canvas, SelectedSegment, SelectedSegments } from '@/types';
import { ProcessSteps } from './ProcessSteps';
import { QueryInput } from './QueryInput';
import { InlineCanvas } from './InlineCanvas';
import { ClarificationMessage } from './ClarificationMessage';

// Simple markdown-like renderer for assistant messages
function renderAssistantContent(content: string) {
  // Split by double newlines to get paragraphs
  const blocks = content.split(/\n\n+/);

  return blocks.map((block, blockIndex) => {
    // Check if this block is a numbered list
    const lines = block.split('\n');
    const isNumberedList = lines.every(line => /^\d+\.\s/.test(line.trim()) || line.trim() === '');

    if (isNumberedList && lines.some(line => /^\d+\.\s/.test(line.trim()))) {
      const listItems = lines.filter(line => /^\d+\.\s/.test(line.trim()));
      return (
        <ol key={blockIndex} className="list-decimal list-inside space-y-1 my-2">
          {listItems.map((item, itemIndex) => (
            <li key={itemIndex} className="text-foreground/90">
              {item.replace(/^\d+\.\s*/, '')}
            </li>
          ))}
        </ol>
      );
    }

    // Regular paragraph
    return (
      <p key={blockIndex} className="text-foreground/90 leading-relaxed">
        {block}
      </p>
    );
  });
}

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
  /** Callback when messaging-testing method is selected */
  onMessageTestingClick?: () => void;
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
  onMessageTestingClick,
}) => {
  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [conversation.messages]);

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
                        {/* Assistant text with max-width for readability (60ch on large, 80% on small) */}
                        <div className="max-w-[80%] lg:max-w-[60%] text-sm space-y-2">
                          {renderAssistantContent(msg.content)}
                        </div>

                        {/* 4. Inline Canvas - centered, full width within padding */}
                        {msg.canvas && (
                          <>
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
                            {/* 5. Follow-up suggestion from agent */}
                            {msg.canvas.followUpSuggestion && (
                              <div className="max-w-[80%] lg:max-w-[60%] text-sm text-muted-foreground">
                                {msg.canvas.followUpSuggestion}
                              </div>
                            )}
                          </>
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

          {/* Scroll Anchor - extra padding for floating input */}
          <div ref={messagesEndRef} className="h-24" />
        </div>
      </div>

      {/* Floating Bottom Input - absolutely positioned */}
      <div className="absolute bottom-0 left-0 right-0 px-[100px] py-6 z-10 pointer-events-none">
        <div className="pointer-events-auto">
        <QueryInput
          onSubmit={(query, segments) => {
            if (segments && segments.segments.length > 0 && onAskSegment) {
              onAskSegment(query, segments);
            } else {
              onFollowUp(query);
            }
          }}
          placeholder="Ask another question"
          className=""
          compact={true}
          availableAudiences={availableAudiences}
          onCreateAudience={onCreateAudience}
          selectedSegments={selectedSegments}
          onClearSegments={onClearSegments}
          onRemoveSegment={onRemoveSegment}
          onMessageTestingClick={onMessageTestingClick}
        />
        </div>
      </div>
    </div>
  );
};