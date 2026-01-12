import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const surveyTool: Tool = {
  name: 'run_survey',
  description: `Execute a quantitative survey to measure opinions, preferences, or behaviors at scale.
Use when the user wants to MEASURE something - percentages, rankings, preferences, or quantify attitudes.

IMPORTANT: Use the 'segments' parameter when comparing different groups (e.g., "Gen Z vs Millennials", "men vs women", "users vs non-users").
This creates a single survey with side-by-side comparison data for each segment.`,
  input_schema: {
    type: 'object',
    properties: {
      audience: {
        type: 'string',
        description: 'Target audience for the survey. For comparisons, describe the overall population (e.g., "Adults 18-55")'
      },
      research_question: {
        type: 'string',
        description: 'Main research question to answer'
      },
      segments: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional: List of segments to compare side-by-side (e.g., ["Gen Z", "Millennials"] or ["iPhone users", "Android users"]). When provided, each question will show results broken down by segment.'
      },
      sample_size: {
        type: 'number',
        description: 'Number of respondents per segment (default: 500)'
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
  segments?: string[]
  sample_size?: number
  questions?: Array<{
    question: string
    options: string[]
  }>
}
