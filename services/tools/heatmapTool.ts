import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const heatmapTool: Tool = {
  name: 'run_heatmap',
  description: 'Generate a visual heatmap showing attention, engagement, or interest patterns. Use when the user wants to SEE where attention goes, engagement hotspots, or visualize interest distribution across categories or time.',
  input_schema: {
    type: 'object',
    properties: {
      audience: {
        type: 'string',
        description: 'Target audience for the heatmap analysis'
      },
      research_question: {
        type: 'string',
        description: 'What engagement/attention pattern to analyze'
      },
      heatmap_type: {
        type: 'string',
        enum: ['attention', 'engagement', 'interest', 'time_spent'],
        description: 'Type of heatmap visualization'
      },
      categories: {
        type: 'array',
        items: { type: 'string' },
        description: 'Categories or areas to measure (e.g., product features, content sections)'
      }
    },
    required: ['audience', 'research_question', 'heatmap_type']
  }
}

export interface HeatmapToolInput {
  audience: string
  research_question: string
  heatmap_type: 'attention' | 'engagement' | 'interest' | 'time_spent'
  categories?: string[]
}
