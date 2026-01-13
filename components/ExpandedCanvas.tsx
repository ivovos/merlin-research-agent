import React, { useState, useRef, useEffect } from 'react';
import type { Canvas, QualitativeTheme, SelectedSegment, SelectedSegments } from '@/types';
import { QuestionCard } from './QuestionCard';
import {
  X,
  Send,
  Copy,
  Download,
  Share2,
  RefreshCw,
  FileText,
  Sparkles,
  Users,
  Plus,
  Minimize2,
  Eye,
  MoreHorizontal,
  UserPlus,
  GitCompare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import { cn } from '@/lib/utils';

interface ExpandedCanvasProps {
  canvas: Canvas;
  onClose: () => void;
  onEditQuestion?: (questionId: string, newText: string, segments: string[]) => void;
  onCanvasPrompt?: (prompt: string, segments?: SelectedSegments) => void;
  selectedSegments: SelectedSegments;
  /** Check if selection belongs to this canvas */
  isSelectionForThisCanvas?: boolean;
  onBarSelect: (segment: SelectedSegment, canvasId: string) => void;
  onClearSegments: () => void;
  onRemoveSegment: (questionId: string, answerLabel: string) => void;
}

export const ExpandedCanvas: React.FC<ExpandedCanvasProps> = ({
  canvas,
  onClose,
  onEditQuestion,
  onCanvasPrompt,
  selectedSegments,
  isSelectionForThisCanvas = false,
  onBarSelect,
  onClearSegments,
  onRemoveSegment,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [version, setVersion] = useState(canvas.version || 1);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !hasSelection) || isProcessing) return;

    setIsProcessing(true);

    if (onCanvasPrompt) {
      await onCanvasPrompt(inputValue, hasSelection ? selectedSegments : undefined);
    }

    setInputValue('');
    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = () => {
    const text = `${canvas.title}\n\n${canvas.abstract}\n\n${
      canvas.type === 'qualitative' && canvas.themes
        ? canvas.themes.map(t => `${t.topic}: ${t.summary}`).join('\n\n')
        : canvas.questions.map(q => `${q.question}`).join('\n\n')
    }`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full w-full bg-muted">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-20 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{canvas.title}</h2>
                <Badge variant="secondary" className="text-xs font-medium">
                  v{version}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {canvas.respondents} respondents
              </span>
            </div>

            {/* Audience badge */}
            <Badge variant="outline" className="gap-2 px-2 py-1">
              <div className="w-4 h-4 bg-foreground text-background flex items-center justify-center rounded text-[10px] font-serif font-bold">
                {canvas.audience.icon}
              </div>
              <span className="text-xs font-medium">{canvas.audience.name}</span>
            </Badge>

            {/* Add audience to compare button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-7 text-xs"
              onClick={() => console.log('Add audience to compare')}
            >
              <Plus className="w-3 h-3" />
              Compare
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => console.log('Refresh')}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={handleCopy}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => console.log('Download')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
            </TooltipProvider>

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

            <div className="w-px h-6 bg-border mx-2" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                  >
                    <Minimize2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Minimize (Esc)</TooltipContent>
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
        <div className="max-w-4xl mx-auto p-8 space-y-6">
          {/* Key Insight - highlighted finding from Claude API */}
          {canvas.keyInsight && (
            <div className="flex items-start gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
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
                  onBarSelect={onBarSelect}
                  selectedSegments={isSelectionForThisCanvas ? selectedSegments : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No data available
            </div>
          )}

          {/* Follow-up Suggestion - agent's suggestion from Claude API */}
          {canvas.followUpSuggestion && (
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {canvas.followUpSuggestion}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Input Area */}
      <div className="border-t border-border bg-background p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              {/* Selected segments pills - multi-select (only show if selection is for this canvas) */}
              {hasSelection && (
                <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2 pr-14 max-w-[calc(100%-60px)]">
                  {/* Summary pill with total */}
                  <Badge className="gap-2 px-3 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-sm">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">New segment</span>
                    <span className="text-primary/70">•</span>
                    <span>{selectedSegments.totalRespondents.toLocaleString()} respondents</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent hover:text-primary/70"
                      onClick={onClearSegments}
                      title="Clear all selections"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </Badge>
                  {/* Individual segment pills */}
                  {selectedSegments.segments.map((seg, idx) => {
                    // Defensive check - ensure seg has expected properties
                    if (!seg || typeof seg.answerLabel !== 'string') {
                      console.warn('Invalid segment object in bottom input:', seg);
                      return null;
                    }
                    return (
                      <Badge
                        key={`${seg.questionId}-${seg.answerLabel}-${idx}`}
                        variant="secondary"
                        className="gap-1.5 px-2 py-1 text-xs"
                      >
                        <span className="truncate max-w-[120px]">{seg.answerLabel}</span>
                        <span className="text-muted-foreground">({(seg.respondents || 0).toLocaleString()})</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => onRemoveSegment(seg.questionId, seg.answerLabel)}
                          title="Remove this selection"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={hasSelection
                  ? `Create a segment from ${selectedSegments.segments.length} selected answer${selectedSegments.segments.length > 1 ? 's' : ''}...`
                  : "Ask to modify this canvas... (e.g., 'Add a comparison with Gen Z', 'Summarize key findings')"
                }
                className={cn(
                  'w-full resize-none rounded-xl border border-border bg-background px-4 pr-12',
                  'text-sm text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                  'max-h-[160px]',
                  'transition-all duration-200',
                  hasSelection
                    ? selectedSegments.segments.length > 2
                      ? 'pt-24 pb-3 min-h-[120px]'
                      : 'pt-16 pb-3 min-h-[100px]'
                    : 'py-3 min-h-[48px]'
                )}
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  type="submit"
                  size="icon"
                  disabled={(!inputValue.trim() && !hasSelection) || isProcessing}
                  className={cn(
                    'h-8 w-8 rounded-lg transition-all duration-200',
                    (inputValue.trim() || hasSelection)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>
              {hasSelection
                ? `${selectedSegments.segments.length} answer${selectedSegments.segments.length > 1 ? 's' : ''} selected — click more to add, or click again to remove`
                : 'Press Enter to send, Shift+Enter for new line, Esc to minimize'
              }
            </span>
          </div>
        </form>
      </div>
    </div>
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
