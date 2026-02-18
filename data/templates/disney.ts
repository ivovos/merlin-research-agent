import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const disneyTemplates: TemplateConfig[] = [
  {
    key: 'disney-family-viewing',
    label: 'Family Viewing Habits',
    icon: 'Users',
    questions: [
      { text: 'How many members of your household regularly use Disney+?', type: 'single_select' as QuestionType, options: ['1', '2', '3', '4', '5+'] },
      { text: 'Which content types does your household watch most?', type: 'ranking' as QuestionType, options: ['Animated films', 'Live-action films', 'TV series', 'Documentaries (Nat Geo)', 'Marvel content', 'Star Wars content'] },
      { text: 'How often does your household watch Disney+ together as a group?', type: 'single_select' as QuestionType, options: ['Daily', 'A few times a week', 'Weekly', 'A few times a month', 'Rarely'] },
      { text: 'How well does Disney+ cater to different age groups in your family?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poorly', maxLabel: 'Very well' } },
      { text: 'What type of content would you like to see more of on Disney+?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'disney-franchise-pulse',
    label: 'Content & Franchise Pulse',
    icon: 'Sparkles',
    questions: [
      { text: 'Which Disney+ franchise are you most excited about?', type: 'single_select' as QuestionType, options: ['Marvel', 'Star Wars', 'Pixar', 'Disney Animation', 'National Geographic', 'Disney Live-Action', 'Other'] },
      { text: 'How satisfied are you with the frequency of new original content on Disney+?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' } },
      { text: 'How important are exclusive premieres and day-one theatrical releases on Disney+?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Essential' } },
      { text: 'How likely are you to recommend Disney+ to other families?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
    ],
  },
  {
    key: 'disney-platform-comparison',
    label: 'Streaming Platform Comparison',
    icon: 'MonitorPlay',
    questions: [
      { text: 'Which streaming services does your household currently subscribe to?', type: 'multi_select' as QuestionType, options: ['Disney+', 'Netflix', 'Amazon Prime Video', 'Apple TV+', 'Paramount+', 'HBO Max', 'Other'] },
      { text: 'If you had to keep only two streaming services, which would they be?', type: 'multi_select' as QuestionType, options: ['Disney+', 'Netflix', 'Amazon Prime Video', 'Apple TV+', 'Paramount+', 'HBO Max'] },
      { text: 'What is the primary reason you subscribe to Disney+?', type: 'single_select' as QuestionType, options: ['Kids content', 'Marvel & Star Wars', 'Price', 'Exclusive originals', 'National Geographic', 'Nostalgia & classic library'] },
      { text: 'How does Disney+ compare to your other subscriptions for value?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Much worse', maxLabel: 'Much better' } },
      { text: 'What would make you upgrade to a higher Disney+ tier?', type: 'open_text' as QuestionType },
    ],
  },
]
