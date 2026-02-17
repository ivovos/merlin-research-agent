import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const wonderhoodTemplates: TemplateConfig[] = [
  {
    key: 'wonderhood-brief',
    label: 'Creative Brief Evaluation',
    icon: 'FileText',
    questions: [
      { text: 'How clear was the creative brief for this project?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unclear', maxLabel: 'Very clear' } },
      { text: 'Which elements of the brief were most useful?', type: 'multi_select' as QuestionType, options: ['Target audience definition', 'Brand guidelines', 'Competitive context', 'Key message hierarchy', 'Tone of voice', 'Success metrics', 'Budget & timeline'] },
      { text: 'How well did the brief align with the client\'s business objectives?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poorly', maxLabel: 'Very well' } },
      { text: 'Were there any gaps in the brief that required follow-up?', type: 'single_select' as QuestionType, options: ['No gaps', 'Minor gaps', 'Significant gaps', 'Brief was incomplete'] },
      { text: 'What one thing would have made this brief more actionable?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'wonderhood-campaign',
    label: 'Campaign Effectiveness Tracker',
    icon: 'BarChart3',
    questions: [
      { text: 'How memorable was this campaign compared to competitor advertising?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Highly memorable' } },
      { text: 'How clearly did the campaign communicate the intended message?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unclear', maxLabel: 'Very clear' } },
      { text: 'Which elements stood out most?', type: 'multi_select' as QuestionType, options: ['Visual design', 'Headline & copy', 'Colour palette', 'Photography & imagery', 'Brand integration', 'Call to action', 'Celebrity & talent', 'Music & sound'] },
      { text: 'How likely are you to take action after seeing this campaign?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unlikely', maxLabel: 'Very likely' } },
      { text: 'What was your overall emotional response to this campaign?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'wonderhood-client-sat',
    label: 'Client Satisfaction Survey',
    icon: 'Handshake',
    questions: [
      { text: 'How satisfied are you with the creative output delivered?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' } },
      { text: 'How well did the agency understand your brand and objectives?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poorly', maxLabel: 'Very well' } },
      { text: 'How would you rate the agency\'s responsiveness and communication?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poor', maxLabel: 'Excellent' } },
      { text: 'How likely are you to recommend Wonderhood Studios to another brand?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
    ],
  },
]
