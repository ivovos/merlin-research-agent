import React from 'react'
import {
  GripVertical,
  Trash2,
  ChevronDown,
  Circle,
  List,
  Type,
  BarChart3,
  SlidersHorizontal,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SurveyQuestion } from '@/types'

// ── Type meta for badges ──

const BUILDER_TYPE_META: Record<string, { icon: React.ElementType; label: string }> = {
  single_select: { icon: Circle, label: 'Single Choice' },
  single_choice: { icon: Circle, label: 'Single Choice' },
  multi_select: { icon: List, label: 'Multiple Choice' },
  multiple_choice: { icon: List, label: 'Multiple Choice' },
  ranking: { icon: BarChart3, label: 'Ranking' },
  open_text: { icon: Type, label: 'Open Text' },
  nps: { icon: SlidersHorizontal, label: 'NPS' },
  scale: { icon: SlidersHorizontal, label: 'Scale' },
}

function isIncomplete(q: SurveyQuestion): boolean {
  if (!q.text.trim()) return true
  if (['single_select', 'multi_select', 'single_choice', 'multiple_choice', 'ranking'].includes(q.type)) {
    if (!q.options || q.options.length === 0) return true
    if (q.options.filter(o => o.trim()).length < 2) return true
  }
  return false
}

interface QuestionCardProps {
  question: SurveyQuestion
  index: number
  showErrors: boolean
  isExtracted?: boolean
  onExpand: () => void
  onDelete: () => void
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  showErrors,
  isExtracted,
  onExpand,
  onDelete,
}) => {
  const incomplete = isIncomplete(question)
  const typeMeta = BUILDER_TYPE_META[question.type] ?? { icon: Circle, label: question.type }
  const TypeIcon = typeMeta.icon

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    const hasContent =
      question.text.trim().length > 0 ||
      (question.options?.some(
        o => o.trim() && o !== 'Option 1' && o !== 'Option 2' && o !== 'Option 3',
      ) ?? false)
    if (hasContent && !window.confirm('Delete this question? This cannot be undone.')) return
    onDelete()
  }

  return (
    <button
      type="button"
      onClick={onExpand}
      className={cn(
        'group w-full text-left border rounded-lg px-4 py-3 flex items-center gap-3 transition-all hover:bg-accent/30',
        showErrors && incomplete
          ? 'border-red-300 bg-red-50/30'
          : 'border-border',
      )}
    >
      {/* Grip handle */}
      <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />

      {/* Number badge */}
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold shrink-0">
        {index + 1}
      </span>

      {/* Question text */}
      <span className="flex-1 min-w-0 truncate text-sm">
        {question.text.trim() ? (
          question.text
        ) : (
          <span className="text-muted-foreground italic">Untitled question</span>
        )}
      </span>

      {/* Badges */}
      <div className="flex items-center gap-2 shrink-0">
        {/* AI extracted badge */}
        {isExtracted && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border bg-purple-50 text-purple-600 border-purple-200">
            <Sparkles className="w-3 h-3" />
            Extracted
          </span>
        )}

        {/* Type badge */}
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border bg-muted text-muted-foreground">
          <TypeIcon className="w-3 h-3" />
          {typeMeta.label}
        </span>

        {/* Incomplete badge */}
        {incomplete && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border',
              showErrors
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-amber-50 text-amber-600 border-amber-200',
            )}
          >
            <AlertCircle className="w-3 h-3" />
            Incomplete
          </span>
        )}

        {/* Trash */}
        <button
          type="button"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 transition-all text-muted-foreground"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Chevron */}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  )
}
