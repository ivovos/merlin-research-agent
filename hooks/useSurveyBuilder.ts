import { useReducer, useMemo, useCallback } from 'react'
import type { SurveyType, QuestionType, Stimulus, SurveyQuestion } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'

// ── Step IDs ──

export type BuilderStepId = 'type' | 'audience' | 'stimulus' | 'questions'

export const STEP_LABELS: Record<BuilderStepId, string> = {
  type: 'Survey Type',
  audience: 'Audience',
  stimulus: 'Stimulus',
  questions: 'Questions',
}

// ── Audience data (mock) ──

export interface BuilderAudience {
  id: string
  name: string
  size: number
  description: string
}

export const MOCK_AUDIENCES: BuilderAudience[] = [
  { id: 'uk-grocery', name: 'UK Grocery Shoppers', size: 300, description: 'Regular grocery buyers in the UK' },
  { id: 'us-health', name: 'US Health-Conscious', size: 500, description: 'Health-focused consumers in the US' },
  { id: 'uk-young-urban', name: 'UK Young Urban', size: 250, description: 'Urban dwellers aged 18-35 in the UK' },
  { id: 'b2b-decision', name: 'B2B Decision Makers', size: 200, description: 'Senior business decision makers' },
  { id: 'uk-parents', name: 'UK Parents', size: 300, description: 'Parents with children under 16 in the UK' },
]

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
  return steps
}

// ── Step validation ──

function computeStepValidity(state: BuilderState): Record<BuilderStepId, boolean> {
  return {
    type: state.selectedType !== null,
    audience: state.selectedAudiences.length > 0,
    stimulus: state.stimuli.length > 0,
    questions: state.questions.length > 0 && state.questions.every(q => q.text.trim().length > 0),
  }
}

// ── Actions ──

export type BuilderAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SELECT_TYPE'; payload: SurveyType }
  | { type: 'SET_AUDIENCE_MODE'; payload: 'single' | 'multi' }
  | { type: 'TOGGLE_AUDIENCE'; payload: string }
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
      return {
        ...state,
        audienceMode: action.payload,
        selectedAudiences: action.payload === 'single' ? state.selectedAudiences.slice(0, 1) : state.selectedAudiences,
      }
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
