/**
 * Thinking Steps Generator
 *
 * Generates context-aware "thinking" steps that reflect what the agent is
 * actually doing for each specific query. These replace the hardcoded
 * per-tool steps with dynamic labels that match the research context.
 *
 * Used in two places:
 * 1. ProcessSteps component — animated progress during live execution
 * 2. ThinkingSection in AIMessage — collapsed "Thought for Xs" with expandable steps
 */

import { anthropic } from './api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThinkingStepsResult {
  planningSteps: string[]   // 2–3 steps shown during the planning phase
  executionSteps: string[]  // 4–7 steps shown during execution
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const THINKING_STEPS_PROMPT = `You are a thinking-steps generator for Merlin, a synthetic research agent. Your job is to produce the animated "thinking" labels that the user sees while the agent is working.

These steps appear in two phases:

## PHASE 1 — Planning steps (2–3 short labels)
Shown while the agent is analysing the query, selecting a method, and designing the study. These should reflect what the agent is actually reasoning about for THIS specific query.

## PHASE 2 — Execution steps (4–7 short labels)
Shown while the study is running. These should feel like realistic research activities that match the chosen method, audience, and topic.

## RULES

1. Each step must be a short present-participle phrase (e.g. "Recruiting 500 Gen Z respondents", not "Recruit respondents")
2. Steps must be SPECIFIC to the query — mention the actual audience, topic, method, segments, or stimulus where relevant
3. Planning steps should cover: understanding the question, identifying the audience/segments, choosing the method, and (if applicable) checking for stimulus material
4. Execution steps should cover: the realistic research activities for the chosen method (recruiting, fielding, analysing, etc.)
5. If the query involves segments/comparisons, mention the segment names in the steps
6. If the query involves stimulus (creative, messaging, concepts), reference the stimulus in the steps
7. If the query is a follow-up to previous research, acknowledge that context (e.g. "Building on previous findings...")
8. Keep each label under 50 characters — they need to fit in a small UI element
9. Don't use generic filler — every step should feel purposeful and specific

## EXAMPLES

### Query: "Do Gen Z prefer sustainable packaging?"
Planning:
- Parsing research question
- Targeting Gen Z consumers
- Selecting survey methodology

Execution:
- Designing sustainability questionnaire
- Recruiting 500 Gen Z respondents
- Fielding survey on packaging attitudes
- Cleaning and validating responses
- Running statistical analysis
- Generating insights on preferences

### Query: "Compare iPhone vs Android users on app spending"
Planning:
- Analysing comparison request
- Creating iPhone & Android segments
- Selecting comparative survey

Execution:
- Designing app spending questionnaire
- Recruiting iPhone user sample
- Recruiting Android user sample
- Collecting parallel responses
- Normalising cross-segment data
- Running comparative analysis
- Highlighting key differences

### Query: "Run a focus group on how parents choose schools"
Planning:
- Parsing qualitative research brief
- Targeting parents with school-age children
- Selecting focus group methodology

Execution:
- Designing discussion guide
- Recruiting 12 parent participants
- Moderating group discussions
- Transcribing 6+ hours of dialogue
- Coding emerging themes
- Synthesising key insights

### Query: "Test these three ad creatives with millennials" (stimulus in context)
Planning:
- Reviewing uploaded ad creatives
- Targeting millennial audience
- Selecting creative testing method

Execution:
- Preparing 3 creative variants for testing
- Recruiting 500 millennial respondents
- Randomising creative exposure
- Measuring recall and appeal
- Scoring emotional resonance per variant
- Ranking creative effectiveness

### Query: "Why did they prefer option B?" (follow-up to prior results)
Planning:
- Reviewing previous study findings
- Focusing on Option B preference drivers
- Selecting targeted follow-up survey

Execution:
- Designing follow-up questionnaire
- Re-engaging previous respondent pool
- Probing motivations behind preference
- Analysing open-ended responses
- Identifying key decision drivers
- Mapping preference rationale

## OUTPUT FORMAT

Return a JSON object with exactly two arrays:
{
  "planningSteps": ["step 1", "step 2", "step 3"],
  "executionSteps": ["step 1", "step 2", "step 3", "step 4", "step 5", "step 6"]
}

Planning steps: 2–3 items.
Execution steps: 4–7 items.
No markdown, no explanation — just the JSON object.`

// ---------------------------------------------------------------------------
// Generator function
// ---------------------------------------------------------------------------

export async function generateThinkingSteps(
  userQuery: string,
  toolName: string,
  toolInput: Record<string, unknown>,
  context?: {
    hasExistingFindings?: boolean
    hasStimulusInContext?: boolean
    audienceMentioned?: string
    isFollowUp?: boolean
  }
): Promise<ThinkingStepsResult> {
  // Build a concise context summary for the LLM
  const contextParts: string[] = []
  contextParts.push(`Query: "${userQuery}"`)
  contextParts.push(`Selected tool: ${toolName}`)

  if (toolInput.audience) contextParts.push(`Audience: ${toolInput.audience}`)
  if (toolInput.segments) contextParts.push(`Segments: ${(toolInput.segments as string[]).join(', ')}`)
  if (toolInput.research_question) contextParts.push(`Research question: ${toolInput.research_question}`)
  if (toolInput.sample_size) contextParts.push(`Sample size: ${toolInput.sample_size}`)

  const questions = toolInput.questions as Array<{ question: string }> | undefined
  if (questions?.length) contextParts.push(`${questions.length} survey questions designed`)

  if (context?.hasExistingFindings) contextParts.push('Context: This is a follow-up — previous findings exist in the conversation')
  if (context?.hasStimulusInContext) contextParts.push('Context: Stimulus material (creative/messaging/concepts) is already in the conversation')
  if (context?.isFollowUp) contextParts.push('Context: This is a follow-up question to previous research')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: THINKING_STEPS_PROMPT,
      messages: [{
        role: 'user',
        content: contextParts.join('\n'),
      }],
    })

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('')

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ThinkingStepsResult
      // Validate shape
      if (
        Array.isArray(parsed.planningSteps) && parsed.planningSteps.length >= 2 &&
        Array.isArray(parsed.executionSteps) && parsed.executionSteps.length >= 4
      ) {
        return parsed
      }
    }

    // Fallback to defaults if parsing fails
    return getFallbackSteps(toolName, toolInput)
  } catch (error) {
    console.error('[ThinkingSteps] Generation failed, using fallback:', error)
    return getFallbackSteps(toolName, toolInput)
  }
}

// ---------------------------------------------------------------------------
// Fallback (used if LLM call fails — keeps current behaviour as safety net)
// ---------------------------------------------------------------------------

function getFallbackSteps(
  toolName: string,
  toolInput: Record<string, unknown>,
): ThinkingStepsResult {
  const audience = (toolInput.audience as string) || 'target audience'
  const segments = toolInput.segments as string[] | undefined

  const planningSteps = [
    'Analysing your question',
    'Selecting research methodology',
  ]

  switch (toolName) {
    case 'run_focus_group':
      return {
        planningSteps: [...planningSteps, `Targeting ${audience}`],
        executionSteps: [
          'Designing discussion guide',
          `Recruiting 12 ${audience} participants`,
          'Moderating focus group sessions',
          'Transcribing discussions',
          'Coding and categorising themes',
          'Synthesising key insights',
        ],
      }

    case 'run_comparison':
      return {
        planningSteps: [...planningSteps, `Creating ${segments?.join(' & ') || 'comparison'} segments`],
        executionSteps: [
          'Defining comparison segments',
          'Recruiting matched samples',
          'Collecting parallel responses',
          'Normalising cross-segment data',
          'Running comparative analysis',
          'Highlighting key differences',
        ],
      }

    case 'run_heatmap':
      return {
        planningSteps: [...planningSteps, `Targeting ${audience}`],
        executionSteps: [
          'Setting up attention tracking',
          `Recruiting 200+ ${audience} participants`,
          'Recording gaze-tracking sessions',
          'Processing attention data',
          'Generating heat intensity maps',
          'Identifying engagement hotspots',
        ],
      }

    case 'run_sentiment_analysis':
      return {
        planningSteps: [...planningSteps, `Targeting ${audience}`],
        executionSteps: [
          'Defining sentiment topics',
          'Collecting brand mentions',
          'Running NLP sentiment analysis',
          'Categorising emotional drivers',
          'Scoring sentiment by topic',
          'Mapping perception landscape',
        ],
      }

    case 'run_message_testing':
      return {
        planningSteps: [...planningSteps, `Targeting ${audience}`],
        executionSteps: [
          'Preparing message variants',
          `Recruiting ${audience}`,
          'A/B testing message exposure',
          'Measuring comprehension & recall',
          'Scoring emotional resonance',
          'Ranking message effectiveness',
        ],
      }

    default: // run_survey
      return {
        planningSteps: segments?.length
          ? [...planningSteps, `Creating ${segments.join(' & ')} segments`]
          : [...planningSteps, `Targeting ${audience}`],
        executionSteps: [
          'Designing survey questionnaire',
          `Recruiting 500+ ${audience} respondents`,
          'Collecting responses',
          'Cleaning and validating data',
          'Running statistical analysis',
          'Generating insights report',
        ],
      }
  }
}
