import type { SurveyQuestion, Finding, QuestionType } from '@/types'

/**
 * Generates realistic mock findings from survey builder questions.
 * Used when a survey is "launched" to immediately show placeholder results.
 */
export function generateMockFindings(
  questions: SurveyQuestion[],
  hasMultipleSegments: boolean = false,
): Finding[] {
  return questions
    .filter(q => canGenerateFinding(q.type))
    .map((q, i) => generateFinding(q, i, hasMultipleSegments))
}

/** Question types that produce visual findings (excludes open_text, video_response, etc.) */
function canGenerateFinding(type: QuestionType): boolean {
  const chartableTypes: QuestionType[] = [
    'single_select', 'multi_select', 'likert', 'scale', 'ranking',
    'nps', 'matrix', 'image_choice', 'rating', 'yes_no', 'slider',
    'semantic_differential', 'paired_comparison', 'maxdiff',
  ]
  return chartableTypes.includes(type)
}

function generateFinding(
  q: SurveyQuestion,
  _index: number,
  hasMultipleSegments: boolean,
): Finding {
  const options = getEffectiveOptions(q)
  const values = generateRealisticValues(options.length, q.type)
  const topIdx = values.indexOf(Math.max(...values))
  const topOption = options[topIdx]
  const topValue = values[topIdx]

  const chartType = hasMultipleSegments ? 'grouped_bar' as const : 'bar' as const

  const chartData = hasMultipleSegments
    ? options.map((name, i) => ({
        name,
        'Segment A': values[i],
        'Segment B': Math.max(5, values[i] + randomInt(-15, 10)),
      }))
    : options.map((name, i) => ({
        name,
        value: values[i],
      }))

  const segmentBreakdowns = hasMultipleSegments
    ? [
        { segmentName: 'Segment A', value: topValue, label: 'Primary' },
        { segmentName: 'Segment B', value: Math.max(5, topValue + randomInt(-15, 5)) },
      ]
    : undefined

  return {
    questionId: q.id,
    questionText: q.text,
    headline: generateHeadline(topValue, topOption, q),
    insight: generateInsight(q, topOption, topValue, options, values),
    chartType,
    chartData,
    segmentBreakdowns,
    editable: true,
  }
}

/** Get display options for a question, synthesising defaults if none provided */
function getEffectiveOptions(q: SurveyQuestion): string[] {
  if (q.options && q.options.length > 0) return q.options

  // Synthesise default options based on question type
  switch (q.type) {
    case 'likert':
      return q.scale
        ? generateScaleLabels(q.scale)
        : ['Strongly disagree', 'Disagree', 'Neither', 'Agree', 'Strongly agree']
    case 'nps':
      return ['Detractors (0-6)', 'Passives (7-8)', 'Promoters (9-10)']
    case 'yes_no':
      return ['Yes', 'No', 'Not sure']
    case 'rating':
      return ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']
    case 'scale':
    case 'slider':
      return ['Very Low', 'Low', 'Medium', 'High', 'Very High']
    default:
      return ['Option A', 'Option B', 'Option C', 'Option D']
  }
}

function generateScaleLabels(scale: { min: number; max: number; minLabel?: string; maxLabel?: string }): string[] {
  const labels: string[] = []
  const count = scale.max - scale.min + 1
  for (let i = 0; i < count; i++) {
    if (i === 0 && scale.minLabel) labels.push(scale.minLabel)
    else if (i === count - 1 && scale.maxLabel) labels.push(scale.maxLabel)
    else labels.push(`${scale.min + i}`)
  }
  return labels
}

/** Generate plausible percentage values that sum roughly to 100 */
function generateRealisticValues(count: number, type: QuestionType): number[] {
  if (type === 'nps') {
    // NPS has a typical distribution
    const detractors = randomInt(15, 30)
    const passives = randomInt(25, 40)
    const promoters = 100 - detractors - passives
    return [detractors, passives, promoters]
  }

  if (type === 'yes_no') {
    const yes = randomInt(40, 75)
    const no = randomInt(15, Math.max(16, 100 - yes - 5))
    return [yes, no, 100 - yes - no]
  }

  // For likert/scale: create a distribution skewed toward positive
  const raw = Array.from({ length: count }, () => Math.random())
  // Skew toward later options (positive end)
  const skewed = raw.map((v, i) => v * (1 + i * 0.3))
  const sum = skewed.reduce((a, b) => a + b, 0)
  return skewed.map(v => Math.round((v / sum) * 100))
}

function generateHeadline(topValue: number, topOption: string, q: SurveyQuestion): string {
  if (q.type === 'nps') return `NPS score of +${randomInt(15, 45)}`
  if (q.type === 'yes_no') return `${topValue}% said "${topOption}"`
  if (q.type === 'likert' || q.type === 'rating' || q.type === 'scale') {
    return `${topValue}% chose "${topOption}"`
  }
  return `${topValue}% selected "${topOption}"`
}

function generateInsight(
  _q: SurveyQuestion,
  topOption: string,
  topValue: number,
  options: string[],
  values: number[],
): string {
  const sortedPairs = options
    .map((o, i) => ({ name: o, value: values[i] }))
    .sort((a, b) => b.value - a.value)

  const runner = sortedPairs.length > 1 ? sortedPairs[1] : null
  const trailing = sortedPairs[sortedPairs.length - 1]

  let insight = `"${topOption}" leads with ${topValue}% of respondents. `

  if (runner) {
    insight += `"${runner.name}" follows at ${runner.value}%. `
  }

  if (trailing && trailing.name !== topOption) {
    insight += `"${trailing.name}" trails at ${trailing.value}%, `
    insight += `suggesting it resonates less with the target audience. `
  }

  insight += `These results indicate clear differentiation among the options presented.`

  return insight
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
