/**
 * Research Generator — Thin orchestrator
 *
 * Coordinates the research pipeline:
 *   selectTool → executeResearchTool → return result
 *
 * Heavy lifting lives in:
 *   - toolSelector.ts   (tool selection, study plans, process steps)
 *   - toolExecutor.ts   (API calls, schema definitions)
 *   - canvasGenerator.ts (fallback canvases, normalizers)
 */

import { anthropic } from './api'
import type { Canvas, ClarificationRequest, AgentResult } from '@/types'
import { researchTools, type ResearchToolName } from './tools'
import { AGENT_SYSTEM_PROMPT, getAgentPromptWithContext } from './agentPrompt'

import {
  createStudyPlan,
  getProcessStepsForTool,
  detectComparisonSegments,
  COMPARISON_PROCESS_STEPS,
  type ToolSelectionResult,
} from './toolSelector'

import { executeResearchTool } from './toolExecutor'
import { generateFallbackComparisonCanvas } from './canvasGenerator'

// Re-export public API from sub-modules so existing consumers keep working
export { selectResearchTool, generateConversationTitle } from './toolSelector'
export type { ToolSelectionResult } from './toolSelector'

// ---------------------------------------------------------------------------
// Legacy interface for backwards compatibility
// ---------------------------------------------------------------------------

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
      title?: string
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

// ---------------------------------------------------------------------------
// Phase 2: Execute the selected research tool
// ---------------------------------------------------------------------------

export async function executeSelectedTool(
  selection: ToolSelectionResult,
  userQuery: string
): Promise<AgentResult> {
  console.log(`[Merlin Agent] Phase 2 - Executing tool: ${selection.toolName}`)

  try {
    const canvas = await executeResearchTool(
      selection.toolName as ResearchToolName,
      selection.toolInput,
      userQuery
    )

    if (!canvas) {
      return executeToolAsSurvey(userQuery, 'General Population')
    }

    return {
      type: 'single_canvas',
      canvases: [canvas],
      processSteps: selection.processSteps,
      explanation: generateResultsIntroduction(canvas)
    }
  } catch (error) {
    console.error('[Merlin Agent] Tool execution error:', error)
    return executeToolAsSurvey(userQuery, 'General Population')
  }
}

// ---------------------------------------------------------------------------
// Full agent flow (legacy single-call path)
// ---------------------------------------------------------------------------

export async function generateResearchWithAgent(
  userQuery: string,
  currentCanvas: Canvas | null = null
): Promise<AgentResult> {
  console.log(`[Merlin Agent] Processing query: "${userQuery}"`)

  try {
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

    const toolCalls = toolSelectionResponse.content.filter(block => block.type === 'tool_use')

    if (toolCalls.length === 0) {
      console.log('[Merlin Agent] No tool selected, treating as generic survey')
      return executeToolAsSurvey(userQuery, 'General Population')
    }

    const results: Canvas[] = []
    const usedTools: string[] = []
    let clarification: ClarificationRequest | undefined

    for (const toolCall of toolCalls) {
      if (toolCall.type !== 'tool_use') continue

      const toolName = toolCall.name as ResearchToolName
      const toolInput = toolCall.input as Record<string, unknown>

      console.log(`[Merlin Agent] Selected tool: ${toolName}`, toolInput)

      if (toolName === 'ask_clarification') {
        clarification = {
          type: 'clarification',
          missing_info: (toolInput.missing_info as string) || 'More information needed',
          reason: toolInput.reason as string | undefined,
          suggestions: (toolInput.suggestions as string[]) || []
        }
        break
      }

      const canvas = await executeResearchTool(toolName, toolInput, userQuery)
      if (canvas) {
        results.push(canvas)
        usedTools.push(toolName)
      }
    }

    if (clarification) {
      return { type: 'clarification', clarification }
    }

    if (results.length === 0) {
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

    const detectedSegments = detectComparisonSegments(userQuery)
    if (detectedSegments.length >= 2) {
      console.log('[Merlin Agent] Detected comparison query in fallback, segments:', detectedSegments)
      const canvas = generateFallbackComparisonCanvas('General Population', userQuery, detectedSegments)
      canvas.studyPlan = createStudyPlan('run_comparison', {
        audience: 'General Population',
        research_question: userQuery,
        segments: detectedSegments
      })
      return {
        type: 'single_canvas',
        canvases: [canvas],
        processSteps: COMPARISON_PROCESS_STEPS,
        explanation: `Comparison research completed for ${detectedSegments.join(' vs ')}`
      }
    }

    return executeToolAsSurvey(userQuery, 'General Population')
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateResultsIntroduction(canvas: Canvas): string {
  const audience = canvas.audience.name
  const respondents = canvas.respondents

  if (canvas.type === 'qualitative') {
    return `Here's what ${respondents} participants from ${audience} shared. The key themes reveal some interesting patterns.`
  }

  return `Based on responses from ${respondents} people in ${audience}, here are the key findings.`
}

async function executeToolAsSurvey(query: string, audience: string): Promise<AgentResult> {
  const canvas = await executeResearchTool('run_survey', {
    audience,
    research_question: query,
  }, query)

  const finalCanvas = canvas!
  finalCanvas.studyPlan = createStudyPlan('run_survey', {
    audience,
    research_question: query
  })

  return {
    type: 'single_canvas',
    canvases: [finalCanvas],
    processSteps: getProcessStepsForTool('run_survey'),
    explanation: `Survey research completed for ${audience}`
  }
}

// ---------------------------------------------------------------------------
// Legacy API — backwards compatibility
// ---------------------------------------------------------------------------

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

export async function generateResearchData(
  userQuery: string,
  currentCanvas: Canvas | null = null
): Promise<ResearchResult> {
  const agentResult = await generateResearchWithAgent(userQuery, currentCanvas)

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

  const canvas = agentResult.canvases?.[0]
  if (!canvas) {
    return generateQuantitativeFallback(userQuery)
  }

  return {
    type: canvas.type === 'qualitative' ? 'qualitative' : 'quantitative',
    audienceName: canvas.audience.name,
    audienceId: canvas.audience.id,
    explanation: agentResult.explanation || `Research completed for ${canvas.audience.name}`,
    processSteps: agentResult.processSteps || getProcessStepsForTool('run_survey'),
    report: {
      type: canvas.type,
      title: canvas.title,
      abstract: canvas.abstract,
      segments: canvas.questions[0]?.segments || [],
      questions: canvas.questions.map(q => ({
        title: q.title,
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
    processSteps: getProcessStepsForTool('run_survey'),
    report: {
      type: 'quantitative',
      title: `Research Report: ${query}`,
      abstract: `This is a generated report estimating public sentiment and trends regarding "${query}". Data is synthetic and for illustrative purposes.`,
      segments: [],
      questions: [
        {
          title: 'Key trend drivers',
          question: 'What are the key factors driving this trend?',
          options: [
            { label: 'Cost / Pricing', percentage: 42.4 },
            { label: 'Quality & Reliability', percentage: 28.7 },
            { label: 'Brand Reputation', percentage: 18.2 },
            { label: 'Availability', percentage: 10.7 },
          ],
        },
        {
          title: 'Sentiment change',
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
          title: 'Future adoption outlook',
          question: 'What is the future outlook and adoption likelihood?',
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
