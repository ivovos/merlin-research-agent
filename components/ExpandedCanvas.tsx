import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Canvas, SelectedSegments, Conversation, QuestionResult } from '@/types';
import { QuestionCard } from './QuestionCard';
import {
  X,
  Share,
  Users,
  Eye,
  MoreHorizontal,
  UserPlus,
  GitCompare,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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

// Generate a short title from a question
function generateShortTitle(question: string): string {
  // Remove question marks and common question words
  let title = question
    .replace(/\?/g, '')
    .replace(/^(What|How|Why|When|Where|Who|Which|Do|Does|Is|Are|Can|Could|Would|Should)\s+/i, '')
    .replace(/^(is|are|do|does|the|a|an)\s+/i, '');

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Truncate if too long
  if (title.length > 40) {
    title = title.substring(0, 37) + '...';
  }

  return title;
}

// Generate executive summary from canvas data
function generateExecutiveSummary(canvas: Canvas, allCanvases: Canvas[]): string {
  // Use canvas abstract if available
  if (canvas.abstract) return canvas.abstract;

  // Use key insight if available
  if (canvas.keyInsight) return canvas.keyInsight;

  // Generate a basic summary
  const totalQuestions = allCanvases.reduce((sum, c) => sum + (c.questions?.length || 0), 0);
  const totalRespondents = allCanvases.reduce((sum, c) => sum + (c.respondents || 0), 0);

  return `This analysis covers ${totalQuestions} key questions across ${totalRespondents.toLocaleString()} respondents, providing insights into audience preferences and behaviors.`;
}

// Evidence item structure for ToC
interface EvidenceItem {
  id: string;
  index: number;
  shortTitle: string;
  question: string;
  data: QuestionResult;
  canvasId: string;
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Extract ALL canvases from conversation messages
  const allCanvases = useMemo(() => {
    if (!conversation) return [canvas];

    const canvases: Canvas[] = [];
    conversation.messages.forEach((msg) => {
      if (msg.role === 'assistant' && msg.canvas) {
        canvases.push(msg.canvas);
      }
    });

    return canvases.length > 0 ? canvases : [canvas];
  }, [conversation, canvas]);

  // Flatten all questions into evidence items
  const evidenceItems = useMemo(() => {
    const items: EvidenceItem[] = [];
    let globalIndex = 0;

    allCanvases.forEach((c) => {
      if (c.questions) {
        c.questions.forEach((q) => {
          globalIndex++;
          items.push({
            id: `${c.id}-${q.id}`,
            index: globalIndex,
            shortTitle: generateShortTitle(q.question),
            question: q.question,
            data: q,
            canvasId: c.id,
          });
        });
      }
    });

    return items;
  }, [allCanvases]);

  // Get unique audiences across all canvases
  const audiences = useMemo(() => {
    const audienceMap = new Map<string, { name: string; icon?: string }>();
    allCanvases.forEach((c) => {
      if (c.audience) {
        audienceMap.set(c.audience.id || c.audience.name, {
          name: c.audience.name,
          icon: c.audience.icon,
        });
      }
    });
    return Array.from(audienceMap.values());
  }, [allCanvases]);

  // Generate title and summary
  const canvasTitle = conversation?.title || canvas.title || 'Audience Exploration';
  const executiveSummary = generateExecutiveSummary(canvas, allCanvases);

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

  // Track scroll position to highlight active ToC item
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();

      // Find the item that's most in view
      let closestItem: string | null = null;
      let closestDistance = Infinity;

      itemRefs.current.forEach((element, id) => {
        const rect = element.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top;

        // Check if element is in view (within top 40% of container)
        if (relativeTop >= -100 && relativeTop < containerRect.height * 0.4) {
          const distance = Math.abs(relativeTop);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestItem = id;
          }
        }
      });

      if (closestItem) {
        setActiveItemId(closestItem);
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => container.removeEventListener('scroll', handleScroll);
  }, [evidenceItems]);

  // Scroll to item when clicking ToC
  const scrollToItem = useCallback((id: string) => {
    const element = itemRefs.current.get(id);
    const container = scrollContainerRef.current;
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 120;

      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }
  }, []);

  // Register ref for an item
  const setItemRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) {
      itemRefs.current.set(id, element);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  // Only show selection UI if it belongs to this canvas
  const hasSelection = isSelectionForThisCanvas && selectedSegments.segments.length > 0;

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header Bar */}
      <div className="flex items-center h-14 px-4 border-b border-border bg-background flex-shrink-0 gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="flex-1" />
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => console.log('Share')}
          >
            <Share className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Segment Selection Bar */}
      {hasSelection && (
        <div className="px-6 py-3 border-b border-border bg-muted/50 flex-shrink-0">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Badge className="gap-2 px-3 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 flex-shrink-0">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold">{selectedSegments.totalRespondents.toLocaleString()}</span>
                <span className="text-primary/70">respondents</span>
              </Badge>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
                {selectedSegments.segments.map((seg, idx) => {
                  if (!seg || typeof seg.answerLabel !== 'string') return null;
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
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-7 w-7">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onClearSegments}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Three Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left spacer for symmetry */}
        <div className="hidden xl:block w-48 flex-shrink-0" />

        {/* Main scrollable content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-4xl mx-auto px-8 py-10">
            {/* Title Section */}
            <h1 className="text-2xl font-bold text-foreground mb-6">
              {canvasTitle}
            </h1>

            {/* Audience Badge */}
            {audiences.length > 0 && (
              <div className="flex items-center gap-2 mb-8">
                <span className="text-sm text-muted-foreground">Audience</span>
                {audiences.map((audience, i) => (
                  <Badge key={i} variant="secondary" className="gap-2 px-3 py-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {audience.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Executive Summary */}
            <div className="mb-10">
              <h2 className="text-base font-semibold text-foreground mb-3">
                Executive Summary
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[600px]">
                {executiveSummary}
              </p>
            </div>

            {/* Key Data Points Header */}
            <h2 className="text-base font-semibold text-foreground mb-8">
              Key data points
            </h2>

            {/* Evidence Cards with Left-aligned Section Titles */}
            <div className="space-y-12">
              {evidenceItems.map((item) => (
                <div
                  key={item.id}
                  ref={(el) => setItemRef(item.id, el)}
                  className="scroll-mt-32"
                >
                  {/* Section Title - Left aligned */}
                  <div className="flex items-start gap-6 mb-4">
                    <div className="w-48 flex-shrink-0 pt-1">
                      <span className="text-sm text-muted-foreground">
                        {item.index}.0&nbsp;&nbsp;{item.shortTitle}
                      </span>
                    </div>
                  </div>

                  {/* Evidence Card - Full width */}
                  <div className="pl-0 xl:pl-0">
                    <QuestionCard
                      data={item.data}
                      index={item.index - 1}
                      canvasId={item.canvasId}
                      onEditQuestion={onEditQuestion}
                    />
                  </div>
                </div>
              ))}

              {evidenceItems.length === 0 && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  No evidence available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Floating Table of Contents */}
        <div className="hidden xl:block w-56 flex-shrink-0">
          <div className="sticky top-6 pt-10 pr-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Table of contents
            </h3>
            <nav className="space-y-0.5">
              {evidenceItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToItem(item.id)}
                  className={cn(
                    "block w-full text-left text-sm py-1.5 transition-colors",
                    activeItemId === item.id
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.index}.0 {item.shortTitle}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
