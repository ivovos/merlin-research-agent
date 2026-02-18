import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const commonTemplates: TemplateConfig[] = [
  {
    key: 'generic-concept',
    label: 'Standard Concept Test',
    icon: 'ClipboardList',
    questions: [
      { text: 'How appealing is this concept to you?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Extremely' } },
      { text: 'How unique or different does this feel?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not unique', maxLabel: 'Very unique' } },
      { text: 'How relevant is this to your needs?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not relevant', maxLabel: 'Very relevant' } },
      { text: 'How likely are you to purchase?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not likely', maxLabel: 'Extremely likely' } },
      { text: 'Does this feel like good value?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Poor value', maxLabel: 'Great value' } },
    ],
  },
  {
    key: 'generic-brand',
    label: 'Quick Brand Pulse',
    icon: 'Heart',
    questions: [
      { text: 'How familiar are you with this brand?', type: 'single_select' as QuestionType, options: ['Very familiar', 'Somewhat familiar', 'Heard of it', 'Never heard of it'] },
      { text: 'How would you rate your overall impression?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very negative', maxLabel: 'Very positive' } },
      { text: 'How likely are you to recommend this brand?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
    ],
  },
  {
    key: 'generic-message-review',
    label: 'Message Review',
    icon: 'MessageSquareText',
    questions: [
      { text: 'How clear is the main message?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unclear', maxLabel: 'Very clear' } },
      { text: 'How appealing is this message to you?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Very appealing' } },
      { text: 'How relevant is this message to your needs?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not relevant', maxLabel: 'Highly relevant' } },
      { text: 'What emotions does this message evoke?', type: 'multi_select' as QuestionType, options: ['Excited', 'Curious', 'Reassured', 'Indifferent', 'Confused', 'Sceptical', 'Inspired'] },
      { text: 'In your own words, what is the main takeaway?', type: 'open_text' as QuestionType },
    ],
  },
]
