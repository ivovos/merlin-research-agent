import type { Canvas, QuestionResult, QualitativeTheme } from '@/types/canvas'
import type { Finding, SegmentBreakdown } from '@/types/survey'
import { parsePercentage } from './parseUtils'

/**
 * Convert a Canvas (from research generation) into Finding[] (for FindingsCanvas).
 * Quantitative: each QuestionResult becomes one Finding.
 * Qualitative: each QualitativeTheme becomes one Finding.
 */
export function canvasToFindings(canvas: Canvas): Finding[] {
  // Qualitative canvas — convert themes to findings
  if (canvas.type === 'qualitative' && canvas.themes && canvas.themes.length > 0) {
    return canvas.themes.map((theme) => themeToFinding(theme))
  }

  if (!canvas.questions || canvas.questions.length === 0) return []

  return canvas.questions.map((q) => {
    const hasSegments = q.segments && q.segments.length > 0
    const sortedOptions = normalizeAndSort(q)
    const topOption = sortedOptions[0]

    return {
      questionId: q.id,
      questionText: q.question,
      headline: generateHeadline(q, topOption),
      insight: generateInsight(q, canvas),
      chartType: hasSegments ? 'grouped_bar' as const : 'bar' as const,
      chartData: transformChartData(q, sortedOptions),
      segmentBreakdowns: hasSegments ? extractSegmentBreakdowns(q, topOption) : undefined,
      editable: true,
    }
  })
}

/** Generate a headline from the top option, e.g. "67% chose Option A" */
function generateHeadline(q: QuestionResult, topOption?: { label: string; percentage: number }): string {
  // If the question has a title field, use it as-is (it's already a headline)
  if (q.title) return q.title

  if (!topOption || !topOption.label) return 'Results'

  const pct = Math.round(topOption.percentage)
  return `${pct}% ${topOption.label}`
}

/** Generate an insight narrative from the canvas abstract and question */
function generateInsight(q: QuestionResult, canvas: Canvas): string {
  // Use the canvas abstract as a base, or generate a generic insight
  if (canvas.abstract && canvas.questions.length === 1) {
    return canvas.abstract
  }

  const opts = normalizeAndSort(q)
  if (opts.length < 2) return `Based on ${q.respondents} respondents.`

  const top = opts[0]
  const second = opts[1]
  const gap = Math.round(top.percentage - second.percentage)

  return `"${top.label}" leads at ${Math.round(top.percentage)}%, ${gap > 0 ? `${gap}pp ahead of` : 'tied with'} "${second.label}" (${Math.round(second.percentage)}%). Based on ${q.respondents} respondents.`
}

/** Normalize QuestionOption[] and sort by percentage descending */
function normalizeAndSort(q: QuestionResult): Array<{ label: string; percentage: number; [key: string]: unknown }> {
  const opts = q.options
  if (!Array.isArray(opts)) return []

  return opts
    .filter(opt => opt && typeof opt.label === 'string')
    .map(opt => ({
      ...opt,
      label: String(opt.label),
      percentage: parsePercentage(opt.percentage),
    }))
    .sort((a, b) => b.percentage - a.percentage)
}

/** Transform QuestionOption[] → chartData compatible with FindingChart */
function transformChartData(
  q: QuestionResult,
  sortedOptions: Array<{ label: string; percentage: number; [key: string]: unknown }>
): Record<string, unknown>[] {
  const hasSegments = q.segments && q.segments.length > 0

  if (hasSegments) {
    // For multi-segment: { name: "Option A", segmentKey1: 45, segmentKey2: 55 }
    return sortedOptions.map(opt => {
      const row: Record<string, unknown> = { name: opt.label }
      q.segments!.forEach(seg => {
        row[seg] = parsePercentage(opt[seg])
      })
      return row
    })
  }

  // Single-segment: { name: "Option A", value: 67 }
  return sortedOptions.map(opt => ({
    name: opt.label,
    value: Math.round(opt.percentage),
  }))
}

/** Extract segment breakdowns from the top option */
function extractSegmentBreakdowns(
  q: QuestionResult,
  topOption?: { label: string; percentage: number; [key: string]: unknown }
): SegmentBreakdown[] | undefined {
  if (!q.segments || !topOption) return undefined

  return q.segments.map(seg => ({
    segmentName: seg,
    value: parsePercentage(topOption[seg]),
    label: topOption.label,
  }))
}

// ---------------------------------------------------------------------------
// Qualitative theme → Finding conversion
// ---------------------------------------------------------------------------

const SENTIMENT_LABELS: Record<string, string> = {
  positive: 'Positive',
  negative: 'Negative',
  neutral: 'Neutral',
  mixed: 'Mixed',
}

/** Convert a QualitativeTheme into a Finding for display in FindingCard */
function themeToFinding(theme: QualitativeTheme): Finding {
  return {
    questionId: theme.id,
    headline: theme.topic,
    insight: theme.summary,
    chartType: 'qualitative' as const,
    chartData: theme.quotes.map((q, i) => ({
      name: q.attribution,
      quote: q.text,
      index: i,
    })),
    editable: true,
    sourceQuote: theme.quotes[0]
      ? { text: theme.quotes[0].text, attribution: theme.quotes[0].attribution }
      : undefined,
  }
}
