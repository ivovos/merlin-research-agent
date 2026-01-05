import React, { useState, useRef, useEffect } from 'react';
import { Plus, Users, Pencil, ArrowUp, Search, X, FlaskConical } from 'lucide-react';
import { Button } from './ui/Button';
import { mockAudiences } from '../data/mockData';
import { Audience } from '../types';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isExpanded?: boolean;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  availableAudiences?: Audience[];
  onCreateAudience?: (name: string) => Audience;
}

const PLACEHOLDER_EXAMPLES = [
  "What do @times-readers want from a new podcast?",
  "Run a @survey with @gen-z about climate anxiety",
  "Ask @policy-makers about AI regulation priorities",
  "Conduct a @focus-group with @parents about screen time",
  "What features do @tech-enthusiasts value most?"
];

const RESEARCH_METHODS = [
  { id: 'survey', label: 'Survey', description: 'Broad quantitative data', icon: '📝' },
  { id: 'focus-group', label: 'Focus Group', description: 'Deep qualitative insights', icon: '👥' },
  { id: 'messaging-testing', label: 'Messaging Testing', description: 'Test copy and value props', icon: '💬' },
  { id: 'plot', label: 'Plot', description: 'Visual mapping of data', icon: '📈' },
  { id: 'heatmap', label: 'Heatmap', description: 'Intensity distribution', icon: '🔥' },
];

export const QueryInput: React.FC<QueryInputProps> = ({
  onSubmit,
  isExpanded = false,
  placeholder: staticPlaceholder = "What do @times-readers want from our podcast?",
  className = "",
  compact = false,
  availableAudiences = mockAudiences,
  onCreateAudience
}) => {
  const [query, setQuery] = useState('');
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [audienceSearch, setAudienceSearch] = useState('');

  // Animation state
  const [placeholderText, setPlaceholderText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerInputRef = useRef<HTMLInputElement>(null);

  // Focus picker input when opened
  useEffect(() => {
    if (showAudiencePicker) {
      setTimeout(() => pickerInputRef.current?.focus(), 50);
    }
  }, [showAudiencePicker]);

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
    if (query.trim()) {
      onSubmit(query);
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (!compact) {
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }
  }, [query, compact]);

  const handlePickerKeyDown = (e: React.KeyboardEvent, type: 'audience' | 'method') => {
    if (e.key === 'Escape') {
      setShowAudiencePicker(false);
      setShowMethodPicker(false);
      textareaRef.current?.focus();
    }
    // Add navigation logic if needed
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ease-in-out ${className} relative`}>
      {/* Audience Picker Popover */}
      {showAudiencePicker && (
        <div className="absolute bottom-full left-0 mb-4 w-72 bg-[var(--background-card)] rounded-xl border border-[var(--border)] shadow-xl overflow-hidden z-50 animate-slide-up flex flex-col font-sans">
          <div className="p-3 border-b border-[var(--border)] flex items-center gap-2 bg-[var(--background)]">
            <Search className="w-4 h-4 text-[var(--text-muted)]" />
            <input
              ref={pickerInputRef}
              value={audienceSearch}
              onChange={(e) => setAudienceSearch(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-[var(--text-muted)]"
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
            <button onClick={() => setShowAudiencePicker(false)} className="hover:text-[var(--text-primary)] text-[var(--text-muted)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {filteredAudiences.map(audience => (
              <button
                key={audience.id}
                onClick={() => selectAudience(audience)}
                className="w-full flex items-center gap-3 p-2 hover:bg-[var(--accent-light)] rounded-lg text-left transition-colors group"
              >
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-serif font-bold group-hover:scale-110 transition-transform">
                  {audience.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{audience.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">@{audience.id}</p>
                </div>
              </button>
            ))}

            {/* Create New Option */}
            {filteredAudiences.length === 0 && audienceSearch.trim() && onCreateAudience && (
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center gap-3 p-2 hover:bg-[var(--accent-light)] rounded-lg text-left transition-colors group border border-dashed border-[var(--border)]"
              >
                <div className="w-8 h-8 bg-[var(--accent)] text-white rounded-full flex items-center justify-center text-xs font-bold transform group-hover:rotate-90 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Create "{audienceSearch}"</p>
                  <p className="text-xs text-[var(--text-muted)]">Add new audience segment</p>
                </div>
              </button>
            )}

            {filteredAudiences.length === 0 && !audienceSearch.trim() && (
              <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                Type to search or create
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool/Method Picker Popover - ShadCN Command Style */}
      {showMethodPicker && (
        <div className="absolute bottom-full left-0 mb-4 w-72 bg-[var(--background-card)] rounded-xl border border-[var(--border)] shadow-xl overflow-hidden z-50 animate-slide-up flex flex-col font-sans">
          <div className="p-2 border-b border-[var(--border)] bg-[var(--background)]">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider pl-2">Research Methods</p>
          </div>
          <div className="p-1 space-y-1 max-h-64 overflow-y-auto">
            {RESEARCH_METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => selectMethod(method.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-[var(--accent-light)] rounded-lg text-left transition-colors group"
              >
                <div className="text-lg w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md group-hover:bg-white transition-colors">{method.icon}</div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">/{method.id}</p>
                  <p className="text-xs text-[var(--text-muted)]">{method.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {compact ? (
        // Compact Single-Height Layout
        <div className="relative bg-[var(--background-card)] rounded-[20px] border border-[var(--border)] shadow-sm px-3 py-2 transition-shadow focus-within:ring-2 focus-within:ring-[var(--border)] flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-[var(--text-secondary)] flex-shrink-0 h-8 w-8">
            <Plus className="w-5 h-5" />
          </Button>

          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            onFocus={() => setIsAnimating(false)}
            onBlur={() => !query && setIsAnimating(true)}
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-2 text-lg placeholder:text-[var(--text-muted)] text-[var(--text-primary)] leading-normal"
            style={{ height: '44px', lineHeight: '28px' }}
          />

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setShowAudiencePicker(!showAudiencePicker);
                setShowMethodPicker(false);
                setAudienceSearch('');
              }}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--accent-light)] transition-colors"
              title="Audience"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setShowMethodPicker(!showMethodPicker);
                setShowAudiencePicker(false);
              }}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--accent-light)] transition-colors font-mono font-bold text-lg w-9 h-9 flex items-center justify-center"
              title="Methods"
            >
              /
            </button>

            <button
              className="h-10 w-10 bg-[#1C1C1C] text-white rounded-[12px] flex items-center justify-center hover:opacity-90 transition-opacity"
              onClick={() => handleSubmit()}
              disabled={!query.trim()}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Expanded Multi-line Layout (Updated Design)
        <div className="relative bg-white rounded-[32px] border border-[var(--border)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 transition-shadow focus-within:ring-2 focus-within:ring-[var(--border)]">

          {/* Backdrop for syntax highlighting - EXACTLY matching textarea styles */}
          <div
            aria-hidden="true"
            className="absolute top-4 left-4 right-4 text-xl leading-[1.4] pointer-events-none whitespace-pre-wrap break-words text-[var(--text-primary)] font-sans text-left"
            style={{ minHeight: '40px' }}
          >
            {query.split(/([@\/][\w-]+)/g).map((part, i) => {
              if (part.startsWith('@') || part.startsWith('/')) {
                return <span key={i} className="text-gray-400">{part}</span>;
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
            className="w-full relative z-10 bg-transparent border-none focus:ring-0 focus:outline-none resize-none p-0 mb-4 max-h-40 min-h-[40px] text-xl placeholder:text-[var(--text-muted)] text-transparent caret-[var(--text-primary)] text-left"
            style={{ lineHeight: '1.4' }}
          />

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-[var(--text-secondary)] hover:bg-transparent px-0 w-auto h-auto">
                <Plus className="w-5 h-5" />
              </Button>

              <button
                onClick={() => {
                  setShowAudiencePicker(!showAudiencePicker);
                  setShowMethodPicker(false);
                  setAudienceSearch('');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-transparent text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-light)] transition-colors"
              >
                <Users className="w-4 h-4" />
                Audience
              </button>

              <button
                onClick={() => {
                  setShowMethodPicker(!showMethodPicker);
                  setShowAudiencePicker(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-transparent text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-light)] transition-colors"
              >
                Tools
              </button>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={!query.trim()}
              className="h-10 w-10 bg-[#1C1C1C] text-white rounded-[16px] flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};