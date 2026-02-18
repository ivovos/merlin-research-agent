import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const canvaTemplates: TemplateConfig[] = [
  {
    key: 'canva-workflow',
    label: 'Design Workflow Assessment',
    icon: 'Palette',
    questions: [
      { text: 'How often do you use Canva for work-related design tasks?', type: 'single_select' as QuestionType, options: ['Daily', 'Several times a week', 'Weekly', 'A few times a month', 'Rarely'] },
      { text: 'Which types of content do you create most frequently?', type: 'multi_select' as QuestionType, options: ['Social media posts', 'Presentations', 'Marketing materials', 'Videos', 'Logos & branding', 'Print materials', 'Infographics', 'Whiteboards'] },
      { text: 'How satisfied are you with Canva\'s template library for your needs?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' } },
      { text: 'Which feature saves you the most time?', type: 'ranking' as QuestionType, options: ['Templates', 'Brand kit', 'Magic Resize', 'Background Remover', 'Content Planner', 'Team collaboration', 'AI tools'] },
      { text: 'What design task do you still find difficult to accomplish in Canva?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'canva-ai',
    label: 'AI Features & Innovation Pulse',
    icon: 'Wand2',
    questions: [
      { text: 'How often do you use Canva\'s AI-powered features (Magic Write, Magic Edit, etc.)?', type: 'single_select' as QuestionType, options: ['Every session', 'Most sessions', 'Sometimes', 'Rarely', 'Never or unaware'] },
      { text: 'How would you rate the quality of AI-generated content in Canva?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poor', maxLabel: 'Excellent' } },
      { text: 'Which AI capability would be most valuable to you?', type: 'single_select' as QuestionType, options: ['AI image generation', 'AI copy writing', 'Auto-layout suggestions', 'Brand voice consistency', 'Video editing AI', 'Translation'] },
      { text: 'How comfortable are you using AI tools for professional design work?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very uncomfortable', maxLabel: 'Very comfortable' } },
    ],
  },
  {
    key: 'canva-collaboration',
    label: 'Team Collaboration & Brand Consistency',
    icon: 'Users',
    questions: [
      { text: 'How many people on your team regularly use Canva?', type: 'single_select' as QuestionType, options: ['Just me', '2–5', '6–15', '16–50', '50+'] },
      { text: 'How well does Canva help your team maintain brand consistency?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poorly', maxLabel: 'Very well' } },
      { text: 'Which collaboration feature is most important to your workflow?', type: 'ranking' as QuestionType, options: ['Real-time editing', 'Comments & feedback', 'Brand kit & templates', 'Approval workflows', 'Content calendar', 'Shared folders'] },
      { text: 'How easy is it to onboard new team members to Canva?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very difficult', maxLabel: 'Very easy' } },
      { text: 'What would most improve team design workflows in Canva?', type: 'open_text' as QuestionType },
    ],
  },
]
