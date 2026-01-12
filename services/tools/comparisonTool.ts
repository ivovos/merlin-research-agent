import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const comparisonTool: Tool = {
  name: 'run_comparison',
  description: 'Compare opinions, behaviors, or attitudes between different audience segments side-by-side. Use when the user wants to COMPARE groups - Gen Z vs Millennials, users vs non-users, regions, etc.',
  input_schema: {
    type: 'object',
    properties: {
      research_question: {
        type: 'string',
        description: 'What to compare between the segments'
      },
      segments: {
        type: 'array',
        items: { type: 'string' },
        description: 'Two or more audience segments to compare (e.g., ["Gen Z", "Millennials"])'
      },
      comparison_metrics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Metrics or questions to compare across segments'
      }
    },
    required: ['research_question', 'segments']
  }
}

export interface ComparisonToolInput {
  research_question: string
  segments: string[]
  comparison_metrics?: string[]
}
