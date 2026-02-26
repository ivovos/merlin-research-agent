import { anthropic } from './api'
import type { Canvas } from '@/types'
import type { ResearchToolName } from './tools'
import { createStudyPlan } from './toolSelector'
import {
  normalizeOptions,
  normalizeComparisonOptions,
  generateFallbackSurveyCanvas,
  generateFallbackFocusGroupCanvas,
  generateFallbackComparisonCanvas,
} from './canvasGenerator'

// ---------------------------------------------------------------------------
// JSON schemas for structured output
// ---------------------------------------------------------------------------

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
          title: { type: 'string', description: 'Concise 3-7 word insight header like "Primary purchase drivers" or "Brand perception"' },
          question: { type: 'string', description: 'The actual survey question asked, e.g., "What are the primary factors that drive your purchase decisions?"' },
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
        required: ['title', 'question', 'options']
      }
    }
  },
  required: ['title', 'abstract', 'audience', 'sample_size', 'questions']
}

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
          topic: { type: 'string', description: 'Standalone 2-4 word section header like "The Trust Factor" (NOT truncated or verbose)' },
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

// ---------------------------------------------------------------------------
// Tool router
// ---------------------------------------------------------------------------

export async function executeResearchTool(
  toolName: ResearchToolName,
  toolInput: Record<string, unknown>,
  originalQuery: string
): Promise<Canvas | null> {
  const audience = (toolInput.audience as string) || 'General Population'
  const researchQuestion = (toolInput.research_question as string) || originalQuery
  const segments = (toolInput.segments as string[] | undefined)

  let canvas: Canvas | null = null

  switch (toolName) {
    case 'run_survey':
      canvas = await executeSurveyTool(audience, researchQuestion, segments)
      break

    case 'run_focus_group':
      canvas = await executeFocusGroupTool(audience, researchQuestion)
      break

    case 'run_comparison': {
      const comparisonSegments = segments || ['Group A', 'Group B']
      canvas = await executeComparisonTool(comparisonSegments, researchQuestion)
      break
    }

    case 'run_heatmap':
    case 'run_sentiment_analysis':
      console.log(`[Merlin Agent] ${toolName} not fully implemented, falling back to survey`)
      canvas = await executeSurveyTool(audience, researchQuestion)
      break

    default:
      console.log(`[Merlin Agent] Unknown tool: ${toolName}`)
      return null
  }

  // Attach study plan to canvas
  if (canvas) {
    const questionsForForm = canvas.questions.map(q => ({
      questionText: q.question,
      questionType: 'single-choice',
      answerOptions: q.options.map(opt => opt.label)
    }))

    canvas.studyPlan = createStudyPlan(toolName, {
      ...toolInput,
      research_question: researchQuestion,
      audience,
      questions: questionsForForm
    })
  }

  return canvas
}

// ---------------------------------------------------------------------------
// Survey tool
// ---------------------------------------------------------------------------

async function executeSurveyTool(audience: string, researchQuestion: string, segments?: string[]): Promise<Canvas> {
  if (segments && segments.length > 1) {
    return executeComparisonSurveyTool(audience, researchQuestion, segments)
  }

  console.log(`[Merlin Agent] Executing survey for: ${audience}`)

  const surveyPrompt = `Generate realistic survey results for the following:
Audience: ${audience}
Research Question: ${researchQuestion}

Guidelines:
- Generate 3 specific, measurable questions with clear options
- IMPORTANT: Each question has TWO text fields:
  1. "title": A concise 3-7 word insight header (e.g., "Primary purchase drivers", "Brand perception")
  2. "question": The actual survey question that was asked (e.g., "What are the primary factors that drive your purchase decisions?")
- Use realistic percentages (avoid round numbers, use values like 42.8%, 17.3%)
- Reflect real-world trends and knowledge
- Ensure percentages in each question sum to approximately 100%
- Make the title catchy and direct
- Write a 2-sentence abstract summarizing key findings`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
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

      let questionsArray: any[] = []
      if (typeof result.questions === 'string') {
        try {
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
        title: q.title || '',
        question: q.question || q.title || '',
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

  return generateFallbackSurveyCanvas(audience, researchQuestion)
}

// ---------------------------------------------------------------------------
// Comparison survey tool
// ---------------------------------------------------------------------------

async function executeComparisonSurveyTool(audience: string, researchQuestion: string, segments: string[]): Promise<Canvas> {
  console.log(`[Merlin Agent] Executing comparison survey for segments: ${segments.join(' vs ')}`)

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
            title: { type: 'string', description: 'Concise 3-7 word insight header like "Primary purchase drivers"' },
            question: { type: 'string', description: 'The actual survey question asked' },
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
          required: ['title', 'question', 'options']
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
- IMPORTANT: Each question has TWO text fields:
  1. "title": A concise 3-7 word insight header (e.g., "Primary purchase drivers", "Brand preference split")
  2. "question": The actual survey question that was asked (e.g., "What are the primary factors that drive your purchase decisions?")
- For each question option, provide a percentage for EACH segment: ${segments.join(', ')}
- Example option format: {"label": "Option A", ${segments.map(s => `"${s}": 45.2`).join(', ')}}
- Use realistic percentages (avoid round numbers, use values like 42.8%, 17.3%)
- Show meaningful differences between segments where appropriate
- Percentages for each segment should sum to approximately 100% within each question
- Make the title highlight the comparison
- Write a 2-sentence abstract summarizing key differences between segments`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
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

      const questions = questionsArray.map((q: any, idx: number) => ({
        id: `q${idx + 1}`,
        title: q.title || '',
        question: q.question || q.title || '',
        respondents: (result.sample_size_per_segment || 500) * segments.length,
        segments: segments,
        options: normalizeComparisonOptions(q.options, segments)
      }))

      console.log('[Merlin Agent] Processed comparison questions:', questions.length, questions)

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

  return generateFallbackComparisonCanvas(audience, researchQuestion, segments)
}

// ---------------------------------------------------------------------------
// Focus group tool
// ---------------------------------------------------------------------------

async function executeFocusGroupTool(audience: string, researchQuestion: string): Promise<Canvas> {
  console.log(`[Merlin Agent] Executing focus group for: ${audience}`)

  const focusGroupPrompt = `Generate realistic focus group insights for the following:
Audience: ${audience}
Research Question: ${researchQuestion}

Guidelines:
- Generate 3-4 distinct themes that emerged from discussion
- IMPORTANT: Each theme topic must be a STANDALONE HEADER (2-4 words)
  - Good: "The Trust Factor", "Price vs Value", "Brand Loyalty Crisis"
  - Bad: "What participants think about..." or truncated text
  - Think "section title" that makes sense on its own
- Match sentiment to the emotional tone (positive, negative, neutral, mixed)
- Write one compelling sentence summary per theme
- Include 2-3 realistic, conversational quotes per theme
- Use natural speech patterns, include filler words and emotions
- Attribution format: "Name, Age" (e.g., "Sarah, 34")
- Make quotes feel authentic and varied`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
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

  return generateFallbackFocusGroupCanvas(audience, researchQuestion)
}

// ---------------------------------------------------------------------------
// Comparison tool (segment-overlay approach)
// ---------------------------------------------------------------------------

async function executeComparisonTool(segments: string[], researchQuestion: string): Promise<Canvas> {
  console.log(`[Merlin Agent] Executing comparison for: ${segments.join(' vs ')}`)

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
      model: 'claude-sonnet-4-6',
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

      const questionsWithSegments = (Array.isArray(result.questions) ? result.questions : []).map((q, idx) => {
        const normalizedOpts = normalizeOptions(q.options)
        return {
          id: `q${idx + 1}`,
          title: (q as any).title || '',
          question: q.question || (q as any).title || '',
          respondents: result.sample_size || 500,
          segments,
          options: normalizedOpts.map(opt => {
            const basePercentage = opt.percentage
            const segmentData: Record<string, number> = {}
            segments.forEach((seg, i) => {
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

  return generateFallbackSurveyCanvas(segments.join(' vs '), researchQuestion)
}
