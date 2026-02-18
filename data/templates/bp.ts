import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const bpTemplates: TemplateConfig[] = [
  {
    key: 'bp-fuelling',
    label: 'Fuelling Experience Tracker',
    icon: 'Fuel',
    questions: [
      { text: 'How often do you refuel your vehicle?', type: 'single_select' as QuestionType, options: ['Multiple times a week', 'Weekly', 'Fortnightly', 'Monthly', 'Less often'] },
      { text: 'What is the most important factor when choosing a fuel station?', type: 'ranking' as QuestionType, options: ['Price', 'Location & convenience', 'Fuel quality', 'Loyalty rewards', 'Facilities (shop & food)', 'EV charging availability'] },
      { text: 'How aware are you of the differences between standard and premium fuels?', type: 'single_select' as QuestionType, options: ['Very aware', 'Somewhat aware', 'Not very aware', 'Not at all aware'] },
      { text: 'How likely are you to pay more for a premium fuel that protects your engine?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unlikely', maxLabel: 'Very likely' } },
      { text: 'What would improve your experience at fuel stations?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'bp-ev-transition',
    label: 'EV & Energy Transition Pulse',
    icon: 'Zap',
    questions: [
      { text: 'Which best describes your current vehicle situation?', type: 'single_select' as QuestionType, options: ['Petrol or diesel only', 'Hybrid', 'Fully electric', 'Planning to go electric within 2 years', 'No plans to change'] },
      { text: 'What is your biggest concern about switching to an electric vehicle?', type: 'single_select' as QuestionType, options: ['Range anxiety', 'Charging infrastructure', 'Upfront cost', 'Charging time', 'Battery lifespan', 'Resale value'] },
      { text: 'How important is it that an energy company invests in renewable and sustainable energy?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Essential' } },
      { text: 'How would you rate BP\'s efforts in the energy transition compared to competitors?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Much worse', maxLabel: 'Much better' } },
      { text: 'What would make you choose BP for your EV charging needs?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'bp-brand-perception',
    label: 'Brand Perception & Trust',
    icon: 'Shield',
    questions: [
      { text: 'Which words best describe your perception of BP?', type: 'multi_select' as QuestionType, options: ['Innovative', 'Traditional', 'Trustworthy', 'Greenwashing', 'Reliable', 'Expensive', 'Forward-thinking', 'Outdated', 'Convenient', 'Environmentally responsible'] },
      { text: 'How has your opinion of BP changed in the last 2 years?', type: 'single_select' as QuestionType, options: ['Much more positive', 'Slightly more positive', 'No change', 'Slightly more negative', 'Much more negative'] },
      { text: 'How credible do you find BP\'s commitments to net zero?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not at all credible', maxLabel: 'Very credible' } },
      { text: 'How likely are you to recommend BP to friends or colleagues?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
    ],
  },
]
