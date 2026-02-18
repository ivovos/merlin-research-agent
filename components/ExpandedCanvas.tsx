import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Canvas, SelectedSegments, Conversation, QuestionResult, QualitativeTheme } from '@/types';
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
  List,
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
import { SENTIMENT_COLORS } from '@/lib/sentimentColors';

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

// Generate a short, concise title from a question
// Converts verbose questions into headline-style phrases
// e.g., "Of the following factors would most likely lead you to cancel your Mubi subscription"
//    -> "Factors in cancelling subscription"
function generateShortTitle(question: string): string {
  let title = question
    // Remove question marks
    .replace(/\?/g, '')
    // Remove leading question words
    .replace(/^(What|How|Why|When|Where|Who|Which|Do|Does|Is|Are|Can|Could|Would|Should)\s+/i, '')
    // Remove "of the following" phrases
    .replace(/of the following\s+/gi, '')
    // Remove filler phrases about likelihood/probability
    .replace(/would most likely\s+/gi, '')
    .replace(/most likely\s+/gi, '')
    .replace(/would make you more likely to\s+/gi, 'to ')
    .replace(/make you more likely to\s+/gi, 'to ')
    .replace(/are you to\s+/gi, 'of ')
    .replace(/likely are you to\s+/gi, 'likelihood of ')
    .replace(/likely is it that you will\s+/gi, 'likelihood of ')
    // Remove timeframes
    .replace(/in the next \d+ (months?|years?|weeks?|days?)/gi, '')
    .replace(/over the next \d+ (months?|years?|weeks?|days?)/gi, '')
    // Convert "lead you to X" to "X-ing"
    .replace(/lead you to cancel/gi, 'cancelling')
    .replace(/lead you to (\w+)/gi, '$1ing')
    // Remove "your" before brand names but keep context
    .replace(/your (\w+) subscription/gi, '$1 subscription')
    .replace(/your (\w+) account/gi, '$1 account')
    // Remove leading articles and filler
    .replace(/^(the|a|an|type of|types of)\s+/gi, '')
    // Remove "that would" phrases
    .replace(/that would\s+/gi, 'that ')
    // Clean up "keep your X" to "staying with X"
    .replace(/keep your/gi, 'staying with')
    // Simplify "new content" phrases
    .replace(/new content would/gi, 'content to')
    // Remove trailing "to a lower tier"
    .replace(/to a lower tier/gi, '')
    // Clean up double spaces
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return title;
}

// Generate canvas title from all canvases
function generateCanvasTitle(conversation: Conversation | undefined, allCanvases: Canvas[]): string {
  // Prefer conversation title if available
  if (conversation?.title) return conversation.title;

  // Collect all canvas titles
  const titles = allCanvases
    .map(c => c.title)
    .filter((t): t is string => !!t);

  if (titles.length > 0) {
    // Use the first title as it's usually the main topic
    return titles[0];
  }

  return 'Audience Exploration';
}

// Evidence item structure for ToC - supports both questions and themes
interface EvidenceItem {
  id: string;
  index: number;
  shortTitle: string;
  title: string; // Full title (question text or theme topic)
  type: 'question' | 'theme';
  data: QuestionResult | QualitativeTheme;
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
  const [isTocOpen, setIsTocOpen] = useState(false);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Check if screen is large enough to always show ToC (1440px for MacBook Air 14")
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1440);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // ToC is visible if on large screen OR if manually opened on smaller screens
  const isTocVisible = isLargeScreen || isTocOpen;

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

  // Flatten all questions and themes into evidence items
  const evidenceItems = useMemo(() => {
    const items: EvidenceItem[] = [];
    let globalIndex = 0;

    allCanvases.forEach((c) => {
      // Add questions (quantitative)
      if (c.questions && c.questions.length > 0) {
        c.questions.forEach((q) => {
          globalIndex++;
          items.push({
            id: `${c.id}-q-${q.id}`,
            index: globalIndex,
            // Use title if provided, otherwise generate short title from question
            shortTitle: q.title || generateShortTitle(q.question),
            title: q.question, // Always use the actual question for the graph title
            type: 'question',
            data: q,
            canvasId: c.id,
          });
        });
      }

      // Add themes (qualitative/focus groups)
      if (c.themes && c.themes.length > 0) {
        c.themes.forEach((theme) => {
          globalIndex++;
          items.push({
            id: `${c.id}-t-${theme.id}`,
            index: globalIndex,
            shortTitle: theme.topic.length > 40 ? theme.topic.slice(0, 37) + '...' : theme.topic,
            title: theme.topic,
            type: 'theme',
            data: theme,
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

  // Generate title from ALL canvases in the conversation
  const canvasTitle = generateCanvasTitle(conversation, allCanvases);

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

  // Track scroll position to highlight active ToC item (throttled to prevent excessive re-renders)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let lastActiveItem: string | null = null;

    const handleScroll = () => {
      // Throttle using requestAnimationFrame
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
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

        // Only update state if the active item has changed
        if (closestItem && closestItem !== lastActiveItem) {
          lastActiveItem = closestItem;
          setActiveItemId(closestItem);
        }
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
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
        {/* TOC toggle button - only visible on smaller screens */}
        {!isLargeScreen && (
          <Button
            variant={isTocOpen ? "secondary" : "ghost"}
            size="sm"
            className="gap-1.5"
            onClick={() => setIsTocOpen(!isTocOpen)}
          >
            <List className="w-4 h-4" />
            Contents
          </Button>
        )}
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main scrollable content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-hide"
        >
          <div className={cn(
            "max-w-4xl mx-auto px-6 py-6 transition-all duration-300",
            isLargeScreen && "mr-64"
          )}>
            {/* Title Section */}
            <h1 className="text-lg font-semibold text-foreground mb-4">
              {canvasTitle}
            </h1>

            {/* Audience Section */}
            {audiences.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Audience
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {audiences.map((audience, i) => (
                    <Badge key={i} variant="secondary" className="gap-2 px-3 py-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {audience.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Section */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Summary
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('Summarise findings')}
              >
                Summarise findings
              </Button>
            </div>

            {/* Key Findings Section */}
            <h2 className="text-sm font-semibold text-foreground mb-6">
              Key findings
            </h2>

            {/* Evidence Cards with Left-aligned Section Titles */}
            <div className="space-y-6">
              {evidenceItems.map((item, idx) => (
                <div
                  key={item.id}
                  ref={(el) => setItemRef(item.id, el)}
                  className={cn(
                    "scroll-mt-32 flex items-start gap-6 pb-6",
                    idx < evidenceItems.length - 1 && "border-b border-border"
                  )}
                >
                  {/* Section Title - Left column, aligned to top of card question */}
                  <div className="w-44 flex-shrink-0 text-right pt-1">
                    <span className="text-sm text-muted-foreground leading-snug block">
                      {item.index}.0&nbsp;&nbsp;{item.shortTitle}
                    </span>
                  </div>

                  {/* Evidence Card - Right column */}
                  <div className="flex-1 min-w-0">
                    {item.type === 'question' ? (
                      <QuestionCard
                        data={item.data as QuestionResult}
                        index={item.index - 1}
                        canvasId={item.canvasId}
                        onEditQuestion={onEditQuestion}
                        questionTitle={item.title}
                        compact
                      />
                    ) : (
                      <ExpandedThemeCard theme={item.data as QualitativeTheme} />
                    )}
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

        {/* Table of Contents - Always visible on large screens (≥1440px), toggle drawer on smaller */}
        <div
          className={cn(
            "fixed right-0 top-14 bottom-0 w-64 bg-background/95 backdrop-blur-sm border-l border-border z-50",
            "transition-transform duration-300 ease-in-out",
            isTocVisible ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-6 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground">
                Table of contents
              </h3>
              {/* Close button - only visible on smaller screens when TOC is open */}
              {!isLargeScreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-2"
                  onClick={() => setIsTocOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <nav className="space-y-0.5">
              {evidenceItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToItem(item.id)}
                  className={cn(
                    "block w-full text-left text-xs py-1 transition-colors",
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

// Theme card for expanded canvas (focus group findings)
const ExpandedThemeCard: React.FC<{ theme: QualitativeTheme }> = ({ theme }) => {
  const [showAllQuotes, setShowAllQuotes] = useState(false);



  const displayedQuotes = showAllQuotes ? theme.quotes : theme.quotes.slice(0, 2);

  return (
    <div className="bg-background border border-border rounded-lg p-5">
      <div className="flex items-center gap-3 mb-3">
        <span
          className={cn(
            'text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full',
            SENTIMENT_COLORS[theme.sentiment]
          )}
        >
          {theme.sentiment}
        </span>
        <span className="text-sm text-muted-foreground">
          {theme.quotes.length} participant{theme.quotes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <h4 className="text-base font-semibold text-foreground mb-2">{theme.topic}</h4>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {theme.summary}
      </p>

      {/* Quotes */}
      <div className="space-y-3 pl-4 border-l-2 border-primary/20">
        {displayedQuotes.map((quote, qIndex) => (
          <div key={qIndex}>
            <p className="text-sm text-foreground italic leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              — {quote.attribution}
            </p>
          </div>
        ))}
      </div>

      {/* Show more/less toggle */}
      {theme.quotes.length > 2 && (
        <button
          onClick={() => setShowAllQuotes(!showAllQuotes)}
          className="mt-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {showAllQuotes ? 'Show less' : `View all ${theme.quotes.length} responses`}
        </button>
      )}
    </div>
  );
};
