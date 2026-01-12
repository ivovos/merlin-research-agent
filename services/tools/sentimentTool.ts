import type { Tool } from '@anthropic-ai/sdk/resources/messages'

export const sentimentTool: Tool = {
  name: 'run_sentiment_analysis',
  description: 'Analyze sentiment breakdown across topics, brands, or categories. Use when the user wants to understand SENTIMENT - brand perception, emotional response, positive vs negative feelings about specific topics.',
  input_schema: {
    type: 'object',
    properties: {
      audience: {
        type: 'string',
        description: 'Target audience for sentiment analysis'
      },
      research_question: {
        type: 'string',
        description: 'What sentiment to analyze'
      },
      topics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Topics or brands to analyze sentiment for'
      },
      sentiment_dimensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dimensions to measure (e.g., "trust", "excitement", "value")'
      }
    },
    required: ['audience', 'research_question', 'topics']
  }
}

export interface SentimentToolInput {
  audience: string
  research_question: string
  topics: string[]
  sentiment_dimensions?: string[]
}
