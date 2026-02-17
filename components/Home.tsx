import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { ProjectState } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import {
  PICKER_METHODS,
  MethodsPicker,
  resolveMethodIcon,
  type PickerMethod,
} from '@/components/chat/MethodsPicker'
import { Badge } from '@/components/ui/badge'
import { ChatInputBar } from '@/components/chat/ChatInputBar'
import { Search, FileQuestion, Users, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HomeProps {
  projects: ProjectState[]
  onSelectProject: (id: string) => void
  onCreateProject: (text: string) => void
  onSelectMethod: (method: PickerMethod) => void
  /** Current brand name — used to filter audiences in the picker */
  brand?: string
}

// ── Curated pill data ──

interface HomePill {
  methodId: string
  isNew?: boolean
}

const CURATED_PILLS: HomePill[] = [
  { methodId: 'quick-poll' },
  { methodId: 'survey' },
  { methodId: 'message-test' },
  { methodId: 'focus-group' },
  { methodId: 'creative-testing' },
  { methodId: 'concept-testing' },
  { methodId: 'packaging-test', isNew: true },
  { methodId: 'nps-csat', isNew: true },
]

// ── Helpers ──

function getTypeLabel(type: string | undefined): string {
  if (!type) return 'Research'
  return SURVEY_TYPE_CONFIGS.find(c => c.key === type)?.label ?? type
}

function getTotalQuestions(p: ProjectState): number {
  return p.studies.reduce((sum, s) => sum + s.questions.length, 0)
}

function getTotalFindings(p: ProjectState): number {
  return p.studies.reduce((sum, s) => sum + (s.findings?.length ?? 0), 0)
}

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
    <div className="flex-1 overflow-y-auto">
      {/* Hero section — vertically centered */}
      <div className="flex flex-col items-center justify-center px-6 min-h-[70vh]">
        <h1 className="text-3xl font-display font-bold tracking-tight text-center">
          What do you want to find out?
        </h1>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Ask a question or pick a method below
        </p>

        {/* Input bar — no method button (don't pass onSelectMethod) */}
        <div className="w-full max-w-2xl mt-8">
          <ChatInputBar
            onSend={onCreateProject}
            onAddAudience={() => {} /* picker handles display */}
            onAttach={() => {}}
            placeholder="e.g. Why are enterprise users churning in the first 30 days?"
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
                      className="text-[9px] px-1.5 py-0 h-4 font-semibold tracking-wide"
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

      {/* Studies list — pushed down so ~2.5 rows visible on first fold */}
      <div className="px-6 pt-16 pb-8 max-w-2xl mx-auto">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Studies
          </h2>
          <span className="text-xs text-muted-foreground">
            {projects.length} {projects.length === 1 ? 'study' : 'studies'}
          </span>
        </div>

        <div className="divide-y divide-border border-t border-b">
          {projects.map(project => (
            <StudyRow
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project.id)}
            />
          ))}
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

// ── Study row for home list ──

function StudyRow({
  project,
  onClick,
}: {
  project: ProjectState
  onClick: () => void
}) {
  const totalQuestions = getTotalQuestions(project)
  const totalFindings = getTotalFindings(project)
  const studyCount = project.studies.length

  return (
    <button
      type="button"
      className="w-full text-left flex items-center gap-4 py-3 px-2 hover:bg-muted/50 transition-colors group"
      onClick={onClick}
    >
      {/* Name + brand + type */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {project.name}
          </span>
          {project.surveyType && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
              {getTypeLabel(project.surveyType)}
            </Badge>
          )}
        </div>
        {project.brand && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {project.brand}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        {studyCount > 0 && (
          <span>{studyCount} {studyCount === 1 ? 'study' : 'studies'}</span>
        )}
        {totalQuestions > 0 && (
          <span className="flex items-center gap-1">
            <FileQuestion className="w-3 h-3" />
            {totalQuestions}
          </span>
        )}
        {totalFindings > 0 && (
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {totalFindings}
          </span>
        )}
        {project.audiences.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {project.audiences.length}
          </span>
        )}
      </div>
    </button>
  )
}
