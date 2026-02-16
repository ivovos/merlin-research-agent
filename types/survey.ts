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
  chartType: 'bar' | 'stacked_bar' | 'radar' | 'table' | 'heatmap' | 'line' | 'grouped_bar'
  chartData: Record<string, unknown>[]
  segmentBreakdowns?: SegmentBreakdown[]
  editable: boolean
  percentile?: number
  normValue?: number
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
