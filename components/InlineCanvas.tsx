import React, { useState, useRef } from 'react';
import type { Canvas, QuestionResult, QualitativeTheme, SelectedSegment, SelectedSegments } from '@/types';
import {
  Maximize2,
  Copy,
  Download,
  Share2,
  RefreshCw,
  FileText,
  Sparkles,
  Plus,
  MoreVertical,
  MoreHorizontal,
  X,
  Users,
  Send,
  Eye,
  UserPlus,
  GitCompare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface InlineCanvasProps {
  canvas: Canvas;
  onExpand?: () => void;
  className?: string;
  selectedSegments?: SelectedSegments;
  /** Check if selection belongs to this canvas */
  isSelectionForThisCanvas?: boolean;
  onBarSelect?: (segment: SelectedSegment, canvasId: string) => void;
  onClearSegments?: () => void;
  onRemoveSegment?: (questionId: string, answerLabel: string) => void;
  onAskSegment?: (query: string, segments: SelectedSegments) => void;
}

export const InlineCanvas: React.FC<InlineCanvasProps> = ({
  canvas,
  onExpand,
  className,
  selectedSegments,
  isSelectionForThisCanvas = false,
  onBarSelect,
  onClearSegments,
  onRemoveSegment,
  onAskSegment,
}) => {
  // Only show selection UI if it belongs to this canvas
  const hasSelection = isSelectionForThisCanvas && selectedSegments && selectedSegments.segments.length > 0;
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    const text = `${canvas.title}\n\n${canvas.abstract}`;
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    console.log('Download canvas');
  };

  const handleShare = () => {
    console.log('Share canvas');
  };

  const handleRefresh = () => {
    console.log('Refresh canvas');
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && hasSelection && onAskSegment) {
      onAskSegment(inputValue.trim(), selectedSegments!);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion(e);
    }
  };

  return (
    <div
      className={cn(
        'bg-muted border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300',
        'hover:border-primary/30 hover:shadow-md',
        className
      )}
    >
      {/* Header with actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-foreground truncate">
              {canvas.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {canvas.respondents} respondents
            </span>
          </div>

          {/* Audience badge with add button */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-2 bg-secondary/50 border border-border px-2 py-1 rounded-full">
              <div className="w-4 h-4 bg-foreground text-background flex items-center justify-center rounded text-[10px] font-serif font-bold">
                {canvas.audience.icon}
              </div>
              <span className="text-xs font-medium">{canvas.audience.name}</span>
            </div>
            <button
              onClick={() => console.log('Add audience to compare')}
              className="w-6 h-6 rounded-full border border-border bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
              title="Add audience to compare"
            >
              <Plus className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
          {/* More options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Full screen expand */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onExpand}
            title="Open in full view"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Segment Selection Bar - shows when segments are selected */}
      {hasSelection && (
        <div className="px-4 py-2.5 border-b border-border bg-background/95">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Segment info and attributes */}
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
              {/* Label */}
              <span className="text-xs font-medium text-muted-foreground flex-shrink-0">Selected segment:</span>

              {/* Segment summary */}
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full text-xs flex-shrink-0">
                <Users className="w-3 h-3" />
                <span className="font-semibold">{selectedSegments!.totalRespondents.toLocaleString()}</span>
              </div>

              {/* Attributes list */}
              {selectedSegments!.segments.map((seg, idx) => {
                // Defensive check - ensure seg has expected properties
                if (!seg || typeof seg.answerLabel !== 'string') {
                  console.warn('Invalid segment object in InlineCanvas:', seg);
                  return null;
                }
                return (
                  <div
                    key={`${seg.questionId}-${seg.answerLabel}-${idx}`}
                    className="flex items-center gap-1 bg-secondary text-secondary-foreground border border-border px-2 py-1 rounded-md text-xs flex-shrink-0"
                  >
                    <span className="truncate max-w-[80px]">{seg.answerLabel}</span>
                    <span className="text-muted-foreground">({seg.percentage}%)</span>
                    {onRemoveSegment && (
                      <button
                        onClick={() => onRemoveSegment(seg.questionId, seg.answerLabel)}
                        className="hover:text-foreground transition-colors ml-0.5"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() => console.log('View segment', selectedSegments)}
              >
                <Eye className="w-3 h-3" />
                View Segment
              </Button>

              {/* More actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
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

      {/* Content area - show all charts */}
      <div className="overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-4">
          {/* Survey Questions */}
          {canvas.type === 'qualitative' && Array.isArray(canvas.themes) && canvas.themes.length > 0 ? (
            <div className="space-y-4">
              {canvas.themes.slice(0, 2).map((theme, i) => (
                <ThemeCard key={theme.id} theme={theme} index={i} />
              ))}
              {canvas.themes.length > 2 && (
                <div className="text-center py-2">
                  <span className="text-xs text-muted-foreground">
                    +{canvas.themes.length - 2} more themes
                  </span>
                </div>
              )}
            </div>
          ) : Array.isArray(canvas.questions) && canvas.questions.length > 0 ? (
            <div className="space-y-4">
              {canvas.questions.map((q, i) => (
                <MiniQuestionCard
                  key={q.id}
                  data={q}
                  index={i}
                  canvasId={canvas.id}
                  selectedSegments={isSelectionForThisCanvas ? selectedSegments : undefined}
                  onBarSelect={onBarSelect}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Footer - Input with segment pill when selected, otherwise simple footer */}
      <div className="px-4 py-3 border-t border-border bg-background">
        {hasSelection ? (
          <form onSubmit={handleSubmitQuestion} className="flex items-center gap-2">
            {/* Input with segment pill */}
            <div className="flex-1 relative">
              <div className="flex items-center gap-2 w-full rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                {/* Segment pill */}
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-xs flex-shrink-0">
                  <Users className="w-3 h-3" />
                  <span className="font-medium">{selectedSegments!.totalRespondents.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={onClearSegments}
                    className="hover:text-primary/70 transition-colors"
                    title="Remove segment from query"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Input field */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask this segment a question..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim()}
              className={cn(
                'h-9 w-9 rounded-lg transition-all duration-200 flex-shrink-0',
                inputValue.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Click bars to select audience, expand for full controls
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={onExpand}
            >
              <Sparkles className="w-3 h-3" />
              Open Canvas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Mini version of QuestionCard for inline display
const MiniQuestionCard: React.FC<{
  data: QuestionResult;
  index: number;
  canvasId: string;
  selectedSegments?: SelectedSegments;
  onBarSelect?: (segment: SelectedSegment, canvasId: string) => void;
}> = ({
  data,
  index,
  canvasId,
  selectedSegments,
  onBarSelect,
}) => {
  // Helper to parse percentage values (handles "37.2%" strings)
  const parsePercentage = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace('%', '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Normalize and sort options - handle both array and object formats
  const sortedOptions = React.useMemo(() => {
    const opts = data.options;
    let normalized: Array<{ label: string; percentage: number }> = [];

    if (Array.isArray(opts)) {
      normalized = opts.filter(opt => opt && typeof opt.label === 'string').map(opt => ({
        label: String(opt.label),
        percentage: parsePercentage(opt.percentage)
      }));
    } else if (opts && typeof opts === 'object') {
      // Handle object format like { "Gen Z": 45, "Millennials": 55 }
      normalized = Object.entries(opts).map(([label, value]) => ({
        label,
        percentage: parsePercentage(value)
      }));
    }

    return normalized.sort((a, b) => {
      const aVal = a.percentage || 0;
      const bVal = b.percentage || 0;
      return bVal - aVal;
    });
  }, [data.options]);

  // Check if a specific bar is selected
  const isBarSelected = (label: string) => {
    if (!selectedSegments || selectedSegments.segments.length === 0) return false;
    return selectedSegments.segments.some(
      seg => seg.questionId === data.id && seg.answerLabel === label
    );
  };

  const hasAnySelection = selectedSegments && selectedSegments.segments.length > 0;

  const handleBarClick = (option: { label: string; percentage?: number }) => {
    if (!onBarSelect) return;
    const respondentCount = Math.round(((option.percentage || 0) / 100) * data.respondents);
    onBarSelect({
      questionId: data.id,
      questionText: data.question,
      answerLabel: option.label,
      percentage: option.percentage || 0,
      respondents: respondentCount,
    }, canvasId);
  };

  return (
    <div className="bg-background border border-border rounded-lg p-5 min-h-[220px]">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold text-muted-foreground">
          Q{index + 1}
        </span>
        <span className="text-xs text-muted-foreground">
          {data.respondents} responses
        </span>
      </div>
      <h4 className="text-sm font-medium text-foreground mb-4 line-clamp-2">
        {data.question}
      </h4>

      {/* Simple horizontal bars - clickable for selection */}
      <div className="space-y-3">
        {sortedOptions.slice(0, 4).map((option, i) => {
          const selected = isBarSelected(option.label);
          const opacity = hasAnySelection ? (selected ? 1 : 0.3) : 1;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 cursor-pointer rounded-md px-1 py-0.5 -mx-1 transition-all",
                selected && "bg-primary/5",
                onBarSelect && "hover:bg-muted/50"
              )}
              onClick={() => handleBarClick(option)}
            >
              <span
                className="text-xs text-muted-foreground w-[45%] flex-shrink-0 leading-tight transition-opacity"
                style={{ opacity }}
              >
                {option.label}
              </span>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    "bg-primary"
                  )}
                  style={{
                    width: `${option.percentage}%`,
                    opacity,
                  }}
                />
              </div>
              <span
                className="text-xs font-medium text-foreground w-12 text-right flex-shrink-0 transition-opacity"
                style={{ opacity }}
              >
                {option.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Mini version of ThemeCard for inline display
const ThemeCard: React.FC<{ theme: QualitativeTheme; index: number }> = ({
  theme,
  index,
}) => {
  const [showAllQuotes, setShowAllQuotes] = useState(false);

  const sentimentColors = {
    positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    negative: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    mixed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const displayedQuotes = showAllQuotes ? theme.quotes : theme.quotes.slice(0, 1);

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
              sentimentColors[theme.sentiment]
            )}
          >
            {theme.sentiment}
          </span>
          <span className="text-xs text-muted-foreground">
            {theme.quotes.length} participant{theme.quotes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-2">{theme.topic}</h4>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {theme.summary}
      </p>

      {/* Quotes */}
      <div className="space-y-2 pl-3 border-l-2 border-primary/20">
        {displayedQuotes.map((quote, qIndex) => (
          <div key={qIndex}>
            <p className="text-xs text-foreground italic line-clamp-2">
              "{quote.text}"
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              - {quote.attribution}
            </p>
          </div>
        ))}
      </div>

      {/* Show more/less toggle */}
      {theme.quotes.length > 1 && (
        <button
          onClick={() => setShowAllQuotes(!showAllQuotes)}
          className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {showAllQuotes ? 'Show less' : `View all ${theme.quotes.length} responses`}
        </button>
      )}
    </div>
  );
};
