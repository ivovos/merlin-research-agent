import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const kingTemplates: TemplateConfig[] = [
  {
    key: 'king-engagement',
    label: 'Player Engagement & Motivation',
    icon: 'Gamepad2',
    questions: [
      { text: 'How often do you play mobile games?', type: 'single_select' as QuestionType, options: ['Multiple times daily', 'Daily', 'A few times a week', 'Weekly', 'Less than weekly'] },
      { text: 'What motivates you most to keep playing?', type: 'ranking' as QuestionType, options: ['Beating levels', 'Competing with friends', 'Daily rewards', 'New content & events', 'Relaxation & stress relief', 'Completing collections'] },
      { text: 'How satisfied are you with the current in-game events and challenges?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' } },
      { text: 'How do you feel about the current difficulty progression?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Too easy', maxLabel: 'Too difficult' } },
      { text: 'What type of new game feature would excite you most?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'king-monetisation',
    label: 'Monetisation & Value Perception',
    icon: 'Gem',
    questions: [
      { text: 'Have you made an in-app purchase in the last 30 days?', type: 'single_select' as QuestionType, options: ['Yes — multiple times', 'Yes — once', 'No', 'I never make in-app purchases'] },
      { text: 'How do you feel about the value of in-app purchases?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poor value', maxLabel: 'Excellent value' } },
      { text: 'Which type of offer would you be most likely to purchase?', type: 'single_select' as QuestionType, options: ['Extra lives bundle', 'Booster pack', 'Ad-free period', 'Exclusive cosmetics', 'Season pass', 'None'] },
      { text: 'What price point feels fair for a premium booster pack?', type: 'single_select' as QuestionType, options: ['Under £1', '£1–£3', '£3–£5', '£5–£10', 'Would not purchase'] },
    ],
  },
  {
    key: 'king-social',
    label: 'Social & Competitive Features',
    icon: 'Trophy',
    questions: [
      { text: 'Do you play with or compete against friends in mobile games?', type: 'single_select' as QuestionType, options: ['Yes — regularly', 'Yes — occasionally', 'No — but I would like to', 'No — not interested'] },
      { text: 'How important are team events and collaborative challenges?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Very important' } },
      { text: 'Which social features do you use most?', type: 'multi_select' as QuestionType, options: ['Leaderboards', 'Sending & receiving lives', 'Team competitions', 'Sharing progress', 'Chat', 'None'] },
      { text: 'How likely are you to recommend this game to a friend?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
    ],
  },
]
