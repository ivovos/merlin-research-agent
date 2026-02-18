import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const philipsTemplates: TemplateConfig[] = [
  {
    key: 'philips-health-wellness',
    label: 'Personal Health & Wellness Tracker',
    icon: 'HeartPulse',
    questions: [
      { text: 'Which health and wellness products do you currently use?', type: 'multi_select' as QuestionType, options: ['Electric toothbrush', 'Air purifier', 'Sleep tracker or device', 'Grooming products', 'Mother & child care', 'Kitchen appliances', 'None'] },
      { text: 'How satisfied are you with your current health technology products?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' } },
      { text: 'How important is it that your health devices connect to a smartphone app?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Essential' } },
      { text: 'How willing are you to pay a premium for clinically proven health technology?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not willing', maxLabel: 'Very willing' } },
      { text: 'What health or wellness need is currently not well served by technology?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'philips-oral-care',
    label: 'Oral Care Concept Test',
    icon: 'Smile',
    questions: [
      { text: 'How would you rate the effectiveness of your current toothbrush?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poor', maxLabel: 'Excellent' } },
      { text: 'Which features matter most in an electric toothbrush?', type: 'ranking' as QuestionType, options: ['Cleaning performance', 'Pressure sensor', 'Timer', 'Replacement head cost', 'Battery life', 'App connectivity', 'Design & colour'] },
      { text: 'How much would you expect to pay for a premium electric toothbrush?', type: 'single_select' as QuestionType, options: ['Under £50', '£50–£100', '£100–£150', '£150–£200', 'Over £200'] },
      { text: 'How likely are you to switch to a new electric toothbrush brand if it offered superior cleaning results?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unlikely', maxLabel: 'Very likely' } },
    ],
  },
  {
    key: 'philips-air-quality',
    label: 'Smart Home & Air Quality',
    icon: 'Wind',
    questions: [
      { text: 'How concerned are you about indoor air quality in your home?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not concerned', maxLabel: 'Very concerned' } },
      { text: 'Do you currently own an air purifier?', type: 'single_select' as QuestionType, options: ['Yes', 'No but considering one', 'No and not interested'] },
      { text: 'Which factors would most influence your purchase of an air purifier?', type: 'ranking' as QuestionType, options: ['Price', 'Filtration effectiveness', 'Noise level', 'Smart features', 'Energy consumption', 'Design & aesthetics', 'Brand reputation'] },
      { text: 'How important is real-time air quality monitoring and alerts?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Very important' } },
      { text: 'What is your biggest concern about air quality at home?', type: 'open_text' as QuestionType },
    ],
  },
]
