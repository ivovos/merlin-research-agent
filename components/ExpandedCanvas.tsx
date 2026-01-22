import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Canvas, QualitativeTheme, SelectedSegments, Conversation } from '@/types';
import { QuestionCard } from './QuestionCard';
import {
  X,
  Share2,
  FileText,
  Users,
  Eye,
  MoreHorizontal,
  UserPlus,
  GitCompare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ExpandedCanvasProps {
  canvas: Canvas;
  /** Optional conversation to show ALL canvases from messages */
  conversation?: Conversation;
  onClose: () => void;
  onEditQuestion?: (questionId: string, newText: string, segments: string[]) => void;
  selectedSegments: SelectedSegments;
  /** Check if selection belongs to this canvas */
  isSelectionForThisCanvas?: boolean;
  onClearSegments: () => void;
  onRemoveSegment: (questionId: string, answerLabel: string) => void;
}

export const ExpandedCanvas: React.FC<ExpandedCanvasProps> = ({
  canvas,
  conversation,
  onClose,
  onEditQuestion,
  selectedSegments,
  isSelectionForThisCanvas = false,
  onClearSegments,
  onRemoveSegment,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Extract ALL canvases from conversation messages
  const allCanvases = useMemo(() => {
    if (!conversation) return [canvas];

    const canvases: Canvas[] = [];
    conversation.messages.forEach((msg) => {
      if (msg.role === 'assistant' && msg.canvas) {
        canvases.push(msg.canvas);
      }
    });

    // If no canvases found in messages, fall back to the passed canvas
    return canvases.length > 0 ? canvases : [canvas];
  }, [conversation, canvas]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Only show selection UI if it belongs to this canvas
  const hasSelection = isSelectionForThisCanvas && selectedSegments.segments.length > 0;

  return (
    <div className="flex flex-col h-full w-full bg-muted">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-20 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-background">
          {/* Left: Back button */}
          <div className="flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back (Esc)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Center: Title */}
          <div className="flex-1 flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Canvas:</span>
            <h2 className="text-base font-medium text-foreground">
              {allCanvases.length > 1 ? 'All Evidence' : canvas.title}
            </h2>
          </div>

          {/* Right: Share button */}
          <div className="flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => console.log('Share')}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Sticky Segment Selection Bar - shows when segments are selected */}
        {hasSelection && (
          <div className="px-6 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              {/* Left: Segment info and attributes */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Segment summary */}
                <Badge className="gap-2 px-3 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 flex-shrink-0">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-semibold">{selectedSegments.totalRespondents.toLocaleString()}</span>
                  <span className="text-primary/70">respondents</span>
                </Badge>

                {/* Attributes list - scrollable */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
                  {selectedSegments.segments.map((seg, idx) => {
                    // Defensive check - ensure seg has expected properties
                    if (!seg || typeof seg.answerLabel !== 'string') {
                      console.warn('Invalid segment object:', seg);
                      return null;
                    }
                    return (
                      <Badge
                        key={`${seg.questionId}-${seg.answerLabel}-${idx}`}
                        variant="secondary"
                        className="gap-1.5 px-2 py-1 flex-shrink-0 rounded-md"
                      >
                        <span className="truncate max-w-[100px]">{seg.answerLabel}</span>
                        <span className="text-muted-foreground">({seg.percentage}%)</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => onRemoveSegment(seg.questionId, seg.answerLabel)}
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 gap-1.5"
                  onClick={() => console.log('View segment', selectedSegments)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  View segment
                </Button>

                {/* More actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log('Save as audience', selectedSegments)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Save as audience
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Compare audience', selectedSegments)}>
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare to another audience
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onClearSegments} className="text-destructive">
                      <X className="w-4 h-4 mr-2" />
                      Clear selection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Dismiss button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={onClearSegments}
                  title="Dismiss selection"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1" ref={contentRef}>
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Render ALL canvases */}
          {allCanvases.map((canvasItem, canvasIndex) => (
            <CanvasSection
              key={canvasItem.id}
              canvas={canvasItem}
              index={canvasIndex}
              isOnly={allCanvases.length === 1}
              onEditQuestion={onEditQuestion}
            />
          ))}

          {allCanvases.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No evidence available
            </div>
          )}
        </div>
      </ScrollArea>

    </div>
  );
};

// Canvas Section - collapsible container for each canvas
interface CanvasSectionProps {
  canvas: Canvas;
  index: number;
  isOnly: boolean;
  onEditQuestion?: (questionId: string, newText: string, segments: string[]) => void;
}

const CanvasSection: React.FC<CanvasSectionProps> = ({
  canvas,
  index,
  isOnly,
  onEditQuestion,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // If it's the only canvas, render without collapsible wrapper
  if (isOnly) {
    return (
      <div className="space-y-6">
        {/* Key Insight */}
        {canvas.keyInsight && (
          <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground/90 leading-relaxed">{canvas.keyInsight}</p>
          </div>
        )}

        {/* Content: Questions or Themes */}
        {canvas.type === 'qualitative' && canvas.themes && canvas.themes.length > 0 ? (
          <div className="space-y-6">
            {canvas.themes.map((theme) => (
              <FullThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        ) : canvas.questions && canvas.questions.length > 0 ? (
          <div className="space-y-6">
            {canvas.questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                data={q}
                index={i}
                canvasId={canvas.id}
                onEditQuestion={onEditQuestion}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No data available
          </div>
        )}
      </div>
    );
  }

  // Multiple canvases - render with collapsible header
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        {/* Canvas Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 bg-background hover:bg-muted/50 transition-colors border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">{canvas.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{canvas.questions?.length || 0} questions</span>
                  <span>·</span>
                  <span>{canvas.respondents?.toLocaleString()} responses</span>
                  {canvas.audience && (
                    <>
                      <span>·</span>
                      <Badge variant="outline" className="h-5 text-[10px] px-1.5">
                        {canvas.audience.name}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                #{index + 1}
              </Badge>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-6 space-y-6 bg-muted/30">
            {/* Key Insight */}
            {canvas.keyInsight && (
              <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/90 leading-relaxed">{canvas.keyInsight}</p>
              </div>
            )}

            {/* Content: Questions or Themes */}
            {canvas.type === 'qualitative' && canvas.themes && canvas.themes.length > 0 ? (
              <div className="space-y-6">
                {canvas.themes.map((theme) => (
                  <FullThemeCard key={theme.id} theme={theme} />
                ))}
              </div>
            ) : canvas.questions && canvas.questions.length > 0 ? (
              <div className="space-y-6">
                {canvas.questions.map((q, i) => (
                  <QuestionCard
                    key={q.id}
                    data={q}
                    index={i}
                    canvasId={canvas.id}
                    onEditQuestion={onEditQuestion}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// Sentiment badge variant mapping using design tokens
const sentimentVariants: Record<string, { className: string }> = {
  positive: { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400' },
  negative: { className: 'bg-destructive/10 text-destructive border-destructive/20' },
  neutral: { className: 'bg-muted text-muted-foreground border-border' },
  mixed: { className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400' },
};

// Full Theme Card for expanded view
const FullThemeCard: React.FC<{ theme: QualitativeTheme }> = ({ theme }) => {
  const [showAllQuotes, setShowAllQuotes] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  const displayedQuotes = showAllQuotes ? theme.quotes : theme.quotes.slice(0, 2);
  const sentimentStyle = sentimentVariants[theme.sentiment] || sentimentVariants.neutral;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-bold uppercase tracking-wider',
                sentimentStyle.className
              )}
            >
              {theme.sentiment}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {theme.quotes.length} participant{theme.quotes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mt-2">{theme.topic}</h3>
        </div>

        {/* Participant filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {selectedParticipant || 'All participants'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedParticipant(null)}>
              All participants
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {theme.quotes.map((quote, i) => (
              <DropdownMenuItem
                key={i}
                onClick={() => setSelectedParticipant(quote.attribution)}
              >
                {quote.attribution}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        {theme.summary}
      </p>

      {/* Quotes section with participant filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Verbatim Responses
          </h4>
          {theme.quotes.length > 2 && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setShowAllQuotes(!showAllQuotes)}
            >
              {showAllQuotes ? 'Collapse' : `Show all ${theme.quotes.length}`}
            </Button>
          )}
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-primary/20">
          {displayedQuotes
            .filter(q => !selectedParticipant || q.attribution === selectedParticipant)
            .map((quote, qIndex) => (
              <div
                key={qIndex}
                className={cn(
                  "text-sm p-3 rounded-lg transition-colors cursor-pointer",
                  "hover:bg-muted/50",
                  selectedParticipant === quote.attribution && "bg-primary/5 border border-primary/20"
                )}
                onClick={() => setSelectedParticipant(
                  selectedParticipant === quote.attribution ? null : quote.attribution
                )}
              >
                <p className="text-foreground italic mb-2 leading-relaxed">"{quote.text}"</p>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium">— {quote.attribution}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('View full response from', quote.attribution);
                    }}
                  >
                    View full response
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
};
