import { useReducer, useMemo, useCallback } from 'react'
import type { SurveyType, QuestionType, Stimulus, SurveyQuestion } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'

// ── Step IDs ──

export type BuilderStepId = 'type' | 'audience' | 'stimulus' | 'questions' | 'review'

export const STEP_LABELS: Record<BuilderStepId, string> = {
  type: 'Survey Type',
  audience: 'Audience',
  stimulus: 'Stimulus',
  questions: 'Questions',
  review: 'Review & Launch',
}

// ── Audience data (mock) ──

export interface BuilderSegment {
  id: string    // format: "audienceId:slug"
  name: string
  size: number
}

export interface BuilderAudience {
  id: string
  name: string
  size: number
  description: string
  segments?: BuilderSegment[]
}

export const MOCK_AUDIENCES: BuilderAudience[] = [
  {
    id: 'uk-grocery', name: 'UK Grocery Shoppers', size: 300, description: 'Regular grocery buyers in the UK',
    segments: [
      { id: 'uk-grocery:budget-families', name: 'Budget-Conscious Families', size: 85 },
      { id: 'uk-grocery:premium-organic', name: 'Premium & Organic Buyers', size: 70 },
      { id: 'uk-grocery:online-first', name: 'Online-First Shoppers', size: 55 },
      { id: 'uk-grocery:bulk-buyers', name: 'Weekly Bulk Buyers', size: 50 },
      { id: 'uk-grocery:convenience', name: 'Convenience Shoppers', size: 40 },
    ],
  },
  {
    id: 'us-health', name: 'US Health-Conscious', size: 500, description: 'Health-focused consumers in the US',
    segments: [
      { id: 'us-health:fitness', name: 'Active Fitness Enthusiasts', size: 140 },
      { id: 'us-health:clean-label', name: 'Clean-Label Seekers', size: 120 },
      { id: 'us-health:weight-mgmt', name: 'Weight-Management Focused', size: 100 },
      { id: 'us-health:plant-based', name: 'Plant-Based & Vegan', size: 80 },
      { id: 'us-health:supplements', name: 'Supplement Shoppers', size: 60 },
    ],
  },
  {
    id: 'uk-young-urban', name: 'UK Young Urban', size: 250, description: 'Urban dwellers aged 18-35 in the UK',
    segments: [
      { id: 'uk-young-urban:trendsetters', name: 'Social-Media Trendsetters', size: 75 },
      { id: 'uk-young-urban:budget-renters', name: 'Budget-Savvy Renters', size: 70 },
      { id: 'uk-young-urban:career-pros', name: 'Career-Driven Professionals', size: 60 },
      { id: 'uk-young-urban:eco-conscious', name: 'Eco-Conscious Urbanites', size: 45 },
    ],
  },
  {
    id: 'b2b-decision', name: 'B2B Decision Makers', size: 200, description: 'Senior business decision makers',
    segments: [
      { id: 'b2b-decision:c-suite', name: 'C-Suite & Board Level', size: 50 },
      { id: 'b2b-decision:vp-director', name: 'VP & Director Level', size: 65 },
      { id: 'b2b-decision:procurement', name: 'Procurement & Ops Leads', size: 45 },
      { id: 'b2b-decision:it-digital', name: 'IT & Digital Transformation', size: 40 },
    ],
  },
  {
    id: 'uk-parents', name: 'UK Parents', size: 300, description: 'Parents with children under 16 in the UK',
    segments: [
      { id: 'uk-parents:under-5s', name: 'Parents of Under-5s', size: 80 },
      { id: 'uk-parents:primary', name: 'Primary School Parents (5-11)', size: 85 },
      { id: 'uk-parents:secondary', name: 'Secondary School Parents (12-16)', size: 70 },
      { id: 'uk-parents:single', name: 'Single Parents', size: 65 },
    ],
  },
]

// ── Audience helpers (used by AudienceStep, ReviewStep, etc.) ──

/** Extract unique parent audience IDs from selectedAudiences (works for both "uk-grocery" and "uk-grocery:slug" formats) */
export function getSelectedAudienceIds(selectedAudiences: string[]): string[] {
  const ids = new Set<string>()
  for (const id of selectedAudiences) {
    const colonIdx = id.indexOf(':')
    ids.add(colonIdx === -1 ? id : id.slice(0, colonIdx))
  }
  return Array.from(ids)
}

/** Compute total respondent count from selectedAudiences (handles both formats) */
export function getSelectedRespondentCount(selectedAudiences: string[]): number {
  const hasSegments = selectedAudiences.some(id => id.includes(':'))

  if (!hasSegments) {
    return MOCK_AUDIENCES
      .filter(a => selectedAudiences.includes(a.id))
      .reduce((sum, a) => sum + a.size, 0)
  }

  let total = 0
  for (const audience of MOCK_AUDIENCES) {
    for (const segment of audience.segments ?? []) {
      if (selectedAudiences.includes(segment.id)) {
        total += segment.size
      }
    }
  }
  return total
}

// ── Builder state ──

export interface BuilderState {
  surveyName: string
  selectedType: SurveyType | null
  flowSteps: BuilderStepId[]
  currentStepIndex: number
  audienceMode: 'single' | 'multi' | null
  selectedAudiences: string[]
  stimuli: Stimulus[]
  questionBuildMethod: 'ai' | 'manual' | 'template' | null
  questionBuildPhase: 'gateway' | 'editor'
  questions: SurveyQuestion[]
  activeQuestionId: string | null
}

// ── Flow computation ──

function computeFlowSteps(type: SurveyType | null): BuilderStepId[] {
  if (!type) return ['type']
  const config = SURVEY_TYPE_CONFIGS.find(c => c.key === type)
  const steps: BuilderStepId[] = ['type', 'audience']
  if (config?.needsStimulus) steps.push('stimulus')
  steps.push('questions')
  steps.push('review')
  return steps
}

// ── Step validation ──

function computeStepValidity(state: BuilderState): Record<BuilderStepId, boolean> {
  return {
    type: state.selectedType !== null,
    audience: state.selectedAudiences.length > 0,
    stimulus: state.stimuli.length > 0,
    questions: state.questions.length > 0 && state.questions.every(q => q.text.trim().length > 0),
    review: true,
  }
}

// ── Actions ──

export type BuilderAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SELECT_TYPE'; payload: SurveyType }
  | { type: 'SET_AUDIENCE_MODE'; payload: 'single' | 'multi' }
  | { type: 'TOGGLE_AUDIENCE'; payload: string }
  | { type: 'TOGGLE_SEGMENT'; payload: string }
  | { type: 'TOGGLE_ALL_SEGMENTS'; payload: string }
  | { type: 'ADD_STIMULUS'; payload: Stimulus }
  | { type: 'REMOVE_STIMULUS'; payload: string }
  | { type: 'SET_BUILD_METHOD'; payload: 'ai' | 'manual' | 'template' }
  | { type: 'SET_BUILD_PHASE'; payload: 'gateway' | 'editor' }
  | { type: 'ADD_QUESTION'; payload: SurveyQuestion }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; updates: Partial<SurveyQuestion> } }
  | { type: 'REMOVE_QUESTION'; payload: string }
  | { type: 'REORDER_QUESTIONS'; payload: SurveyQuestion[] }
  | { type: 'SET_ACTIVE_QUESTION'; payload: string | null }
  | { type: 'GENERATE_QUESTIONS'; payload: SurveyQuestion[] }
  | { type: 'GO_NEXT' }
  | { type: 'GO_BACK' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'RESET' }

// ── Initial state ──

const initialState: BuilderState = {
  surveyName: '',
  selectedType: null,
  flowSteps: ['type'],
  currentStepIndex: 0,
  audienceMode: null,
  selectedAudiences: [],
  stimuli: [],
  questionBuildMethod: null,
  questionBuildPhase: 'gateway',
  questions: [],
  activeQuestionId: null,
}

// ── Reducer ──

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, surveyName: action.payload }

    case 'SELECT_TYPE': {
      const newFlowSteps = computeFlowSteps(action.payload)
      // If switching to non-stimulus type, clear stimuli
      const config = SURVEY_TYPE_CONFIGS.find(c => c.key === action.payload)
      const stimuli = config?.needsStimulus ? state.stimuli : []
      return {
        ...state,
        selectedType: action.payload,
        flowSteps: newFlowSteps,
        stimuli,
      }
    }

    case 'SET_AUDIENCE_MODE': {
      if (action.payload === 'single') {
        // Clear segment IDs; keep at most one audience-level ID
        const audienceIds = state.selectedAudiences
          .filter(id => !id.includes(':'))
          .slice(0, 1)
        return { ...state, audienceMode: action.payload, selectedAudiences: audienceIds }
      }
      // Switching to multi — clear selections (user will re-select via segments)
      return { ...state, audienceMode: action.payload, selectedAudiences: [] }
    }

    case 'TOGGLE_AUDIENCE': {
      const id = action.payload
      if (state.audienceMode === 'single') {
        return { ...state, selectedAudiences: [id] }
      }
      const exists = state.selectedAudiences.includes(id)
      return {
        ...state,
        selectedAudiences: exists
          ? state.selectedAudiences.filter(a => a !== id)
          : [...state.selectedAudiences, id],
      }
    }

    case 'TOGGLE_SEGMENT': {
      const segId = action.payload
      const exists = state.selectedAudiences.includes(segId)
      return {
        ...state,
        selectedAudiences: exists
          ? state.selectedAudiences.filter(id => id !== segId)
          : [...state.selectedAudiences, segId],
      }
    }

    case 'TOGGLE_ALL_SEGMENTS': {
      const audienceId = action.payload
      const audience = MOCK_AUDIENCES.find(a => a.id === audienceId)
      if (!audience?.segments) return state

      const allSegIds = audience.segments.map(s => s.id)
      const allSelected = allSegIds.every(id => state.selectedAudiences.includes(id))

      if (allSelected) {
        // Deselect all segments for this audience
        return {
          ...state,
          selectedAudiences: state.selectedAudiences.filter(id => !allSegIds.includes(id)),
        }
      } else {
        // Select all segments (add any not already present)
        const newIds = allSegIds.filter(id => !state.selectedAudiences.includes(id))
        return {
          ...state,
          selectedAudiences: [...state.selectedAudiences, ...newIds],
        }
      }
    }

    case 'ADD_STIMULUS':
      return { ...state, stimuli: [...state.stimuli, action.payload] }

    case 'REMOVE_STIMULUS':
      return { ...state, stimuli: state.stimuli.filter(s => s.id !== action.payload) }

    case 'SET_BUILD_METHOD':
      return { ...state, questionBuildMethod: action.payload }

    case 'SET_BUILD_PHASE':
      return { ...state, questionBuildPhase: action.payload }

    case 'ADD_QUESTION': {
      const newQuestions = [...state.questions, action.payload]
      return { ...state, questions: newQuestions, activeQuestionId: action.payload.id }
    }

    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map(q =>
          q.id === action.payload.id ? { ...q, ...action.payload.updates } : q
        ),
      }

    case 'REMOVE_QUESTION': {
      const filtered = state.questions.filter(q => q.id !== action.payload)
      const activeId = state.activeQuestionId === action.payload
        ? (filtered[0]?.id ?? null)
        : state.activeQuestionId
      return { ...state, questions: filtered, activeQuestionId: activeId }
    }

    case 'REORDER_QUESTIONS':
      return { ...state, questions: action.payload }

    case 'SET_ACTIVE_QUESTION':
      return { ...state, activeQuestionId: action.payload }

    case 'GENERATE_QUESTIONS': {
      const questions = action.payload
      return {
        ...state,
        questions,
        activeQuestionId: questions[0]?.id ?? null,
        questionBuildPhase: 'editor',
      }
    }

    case 'GO_NEXT': {
      const validity = computeStepValidity(state)
      const currentStep = state.flowSteps[state.currentStepIndex]
      if (!validity[currentStep]) return state
      const nextIndex = Math.min(state.currentStepIndex + 1, state.flowSteps.length - 1)
      return { ...state, currentStepIndex: nextIndex }
    }

    case 'GO_BACK': {
      const prevIndex = Math.max(state.currentStepIndex - 1, 0)
      return { ...state, currentStepIndex: prevIndex }
    }

    case 'GO_TO_STEP': {
      // Only allow navigating to completed steps or current step
      const targetIndex = action.payload
      if (targetIndex < 0 || targetIndex >= state.flowSteps.length) return state
      if (targetIndex > state.currentStepIndex) return state
      return { ...state, currentStepIndex: targetIndex }
    }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

// ── Hook ──

export function useSurveyBuilder() {
  const [state, dispatch] = useReducer(builderReducer, initialState)

  const currentStep = state.flowSteps[state.currentStepIndex]
  const stepValidity = useMemo(() => computeStepValidity(state), [state])
  const canGoNext = stepValidity[currentStep]
  const canGoBack = state.currentStepIndex > 0
  const isLastStep = state.currentStepIndex === state.flowSteps.length - 1

  const goNext = useCallback(() => dispatch({ type: 'GO_NEXT' }), [])
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return {
    state,
    dispatch,
    currentStep,
    stepValidity,
    canGoNext,
    canGoBack,
    isLastStep,
    goNext,
    goBack,
    reset,
  }
}
