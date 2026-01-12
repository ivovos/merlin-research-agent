import { anthropic } from './api'
import type { Report } from '@/types'

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
1. **Qualitative (Focus Group)**: If query contains "#focus-group" or asks for qualitative insights/focus group.
   - Set "type": "qualitative".
   - "respondents": Small number (8-15).
   - Generate "themes" array instead of "questions".
2. **Quantitative (Survey)**: Default behavior.
   - Set "type": "quantitative".
   - "respondents": Large number (100+).
   - Generate "questions" array.

**CRITICAL: AUDIENCE SEGMENTATION LOGIC**
Analyze the user's request to determine the number of audience segments to visualize.
1. **Single Audience**: If the user asks about a general group (e.g., "What do teens like?", "Survey parents"), use a SINGLE segment.
   - Output 'segments': [] (empty array).
   - Each option should have: { "label": "string", "percentage": number }
2. **Comparison**: If the user asks to compare groups (e.g., "Teens vs Adults", "Compare UK and US"), use MULTIPLE segments.
   - Output 'segments': ["Teens", "Adults"].
   - Each option should have: { "label": "string", "Teens": number, "Adults": number }
   - You can have 2, 3, or more segments if requested.

**DATA REALISM GUIDELINES (STRICT):**
- **AVOID ROUND NUMBERS**: Do NOT use 50%, 25%, 10%, or 0% unless absolutely necessary.
- **USE NUANCED STATISTICS**: Use specific values like 42.8%, 17%, 87.3% to reflect real-world messiness.
- **REAL WORLD TRENDS**: Leverage your knowledge base to approximate *actual* market stats.
- **AVOID PERFECT SPLITS**: Never generate a 50/50 split. Always show a clear winner or a realistic distribution.

1. **Identify the Audience**: Extract or infer the target audience.
2. **Process Steps**: Generate 5 specific, technical research steps relevant to this query. **CRITICAL**: Keep step labels extremely concise (max 3-5 words) and action-oriented.
3. **Research Report**: Create a synthetic report that directly answers the user's question.
    - Title: Catchy and direct.
    - Summary: Concise (1-2 sentences).

    **IF QUALITATIVE**:
    - "themes": 3 distinct themes.
      - "topic": Short title.
      - "sentiment": "positive" | "negative" | "neutral" | "mixed".
      - "summary": 1 sentence description.
      - "quotes": 2 realistic quotes from participants.

    **IF QUANTITATIVE**:
    - "questions": 3 specific questions with plausible data.

4. **Explanation**: A one-sentence summary of the methodology and key finding.

Output strictly valid JSON matching this structure:
{
  "type": "quantitative" | "qualitative" | "update",
  "audienceName": "string",
  "audienceId": "string (slug)",
  "processSteps": ["step1", "step2", "step3", "step4", "step5"],
  "explanation": "string",
  "report": {
    "title": "string",
    "abstract": "string",
    "segments": [],
    "questions": [
      {
        "question": "What is your primary concern?",
        "options": [
          { "label": "Cost", "percentage": 42.3 },
          { "label": "Quality", "percentage": 31.8 }
        ]
      }
    ],
    "themes": []
  }
}

CRITICAL: For quantitative reports, EVERY question MUST have an "options" array with 3-6 options.`

function getSystemPromptWithContext(currentReport: Report | null, userQuery: string): string {
  if (!currentReport) return SYSTEM_PROMPT

  return `${SYSTEM_PROMPT}

CURRENT REPORT CONTEXT:
${JSON.stringify(currentReport, null, 2)}
The user is asking a follow-up question: "${userQuery}".
DECISION LOGIC:
- DEFAULT to creating a NEW report for follow-up questions to maintain history. Set "type": "new".
- ONLY if the user explicitly asks to UPDATE, MODIFY, or CHANGE the existing report, then set "type": "update".`
}

function generateQualitativeFallback(query: string): ResearchResult {
  return {
    type: 'qualitative',
    audienceName: 'Target Audience',
    audienceId: 'audience',
    explanation: 'Generated qualitative insights based on focus group simulation.',
    processSteps: [
      'Designing discussion guide',
      'Recruiting panel',
      'Moderating focus group',
      'Transcribing sessions',
      'Coding themes',
      'Synthesizing insights',
    ],
    report: {
      type: 'qualitative',
      title: `Focus Group Insights: ${query.replace('#focus-group', '').trim()}`,
      abstract:
        'Participants engaged in a lively discussion about the topic, revealing deep-seated values and conflicting priorities.',
      segments: [],
      questions: [],
      themes: [
        {
          id: 'theme-1',
          topic: 'Core Values',
          sentiment: 'positive',
          summary: 'Participants consistently prioritized authenticity and transparency.',
          quotes: [
            {
              text: "I just want brands to be real with me. If you messed up, own it.",
              attribution: 'Participant 3',
            },
            {
              text: "It's not about being perfect, it's about being honest.",
              attribution: 'Participant 7',
            },
          ],
        },
        {
          id: 'theme-2',
          topic: 'Barriers to Adoption',
          sentiment: 'negative',
          summary: 'Cost remains a significant barrier, but trust is the bigger issue.',
          quotes: [
            { text: "It's too expensive for what it is.", attribution: 'Participant 1' },
            { text: "I don't trust them with my data.", attribution: 'Participant 5' },
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
  return query.includes('#focus-group') || query.toLowerCase().includes('focus group')
}

export async function generateResearchData(
  userQuery: string,
  currentReport: Report | null = null
): Promise<ResearchResult> {
  const isQualitative = isQualitativeQuery(userQuery)

  // Immediate bypass for focus groups - skip API for robustness
  if (isQualitative) {
    console.log('Qualitative query detected, using synthetic generator.')
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return generateQualitativeFallback(userQuery)
  }

  try {
    // 8-second timeout for snappier experience
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('API Timeout')), 8000)
    )

    const systemPrompt = getSystemPromptWithContext(currentReport, userQuery)

    const apiCall = anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userQuery }],
    })

    const response = await Promise.race([apiCall, timeoutPromise])

    if (response.content && response.content[0]?.type === 'text') {
      const text = response.content[0].text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ResearchResult
      }
      return JSON.parse(text) as ResearchResult
    }
    throw new Error('Invalid API response format')
  } catch (error) {
    console.warn('Claude generation failed or timed out, generating smart fallback.', error)

    if (isQualitative) {
      return generateQualitativeFallback(userQuery)
    }
    return generateQuantitativeFallback(userQuery)
  }
}
