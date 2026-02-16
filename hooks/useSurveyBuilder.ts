import { useReducer, useMemo, useCallback } from 'react'
import type { SurveyType, Stimulus, SurveyQuestion } from '@/types'
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

export type QuestionSourceTab = 'import' | 'templates' | 'scratch'

export interface BuilderState {
  surveyName: string
  selectedType: SurveyType | null
  flowSteps: BuilderStepId[]
  currentStepIndex: number
  audienceMode: 'single' | 'multi' | null
  selectedAudiences: string[]
  stimuli: Stimulus[]
  // Question builder state (new inline-card model)
  questionSourceTab: QuestionSourceTab
  editingQuestionIndex: number          // -1 = none expanded
  showQuestionErrors: boolean
  selectedTemplate: string | null
  importBriefText: string
  importBriefUploaded: boolean
  importBriefExtracted: boolean
  questions: SurveyQuestion[]
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

function isChoiceType(type: string): boolean {
  return ['single_select', 'multi_select', 'single_choice', 'multiple_choice', 'ranking'].includes(type)
}

function computeStepValidity(state: BuilderState): Record<BuilderStepId, boolean> {
  const questionsValid = state.questions.length > 0 && state.questions.every(q => {
    if (!q.text.trim()) return false
    // Choice-based types need at least 2 non-empty options
    if (isChoiceType(q.type) && (!q.options || q.options.filter(o => o.trim()).length < 2)) return false
    return true
  })

  return {
    type: state.selectedType !== null,
    audience: state.selectedAudiences.length > 0,
    stimulus: state.stimuli.length > 0,
    questions: questionsValid,
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
  // Question builder actions (inline-card model)
  | { type: 'SET_QUESTION_SOURCE_TAB'; payload: QuestionSourceTab }
  | { type: 'SET_EDITING_QUESTION_INDEX'; payload: number }
  | { type: 'SET_SHOW_QUESTION_ERRORS'; payload: boolean }
  | { type: 'SELECT_TEMPLATE'; payload: string }
  | { type: 'RESET_TEMPLATE' }
  | { type: 'SET_IMPORT_BRIEF_TEXT'; payload: string }
  | { type: 'SET_IMPORT_BRIEF_UPLOADED'; payload: boolean }
  | { type: 'EXTRACT_FROM_BRIEF'; payload: SurveyQuestion[] }
  | { type: 'CLOSE_QUESTION_EDITOR' }
  | { type: 'ADD_QUESTION'; payload: SurveyQuestion }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; updates: Partial<SurveyQuestion> } }
  | { type: 'REMOVE_QUESTION'; payload: string }
  | { type: 'REORDER_QUESTIONS'; payload: SurveyQuestion[] }
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
  questionSourceTab: 'templates',
  editingQuestionIndex: -1,
  showQuestionErrors: false,
  selectedTemplate: null,
  importBriefText: '',
  importBriefUploaded: false,
  importBriefExtracted: false,
  questions: [],
}

// ── Reducer ──

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, surveyName: action.payload }

    case 'SELECT_TYPE': {
      const newFlowSteps = computeFlowSteps(action.payload)
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
        const audienceIds = state.selectedAudiences
          .filter(id => !id.includes(':'))
          .slice(0, 1)
        return { ...state, audienceMode: action.payload, selectedAudiences: audienceIds }
      }
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
        return {
          ...state,
          selectedAudiences: state.selectedAudiences.filter(id => !allSegIds.includes(id)),
        }
      } else {
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

    // ── Question builder actions (inline-card model) ──

    case 'SET_QUESTION_SOURCE_TAB':
      return {
        ...state,
        questionSourceTab: action.payload,
        selectedTemplate: null,
        importBriefExtracted: false,
        editingQuestionIndex: -1,
        showQuestionErrors: false,
      }

    case 'SET_EDITING_QUESTION_INDEX':
      return { ...state, editingQuestionIndex: action.payload }

    case 'SET_SHOW_QUESTION_ERRORS':
      return { ...state, showQuestionErrors: action.payload }

    case 'SELECT_TEMPLATE':
      return { ...state, selectedTemplate: action.payload }

    case 'RESET_TEMPLATE':
      return {
        ...state,
        selectedTemplate: null,
        questions: [],
        editingQuestionIndex: -1,
        showQuestionErrors: false,
      }

    case 'SET_IMPORT_BRIEF_TEXT':
      return { ...state, importBriefText: action.payload }

    case 'SET_IMPORT_BRIEF_UPLOADED':
      return { ...state, importBriefUploaded: action.payload }

    case 'EXTRACT_FROM_BRIEF':
      return {
        ...state,
        questions: action.payload,
        importBriefExtracted: true,
        editingQuestionIndex: -1,
      }

    case 'CLOSE_QUESTION_EDITOR':
      return { ...state, editingQuestionIndex: -1 }

    case 'ADD_QUESTION': {
      const newQuestions = [...state.questions, action.payload]
      return {
        ...state,
        questions: newQuestions,
        editingQuestionIndex: newQuestions.length - 1,
      }
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
      // If editing the removed question, close editor
      const removedIndex = state.questions.findIndex(q => q.id === action.payload)
      const editingIdx = state.editingQuestionIndex === removedIndex
        ? -1
        : state.editingQuestionIndex > removedIndex
          ? state.editingQuestionIndex - 1
          : state.editingQuestionIndex
      return { ...state, questions: filtered, editingQuestionIndex: editingIdx }
    }

    case 'REORDER_QUESTIONS':
      return { ...state, questions: action.payload, editingQuestionIndex: -1 }

    case 'GENERATE_QUESTIONS':
      return {
        ...state,
        questions: action.payload,
        editingQuestionIndex: -1,
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
