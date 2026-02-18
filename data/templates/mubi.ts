import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const mubiTemplates: TemplateConfig[] = [
  {
    key: 'mubi-content-discovery',
    label: 'Content Discovery Pulse',
    icon: 'Film',
    questions: [
      { text: 'How do you typically discover new films to watch?', type: 'multi_select' as QuestionType, options: ['Recommendations from friends', 'Social media', 'Film festivals & awards', 'Curated lists', 'Trailers', 'Film critics & reviews', 'Algorithm suggestions'] },
      { text: 'How important is editorial curation vs. algorithmic recommendations when choosing what to watch?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Essential' } },
      { text: 'Which genres are you most interested in exploring?', type: 'multi_select' as QuestionType, options: ['World cinema', 'Classic films', 'Documentary', 'Art-house drama', 'Thriller & noir', 'Animation', 'Experimental'] },
      { text: 'How often do you watch a film outside your usual comfort zone?', type: 'single_select' as QuestionType, options: ['Weekly', 'Monthly', 'A few times a year', 'Rarely', 'Never'] },
      { text: 'What would make you more likely to try a film you\'ve never heard of?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'mubi-subscriber-satisfaction',
    label: 'Subscriber Satisfaction Tracker',
    icon: 'Star',
    questions: [
      { text: 'How satisfied are you with your MUBI subscription overall?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' } },
      { text: 'Which aspects of MUBI do you value most?', type: 'ranking' as QuestionType, options: ['Film curation quality', 'New releases each week', 'Exclusive & original content', 'Notebook editorial content', 'MUBI Go cinema credits', 'Community & reviews'] },
      { text: 'How likely are you to recommend MUBI to a fellow film enthusiast?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
      { text: 'What is the main reason you chose MUBI over other streaming services?', type: 'single_select' as QuestionType, options: ['Curated selection', 'Art-house focus', 'Quality over quantity', 'MUBI Go', 'Price', 'Exclusive premieres'] },
      { text: 'What one thing would most improve your MUBI experience?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'mubi-cinema-habits',
    label: 'Cinema-Going Habits',
    icon: 'Clapperboard',
    questions: [
      { text: 'How often do you visit the cinema?', type: 'single_select' as QuestionType, options: ['Weekly', '2–3 times per month', 'Once a month', 'A few times a year', 'Rarely or never'] },
      { text: 'What motivates you to see a film in the cinema rather than at home?', type: 'multi_select' as QuestionType, options: ['Big screen experience', 'Social outing', 'New release excitement', 'Film festival screenings', 'MUBI Go credit', 'No distractions'] },
      { text: 'How important is it that your streaming service connects to the cinema experience?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Very important' } },
      { text: 'Would you attend more MUBI-curated cinema events if available in your area?', type: 'single_select' as QuestionType, options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'] },
    ],
  },
]
