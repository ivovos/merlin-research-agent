import React from 'react';
import type { Conversation, Canvas, SelectedSegment, SelectedSegments, StudyPlan } from '@/types';
import { ProcessSteps } from './ProcessSteps';
import { QueryInput } from './QueryInput';
import { InlineCanvas } from './InlineCanvas';
import { ClarificationMessage } from './ClarificationMessage';
import { ClipboardList, Users, MessageSquare, BarChart3, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon mapping for methods (same as StudyPlanPill)
const methodIcons: Record<string, React.ElementType> = {
  'explore-audience': BarChart3,
  'survey': ClipboardList,
  'focus-group': Users,
  'message-testing': MessageSquare,
};

// Inline method link component
interface MethodLinkProps {
  title: string;
  methodId: string;
  onClick: () => void;
}

const MethodLink: React.FC<MethodLinkProps> = ({ title, methodId, onClick }) => {
  const Icon = methodIcons[methodId] || Settings2;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-baseline gap-1 text-foreground hover:text-primary font-semibold transition-colors cursor-pointer"
    >
      <Icon className="h-4 w-4 self-center relative top-[1px]" />
      <span className="underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-primary">{title}</span>
    </button>
  );
};

// Render inline markdown (bold, italic) with optional method link support
function renderInlineMarkdown(
  text: string,
  studyPlan?: StudyPlan,
  onMethodClick?: () => void
): React.ReactNode[] {
  // Split by bold markers (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);

      // Check if this bold text matches the study plan (with or without method prefix)
      if (studyPlan && onMethodClick) {
        // Direct match with title
        const titleMatch = boldText === studyPlan.title;
        // Match with "Focus Group: Title" format
        const focusGroupMatch = studyPlan.methodId === 'focus-group' &&
          boldText === `Focus Group: ${studyPlan.title}`;

        if (titleMatch || focusGroupMatch) {
          return (
            <MethodLink
              key={i}
              title={boldText}
              methodId={studyPlan.methodId}
              onClick={onMethodClick}
            />
          );
        }
      }

      return <strong key={i} className="font-semibold">{boldText}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// Simple markdown-like renderer for assistant messages
function renderAssistantContent(
  content: string,
  studyPlan?: StudyPlan,
  onMethodClick?: () => void
) {
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
              {renderInlineMarkdown(item.replace(/^\d+\.\s*/, ''), studyPlan, onMethodClick)}
            </li>
          ))}
        </ol>
      );
    }

    // Regular paragraph with inline markdown support
    return (
      <p key={blockIndex} className="text-foreground/90 leading-relaxed">
        {renderInlineMarkdown(block, studyPlan, onMethodClick)}
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
  /** Callback when editing a question in a canvas */
  onEditQuestion?: (questionId: string, newText: string, segments: string[]) => void;
  /** Callback when messaging-testing method is selected */
  onMessageTestingClick?: () => void;
  /** Callback when clicking the study plan pill to edit */
  onEditStudyPlan?: (studyPlan: StudyPlan, audienceId?: string) => void;
  /** Callback when editing a canvas title */
  onCanvasTitleChange?: (canvasId: string, newTitle: string) => void;
  /** Callback when opening method creator from slash command */
  onOpenMethodCreator?: (methodId?: string) => void;
  /** Whether the side panel is open (reduces padding) */
  isSidePanelOpen?: boolean;
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
  onEditQuestion,
  onMessageTestingClick,
  onEditStudyPlan,
  onCanvasTitleChange,
  onOpenMethodCreator,
  isSidePanelOpen = false,
}) => {
  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [conversation.messages]);

  // Handler for "Ask another question" button - scrolls to bottom where input is
  const handleAskAnotherQuestion = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Main content area with responsive padding */}
        <div className={cn(
          "py-6 space-y-8 transition-all duration-300",
          isSidePanelOpen ? "px-6 lg:px-10" : "px-[100px]"
        )}>

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
                    {/* 1. Process Steps (show progress if not all complete) */}
                    {msg.processSteps && (
                      <ProcessSteps
                        steps={msg.processSteps}
                        isComplete={msg.processSteps.every(s => s.status === 'complete')}
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

                    {/* 4. Explanation & Metadata (only if no clarification) */}
                    {!msg.clarification && (
                      <div className="space-y-4">
                        {/* Assistant text with max-width for readability (60ch on large, 80% on small) */}
                        <div className="max-w-[80%] lg:max-w-[60%] text-sm space-y-2">
                          {renderAssistantContent(
                            msg.content,
                            msg.studyPlan,
                            msg.studyPlan ? () => onEditStudyPlan?.(
                              msg.studyPlan!,
                              msg.canvas?.audience?.id || conversation.canvas?.audience?.id
                            ) : undefined
                          )}
                        </div>

                        {/* 5. Inline Canvas - centered, full width within padding */}
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
                                onEditQuestion={onEditQuestion}
                                onEditStudyPlan={onEditStudyPlan}
                                onTitleChange={
                                  onCanvasTitleChange
                                    ? (newTitle) => onCanvasTitleChange(msg.canvas!.id, newTitle)
                                    : undefined
                                }
                                onAskAnotherQuestion={
                                  msg.canvas.type === 'qualitative' ? handleAskAnotherQuestion : undefined
                                }
                                className="w-full max-w-3xl"
                              />
                            </div>
                            {/* 6. Follow-up suggestion from agent */}
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

          {/* Scroll Anchor - extra padding for floating input */}
          <div ref={messagesEndRef} className="h-24" />
        </div>
      </div>

      {/* Floating Bottom Input - absolutely positioned */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 py-6 z-10 pointer-events-none transition-all duration-300",
        isSidePanelOpen ? "px-6 lg:px-10" : "px-[100px]"
      )}>
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
          onOpenMethodCreator={onOpenMethodCreator}
        />
        </div>
      </div>
    </div>
  );
};