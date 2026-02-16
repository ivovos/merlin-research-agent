import React from 'react'
import {
  ClipboardList,
  Heart,
  Smile,
  DollarSign,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { SurveyQuestion, QuestionType } from '@/types'

// ── Template data ──

interface TemplateConfig {
  key: string
  label: string
  icon: React.ElementType
  questions: Omit<SurveyQuestion, 'id' | 'required'>[]
}

const TEMPLATES: TemplateConfig[] = [
  {
    key: 'concept',
    label: 'Standard Concept Test',
    icon: ClipboardList,
    questions: [
      { text: 'How appealing is this concept to you?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Extremely' } },
      { text: 'How unique or different does this feel?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not unique', maxLabel: 'Very unique' } },
      { text: 'How relevant is this to your needs?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not relevant', maxLabel: 'Very relevant' } },
      { text: 'How likely are you to purchase?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not likely', maxLabel: 'Extremely likely' } },
      { text: 'Does this feel like good value?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Poor value', maxLabel: 'Great value' } },
    ],
  },
  {
    key: 'brand',
    label: 'Quick Brand Pulse',
    icon: Heart,
    questions: [
      { text: 'How familiar are you with this brand?', type: 'single_select' as QuestionType, options: ['Very familiar', 'Somewhat familiar', 'Heard of it', 'Never heard of it'] },
      { text: 'How would you rate your overall impression?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very negative', maxLabel: 'Very positive' } },
      { text: 'How likely are you to recommend this brand?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
    ],
  },
  {
    key: 'csat',
    label: 'Customer Satisfaction',
    icon: Smile,
    questions: [
      { text: 'Overall, how satisfied are you?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unsatisfied', maxLabel: 'Very satisfied' } },
      { text: 'What did you like most?', type: 'open_text' as QuestionType },
      { text: 'What could be improved?', type: 'open_text' as QuestionType },
      { text: 'How likely are you to use again?', type: 'single_select' as QuestionType, options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'] },
    ],
  },
  {
    key: 'pricing',
    label: 'Pricing Sensitivity',
    icon: DollarSign,
    questions: [
      { text: 'At what price would this feel like a bargain?', type: 'open_text' as QuestionType },
      { text: 'At what price would you start to question the quality?', type: 'open_text' as QuestionType },
      { text: 'At what price would it feel too expensive?', type: 'open_text' as QuestionType },
      { text: 'How does this compare to what you currently pay?', type: 'single_select' as QuestionType, options: ['Much cheaper', 'Slightly cheaper', 'About the same', 'Slightly more', 'Much more'] },
    ],
  },
]

interface TemplatesPanelProps {
  selectedTemplate: string | null
  onSelectTemplate: (key: string, questions: SurveyQuestion[]) => void
  onResetTemplate: () => void
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onResetTemplate,
}) => {
  const handleSelect = (tpl: TemplateConfig) => {
    const questions: SurveyQuestion[] = tpl.questions.map((q, i) => ({
      id: `q_tpl_${Date.now()}_${i}`,
      required: true,
      ...q,
    }))
    onSelectTemplate(tpl.key, questions)
  }

  // ── Collapsed state ──
  if (selectedTemplate) {
    const tpl = TEMPLATES.find(t => t.key === selectedTemplate)
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-zinc-50 border border-zinc-200">
        {tpl && <tpl.icon className="w-4 h-4 text-muted-foreground shrink-0" />}
        <span className="text-sm text-foreground flex-1">
          Using {tpl?.label ?? selectedTemplate}
        </span>
        <button
          type="button"
          onClick={onResetTemplate}
          className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Change template
        </button>
      </div>
    )
  }

  // ── Grid state ──
  return (
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((tpl) => {
        const Icon = tpl.icon
        return (
          <Card
            key={tpl.key}
            className="cursor-pointer p-4 hover:bg-accent/30 hover:border-foreground/10 transition-all"
            onClick={() => handleSelect(tpl)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{tpl.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tpl.questions.length} questions
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
