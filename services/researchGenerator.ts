import { anthropic } from './api'
import type { Canvas, ClarificationRequest, AgentResult } from '@/types'
import { researchTools, type ResearchToolName } from './tools'
import { AGENT_SYSTEM_PROMPT, getAgentPromptWithContext } from './agentPrompt'

/**
 * Parse a percentage value that might be a number or a string like "37.2%"
 */
function parsePercentage(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    // Remove % sign and parse
    const cleaned = value.replace('%', '').trim()
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/**
 * Normalize options - convert object to array if needed
 * Handles cases where API returns { "Gen Z": 45, "Millennials": 55 } instead of [{ label: "Gen Z", percentage: 45 }, ...]
 * Also handles percentage values as strings like "37.2%"
 */
function normalizeOptions(options: unknown): Array<{ label: string; percentage: number }> {
  // Already an array - validate and return
  if (Array.isArray(options)) {
    return options.filter(opt => opt && typeof opt === 'object' && 'label' in opt).map(opt => ({
      label: String(opt.label || ''),
      percentage: parsePercentage(opt.percentage)
    }))
  }

  // Object format like { "Gen Z": 45, "Millennials": 55 }
  if (options && typeof options === 'object') {
    return Object.entries(options).map(([label, value]) => ({
      label,
      percentage: parsePercentage(value)
    }))
  }

  // Fallback
  return []
}

/**
 * Detect if a query is asking for a comparison between segments
 * Returns array of segments if comparison detected, empty array otherwise
 */
function detectComparisonSegments(query: string): string[] {
  console.log('[Merlin Agent] Detecting comparison segments in query:', query)

  // Check for comparison patterns like "vs", "versus", "compared to", "comparing"
  const comparisonPatterns = [
    /(.+?)\s+vs\.?\s+(.+)/i,
    /(.+?)\s+versus\s+(.+)/i,
    /compar(?:e|ing)\s+(.+?)\s+(?:to|and|with)\s+(.+)/i,
    /(.+?)\s+compared\s+to\s+(.+)/i,
  ]

  for (const pattern of comparisonPatterns) {
    const match = query.match(pattern)
    if (match) {
      // Extract the two groups being compared
      const seg1 = match[1].trim().replace(/^@/, '')
      const seg2 = match[2].trim().replace(/^@/, '')
      console.log('[Merlin Agent] Pattern match found:', { seg1, seg2 })
      if (seg1 && seg2) {
        return [seg1, seg2]
      }
    }
  }

  // Also check for @mentions - if multiple @mentions, treat as comparison
  const atMentions = query.match(/@[\w-]+/g)
  console.log('[Merlin Agent] @mentions found:', atMentions)
  if (atMentions && atMentions.length >= 2) {
    return atMentions.map(m => m.replace('@', ''))
  }

  return []
}

// Legacy interface for backwards compatibility
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

// Schema for generating survey results
const surveyResultSchema = {
  type: 'object' as const,
  properties: {
    title: { type: 'string', description: 'Catchy, direct title for the survey results' },
    abstract: { type: 'string', description: 'Executive summary of findings (2-3 sentences)' },
    audience: { type: 'string', description: 'Target audience name' },
    sample_size: { type: 'number', description: 'Number of respondents' },
    questions: {
      type: 'array',
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
    }
  },
  required: ['title', 'abstract', 'audience', 'sample_size', 'questions']
}

// Schema for generating focus group results
const focusGroupResultSchema = {
  type: 'object' as const,
  properties: {
    title: { type: 'string', description: 'Catchy title for the focus group insights' },
    abstract: { type: 'string', description: 'Executive summary of key themes (2-3 sentences)' },
    audience: { type: 'string', description: 'Target audience name' },
    participant_count: { type: 'number', description: 'Number of participants' },
    themes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          topic: { type: 'string', description: 'Evocative 2-4 word theme name' },
          sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral', 'mixed'] },
          summary: { type: 'string', description: 'One compelling sentence capturing the insight' },
          quotes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string', description: 'Realistic, conversational quote' },
                attribution: { type: 'string', description: 'Name, Age format' }
              },
              required: ['text', 'attribution']
            }
          }
        },
        required: ['id', 'topic', 'sentiment', 'summary', 'quotes']
      }
    }
  },
  required: ['title', 'abstract', 'audience', 'participant_count', 'themes']
}

// Process steps for different research types
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

// Helper to get process steps by tool name
function getProcessStepsForTool(toolName: string): string[] {
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

/**
 * Agent-based research generation
 * Uses Claude to intelligently select the appropriate research methodology
 */
export async function generateResearchWithAgent(
  userQuery: string,
  currentCanvas: Canvas | null = null
): Promise<AgentResult> {
  console.log(`[Merlin Agent] Processing query: "${userQuery}"`)

  try {
    // Step 1: Get agent's tool selection
    const systemPrompt = currentCanvas
      ? getAgentPromptWithContext(currentCanvas.title, currentCanvas.type)
      : AGENT_SYSTEM_PROMPT

    console.log('[Merlin Agent] Calling Claude for tool selection...')

    const toolSelectionResponse = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userQuery }],
      tools: researchTools,
    })

    console.log('[Merlin Agent] Tool selection response received, stop_reason:', toolSelectionResponse.stop_reason)

    // Extract tool calls from response
    const toolCalls = toolSelectionResponse.content.filter(block => block.type === 'tool_use')

    if (toolCalls.length === 0) {
      console.log('[Merlin Agent] No tool selected, treating as generic survey')
      // Fallback: treat as generic survey
      return executeToolAsSurvey(userQuery, 'General Population')
    }

    // Step 2: Process each tool call
    const results: Canvas[] = []
    const usedTools: string[] = []
    let clarification: ClarificationRequest | undefined

    for (const toolCall of toolCalls) {
      if (toolCall.type !== 'tool_use') continue

      const toolName = toolCall.name as ResearchToolName
      const toolInput = toolCall.input as Record<string, unknown>

      console.log(`[Merlin Agent] Selected tool: ${toolName}`, toolInput)

      // Handle clarification request
      if (toolName === 'ask_clarification') {
        clarification = {
          type: 'clarification',
          missing_info: (toolInput.missing_info as string) || 'More information needed',
          reason: toolInput.reason as string | undefined,
          suggestions: (toolInput.suggestions as string[]) || []
        }
        break // Don't continue if clarification is needed
      }

      // Execute research tool
      const canvas = await executeResearchTool(toolName, toolInput, userQuery)
      if (canvas) {
        results.push(canvas)
        usedTools.push(toolName)
      }
    }

    // Return appropriate result type
    if (clarification) {
      return {
        type: 'clarification',
        clarification
      }
    }

    if (results.length === 0) {
      // Fallback if no results
      return executeToolAsSurvey(userQuery, 'General Population')
    }

    if (results.length === 1) {
      return {
        type: 'single_canvas',
        canvases: results,
        processSteps: getProcessStepsForTool(usedTools[0]),
        explanation: `Research completed for ${results[0].audience.name}`
      }
    }

    // Multi-tool: combine first 3 steps from each tool used
    const combinedSteps: string[] = []
    usedTools.forEach(tool => {
      const toolSteps = getProcessStepsForTool(tool)
      combinedSteps.push(...toolSteps.slice(0, 3))
    })

    return {
      type: 'multi_canvas',
      canvases: results,
      processSteps: combinedSteps,
      explanation: `Multiple research methodologies executed to provide comprehensive insights`
    }

  } catch (error) {
    console.error('[Merlin Agent] Error:', error)

    // Check if the query is asking for a comparison
    const detectedSegments = detectComparisonSegments(userQuery)
    if (detectedSegments.length >= 2) {
      console.log('[Merlin Agent] Detected comparison query in fallback, segments:', detectedSegments)
      // Generate comparison fallback with detected segments
      const canvas = generateFallbackComparisonCanvas('General Population', userQuery, detectedSegments)
      return {
        type: 'single_canvas',
        canvases: [canvas],
        processSteps: COMPARISON_PROCESS_STEPS,
        explanation: `Comparison research completed for ${detectedSegments.join(' vs ')}`
      }
    }

    // Return fallback survey for non-comparison queries
    return executeToolAsSurvey(userQuery, 'General Population')
  }
}

/**
 * Execute a specific research tool and return canvas
 */
async function executeResearchTool(
  toolName: ResearchToolName,
  toolInput: Record<string, unknown>,
  originalQuery: string
): Promise<Canvas | null> {
  const audience = (toolInput.audience as string) || 'General Population'
  const researchQuestion = (toolInput.research_question as string) || originalQuery
  const segments = (toolInput.segments as string[] | undefined)

  switch (toolName) {
    case 'run_survey':
      // Pass segments for comparison surveys
      return executeSurveyTool(audience, researchQuestion, segments)

    case 'run_focus_group':
      return executeFocusGroupTool(audience, researchQuestion)

    case 'run_comparison':
      // Use segments from comparison tool or default
      const comparisonSegments = segments || ['Group A', 'Group B']
      return executeComparisonTool(comparisonSegments, researchQuestion)

    case 'run_heatmap':
    case 'run_sentiment_analysis':
      // For now, fall back to survey for these types
      // TODO: Implement proper heatmap and sentiment canvas types
      console.log(`[Merlin Agent] ${toolName} not fully implemented, falling back to survey`)
      return executeSurveyTool(audience, researchQuestion)

    default:
      console.log(`[Merlin Agent] Unknown tool: ${toolName}`)
      return null
  }
}

/**
 * Execute survey tool and generate quantitative canvas
 * Supports optional segments for comparison surveys
 */
async function executeSurveyTool(audience: string, researchQuestion: string, segments?: string[]): Promise<Canvas> {
  // If segments provided, use comparison survey generation
  if (segments && segments.length > 1) {
    return executeComparisonSurveyTool(audience, researchQuestion, segments)
  }

  console.log(`[Merlin Agent] Executing survey for: ${audience}`)

  const surveyPrompt = `Generate realistic survey results for the following:
Audience: ${audience}
Research Question: ${researchQuestion}

Guidelines:
- Generate 3 specific, measurable questions with clear options
- Use realistic percentages (avoid round numbers, use values like 42.8%, 17.3%)
- Reflect real-world trends and knowledge
- Ensure percentages in each question sum to approximately 100%
- Make the title catchy and direct
- Write a 2-sentence abstract summarizing key findings`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{ role: 'user', content: surveyPrompt }],
      tools: [{
        name: 'generate_survey_results',
        description: 'Generate structured survey results',
        input_schema: surveyResultSchema
      }],
      tool_choice: { type: 'tool', name: 'generate_survey_results' }
    })

    const toolUse = response.content.find(block => block.type === 'tool_use')
    if (toolUse && toolUse.type === 'tool_use') {
      const result = toolUse.input as {
        title: string
        abstract: string
        audience: string
        sample_size: number
        questions: Array<{
          question: string
          options: Array<{ label: string; percentage: number }>
        }>
      }

      console.log('[Merlin Agent] Survey API response:', JSON.stringify(result, null, 2))

      // Handle questions being returned as a string (JSON) instead of array
      let questionsArray: any[] = []
      if (typeof result.questions === 'string') {
        try {
          // Sanitize malformed JSON: fix unquoted percentage values like "percentage": 37.2%
          // This regex finds number% patterns and wraps them in quotes
          const sanitizedJson = result.questions.replace(
            /:\s*(\d+\.?\d*)%/g,
            ': "$1%"'
          )
          questionsArray = JSON.parse(sanitizedJson)
          console.log('[Merlin Agent] Parsed questions from JSON string (sanitized)')
        } catch (e) {
          console.error('[Merlin Agent] Failed to parse questions string:', e)
          console.error('[Merlin Agent] Raw questions string:', result.questions)
        }
      } else if (Array.isArray(result.questions)) {
        questionsArray = result.questions
      }

      const questions = questionsArray.map((q: any, idx: number) => ({
        id: `q${idx + 1}`,
        question: q.question || '',
        respondents: result.sample_size || 500,
        options: normalizeOptions(q.options)
      }))

      console.log('[Merlin Agent] Processed questions:', questions.length, questions)

      return {
        id: `canvas-${Date.now()}`,
        title: result.title || 'Survey Results',
        type: 'quantitative',
        audience: {
          id: audience.toLowerCase().replace(/\s+/g, '-'),
          name: result.audience || audience
        },
        respondents: result.sample_size || 500,
        abstract: result.abstract || '',
        questions,
        themes: [],
        createdAt: new Date()
      }
    } else {
      console.log('[Merlin Agent] No tool_use block found in response:', response.content)
    }
  } catch (error) {
    console.error('[Merlin Agent] Survey generation failed:', error)
  }

  // Fallback
  return generateFallbackSurveyCanvas(audience, researchQuestion)
}

/**
 * Execute comparison survey tool - generates survey with multiple segments
 * Each question shows side-by-side results for each segment
 */
async function executeComparisonSurveyTool(audience: string, researchQuestion: string, segments: string[]): Promise<Canvas> {
  console.log(`[Merlin Agent] Executing comparison survey for segments: ${segments.join(' vs ')}`)

  // Build dynamic schema with explicit segment properties
  const segmentProperties: Record<string, { type: string; description: string }> = {}
  for (const segment of segments) {
    segmentProperties[segment] = {
      type: 'number',
      description: `Percentage for ${segment} segment (0-100)`
    }
  }

  const dynamicComparisonSchema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: `Catchy title highlighting the comparison (e.g., "${segments.join(' vs ')}: Topic Compared")` },
      abstract: { type: 'string', description: 'Executive summary highlighting key differences between segments (2-3 sentences)' },
      sample_size_per_segment: { type: 'number', description: 'Number of respondents per segment (default 500)' },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'The survey question' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string', description: 'The answer option text' },
                  ...segmentProperties
                },
                required: ['label', ...segments]
              },
              description: 'Array of answer options, each with percentages for all segments'
            }
          },
          required: ['question', 'options']
        }
      }
    },
    required: ['title', 'abstract', 'sample_size_per_segment', 'questions']
  }

  const comparisonPrompt = `Generate realistic comparative survey results for the following:
Audience: ${audience}
Research Question: ${researchQuestion}
Segments to Compare: ${segments.join(', ')}

Guidelines:
- Generate 3 specific, measurable questions that compare the segments
- For each question option, provide a percentage for EACH segment: ${segments.join(', ')}
- Example option format: {"label": "Option A", ${segments.map(s => `"${s}": 45.2`).join(', ')}}
- Use realistic percentages (avoid round numbers, use values like 42.8%, 17.3%)
- Show meaningful differences between segments where appropriate
- Percentages for each segment should sum to approximately 100% within each question
- Make the title highlight the comparison
- Write a 2-sentence abstract summarizing key differences between segments`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
      messages: [{ role: 'user', content: comparisonPrompt }],
      tools: [{
        name: 'generate_comparison_survey_results',
        description: `Generate structured comparison survey results with segment breakdowns for: ${segments.join(', ')}`,
        input_schema: dynamicComparisonSchema
      }],
      tool_choice: { type: 'tool', name: 'generate_comparison_survey_results' }
    })

    const toolUse = response.content.find(block => block.type === 'tool_use')
    if (toolUse && toolUse.type === 'tool_use') {
      const result = toolUse.input as {
        title: string
        abstract: string
        sample_size_per_segment: number
        questions: Array<{
          question: string
          options: Array<{ label: string; [segment: string]: string | number }>
        }>
      }

      console.log('[Merlin Agent] Comparison Survey API response:', JSON.stringify(result, null, 2))

      // Handle questions being returned as a string (JSON) instead of array
      let questionsArray: any[] = []
      if (typeof result.questions === 'string') {
        try {
          const sanitizedJson = result.questions.replace(
            /:\s*(\d+\.?\d*)%/g,
            ': "$1%"'
          )
          questionsArray = JSON.parse(sanitizedJson)
          console.log('[Merlin Agent] Parsed comparison questions from JSON string (sanitized)')
        } catch (e) {
          console.error('[Merlin Agent] Failed to parse comparison questions string:', e)
        }
      } else if (Array.isArray(result.questions)) {
        questionsArray = result.questions
      }

      // Use the segments we passed in (not from result)
      // Normalize options with segment data
      const questions = questionsArray.map((q: any, idx: number) => ({
        id: `q${idx + 1}`,
        question: q.question || '',
        respondents: (result.sample_size_per_segment || 500) * segments.length,
        segments: segments, // Use the segments we passed in
        options: normalizeComparisonOptions(q.options, segments)
      }))

      console.log('[Merlin Agent] Processed comparison questions:', questions.length, questions)

      // Calculate total respondents across all segments
      const totalRespondents = (result.sample_size_per_segment || 500) * segments.length

      return {
        id: `canvas-${Date.now()}`,
        title: result.title || `${segments.join(' vs ')}: Survey Results`,
        type: 'quantitative',
        audience: {
          id: audience.toLowerCase().replace(/\s+/g, '-'),
          name: audience
        },
        respondents: totalRespondents,
        abstract: result.abstract || '',
        questions,
        themes: [],
        createdAt: new Date()
      }
    } else {
      console.log('[Merlin Agent] No tool_use block found in comparison response:', response.content)
    }
  } catch (error) {
    console.error('[Merlin Agent] Comparison survey generation failed:', error)
  }

  // Fallback to generating separate single surveys (not ideal but works)
  return generateFallbackComparisonCanvas(audience, researchQuestion, segments)
}

/**
 * Normalize options for comparison surveys - handles segment percentage data
 */
function normalizeComparisonOptions(options: unknown, segments: string[]): Array<{ label: string; [key: string]: string | number }> {
  if (!Array.isArray(options)) return []

  return options.filter(opt => opt && typeof opt === 'object' && 'label' in opt).map(opt => {
    const normalized: { label: string; [key: string]: string | number } = {
      label: String(opt.label || '')
    }

    // Extract segment percentages
    for (const segment of segments) {
      const value = opt[segment]
      normalized[segment] = parsePercentage(value)
    }

    return normalized
  })
}

/**
 * Fallback comparison canvas when API fails
 */
function generateFallbackComparisonCanvas(audience: string, researchQuestion: string, segments: string[]): Canvas {
  console.log('[Merlin Agent] Using fallback comparison canvas')

  // Generate mock comparison data
  const mockQuestions = [
    {
      id: 'q1',
      question: `How do ${segments.join(' and ')} compare on preferences?`,
      respondents: 500 * segments.length,
      segments,
      options: [
        { label: 'Option A', ...Object.fromEntries(segments.map(s => [s, Math.round(Math.random() * 40 + 20)])) },
        { label: 'Option B', ...Object.fromEntries(segments.map(s => [s, Math.round(Math.random() * 30 + 15)])) },
        { label: 'Option C', ...Object.fromEntries(segments.map(s => [s, Math.round(Math.random() * 20 + 10)])) },
      ]
    }
  ]

  return {
    id: `canvas-${Date.now()}`,
    title: `${segments.join(' vs ')}: Comparison`,
    type: 'quantitative',
    audience: { id: audience.toLowerCase().replace(/\s+/g, '-'), name: audience },
    respondents: 500 * segments.length,
    abstract: `Comparison of ${segments.join(' and ')} on ${researchQuestion}.`,
    questions: mockQuestions as any,
    themes: [],
    createdAt: new Date()
  }
}

/**
 * Execute focus group tool and generate qualitative canvas
 */
async function executeFocusGroupTool(audience: string, researchQuestion: string): Promise<Canvas> {
  console.log(`[Merlin Agent] Executing focus group for: ${audience}`)

  const focusGroupPrompt = `Generate realistic focus group insights for the following:
Audience: ${audience}
Research Question: ${researchQuestion}

Guidelines:
- Generate 3-4 distinct themes that emerged from discussion
- Each theme needs an evocative 2-4 word topic name
- Match sentiment to the emotional tone (positive, negative, neutral, mixed)
- Write one compelling sentence summary per theme
- Include 2-3 realistic, conversational quotes per theme
- Use natural speech patterns, include filler words and emotions
- Attribution format: "Name, Age" (e.g., "Sarah, 34")
- Make quotes feel authentic and varied`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
      messages: [{ role: 'user', content: focusGroupPrompt }],
      tools: [{
        name: 'generate_focus_group_results',
        description: 'Generate structured focus group insights',
        input_schema: focusGroupResultSchema
      }],
      tool_choice: { type: 'tool', name: 'generate_focus_group_results' }
    })

    const toolUse = response.content.find(block => block.type === 'tool_use')
    if (toolUse && toolUse.type === 'tool_use') {
      const result = toolUse.input as {
        title: string
        abstract: string
        audience: string
        participant_count: number
        themes: Array<{
          id: string
          topic: string
          sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
          summary: string
          quotes: Array<{ text: string; attribution: string }>
        }>
      }

      return {
        id: `canvas-${Date.now()}`,
        title: result.title,
        type: 'qualitative',
        audience: {
          id: audience.toLowerCase().replace(/\s+/g, '-'),
          name: result.audience || audience
        },
        respondents: result.participant_count || 12,
        abstract: result.abstract,
        questions: [],
        themes: Array.isArray(result.themes) ? result.themes : [],
        createdAt: new Date()
      }
    }
  } catch (error) {
    console.error('[Merlin Agent] Focus group generation failed:', error)
  }

  // Fallback
  return generateFallbackFocusGroupCanvas(audience, researchQuestion)
}

/**
 * Execute comparison tool - generates survey with segment comparison
 */
async function executeComparisonTool(segments: string[], researchQuestion: string): Promise<Canvas> {
  console.log(`[Merlin Agent] Executing comparison for: ${segments.join(' vs ')}`)

  // For comparison, we generate a survey with segment breakdowns
  const comparisonPrompt = `Generate realistic survey comparison results for:
Segments to compare: ${segments.join(' vs ')}
Research Question: ${researchQuestion}

Guidelines:
- Generate 3 questions comparing the segments
- Each question should show different percentages per segment
- Show meaningful differences between groups (not identical)
- Use realistic percentages
- Title should emphasize the comparison aspect`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{ role: 'user', content: comparisonPrompt }],
      tools: [{
        name: 'generate_survey_results',
        description: 'Generate structured survey results with segment comparison',
        input_schema: surveyResultSchema
      }],
      tool_choice: { type: 'tool', name: 'generate_survey_results' }
    })

    const toolUse = response.content.find(block => block.type === 'tool_use')
    if (toolUse && toolUse.type === 'tool_use') {
      const result = toolUse.input as {
        title: string
        abstract: string
        sample_size: number
        questions: Array<{
          question: string
          options: Array<{ label: string; percentage: number }>
        }>
      }

      // Add segment data to options
      const questionsWithSegments = (Array.isArray(result.questions) ? result.questions : []).map((q, idx) => {
        const normalizedOpts = normalizeOptions(q.options)
        return {
          id: `q${idx + 1}`,
          question: q.question || '',
          respondents: result.sample_size || 500,
          segments,
          options: normalizedOpts.map(opt => {
            // Generate varied percentages per segment
            const basePercentage = opt.percentage
            const segmentData: Record<string, number> = {}
            segments.forEach((seg, i) => {
              // Vary by ±15% between segments
              const variance = (i === 0 ? 0 : (Math.random() - 0.5) * 30)
              segmentData[seg] = Math.max(0, Math.min(100, Math.round((basePercentage + variance) * 10) / 10))
            })
            return {
              label: opt.label,
              percentage: opt.percentage,
              ...segmentData
            }
          })
        }
      })

      return {
        id: `canvas-${Date.now()}`,
        title: result.title,
        type: 'quantitative',
        audience: {
          id: 'comparison',
          name: segments.join(' vs ')
        },
        respondents: result.sample_size || 500,
        abstract: result.abstract,
        questions: questionsWithSegments,
        themes: [],
        createdAt: new Date()
      }
    }
  } catch (error) {
    console.error('[Merlin Agent] Comparison generation failed:', error)
  }

  // Fallback to standard survey
  return generateFallbackSurveyCanvas(segments.join(' vs '), researchQuestion)
}

/**
 * Helper: Execute as survey (used for fallbacks)
 */
async function executeToolAsSurvey(query: string, audience: string): Promise<AgentResult> {
  const canvas = await executeSurveyTool(audience, query)
  return {
    type: 'single_canvas',
    canvases: [canvas],
    processSteps: getProcessStepsForTool('run_survey'),
    explanation: `Survey research completed for ${audience}`
  }
}

/**
 * Fallback survey canvas when API fails
 */
function generateFallbackSurveyCanvas(audience: string, query: string): Canvas {
  return {
    id: `canvas-${Date.now()}`,
    title: `Survey: ${query.slice(0, 50)}`,
    type: 'quantitative',
    audience: {
      id: audience.toLowerCase().replace(/\s+/g, '-'),
      name: audience
    },
    respondents: 500,
    abstract: 'Survey results generated with preliminary data. Results are synthetic and for illustrative purposes.',
    questions: [
      {
        id: 'q1',
        question: 'Primary factors influencing decision?',
        respondents: 500,
        options: [
          { label: 'Cost / Value', percentage: 38.4 },
          { label: 'Quality', percentage: 29.1 },
          { label: 'Brand Trust', percentage: 19.7 },
          { label: 'Convenience', percentage: 12.8 }
        ]
      },
      {
        id: 'q2',
        question: 'Overall sentiment?',
        respondents: 500,
        options: [
          { label: 'Very Positive', percentage: 24.6 },
          { label: 'Somewhat Positive', percentage: 31.2 },
          { label: 'Neutral', percentage: 22.8 },
          { label: 'Somewhat Negative', percentage: 14.3 },
          { label: 'Very Negative', percentage: 7.1 }
        ]
      },
      {
        id: 'q3',
        question: 'Likelihood to recommend?',
        respondents: 500,
        options: [
          { label: 'Very Likely', percentage: 41.3 },
          { label: 'Likely', percentage: 28.9 },
          { label: 'Unlikely', percentage: 29.8 }
        ]
      }
    ],
    themes: [],
    createdAt: new Date()
  }
}

/**
 * Fallback focus group canvas when API fails
 */
function generateFallbackFocusGroupCanvas(audience: string, query: string): Canvas {
  return {
    id: `canvas-${Date.now()}`,
    title: `Focus Group: ${query.slice(0, 50)}`,
    type: 'qualitative',
    audience: {
      id: audience.toLowerCase().replace(/\s+/g, '-'),
      name: audience
    },
    respondents: 12,
    abstract: 'Focus group insights synthesized from participant discussions. Key themes emerged around trust, value, and authenticity.',
    questions: [],
    themes: [
      {
        id: 'theme-1',
        topic: 'The Trust Factor',
        sentiment: 'mixed',
        summary: 'Participants expressed a complex relationship with trust, valuing authenticity but remaining skeptical of marketing claims.',
        quotes: [
          { text: "I need to see real proof before I believe anything these days. Actions speak louder than ads.", attribution: 'Sarah, 34' },
          { text: "When a brand admits they're not perfect, that actually makes me trust them more. Weird, right?", attribution: 'James, 28' }
        ]
      },
      {
        id: 'theme-2',
        topic: 'Value vs. Price',
        sentiment: 'neutral',
        summary: 'Cost remains important but participants were willing to pay more for perceived quality and alignment with values.',
        quotes: [
          { text: "Cheap isn't always the answer. I've learned that lesson too many times.", attribution: 'Maria, 41' },
          { text: "If I understand WHY something costs more, I'm usually okay with it.", attribution: 'Kevin, 25' }
        ]
      },
      {
        id: 'theme-3',
        topic: 'Community Matters',
        sentiment: 'positive',
        summary: 'Word-of-mouth and community validation emerged as more influential than traditional advertising.',
        quotes: [
          { text: "My sister's recommendation is worth more than any billboard. She has no reason to lie.", attribution: 'Lisa, 36' },
          { text: "I check Reddit before I buy anything. Real people, real opinions.", attribution: 'Alex, 23' }
        ]
      }
    ],
    createdAt: new Date()
  }
}

// ============================================================================
// LEGACY API - Backwards compatibility with existing code
// ============================================================================

export function isQualitativeQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase()
  const qualKeywords = [
    '#focus-group', 'focus group', 'focus-group', 'qualitative', 'qual research',
    'in-depth interview', 'in depth interview', 'depth interview', 'idis',
    'ethnography', 'ethnographic', '/qual', '/focus-group', 'exploratory research',
    'open-ended', 'why do they', 'understand why', 'explore their feelings',
    'attitudes and perceptions', 'deep dive into motivations',
  ]
  return qualKeywords.some(keyword => lowerQuery.includes(keyword))
}

/**
 * Legacy function - converts AgentResult to ResearchResult for backwards compatibility
 */
export async function generateResearchData(
  userQuery: string,
  currentCanvas: Canvas | null = null
): Promise<ResearchResult> {
  const agentResult = await generateResearchWithAgent(userQuery, currentCanvas)

  // Handle clarification - for legacy, return a minimal result
  if (agentResult.type === 'clarification' && agentResult.clarification) {
    return {
      type: 'quantitative',
      audienceName: 'Clarification Needed',
      audienceId: 'clarification',
      explanation: agentResult.clarification.missing_info,
      processSteps: ['Analyzing query', 'Identifying missing information'],
      report: {
        type: 'quantitative',
        title: 'Clarification Needed',
        abstract: agentResult.clarification.missing_info,
        segments: [],
        questions: [],
        themes: []
      }
    }
  }

  // Get first canvas (for legacy single-canvas support)
  const canvas = agentResult.canvases?.[0]
  if (!canvas) {
    // Fallback
    return generateQuantitativeFallback(userQuery)
  }

  return {
    type: canvas.type === 'qualitative' ? 'qualitative' : 'quantitative',
    audienceName: canvas.audience.name,
    audienceId: canvas.audience.id,
    explanation: agentResult.explanation || `Research completed for ${canvas.audience.name}`,
    processSteps: agentResult.processSteps || SURVEY_PROCESS_STEPS,
    report: {
      type: canvas.type,
      title: canvas.title,
      abstract: canvas.abstract,
      segments: canvas.questions[0]?.segments || [],
      questions: canvas.questions.map(q => ({
        question: q.question,
        options: q.options
      })),
      themes: canvas.themes
    }
  }
}

function generateQuantitativeFallback(query: string): ResearchResult {
  return {
    type: 'quantitative',
    audienceName: 'General Population',
    audienceId: 'gen-pop',
    explanation: "I couldn't access live data, so I've generated a preliminary report based on general trends.",
    processSteps: SURVEY_PROCESS_STEPS,
    report: {
      type: 'quantitative',
      title: `Research Report: ${query}`,
      abstract: `This is a generated report estimating public sentiment and trends regarding "${query}". Data is synthetic and for illustrative purposes.`,
      segments: [],
      questions: [
        {
          question: 'Key factors driving this trend?',
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

// Helper to extract a simple title from query text
function extractSimpleTitle(query: string): string {
  // Remove @ mentions and / commands, clean up
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

// Check if a response looks like an error message rather than a title
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

// Generate a concise title for a conversation query
export async function generateConversationTitle(query: string): Promise<string> {
  console.log('[Merlin] Generating title for query...')

  // If query is empty or very short, use fallback
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

      // Validate: check if it looks like an error response
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
