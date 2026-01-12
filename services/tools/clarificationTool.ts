import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const clarificationTool: Tool = {
  name: 'ask_clarification',
  description: 'Ask the user for more information when the prompt is too vague, missing key details like audience, or unclear about what type of research is needed. Use this BEFORE running any research if critical information is missing.',
  input_schema: {
    type: 'object',
    properties: {
      missing_info: {
        type: 'string',
        description: 'What information is needed from the user'
      },
      reason: {
        type: 'string',
        description: 'Brief explanation of why this information is needed'
      },
      suggestions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Suggested ways to clarify or example queries (2-4 options)'
      }
    },
    required: ['missing_info', 'suggestions']
  }
}

export interface ClarificationToolInput {
  missing_info: string
  reason?: string
  suggestions: string[]
}
