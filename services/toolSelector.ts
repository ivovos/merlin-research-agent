import { anthropic } from './api'
import type { Canvas, ClarificationRequest, StudyPlan } from '@/types'
import { researchTools, type ResearchToolName } from './tools'
import { AGENT_SYSTEM_PROMPT, getAgentPromptWithContext } from './agentPrompt'

// ---------------------------------------------------------------------------
// Tool → Method mapping
// ---------------------------------------------------------------------------

const toolToMethodMapping: Record<string, { methodId: string; methodName: string; variantId?: string; variantName?: string }> = {
  'run_survey': { methodId: 'survey', methodName: 'Survey' },
  'run_focus_group': { methodId: 'focus-group', methodName: 'Focus Group' },
  'run_comparison': { methodId: 'survey', methodName: 'Survey', variantId: 'comparison', variantName: 'Comparison' },
  'run_heatmap': { methodId: 'explore-audience', methodName: 'Explore Audience', variantId: 'heatmap', variantName: 'Heatmap' },
  'run_sentiment_analysis': { methodId: 'explore-audience', methodName: 'Explore Audience', variantId: 'sentiment', variantName: 'Sentiment Analysis' },
  'run_message_testing': { methodId: 'message-testing', methodName: 'Message Testing' },
}

// ---------------------------------------------------------------------------
// Process steps per tool
// ---------------------------------------------------------------------------

const SURVEY_PROCESS_STEPS = [
  'Designing survey questionnaire',
  'Recruiting 500+ respondents',
  'Collecting responses',
  'Cleaning and validating data',
  'Running statistical analysis',
  'Generating insights report'
]

const FOCUS_GROUP_PROCESS_STEPS = [
  'Designing discussion guide',
  'Recruiting 12 participants',
  'Moderating focus group sessions',
  'Transcribing 6+ hours of discussion',
  'Coding and categorizing themes',
  'Synthesizing key insights'
]

const COMPARISON_PROCESS_STEPS = [
  'Defining comparison segments',
  'Recruiting matched samples',
  'Collecting parallel responses',
  'Normalizing cross-segment data',
  'Running comparative analysis',
  'Highlighting key differences'
]

const HEATMAP_PROCESS_STEPS = [
  'Setting up attention tracking',
  'Recruiting 200+ participants',
  'Recording eye-tracking sessions',
  'Processing gaze data',
  'Generating heat intensity maps',
  'Identifying engagement hotspots'
]

const SENTIMENT_PROCESS_STEPS = [
  'Defining sentiment topics',
  'Collecting brand mentions',
  'Running NLP sentiment analysis',
  'Categorizing emotional drivers',
  'Scoring sentiment by topic',
  'Mapping perception landscape'
]

const MESSAGE_TESTING_PROCESS_STEPS = [
  'Preparing message variants',
  'Recruiting target audience',
  'A/B testing message exposure',
  'Measuring comprehension & recall',
  'Scoring emotional resonance',
  'Ranking message effectiveness'
]

export function getProcessStepsForTool(toolName: string): string[] {
  switch (toolName) {
    case 'run_survey':
      return SURVEY_PROCESS_STEPS
    case 'run_focus_group':
      return FOCUS_GROUP_PROCESS_STEPS
    case 'run_comparison':
      return COMPARISON_PROCESS_STEPS
    case 'run_heatmap':
      return HEATMAP_PROCESS_STEPS
    case 'run_sentiment_analysis':
      return SENTIMENT_PROCESS_STEPS
    case 'run_message_testing':
      return MESSAGE_TESTING_PROCESS_STEPS
    default:
      return SURVEY_PROCESS_STEPS
  }
}

// Re-export for use in orchestrator fallback paths
export { COMPARISON_PROCESS_STEPS, SURVEY_PROCESS_STEPS }

// ---------------------------------------------------------------------------
// Study plan helpers
// ---------------------------------------------------------------------------

function generateStudyTitle(toolInput: Record<string, unknown>, methodName: string): string {
  const audience = (toolInput.audience as string) || 'Audience'
  const question = (toolInput.research_question as string) || ''

  const topicWords = question
    .replace(/\?/g, '')
    .replace(/^(what|how|why|do|does|are|is|can|could|would|should)\s+/i, '')
    .replace(/^(they|people|users|customers)\s+(think|feel|want|like|prefer|believe)\s+(about\s+)?/i, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'about'].includes(w.toLowerCase()))
    .slice(0, 3)
    .join(' ')

  const cleanAudience = audience.replace(/^@/, '').split('-').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ')

  if (topicWords) {
    const capitalizedTopic = topicWords.charAt(0).toUpperCase() + topicWords.slice(1)
    return `${cleanAudience} ${capitalizedTopic}`
  }

  return `${cleanAudience} ${methodName}`
}

export function createStudyPlan(toolName: string, toolInput: Record<string, unknown>): StudyPlan {
  const mapping = toolToMethodMapping[toolName] || { methodId: 'survey', methodName: 'Survey' }
  const title = generateStudyTitle(toolInput, mapping.methodName)

  return {
    title,
    methodId: mapping.methodId,
    methodName: mapping.methodName,
    variantId: mapping.variantId || null,
    variantName: mapping.variantName,
    formData: {
      audience: toolInput.audience,
      researchQuestion: toolInput.research_question,
      segments: toolInput.segments,
      ...toolInput
    }
  }
}

// ---------------------------------------------------------------------------
// Comparison detection
// ---------------------------------------------------------------------------

export function detectComparisonSegments(query: string): string[] {
  console.log('[Merlin Agent] Detecting comparison segments in query:', query)

  const comparisonPatterns = [
    /(.+?)\s+vs\.?\s+(.+)/i,
    /(.+?)\s+versus\s+(.+)/i,
    /compar(?:e|ing)\s+(.+?)\s+(?:to|and|with)\s+(.+)/i,
    /(.+?)\s+compared\s+to\s+(.+)/i,
  ]

  for (const pattern of comparisonPatterns) {
    const match = query.match(pattern)
    if (match) {
      const seg1 = match[1].trim().replace(/^@/, '')
      const seg2 = match[2].trim().replace(/^@/, '')
      console.log('[Merlin Agent] Pattern match found:', { seg1, seg2 })
      if (seg1 && seg2) {
        return [seg1, seg2]
      }
    }
  }

  const atMentions = query.match(/@[\w-]+/g)
  console.log('[Merlin Agent] @mentions found:', atMentions)
  if (atMentions && atMentions.length >= 2) {
    return atMentions.map(m => m.replace('@', ''))
  }

  return []
}

// ---------------------------------------------------------------------------
// Tool selection result type
// ---------------------------------------------------------------------------

export interface ToolSelectionResult {
  toolName: string;
  toolInput: Record<string, unknown>;
  studyPlan: StudyPlan;
  processSteps: string[];
}

// ---------------------------------------------------------------------------
// Phase 1: Select the research tool and create study plan
// ---------------------------------------------------------------------------

export async function selectResearchTool(
  userQuery: string,
  currentCanvas: Canvas | null = null
): Promise<{ type: 'clarification'; clarification: ClarificationRequest } | { type: 'tool'; selection: ToolSelectionResult }> {
  console.log(`[Merlin Agent] Phase 1 - Selecting tool for: "${userQuery}"`)

  try {
    const systemPrompt = currentCanvas
      ? getAgentPromptWithContext(currentCanvas.title, currentCanvas.type)
      : AGENT_SYSTEM_PROMPT

    const toolSelectionResponse = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userQuery }],
      tools: researchTools,
    })

    const toolCalls = toolSelectionResponse.content.filter(block => block.type === 'tool_use')

    if (toolCalls.length === 0) {
      const studyPlan = createStudyPlan('run_survey', { audience: 'General Population', research_question: userQuery })
      return {
        type: 'tool',
        selection: {
          toolName: 'run_survey',
          toolInput: { audience: 'General Population', research_question: userQuery },
          studyPlan,
          processSteps: getProcessStepsForTool('run_survey')
        }
      }
    }

    const firstToolCall = toolCalls[0]
    if (firstToolCall.type !== 'tool_use') {
      throw new Error('Unexpected tool call type')
    }

    const toolName = firstToolCall.name as ResearchToolName
    const toolInput = firstToolCall.input as Record<string, unknown>

    if (toolName === 'ask_clarification') {
      return {
        type: 'clarification',
        clarification: {
          type: 'clarification',
          missing_info: (toolInput.missing_info as string) || 'More information needed',
          reason: toolInput.reason as string | undefined,
          suggestions: (toolInput.suggestions as string[]) || []
        }
      }
    }

    const studyPlan = createStudyPlan(toolName, {
      ...toolInput,
      research_question: (toolInput.research_question as string) || userQuery,
      audience: (toolInput.audience as string) || 'General Population'
    })

    return {
      type: 'tool',
      selection: {
        toolName,
        toolInput,
        studyPlan,
        processSteps: getProcessStepsForTool(toolName)
      }
    }
  } catch (error) {
    console.error('[Merlin Agent] Tool selection error:', error)
    const studyPlan = createStudyPlan('run_survey', { audience: 'General Population', research_question: userQuery })
    return {
      type: 'tool',
      selection: {
        toolName: 'run_survey',
        toolInput: { audience: 'General Population', research_question: userQuery },
        studyPlan,
        processSteps: getProcessStepsForTool('run_survey')
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Conversation title generation
// ---------------------------------------------------------------------------

function extractSimpleTitle(query: string): string {
  const cleaned = query
    .replace(/@[\w-]+/g, '')
    .replace(/\/[\w-]+/g, '')
    .trim()
  const words = cleaned.split(/\s+/).filter(w => w.length > 0).slice(0, 5)
  if (words.length === 0) {
    return 'Research Query'
  }
  return words.join(' ') + (cleaned.split(/\s+/).length > 5 ? '...' : '')
}

function isErrorResponse(text: string): boolean {
  const errorPatterns = [
    /^I('m| am) sorry/i,
    /^I cannot/i,
    /^I can't/i,
    /^I don't/i,
    /^I didn't/i,
    /^Unfortunately/i,
    /^Could you/i,
    /^Please /i,
    /^I need more/i,
  ]
  return errorPatterns.some(pattern => pattern.test(text.trim()))
}

export async function generateConversationTitle(query: string): Promise<string> {
  console.log('[Merlin] Generating title for query...')

  if (!query || query.trim().length < 3) {
    return extractSimpleTitle(query || 'Research Query')
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 30,
      system: `You are a title generator. Given a research query, output ONLY a 3-5 word title.
Rules:
- Output ONLY the title text, nothing else
- No quotes, punctuation, or explanations
- If the query is unclear, still generate a descriptive title based on key words
- Never apologize or ask questions
- Never start with "I"`,
      messages: [{ role: 'user', content: `Generate title for: ${query}` }],
    })

    if (response.content && response.content[0]?.type === 'text') {
      const title = response.content[0].text.trim()
      console.log('[Merlin] Generated title:', title)

      if (isErrorResponse(title) || title.length > 60) {
        console.log('[Merlin] Title looks like error, using fallback')
        return extractSimpleTitle(query)
      }

      return title
    }
    throw new Error('Invalid response')
  } catch (error) {
    console.error('[Merlin] Title generation failed:', error)
    return extractSimpleTitle(query)
  }
}
