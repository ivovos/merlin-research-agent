import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { ProjectState } from '@/types'
import {
  PICKER_METHODS,
  MethodsPicker,
  resolveMethodIcon,
  type PickerMethod,
} from '@/components/chat/MethodsPicker'
import { Badge } from '@/components/ui/badge'
import { ChatInputBar } from '@/components/chat/ChatInputBar'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HomeProps {
  projects: ProjectState[]
  onSelectProject: (id: string) => void
  onCreateProject: (text: string) => void
  onSelectMethod: (method: PickerMethod) => void
  /** Current brand name — used to filter audiences in the picker */
  brand?: string
}

// ── Animated placeholder phrases ──

const PLACEHOLDER_PHRASES = [
  'Why are @uk-millennials churning after the first month?',
  '/focus-group What do parents think about our new ad campaign?',
  'How does @premium-subscribers feel about the latest price increase?',
  '/creative-testing Which packaging design resonates most with Gen Z?',
  'What are the top unmet needs for @health-conscious-shoppers?',
  '/survey How satisfied are customers with our onboarding experience?',
  'What would make @lapsed-users come back to the platform?',
  '/concept-testing Does this new product idea have legs with our core audience?',
]

// ── Curated pill data ──

interface HomePill {
  methodId: string
  isNew?: boolean
}

const CURATED_PILLS: HomePill[] = [
  { methodId: 'quick-poll' },
  { methodId: 'survey' },
  { methodId: 'message-test' },
  { methodId: 'focus-group', isNew: true },
  { methodId: 'creative-testing', isNew: true },
  { methodId: 'concept-testing' },
]

// ── Main component ──

export const Home: React.FC<HomeProps> = ({
  projects,
  onSelectProject,
  onCreateProject,
  onSelectMethod,
  brand,
}) => {
  const [methodsOpen, setMethodsOpen] = useState(false)
  const [flashPill, setFlashPill] = useState<string | null>(null)
  const [showFade, setShowFade] = useState({ left: false, right: true })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Resolve curated pills to their full method objects
  const resolvedPills = useMemo(
    () =>
      CURATED_PILLS.map(pill => ({
        ...pill,
        method: PICKER_METHODS.find(m => m.id === pill.methodId)!,
      })).filter(pill => pill.method), // safety: skip any unresolved
    [],
  )

  // Scroll detection for fade overlays
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowFade({
      left: el.scrollLeft > 8,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 8,
    })
  }, [])

  useEffect(() => {
    handleScroll()
    // Re-check on resize
    window.addEventListener('resize', handleScroll)
    return () => window.removeEventListener('resize', handleScroll)
  }, [handleScroll])

  // Pill click handler — flash highlight, then fire callback
  const handlePillClick = useCallback(
    (method: PickerMethod) => {
      setFlashPill(method.id)
      setTimeout(() => setFlashPill(null), 200)
      onSelectMethod(method)
    },
    [onSelectMethod],
  )

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero section — vertically centered */}
      <div className="flex flex-col items-center justify-center px-6 flex-1">
        <h1 className="text-3xl font-display font-bold tracking-tight text-center">
          Ask them anything
        </h1>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Ask a question or pick a method below
        </p>

        {/* Input bar */}
        <div className="w-full max-w-2xl mt-8">
          <ChatInputBar
            onSend={onCreateProject}
            onAddAudience={() => {} /* picker handles display */}
            onAttach={() => {}}
            animatedPlaceholders={PLACEHOLDER_PHRASES}
            variant="home"
            brand={brand}
          />
        </div>

        {/* Pill row */}
        <div className="w-full max-w-2xl mt-3 relative">
          {/* Fade overlays */}
          {showFade.left && (
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          )}
          {showFade.right && (
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* All methods button */}
            <button
              type="button"
              onClick={() => setMethodsOpen(true)}
              className="rounded-full px-3 py-1.5 text-xs font-medium border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted-foreground/30 transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>All methods</span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-border flex-shrink-0 self-center" />

            {/* Curated pills */}
            {resolvedPills.map(pill => {
              const Icon = resolveMethodIcon(pill.method.icon)
              const isActive = flashPill === pill.methodId
              return (
                <button
                  key={pill.methodId}
                  type="button"
                  onClick={() => handlePillClick(pill.method)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium border whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 transition-colors',
                    isActive
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border bg-muted/50 text-foreground hover:bg-muted hover:border-muted-foreground/30',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pill.method.label}</span>
                  {pill.isNew && (
                    <Badge
                      variant="default"
                      className="text-[9px] px-1.5 py-0 h-4 font-semibold tracking-wide bg-[#6366f1] hover:bg-[#6366f1] text-white"
                    >
                      NEW
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* MethodsPicker lightbox — owned by Home */}
      <MethodsPicker
        open={methodsOpen}
        onClose={() => setMethodsOpen(false)}
        onSelect={(method) => {
          onSelectMethod(method)
          setMethodsOpen(false)
        }}
      />
    </div>
  )
}
