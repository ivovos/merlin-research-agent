import type { Canvas } from './canvas'

// ── Survey taxonomy ──

export type SurveyType =
  | 'simple'
  | 'concept'
  | 'message'
  | 'creative'
  | 'audience_exploration'

export type SurveyStatus = 'draft' | 'active' | 'completed'

// ── Question types (from interaction model) ──

export type QuestionType =
  | 'single_select'
  | 'multi_select'
  | 'likert'
  | 'scale'
  | 'open_text'
  | 'ranking'
  | 'maxdiff'
  | 'nps'
  | 'matrix'
  | 'image_choice'
  | 'semantic_differential'
  | 'rating'
  | 'yes_no'
  | 'slider'
  | 'heatmap'
  | 'video_response'
  | 'card_sort'
  | 'conjoint'
  | 'paired_comparison'

// ── Builder question types (simplified for builder UI) ──

export type BuilderQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'ranking'
  | 'open_text'
  | 'nps'
  | 'scale'

/** Map builder types to the existing QuestionType for downstream compatibility */
export const BUILDER_TO_SURVEY_TYPE: Record<BuilderQuestionType, QuestionType> = {
  single_choice: 'single_select',
  multiple_choice: 'multi_select',
  ranking: 'ranking',
  open_text: 'open_text',
  nps: 'nps',
  scale: 'scale',
}

// ── Stimulus material ──

export interface Stimulus {
  id: string
  type: 'image' | 'video' | 'text' | 'concept' | 'document'
  name: string
  url: string
  thumbnailUrl?: string
  description?: string
}

// ── Survey question ──

export interface SurveyQuestion {
  id: string
  type: QuestionType
  text: string
  options?: string[]
  required: boolean
  stimulusRef?: string
  aiSuggestion?: string
  scale?: {
    min: number
    max: number
    minLabel?: string
    maxLabel?: string
  }
}

// ── Segment breakdown within a finding ──

export interface SegmentBreakdown {
  segmentName: string
  value: number
  label?: string
}

// ── Per-question finding ──

export interface Finding {
  questionId: string
  questionText?: string
  headline: string
  insight: string
  chartType: 'bar' | 'stacked_bar' | 'radar' | 'table' | 'heatmap' | 'line' | 'grouped_bar' | 'qualitative'
  chartData: Record<string, unknown>[]
  segmentBreakdowns?: SegmentBreakdown[]
  editable: boolean
  percentile?: number
  normValue?: number
  /** IDs of stimuli this finding relates to (references Stimulus.id from project) */
  stimuliIds?: string[]
  /** AI-suggested conclusion, editable by user in the findings lightbox */
  conclusion?: string
  /** Timestamp when this finding was bookmarked/saved */
  savedAt?: number
  /** Optional verbatim quote from a respondent */
  sourceQuote?: {
    text: string
    attribution: string  // e.g. "Participant 3, Enterprise"
  }
}

// ── Survey ──

export interface Survey {
  id: string
  type: SurveyType
  name: string
  status: SurveyStatus
  questions: SurveyQuestion[]
  audiences: string[]
  stimuli: string[]
  findings?: Finding[]
  canvas?: Canvas
  createdAt: string
  updatedAt?: string
  methodology?: string
  sampleSize?: number
  fieldworkDuration?: string
}

// ── Survey Project ──

export interface SurveyProject {
  id: string
  name: string
  brand: string
  brandLogo?: string
  icon: string
  surveyType: SurveyType
  description?: string
  surveys: Survey[]
  stimuli: Stimulus[]
  audienceIds: string[]
  status: SurveyStatus
  createdAt: string
  updatedAt: string
  tags?: string[]
}

// ── Survey type configuration ──

export interface SurveyTypeConfig {
  key: SurveyType
  label: string
  description: string
  needsStimulus: boolean
  icon: string
}

export const SURVEY_TYPE_CONFIGS: SurveyTypeConfig[] = [
  { key: 'simple', label: 'Quick Poll', description: 'Fast feedback on a single topic or question', needsStimulus: false, icon: 'ClipboardList' },
  { key: 'audience_exploration', label: 'Audience Exploration', description: 'Deep-dive into audience attitudes and behaviours', needsStimulus: false, icon: 'Users' },
  { key: 'concept', label: 'Proposition Testing', description: 'Test product concepts, ideas, or propositions', needsStimulus: true, icon: 'Lightbulb' },
  { key: 'message', label: 'Message Testing', description: 'Test messaging, claims, and copy', needsStimulus: true, icon: 'MessageCircle' },
  { key: 'creative', label: 'Creative Testing', description: 'Test ads, designs, and creative assets', needsStimulus: true, icon: 'Image' },
]
