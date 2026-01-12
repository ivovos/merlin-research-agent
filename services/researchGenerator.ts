import { anthropic } from './api'
import type { Canvas } from '@/types'

export interface ResearchResult {
  type: 'quantitative' | 'qualitative' | 'update'
  audienceName: string
  audienceId: string
  explanation: string
  processSteps: string[]
  report: {
    type?: 'quantitative' | 'qualitative'
    title: string
    abstract: string
    segments: string[]
    questions: Array<{
      question: string
      options: Array<{
        label: string
        percentage?: number
        [key: string]: string | number | undefined
      }>
    }>
    themes?: Array<{
      id: string
      topic: string
      sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
      summary: string
      quotes: Array<{ text: string; attribution: string }>
    }>
  }
}

const SYSTEM_PROMPT = `You are Merlin, an advanced synthetic research agent.
The user has asked a specific research question.
Your task is to simulate the execution of this specific research project and generate a realistic, easy-to-read report.

**CRITICAL: REPORT TYPE DETERMINATION**
Detect qualitative keywords: "focus group", "qualitative", "qual", "in-depth interview", "ethnography", "exploratory", "why do they", "understand why", etc.

1. **Qualitative (Focus Group/IDIs)**: If query mentions qualitative research methods.
   - Set "type": "qualitative" and "report.type": "qualitative".
   - Generate "themes" array with 3-4 rich themes (NOT questions).
   - Set "questions": [] (empty array for qualitative).

2. **Quantitative (Survey)**: Default for all other queries.
   - Set "type": "quantitative" and "report.type": "quantitative".
   - Generate "questions" array with 3 specific questions.
   - Set "themes": [] (empty array for quantitative).

**QUALITATIVE RESEARCH GUIDELINES:**
When generating qualitative results:
- **Themes**: Generate 3-4 distinct themes that emerged from discussion
- **Topic**: Evocative 2-4 word theme name (e.g., "The Trust Deficit", "Price vs. Purpose")
- **Sentiment**: Match the emotional tone - positive, negative, neutral, or mixed
- **Summary**: One compelling sentence capturing the insight
- **Quotes**: 2-3 realistic, conversational quotes per theme
  - Use natural speech patterns, hesitations, emphasis
  - Attribution format: "Name, Age" (e.g., "Sarah, 34" or "Mike, 28")
  - Make quotes feel authentic - include filler words, interruptions, emotions
- **Process Steps** for qual: "Designing discussion guide", "Recruiting 12 participants", "Moderating sessions", "Transcribing 8 hours", "Coding themes", "Synthesizing insights"

**QUANTITATIVE RESEARCH GUIDELINES:**
When generating quantitative results:
- **Questions**: 3 specific, measurable questions with clear options
- **Options**: 4-6 response options per question with realistic percentages
- **Process Steps** for quant: "Designing survey", "Recruiting 500+ respondents", "Collecting responses", "Cleaning data", "Running analysis", "Generating report"

**DATA REALISM GUIDELINES (STRICT):**
- **AVOID ROUND NUMBERS**: Use specific values like 42.8%, 17.3%, 87.1%
- **REAL WORLD TRENDS**: Leverage your knowledge to approximate actual market statistics
- **AVOID PERFECT SPLITS**: Never generate 50/50. Show clear winners or realistic distributions.

**AUDIENCE SEGMENTATION (Quantitative only):**
- Single audience: 'segments': []
- Comparison: 'segments': ["Group A", "Group B"] with per-segment percentages

Output strictly valid JSON:
{
  "type": "quantitative" | "qualitative",
  "audienceName": "string",
  "audienceId": "string-slug",
  "processSteps": ["step1", "step2", "step3", "step4", "step5", "step6"],
  "explanation": "string - one sentence methodology + key finding",
  "report": {
    "type": "quantitative" | "qualitative",
    "title": "string - catchy, direct",
    "abstract": "string - 1-2 sentence summary of key insight",
    "segments": [],
    "questions": [],
    "themes": []
  }
}`

function getSystemPromptWithContext(currentCanvas: Canvas | null, userQuery: string): string {
  if (!currentCanvas) return SYSTEM_PROMPT

  return `${SYSTEM_PROMPT}

CURRENT CANVAS CONTEXT:
${JSON.stringify(currentCanvas, null, 2)}
The user is asking a follow-up question: "${userQuery}".
DECISION LOGIC:
- DEFAULT to creating a NEW canvas for follow-up questions to maintain history. Set "type": "new".
- ONLY if the user explicitly asks to UPDATE, MODIFY, or CHANGE the existing canvas, then set "type": "update".`
}

function generateQualitativeFallback(query: string): ResearchResult {
  // Clean up query for title
  const cleanQuery = query
    .replace(/#focus-group/gi, '')
    .replace(/\/qual/gi, '')
    .replace(/qualitative/gi, '')
    .replace(/focus group/gi, '')
    .trim()

  return {
    type: 'qualitative',
    audienceName: 'Focus Group Participants',
    audienceId: 'focus-group',
    explanation: 'We conducted 2 focus group sessions with 12 participants, uncovering 4 key themes around motivations, barriers, and underlying attitudes.',
    processSteps: [
      'Designing discussion guide',
      'Recruiting 12 participants',
      'Moderating sessions',
      'Transcribing 6 hours',
      'Coding themes',
      'Synthesizing insights',
    ],
    report: {
      type: 'qualitative',
      title: cleanQuery ? `Focus Group: ${cleanQuery}` : 'Focus Group Insights',
      abstract:
        'Participants revealed a complex interplay between practical concerns and emotional drivers. While cost and convenience matter, trust and authenticity emerged as the dominant factors shaping decisions.',
      segments: [],
      questions: [],
      themes: [
        {
          id: 'theme-1',
          topic: 'The Trust Deficit',
          sentiment: 'negative',
          summary: 'Participants expressed deep skepticism rooted in past experiences with broken promises and perceived corporate insincerity.',
          quotes: [
            {
              text: "I've been burned too many times. They say one thing in the ads and then... it's just not the same when you actually use it.",
              attribution: 'Sarah, 34',
            },
            {
              text: "Honestly? I assume everything is marketing spin until proven otherwise. That's just... that's where we're at now.",
              attribution: 'Marcus, 28',
            },
            {
              text: "My friend recommended it but even then I was like, okay but are they getting paid to say that? You can't trust anyone anymore.",
              attribution: 'Jennifer, 42',
            },
          ],
        },
        {
          id: 'theme-2',
          topic: 'Price vs. Purpose',
          sentiment: 'mixed',
          summary: 'Cost remains a significant barrier, but participants showed willingness to pay more when they understood the underlying value.',
          quotes: [
            {
              text: "It's not that I can't afford it, it's that I need to understand what I'm actually getting. Like, break it down for me.",
              attribution: 'David, 31',
            },
            {
              text: "I'll pay premium if it actually means something. But if it's just... premium for the sake of premium? No thanks.",
              attribution: 'Aisha, 27',
            },
            {
              text: "The cheap option always ends up costing more in the long run. I've learned that the hard way, multiple times.",
              attribution: 'Robert, 45',
            },
          ],
        },
        {
          id: 'theme-3',
          topic: 'Seeking Authenticity',
          sentiment: 'positive',
          summary: 'Participants gravitated toward brands and experiences that felt genuine, unpolished, and human.',
          quotes: [
            {
              text: "I love when companies just... own their mistakes? Like, 'yeah we messed up, here's what we're doing about it.' That's refreshing.",
              attribution: 'Emma, 29',
            },
            {
              text: "The best ones don't try too hard. They just... are what they are. No gimmicks, no pretending to be your best friend.",
              attribution: 'James, 38',
            },
            {
              text: "Show me the people behind it. I want to see real faces, real stories. Not stock photos and corporate speak.",
              attribution: 'Maria, 33',
            },
          ],
        },
        {
          id: 'theme-4',
          topic: 'Community Influence',
          sentiment: 'positive',
          summary: 'Word-of-mouth and community validation trumped traditional advertising across all participant segments.',
          quotes: [
            {
              text: "If my sister says it's good, that's worth more than a thousand ads. She has no reason to lie to me.",
              attribution: 'Lisa, 36',
            },
            {
              text: "I basically live in Reddit threads before I make any decision. Real people, real opinions, you know?",
              attribution: 'Kevin, 25',
            },
            {
              text: "The community around it matters almost as much as the thing itself. Like, who else is using this? Are they people I respect?",
              attribution: 'Nina, 41',
            },
          ],
        },
      ],
    },
  }
}

function generateQuantitativeFallback(query: string): ResearchResult {
  return {
    type: 'quantitative',
    audienceName: 'General Population',
    audienceId: 'gen-pop',
    explanation:
      "I couldn't access live data, so I've generated a preliminary report based on general trends.",
    processSteps: [
      'Planning survey',
      'Recruiting participants',
      'Reviewing responses',
      'Asking additional questions',
      'Analysing result',
      'Creating report',
    ],
    report: {
      type: 'quantitative',
      title: `Research Report: ${query}`,
      abstract: `This is a generated report estimating public sentiment and trends regarding "${query}". Data is synthetic and for illustrative purposes.`,
      segments: [],
      questions: [
        {
          question: `What are the key factors driving ${query.split(' ').slice(-1)[0] || 'trends'}?`,
          options: [
            { label: 'Cost / Pricing', percentage: 42.4 },
            { label: 'Quality & Reliability', percentage: 28.7 },
            { label: 'Brand Reputation', percentage: 18.2 },
            { label: 'Availability', percentage: 10.7 },
          ],
        },
        {
          question: 'How has sentiment changed over the last year?',
          options: [
            { label: 'Significantly Positive', percentage: 33.5 },
            { label: 'Slightly Positive', percentage: 24.1 },
            { label: 'No Change', percentage: 15.3 },
            { label: 'Slightly Negative', percentage: 18.2 },
            { label: 'Significantly Negative', percentage: 8.9 },
          ],
        },
        {
          question: 'Future outlook and adoption likelihood?',
          options: [
            { label: 'Very Likely', percentage: 55.4 },
            { label: 'Somewhat Likely', percentage: 23.8 },
            { label: 'Unlikely', percentage: 20.8 },
          ],
        },
      ],
    },
  }
}

export function isQualitativeQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase()
  const qualKeywords = [
    '#focus-group',
    'focus group',
    'focus-group',
    'qualitative',
    'qual research',
    'in-depth interview',
    'in depth interview',
    'depth interview',
    'idis',
    'ethnography',
    'ethnographic',
    '/qual',
    '/focus-group',
    'exploratory research',
    'open-ended',
    'why do they',
    'understand why',
    'explore their feelings',
    'attitudes and perceptions',
    'deep dive into motivations',
  ]
  return qualKeywords.some(keyword => lowerQuery.includes(keyword))
}

export async function generateResearchData(
  userQuery: string,
  currentCanvas: Canvas | null = null
): Promise<ResearchResult> {
  const isQualitative = isQualitativeQuery(userQuery)
  console.log(`[Merlin] Research query: "${userQuery}"`)
  console.log(`[Merlin] Type: ${isQualitative ? 'QUALITATIVE' : 'QUANTITATIVE'}`)

  // Define the JSON schema for structured output
  const researchResultSchema = {
    type: 'object' as const,
    properties: {
      type: {
        type: 'string',
        enum: ['quantitative', 'qualitative'],
        description: 'The type of research conducted'
      },
      audienceName: {
        type: 'string',
        description: 'Human-readable name for the audience (e.g., "Gen Z", "Times Readers")'
      },
      audienceId: {
        type: 'string',
        description: 'URL-safe identifier for the audience (e.g., "gen-z", "times-readers")'
      },
      explanation: {
        type: 'string',
        description: 'Brief explanation of the research findings (2-3 sentences)'
      },
      processSteps: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of 5-6 research process steps that were performed'
      },
      report: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['quantitative', 'qualitative']
          },
          title: {
            type: 'string',
            description: 'Concise title for the research report'
          },
          abstract: {
            type: 'string',
            description: 'Executive summary of findings (2-3 sentences)'
          },
          segments: {
            type: 'array',
            items: { type: 'string' },
            description: 'Comparison segments if applicable, otherwise empty array'
          },
          questions: {
            type: 'array',
            description: 'For quantitative: 3 survey questions with results. For qualitative: empty array.',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      percentage: { type: 'number' }
                    },
                    required: ['label', 'percentage']
                  }
                }
              },
              required: ['question', 'options']
            }
          },
          themes: {
            type: 'array',
            description: 'For qualitative: 3-4 themes with quotes. For quantitative: empty array.',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                topic: { type: 'string' },
                sentiment: {
                  type: 'string',
                  enum: ['positive', 'negative', 'neutral', 'mixed']
                },
                summary: { type: 'string' },
                quotes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: { type: 'string' },
                      attribution: { type: 'string' }
                    },
                    required: ['text', 'attribution']
                  }
                }
              },
              required: ['id', 'topic', 'sentiment', 'summary', 'quotes']
            }
          }
        },
        required: ['type', 'title', 'abstract', 'segments', 'questions', 'themes']
      }
    },
    required: ['type', 'audienceName', 'audienceId', 'explanation', 'processSteps', 'report']
  }

  try {
    // 30-second timeout to allow for API response
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('API Timeout after 30s')), 30000)
    )

    const systemPrompt = getSystemPromptWithContext(currentCanvas, userQuery)

    console.log('[Merlin] Calling Claude API with structured output...')

    // Use tool_choice to force structured JSON output
    const apiCall = anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userQuery }],
      tools: [{
        name: 'generate_research_report',
        description: 'Generate a structured research report based on the query',
        input_schema: researchResultSchema
      }],
      tool_choice: { type: 'tool', name: 'generate_research_report' }
    })

    const response = await Promise.race([apiCall, timeoutPromise])
    console.log('[Merlin] API response received, stop_reason:', response.stop_reason)

    // Check if response was truncated
    if (response.stop_reason === 'max_tokens') {
      console.warn('[Merlin] Response truncated due to max_tokens limit')
      throw new Error('Response truncated - using fallback')
    }

    // Extract the tool use result
    const toolUse = response.content.find(block => block.type === 'tool_use')
    if (toolUse && toolUse.type === 'tool_use') {
      const result = toolUse.input as ResearchResult
      console.log('[Merlin] Successfully received structured response')

      // Ensure type consistency
      if (isQualitative && result.type !== 'qualitative') {
        result.type = 'qualitative'
        if (result.report) result.report.type = 'qualitative'
      }
      return result
    }

    console.error('[Merlin] No tool_use in response')
    throw new Error('No structured output in response')
  } catch (error) {
    console.error('[Merlin] API call failed:', error)
    console.log('[Merlin] Using fallback data')

    if (isQualitative) {
      return generateQualitativeFallback(userQuery)
    }
    return generateQuantitativeFallback(userQuery)
  }
}

// Generate a concise title for a conversation query
export async function generateConversationTitle(query: string): Promise<string> {
  console.log('[Merlin] Generating title for query...')
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      system: 'Generate a concise 3-5 word title summarizing the research query. Output only the title, no quotes or punctuation. Be descriptive but brief.',
      messages: [{ role: 'user', content: query }],
    })

    if (response.content && response.content[0]?.type === 'text') {
      const title = response.content[0].text.trim()
      console.log('[Merlin] Generated title:', title)
      return title
    }
    throw new Error('Invalid response')
  } catch (error) {
    console.error('[Merlin] Title generation failed:', error)
    // Fallback: create a simple title from the query
    const words = query.split(' ').slice(0, 4)
    return words.join(' ') + (query.split(' ').length > 4 ? '...' : '')
  }
}
