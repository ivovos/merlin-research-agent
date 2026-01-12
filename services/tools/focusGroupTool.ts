import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const focusGroupTool: Tool = {
  name: 'run_focus_group',
  description: 'Conduct qualitative focus groups to understand motivations, feelings, and deeper insights. Use when the user wants to UNDERSTAND something - the "why" behind behaviors, explore feelings, or get rich narrative insights.',
  input_schema: {
    type: 'object',
    properties: {
      audience: {
        type: 'string',
        description: 'Target audience for the focus groups (e.g., "Millennial Parents", "Early Adopters")'
      },
      research_question: {
        type: 'string',
        description: 'Main research question to explore'
      },
      participant_count: {
        type: 'number',
        description: 'Number of participants across sessions (default: 12)'
      },
      discussion_topics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Key topics to explore in discussion (3-5 topics recommended)'
      }
    },
    required: ['audience', 'research_question']
  }
}

export interface FocusGroupToolInput {
  audience: string
  research_question: string
  participant_count?: number
  discussion_topics?: string[]
}
