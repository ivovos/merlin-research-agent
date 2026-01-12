import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const surveyTool: Tool = {
  name: 'run_survey',
  description: 'Execute a quantitative survey to measure opinions, preferences, or behaviors at scale. Use when the user wants to MEASURE something - percentages, rankings, preferences, or quantify attitudes.',
  input_schema: {
    type: 'object',
    properties: {
      audience: {
        type: 'string',
        description: 'Target audience for the survey (e.g., "Gen Z", "UK Adults 25-45", "Tech Professionals")'
      },
      research_question: {
        type: 'string',
        description: 'Main research question to answer'
      },
      sample_size: {
        type: 'number',
        description: 'Number of respondents (default: 500)'
      },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['question', 'options']
        },
        description: 'Survey questions to ask (3-5 questions recommended)'
      }
    },
    required: ['audience', 'research_question']
  }
}

export interface SurveyToolInput {
  audience: string
  research_question: string
  sample_size?: number
  questions?: Array<{
    question: string
    options: string[]
  }>
}
