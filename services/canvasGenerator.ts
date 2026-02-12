import type { Canvas } from '@/types'
import { parsePercentage } from '@/lib/parseUtils'

// ---------------------------------------------------------------------------
// Option normalizers
// ---------------------------------------------------------------------------

/**
 * Normalize options - convert object to array if needed.
 * Handles cases where API returns { "Gen Z": 45, "Millennials": 55 }
 * instead of [{ label: "Gen Z", percentage: 45 }, ...]
 * Also handles percentage values as strings like "37.2%"
 */
export function normalizeOptions(options: unknown): Array<{ label: string; percentage: number }> {
  if (Array.isArray(options)) {
    return options.filter(opt => opt && typeof opt === 'object' && 'label' in opt).map(opt => ({
      label: String(opt.label || ''),
      percentage: parsePercentage(opt.percentage)
    }))
  }

  if (options && typeof options === 'object') {
    return Object.entries(options).map(([label, value]) => ({
      label,
      percentage: parsePercentage(value)
    }))
  }

  return []
}

/**
 * Normalize options for comparison surveys - handles segment percentage data
 */
export function normalizeComparisonOptions(options: unknown, segments: string[]): Array<{ label: string; [key: string]: string | number }> {
  if (!Array.isArray(options)) return []

  return options.filter(opt => opt && typeof opt === 'object' && 'label' in opt).map(opt => {
    const normalized: { label: string; [key: string]: string | number } = {
      label: String(opt.label || '')
    }

    for (const segment of segments) {
      const value = opt[segment]
      normalized[segment] = parsePercentage(value)
    }

    return normalized
  })
}

// ---------------------------------------------------------------------------
// Fallback canvas generators
// ---------------------------------------------------------------------------

export function generateFallbackSurveyCanvas(audience: string, query: string): Canvas {
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
        title: 'Primary decision factors',
        question: 'What are the primary factors that influence your decision?',
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
        title: 'Overall sentiment',
        question: 'How would you describe your overall sentiment?',
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
        title: 'Recommendation likelihood',
        question: 'How likely are you to recommend this to others?',
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

export function generateFallbackFocusGroupCanvas(audience: string, query: string): Canvas {
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

export function generateFallbackComparisonCanvas(audience: string, researchQuestion: string, segments: string[]): Canvas {
  console.log('[Merlin Agent] Using fallback comparison canvas')

  const mockQuestions = [
    {
      id: 'q1',
      title: 'Preference comparison',
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
