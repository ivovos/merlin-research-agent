import React, { useCallback } from 'react'
import {
  ChevronUp,
  Circle,
  List,
  BarChart3,
  Type,
  SlidersHorizontal,
  GripVertical,
  Trash2,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SurveyQuestion, QuestionType } from '@/types'
import type { BuilderQuestionType } from '@/types'

// ── 6 builder question types ──

interface TypeChipDef {
  key: BuilderQuestionType
  label: string
  icon: React.ElementType
  surveyType: QuestionType
}

const TYPE_CHIPS: TypeChipDef[] = [
  { key: 'single_choice', label: 'Single Choice', icon: Circle, surveyType: 'single_select' },
  { key: 'multiple_choice', label: 'Multiple Choice', icon: List, surveyType: 'multi_select' },
  { key: 'ranking', label: 'Ranking', icon: BarChart3, surveyType: 'ranking' },
  { key: 'open_text', label: 'Open Text', icon: Type, surveyType: 'open_text' },
  { key: 'nps', label: 'NPS', icon: SlidersHorizontal, surveyType: 'nps' },
  { key: 'scale', label: 'Scale', icon: SlidersHorizontal, surveyType: 'scale' },
]

// Map existing QuestionType → builder key for initial display
function toBuilderType(qt: QuestionType): BuilderQuestionType {
  switch (qt) {
    case 'single_select': return 'single_choice'
    case 'multi_select': return 'multiple_choice'
    case 'ranking': return 'ranking'
    case 'open_text': return 'open_text'
    case 'nps': return 'nps'
    case 'scale': return 'scale'
    default: return 'single_choice'
  }
}

function isChoiceType(bt: BuilderQuestionType): boolean {
  return ['single_choice', 'multiple_choice', 'ranking'].includes(bt)
}

interface QuestionEditorProps {
  question: SurveyQuestion
  index: number
  onUpdate: (updates: Partial<SurveyQuestion>) => void
  onClose: () => void
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  onClose,
}) => {
  const currentBuilderType = toBuilderType(question.type)

  // ── Type switching ──
  const handleTypeChange = useCallback(
    (chip: TypeChipDef) => {
      const updates: Partial<SurveyQuestion> = { type: chip.surveyType }

      if (isChoiceType(chip.key)) {
        // Keep existing options if switching between choice types, otherwise set defaults
        if (!isChoiceType(currentBuilderType) || !question.options?.length) {
          updates.options = ['Option 1', 'Option 2', 'Option 3']
        }
        updates.scale = undefined
      } else if (chip.key === 'scale') {
        updates.scale = { min: 1, max: 5, minLabel: '', maxLabel: '' }
        updates.options = undefined
      } else if (chip.key === 'nps') {
        updates.scale = { min: 0, max: 10 }
        updates.options = undefined
      } else {
        // open_text
        updates.options = undefined
        updates.scale = undefined
      }

      onUpdate(updates)
    },
    [currentBuilderType, question.options, onUpdate],
  )

  // ── Option management ──
  const handleOptionChange = useCallback(
    (idx: number, value: string) => {
      const opts = [...(question.options ?? [])]
      opts[idx] = value
      onUpdate({ options: opts })
    },
    [question.options, onUpdate],
  )

  const handleAddOption = useCallback(() => {
    const opts = [...(question.options ?? [])]
    opts.push(`Option ${opts.length + 1}`)
    onUpdate({ options: opts })
  }, [question.options, onUpdate])

  const handleRemoveOption = useCallback(
    (idx: number) => {
      const opts = (question.options ?? []).filter((_, i) => i !== idx)
      onUpdate({ options: opts })
    },
    [question.options, onUpdate],
  )

  // ── Scale labels ──
  const handleScaleLabel = useCallback(
    (field: 'minLabel' | 'maxLabel', value: string) => {
      onUpdate({
        scale: { ...question.scale!, [field]: value },
      })
    },
    [question.scale, onUpdate],
  )

  return (
    <div>
      {/* Editor card with grey border */}
      <div className="border border-zinc-300 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 bg-zinc-50/50">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-semibold shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-medium flex-1">Question {index + 1}</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-200 text-muted-foreground transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Type chips */}
          <div className="flex flex-wrap gap-2">
            {TYPE_CHIPS.map((chip) => {
              const active = currentBuilderType === chip.key
              const Icon = chip.icon
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => handleTypeChange(chip)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {chip.label}
                </button>
              )
            })}
          </div>

          {/* Question text */}
          <Input
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Enter your question..."
            className="text-sm"
          />

          {/* Type-specific config */}
          {isChoiceType(currentBuilderType) && (
            <div className="space-y-2">
              {(question.options ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  <Input
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="text-sm flex-1"
                  />
                  {(question.options?.length ?? 0) > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1 rounded hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {currentBuilderType === 'scale' && (
            <div className="space-y-3">
              {/* Scale dots preview */}
              <div className="flex items-center justify-center gap-2 py-2">
                {Array.from({ length: (question.scale?.max ?? 5) - (question.scale?.min ?? 1) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-zinc-300 flex items-center justify-center text-xs text-muted-foreground"
                  >
                    {(question.scale?.min ?? 1) + i}
                  </div>
                ))}
              </div>
              {/* Min / max labels */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Min label</label>
                  <Input
                    value={question.scale?.minLabel ?? ''}
                    onChange={(e) => handleScaleLabel('minLabel', e.target.value)}
                    placeholder="e.g. Not at all"
                    className="text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Max label</label>
                  <Input
                    value={question.scale?.maxLabel ?? ''}
                    onChange={(e) => handleScaleLabel('maxLabel', e.target.value)}
                    placeholder="e.g. Extremely"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {currentBuilderType === 'nps' && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 11 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 h-8 rounded flex items-center justify-center text-xs font-medium',
                      i <= 6
                        ? 'bg-red-100 text-red-700'
                        : i <= 8
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700',
                    )}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>Detractors (0-6)</span>
                <span>Passives (7-8)</span>
                <span>Promoters (9-10)</span>
              </div>
            </div>
          )}

          {currentBuilderType === 'open_text' && (
            <div className="rounded-md bg-zinc-50 border border-zinc-200 p-3 text-xs text-muted-foreground">
              Respondents will see a free-text input field to type their answer.
            </div>
          )}

          {/* Done button */}
          <div className="flex justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* Add option button — outside the editor card border */}
      {isChoiceType(currentBuilderType) && (
        <button
          type="button"
          onClick={handleAddOption}
          className="flex items-center gap-1.5 mt-2 ml-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add option
        </button>
      )}
    </div>
  )
}
