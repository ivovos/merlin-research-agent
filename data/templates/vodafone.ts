import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const vodafoneTemplates: TemplateConfig[] = [
  {
    key: 'vodafone-broadband',
    label: 'Broadband Experience Tracker',
    icon: 'Wifi',
    questions: [
      { text: 'How would you rate your current home broadband speed and reliability?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poor', maxLabel: 'Excellent' } },
      { text: 'Which broadband issues have you experienced in the last month?', type: 'multi_select' as QuestionType, options: ['Slow speeds', 'Dropouts & disconnections', 'Poor Wi-Fi coverage', 'Router problems', 'Billing issues', 'None'] },
      { text: 'How easy was it to set up your broadband service?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very difficult', maxLabel: 'Very easy' } },
      { text: 'How likely are you to recommend your broadband provider to friends or family?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
      { text: 'What single improvement would make the biggest difference to your home broadband?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'vodafone-network',
    label: 'Network & Coverage Pulse',
    icon: 'Signal',
    questions: [
      { text: 'How would you rate your mobile network coverage in areas you use most?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poor', maxLabel: 'Excellent' } },
      { text: 'Which connectivity situations frustrate you most?', type: 'ranking' as QuestionType, options: ['Indoor coverage at home', 'Coverage during commute', 'Coverage in rural areas', 'Coverage in busy public venues', 'International roaming'] },
      { text: 'How important is 5G availability when choosing a mobile provider?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Extremely important' } },
      { text: 'What would make you consider switching your mobile network provider?', type: 'multi_select' as QuestionType, options: ['Better coverage', 'Lower price', 'Faster speeds', 'Better customer service', 'Bundled deals', 'Better handset offers', 'Nothing'] },
    ],
  },
  {
    key: 'vodafone-service',
    label: 'Customer Service Evaluation',
    icon: 'Headphones',
    questions: [
      { text: 'When did you last contact customer service?', type: 'single_select' as QuestionType, options: ['This week', 'This month', 'In the last 3 months', 'More than 3 months ago', 'Never'] },
      { text: 'Which channel did you use?', type: 'single_select' as QuestionType, options: ['Phone', 'Live chat', 'App', 'In-store', 'Social media', 'Community forum'] },
      { text: 'How satisfied were you with the resolution?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' } },
      { text: 'Was your issue resolved on first contact?', type: 'single_select' as QuestionType, options: ['Yes, completely', 'Partially', 'No', 'Still unresolved'] },
      { text: 'What could we do to improve our customer support?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'vodafone-bundle',
    label: 'Bundle & Value Assessment',
    icon: 'Package',
    questions: [
      { text: 'Which Vodafone services do you currently use?', type: 'multi_select' as QuestionType, options: ['Mobile', 'Home broadband', 'TV', 'Home phone', 'Business', 'None'] },
      { text: 'How would you rate the overall value for money of your current plan?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poor value', maxLabel: 'Excellent value' } },
      { text: 'Which additional benefit would be most appealing in your plan?', type: 'single_select' as QuestionType, options: ['More data', 'Faster broadband', 'Streaming subscription included', 'International calls', 'Device insurance', 'Smart home devices'] },
      { text: 'How likely are you to consolidate more services with one provider for a better deal?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unlikely', maxLabel: 'Very likely' } },
    ],
  },
]
