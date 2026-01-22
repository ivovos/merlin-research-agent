import React, { useState, useRef, useEffect } from 'react';
import { Plus, Users, ArrowUp, Search, X, ClipboardList, MessageSquare, TrendingUp, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockAudiences } from '../data/mockData';
import type { Audience, SelectedSegments } from '@/types';
import { cn } from '@/lib/utils';

interface QueryInputProps {
  onSubmit: (query: string, segments?: SelectedSegments) => void;
  isExpanded?: boolean;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  availableAudiences?: Audience[];
  onCreateAudience?: (name: string) => Audience;
  /** Selected segments from chart interactions */
  selectedSegments?: SelectedSegments;
  /** Clear all selected segments */
  onClearSegments?: () => void;
  /** Remove a specific segment */
  onRemoveSegment?: (questionId: string, answerLabel: string) => void;
  /** Callback when messaging-testing method is selected */
  onMessageTestingClick?: () => void;
}

const PLACEHOLDER_EXAMPLES = [
  "What do @times-readers want from a new podcast?",
  "Run a @survey with @gen-z about climate anxiety",
  "Ask @policy-makers about AI regulation priorities",
  "Conduct a @focus-group with @parents about screen time",
  "What features do @tech-enthusiasts value most?"
];

const RESEARCH_METHODS = [
  { id: 'survey', label: 'Survey', description: 'Broad quantitative data', icon: ClipboardList },
  { id: 'focus-group', label: 'Focus Group', description: 'Deep qualitative insights', icon: Users },
  { id: 'messaging-testing', label: 'Messaging Testing', description: 'Test copy and value props', icon: MessageSquare },
  { id: 'plot', label: 'Plot', description: 'Visual mapping of data', icon: TrendingUp },
  { id: 'heatmap', label: 'Heatmap', description: 'Intensity distribution', icon: Flame },
];

export const QueryInput: React.FC<QueryInputProps> = ({
  onSubmit,
  isExpanded: _isExpanded = false,
  placeholder: _staticPlaceholder = "What do @times-readers want from our podcast?",
  className = "",
  compact = false,
  availableAudiences = mockAudiences,
  onCreateAudience,
  selectedSegments,
  onClearSegments,
  onRemoveSegment,
  onMessageTestingClick,
}) => {
  const hasSegmentSelection = selectedSegments && selectedSegments.segments.length > 0;
  const [query, setQuery] = useState('');
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [audienceSearch, setAudienceSearch] = useState('');
  const [methodSearch, setMethodSearch] = useState('');

  // Animation state
  const [placeholderText, setPlaceholderText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerInputRef = useRef<HTMLInputElement>(null);
  const audiencePickerRef = useRef<HTMLDivElement>(null);
  const methodPickerRef = useRef<HTMLDivElement>(null);
  const audienceContainerRef = useRef<HTMLDivElement>(null);
  const methodContainerRef = useRef<HTMLDivElement>(null);

  const [showPickerAbove, setShowPickerAbove] = useState(false);

  // Calculate if picker should show above or below
  const calculatePickerDirection = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    if (!containerRef.current) return false;

    const containerRect = containerRef.current.getBoundingClientRect();
    const pickerHeight = 400; // Approximate max height
    const spaceBelow = window.innerHeight - containerRect.bottom;

    return spaceBelow < pickerHeight;
  };

  // Focus picker input when opened
  useEffect(() => {
    if (showAudiencePicker) {
      setShowPickerAbove(calculatePickerDirection(audienceContainerRef));
      setTimeout(() => pickerInputRef.current?.focus(), 50);
    }
  }, [showAudiencePicker]);

  useEffect(() => {
    if (showMethodPicker) {
      setShowPickerAbove(calculatePickerDirection(methodContainerRef));
    }
  }, [showMethodPicker]);

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (audiencePickerRef.current && !audiencePickerRef.current.contains(event.target as Node)) {
        setShowAudiencePicker(false);
        setAudienceSearch('');
      }
      if (methodPickerRef.current && !methodPickerRef.current.contains(event.target as Node)) {
        setShowMethodPicker(false);
        setMethodSearch('');
      }
    };

    if (showAudiencePicker || showMethodPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAudiencePicker, showMethodPicker]);

  // Placeholder typing animation
  useEffect(() => {
    if (!isAnimating) return;
    if (compact) {
      setPlaceholderText("Ask another question");
      return;
    }

    let currentIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: any;

    const type = () => {
      const currentString = PLACEHOLDER_EXAMPLES[currentIdx];

      if (isDeleting) {
        setPlaceholderText(currentString.substring(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          currentIdx = (currentIdx + 1) % PLACEHOLDER_EXAMPLES.length;
          timeoutId = setTimeout(type, 500); // Wait before typing next
        } else {
          timeoutId = setTimeout(type, 30); // Deleting speed
        }
      } else {
        setPlaceholderText(currentString.substring(0, charIdx + 1));
        charIdx++;
        if (charIdx === currentString.length) {
          isDeleting = true;
          timeoutId = setTimeout(type, 2000); // Pause at full text
        } else {
          timeoutId = setTimeout(type, 50); // Typing speed
        }
      }
    };

    timeoutId = setTimeout(type, 500);
    return () => clearTimeout(timeoutId);
  }, [isAnimating, compact]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim() || hasSegmentSelection) {
      onSubmit(query, hasSegmentSelection ? selectedSegments : undefined);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setQuery(val);

    // Trigger on '@' if it's at start or preceded by whitespace
    if (/(^|\s)@$/.test(val)) {
      setShowAudiencePicker(true);
      setShowMethodPicker(false);
      setAudienceSearch('');
    }

    // Trigger on '/' if it's at start or preceded by whitespace
    if (/(^|\s)\/$/.test(val)) {
      setShowMethodPicker(true);
      setShowAudiencePicker(false);
    }
  };

  const selectAudience = (audience: Audience) => {
    let newQuery = query;
    // If we are at the end and there is a trailing @, remove it.
    if (newQuery.endsWith('@')) {
      newQuery = newQuery.slice(0, -1);
    }
    // Insert @id
    setQuery(newQuery + `@${audience.id} `);
    setShowAudiencePicker(false);
    setAudienceSearch('');
    textareaRef.current?.focus();
  };

  const selectMethod = (methodId: string) => {
    // Handle messaging-testing specially - open modal instead of inserting text
    if (methodId === 'messaging-testing' && onMessageTestingClick) {
      let newQuery = query;
      if (newQuery.endsWith('/')) {
        newQuery = newQuery.slice(0, -1);
      }
      setQuery(newQuery);
      setShowMethodPicker(false);
      setMethodSearch('');
      onMessageTestingClick();
      return;
    }

    let newQuery = query;
    if (newQuery.endsWith('/')) {
      newQuery = newQuery.slice(0, -1);
    }
    setQuery(newQuery + `/${methodId} `);
    setShowMethodPicker(false);
    textareaRef.current?.focus();
  };

  const handleCreateNew = () => {
    if (!audienceSearch.trim() || !onCreateAudience) return;

    const newAudience = onCreateAudience(audienceSearch.trim());
    selectAudience(newAudience);
  };

  const filteredAudiences = availableAudiences.filter(a =>
    a.name.toLowerCase().includes(audienceSearch.toLowerCase()) ||
    a.id.toLowerCase().includes(audienceSearch.toLowerCase())
  );

  const filteredMethods = RESEARCH_METHODS.filter(m =>
    m.label.toLowerCase().includes(methodSearch.toLowerCase()) ||
    m.id.toLowerCase().includes(methodSearch.toLowerCase()) ||
    m.description.toLowerCase().includes(methodSearch.toLowerCase())
  );

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (!compact) {
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }
  }, [query, compact]);

  return (
    <div className={cn("w-full max-w-full mx-auto transition-all duration-500 ease-in-out", className)}>
      {/* Audience Picker Popover */}
      {showAudiencePicker && (
        <div
          ref={audiencePickerRef}
          className={cn(
            "fixed w-72 bg-popover rounded-xl border border-border shadow-xl overflow-hidden z-[100] flex flex-col font-sans",
            showPickerAbove ? "animate-in slide-in-from-top-2" : "animate-in slide-in-from-bottom-2"
          )}
          style={
            audienceContainerRef.current ? {
              [showPickerAbove ? 'bottom' : 'top']: showPickerAbove
                ? `${window.innerHeight - audienceContainerRef.current.getBoundingClientRect().top + 8}px`
                : `${audienceContainerRef.current.getBoundingClientRect().bottom + 8}px`,
              left: `${audienceContainerRef.current.getBoundingClientRect().left}px`
            } : {}
          }
        >
          <div className="p-3 border-b border-border flex items-center gap-2 bg-background">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              ref={pickerInputRef}
              value={audienceSearch}
              onChange={(e) => setAudienceSearch(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-muted-foreground text-foreground"
              placeholder="Find or create audience..."
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowAudiencePicker(false);
                  textareaRef.current?.focus();
                }
                if (e.key === 'Enter') {
                  if (filteredAudiences.length > 0) {
                    selectAudience(filteredAudiences[0]);
                  } else if (audienceSearch.trim() && onCreateAudience) {
                    handleCreateNew();
                  }
                }
              }}
            />
            <button onClick={() => setShowAudiencePicker(false)} className="hover:text-foreground text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredAudiences.map(audience => {
              // Get source badge label based on sourceLabel or source
              const sourceLabel = (audience as any).sourceLabel || (audience as any).source;
              const getBadgeStyle = () => {
                const source = (audience as any).source || '';
                if (source.includes('_1p') || source === 'mubi_1p' || source === 'canva_1p' || source === 'wonderhood_1p') {
                  return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
                }
                if (source === 'electric_twin') {
                  return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
                }
                if (source === 'electric_twin_attention') {
                  return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
                }
                return 'bg-muted text-muted-foreground';
              };
              const getBadgeText = () => {
                const source = (audience as any).source || '';
                if (source === 'mubi_1p') return '1P';
                if (source === 'canva_1p') return '1P';
                if (source === 'wonderhood_1p') return '1P';
                if (source === 'electric_twin') return 'ET';
                if (source === 'electric_twin_attention') return 'ET';
                return '';
              };

              return (
                <button
                  key={audience.id}
                  onClick={() => selectAudience(audience)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg text-left transition-colors group"
                >
                  <div className="w-8 h-8 bg-foreground text-background rounded-md flex items-center justify-center text-xs font-serif font-bold group-hover:scale-110 transition-transform">
                    {audience.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{audience.name}</p>
                      {getBadgeText() && (
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", getBadgeStyle())}>
                          {getBadgeText()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{audience.id}</p>
                  </div>
                </button>
              );
            })}

            {/* Create New Option */}
            {filteredAudiences.length === 0 && audienceSearch.trim() && onCreateAudience && (
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg text-left transition-colors group border border-dashed border-border"
              >
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold transform group-hover:rotate-90 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Create "{audienceSearch}"</p>
                  <p className="text-xs text-muted-foreground">Add new audience segment</p>
                </div>
              </button>
            )}

            {filteredAudiences.length === 0 && !audienceSearch.trim() && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type to search or create
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool/Method Picker Popover */}
      {showMethodPicker && (
        <div
          ref={methodPickerRef}
          className={cn(
            "fixed w-72 bg-popover rounded-xl border border-border shadow-xl overflow-hidden z-[100] flex flex-col font-sans",
            showPickerAbove ? "animate-in slide-in-from-top-2" : "animate-in slide-in-from-bottom-2"
          )}
          style={
            methodContainerRef.current ? {
              [showPickerAbove ? 'bottom' : 'top']: showPickerAbove
                ? `${window.innerHeight - methodContainerRef.current.getBoundingClientRect().top + 8}px`
                : `${methodContainerRef.current.getBoundingClientRect().bottom + 8}px`,
              left: `${methodContainerRef.current.getBoundingClientRect().left}px`
            } : {}
          }
        >
          <div className="p-2 border-b border-border bg-background">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-2 mb-2">Methods</p>
            <div className="flex items-center gap-2 bg-background px-2 py-1.5 rounded-md border border-input">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={methodSearch}
                onChange={(e) => setMethodSearch(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-muted-foreground text-foreground"
                placeholder="Search methods..."
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowMethodPicker(false);
                    setMethodSearch('');
                    textareaRef.current?.focus();
                  }
                  if (e.key === 'Enter' && filteredMethods.length > 0) {
                    selectMethod(filteredMethods[0].id);
                    setMethodSearch('');
                  }
                }}
              />
              <button onClick={() => {
                setShowMethodPicker(false);
                setMethodSearch('');
              }} className="hover:text-foreground text-muted-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="p-1 space-y-1 max-h-64 overflow-y-auto">
            {filteredMethods.map(method => {
              const IconComponent = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    selectMethod(method.id);
                    setMethodSearch('');
                  }}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg text-left transition-colors group"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-muted/30 rounded-md group-hover:bg-background transition-colors">
                    <IconComponent className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">/{method.id}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {compact ? (
        // Compact Single-Height Layout (with optional segment selection)
        <div className={cn(
          "relative bg-background border border-input shadow-none transition-all rounded-full px-3 py-2"
        )}>
          <div className="flex items-center gap-3">
            {/* Segment pill - shown inline when segments selected */}
            {hasSegmentSelection ? (
              <Badge className="gap-2 px-3 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-sm flex-shrink-0">
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium truncate max-w-[200px]">
                  {/* Generate concise segment name from selected answers */}
                  {selectedSegments!.segments.length === 1
                    ? selectedSegments!.segments[0].answerLabel
                    : selectedSegments!.segments.length === 2
                      ? `${selectedSegments!.segments[0].answerLabel} + ${selectedSegments!.segments[1].answerLabel}`
                      : `${selectedSegments!.segments[0].answerLabel} +${selectedSegments!.segments.length - 1} more`
                  }
                </span>
                <span className="text-primary/70">•</span>
                <span className="flex-shrink-0">{selectedSegments!.totalRespondents.toLocaleString()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-0.5 hover:bg-transparent hover:text-primary/70 flex-shrink-0"
                  onClick={onClearSegments}
                  title="Clear segment"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </Badge>
            ) : (
              <Button variant="ghost" size="icon" className="text-muted-foreground flex-shrink-0 h-8 w-8 hover:bg-background">
                <Plus className="w-5 h-5" />
              </Button>
            )}

            <textarea
              ref={textareaRef}
              value={query}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={hasSegmentSelection ? "Ask about this segment..." : placeholderText}
              onFocus={() => setIsAnimating(false)}
              onBlur={() => !query && setIsAnimating(true)}
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-2 text-base placeholder:text-muted-foreground text-foreground leading-normal"
              style={{ height: '40px', lineHeight: '24px' }}
            />

            <div className="flex items-center gap-2 flex-shrink-0">
              <div ref={audienceContainerRef}>
                <button
                  onClick={() => {
                    setShowAudiencePicker(!showAudiencePicker);
                    setShowMethodPicker(false);
                    setAudienceSearch('');
                  }}
                  className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                  title="Audience"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
              <div ref={methodContainerRef}>
                <button
                  onClick={() => {
                    setShowMethodPicker(!showMethodPicker);
                    setShowAudiencePicker(false);
                  }}
                  className="p-2 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-mono font-bold text-lg w-9 h-9 flex items-center justify-center"
                  title="Methods"
                >
                  /
                </button>
              </div>

              <button
                className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                onClick={() => handleSubmit()}
                disabled={!query.trim() && !hasSegmentSelection}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Expanded Multi-line Layout (Updated Design)
        <div className="relative bg-background rounded-xl border border-input shadow-none p-4 transition-all focus-within:border-primary">

          {/* Backdrop for syntax highlighting - EXACTLY matching textarea styles */}
          <div
            aria-hidden="true"
            className="absolute top-4 left-4 right-4 text-base leading-[1.4] pointer-events-none whitespace-pre-wrap break-words text-foreground font-sans text-left"
            style={{ minHeight: '40px' }}
          >
            {query.split(/([@\/][\w-]+)/g).map((part, i) => {
              if (part.startsWith('@') || part.startsWith('/')) {
                return <span key={i} className="text-muted-foreground font-medium">{part}</span>;
              }
              return <span key={i}>{part}</span>;
            })}
            {query.endsWith('\n') && <br />}
          </div>

          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            onFocus={() => setIsAnimating(false)}
            onBlur={() => !query && setIsAnimating(true)}
            rows={1}
            spellCheck={false}
            className="w-full relative z-10 bg-transparent border-none focus:ring-0 focus:outline-none resize-none p-0 mb-4 max-h-40 min-h-[40px] text-base placeholder:text-muted-foreground text-transparent caret-foreground text-left"
            style={{ lineHeight: '1.4' }}
          />

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted h-10 w-10 rounded-full">
                <Plus className="w-5 h-5" />
              </Button>

              <div ref={audienceContainerRef}>
                <button
                  onClick={() => {
                    setShowAudiencePicker(!showAudiencePicker);
                    setShowMethodPicker(false);
                    setAudienceSearch('');
                  }}
                  className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  title="Audience"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>

              <div ref={methodContainerRef}>
                <button
                  onClick={() => {
                    setShowMethodPicker(!showMethodPicker);
                    setShowAudiencePicker(false);
                  }}
                  className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors font-mono font-bold text-lg"
                  title="Methods"
                >
                  /
                </button>
              </div>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={!query.trim()}
              className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};