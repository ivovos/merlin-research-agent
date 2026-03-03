import { useReducer, useMemo, useCallback } from 'react'
import type { SurveyType, Stimulus, SurveyQuestion, Survey } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'

// ── Init config (passed from CreateSurveyModal → SurveyBuilder → hook) ──

export interface BuilderInitConfig {
  mode: 'scratch' | 'template' | 'import'
  surveyType: SurveyType
  templateKey?: string
  questions?: SurveyQuestion[]
}

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
  // ── Disney+ Audiences ──
  {
    id: 'disney-uk-subscribers', name: 'UK Subscribers', size: 6200, description: 'Active Disney+ subscribers in the United Kingdom',
    segments: [
      { id: 'disney-uk-subscribers:premium', name: 'Premium (Ad-Free)', size: 2480 },
      { id: 'disney-uk-subscribers:standard', name: 'Standard (Ad-Supported)', size: 2790 },
      { id: 'disney-uk-subscribers:basic', name: 'Basic / Mobile-Only', size: 930 },
    ],
  },
  {
    id: 'disney-us-subscribers', name: 'US Subscribers', size: 12400, description: 'Active Disney+ subscribers in the United States',
    segments: [
      { id: 'disney-us-subscribers:premium', name: 'Premium (Ad-Free)', size: 4340 },
      { id: 'disney-us-subscribers:standard', name: 'Standard (Ad-Supported)', size: 5580 },
      { id: 'disney-us-subscribers:bundle', name: 'Disney Bundle (Hulu + ESPN)', size: 2480 },
    ],
  },
  {
    id: 'disney-family-viewers', name: 'Family Viewers', size: 5800, description: 'Households streaming Disney+ with children under 12',
    segments: [
      { id: 'disney-family-viewers:young-kids', name: 'Young Kids (Under 6)', size: 1740 },
      { id: 'disney-family-viewers:primary', name: 'Primary Age (6-11)', size: 2030 },
      { id: 'disney-family-viewers:tweens', name: 'Tweens (12-15)', size: 1160 },
      { id: 'disney-family-viewers:multi-gen', name: 'Multi-Generational', size: 870 },
    ],
  },
  {
    id: 'disney-adult-drama-fans', name: 'Adult Drama Fans', size: 3400, description: 'Subscribers who primarily watch drama and prestige content',
    segments: [
      { id: 'disney-adult-drama-fans:prestige', name: 'Prestige Drama Viewers', size: 1190 },
      { id: 'disney-adult-drama-fans:crime', name: 'Crime & Thriller Fans', size: 1020 },
      { id: 'disney-adult-drama-fans:limited', name: 'Limited Series Watchers', size: 680 },
      { id: 'disney-adult-drama-fans:international', name: 'International Content Seekers', size: 510 },
    ],
  },
  {
    id: 'disney-premium-tier', name: 'Premium Tier', size: 4100, description: 'Ad-free premium subscribers',
    segments: [
      { id: 'disney-premium-tier:loyal', name: 'Long-Term Loyal (2+ years)', size: 1640 },
      { id: 'disney-premium-tier:high-view', name: 'High-Viewership (20+ hrs/mo)', size: 1230 },
      { id: 'disney-premium-tier:recent', name: 'Recent Upgraders', size: 820 },
      { id: 'disney-premium-tier:low-view', name: 'Low-Viewership Premium', size: 410 },
    ],
  },
  {
    id: 'disney-ad-supported', name: 'Ad-Supported Tier', size: 7200, description: 'Subscribers on the ad-supported plan',
    segments: [
      { id: 'disney-ad-supported:price-sensitive', name: 'Price-Sensitive Viewers', size: 2880 },
      { id: 'disney-ad-supported:casual', name: 'Casual / Light Viewers', size: 2160 },
      { id: 'disney-ad-supported:potential-upgrade', name: 'Potential Upgraders', size: 1440 },
      { id: 'disney-ad-supported:trialists', name: 'Recent Trialists', size: 720 },
    ],
  },
  {
    id: 'disney-marvel-star-wars', name: 'Marvel / Star Wars Fans', size: 4800, description: 'Subscribers driven by franchise content',
    segments: [
      { id: 'disney-marvel-star-wars:marvel', name: 'Marvel-First Viewers', size: 2160 },
      { id: 'disney-marvel-star-wars:sw', name: 'Star Wars-First Viewers', size: 1440 },
      { id: 'disney-marvel-star-wars:both', name: 'Cross-Franchise Fans', size: 960 },
      { id: 'disney-marvel-star-wars:casual', name: 'Casual Franchise Viewers', size: 240 },
    ],
  },
  {
    id: 'disney-churn-risk', name: 'Churn Risk', size: 2900, description: 'Low-engagement subscribers at risk of cancelling',
    segments: [
      { id: 'disney-churn-risk:low-engage', name: 'Low Engagement (<2 hrs/mo)', size: 1160 },
      { id: 'disney-churn-risk:price', name: 'Price-Driven Churn', size: 870 },
      { id: 'disney-churn-risk:content', name: 'Content Gap Dissatisfied', size: 580 },
      { id: 'disney-churn-risk:competitor', name: 'Competitor Lured', size: 290 },
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
  if (!type) return ['audience']
  const config = SURVEY_TYPE_CONFIGS.find(c => c.key === type)
  const steps: BuilderStepId[] = ['audience']
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
  | { type: 'INIT_FROM_STUDY'; payload: Survey }
  | { type: 'INIT_FROM_CONFIG'; payload: BuilderInitConfig }

// ── Initial state ──

const initialState: BuilderState = {
  surveyName: '',
  selectedType: null,
  flowSteps: ['audience'],
  currentStepIndex: 0,
  audienceMode: null,
  selectedAudiences: [],
  stimuli: [],
  questionSourceTab: 'import',
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
      // Allow navigating to any step — needed for edit mode where all steps are pre-filled
      return { ...state, currentStepIndex: targetIndex }
    }

    case 'RESET':
      return initialState

    case 'INIT_FROM_STUDY': {
      const study = action.payload
      const surveyType = study.type as SurveyType
      const flowSteps = computeFlowSteps(surveyType)
      const hasSegments = study.audiences.some(id => id.includes(':'))

      return {
        ...initialState,
        surveyName: study.name,
        selectedType: surveyType,
        flowSteps,
        currentStepIndex: flowSteps.length - 1, // go to review step
        audienceMode: hasSegments ? 'multi' : 'single',
        selectedAudiences: study.audiences,
        stimuli: [], // stimuli IDs can't be resolved back to full objects
        questions: study.questions,
      }
    }

    case 'INIT_FROM_CONFIG': {
      const config = action.payload
      const flowSteps = computeFlowSteps(config.surveyType)
      return {
        ...initialState,
        selectedType: config.surveyType,
        flowSteps,
        currentStepIndex: 0,
        questions: config.questions ?? [],
        selectedTemplate: config.templateKey ?? null,
        questionSourceTab: config.mode === 'import' ? 'import'
          : config.mode === 'template' ? 'templates'
          : 'scratch',
      }
    }

    default:
      return state
  }
}

// ── Hook ──

export function useSurveyBuilder(initialStudy?: Survey, initialConfig?: BuilderInitConfig) {
  const [state, dispatch] = useReducer(
    builderReducer,
    { initialStudy, initialConfig },
    ({ initialStudy: study, initialConfig: config }) => {
      if (study) return builderReducer(initialState, { type: 'INIT_FROM_STUDY', payload: study })
      if (config) return builderReducer(initialState, { type: 'INIT_FROM_CONFIG', payload: config })
      return initialState
    },
  )

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
