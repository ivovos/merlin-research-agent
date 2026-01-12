import React, { useRef, useEffect, useState } from 'react';

interface SuggestionRowProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
}

export const SuggestionRow: React.FC<SuggestionRowProps> = ({ suggestions, onSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showRightFade, setShowRightFade] = useState(true);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        handleScroll();
    }, []);

    return (
        <div className="relative group mt-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Suggested Next Steps</span>
            </div>

            <div className="relative">
                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelect(suggestion)}
                            className="flex-shrink-0 snap-start bg-card hover:bg-accent/50 border border-border hover:border-gray-300 text-muted-foreground hover:text-foreground px-4 py-2 rounded-full text-sm transition-all duration-200 whitespace-nowrap group-hover:shadow-sm"
                        >
                            <span className="flex items-center gap-2">
                                {suggestion.split(/([@/#][\w-]+)/g).map((part, i) => {
                                    if (part.startsWith('@') || part.startsWith('/') || part.startsWith('#')) {
                                        return <span key={i} className="text-gray-400 font-medium">{part}</span>;
                                    }
                                    return <span key={i}>{part}</span>;
                                })}
                            </span>
                        </button>
                    ))}
                    {/* Spacer for right padding */}
                    <div className="w-4 flex-shrink-0" />
                </div>

                {/* Right Fade */}
                <div
                    className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--background)] to-transparent z-10 transition-opacity duration-300 pointer-events-none ${showRightFade ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>
        </div>
    );
};
