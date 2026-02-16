import { useReducer, useMemo } from 'react'
import type { SurveyQuestion } from '@/types'
import { QUICK_POLL_AUDIENCES, type QuickPollAudience } from './quickPollAudiences'

// ── Helpers ──

function createEmptyQuestion(): SurveyQuestion {
  return {
    id: crypto.randomUUID(),
    type: 'single_select',
    text: '',
    options: ['Option 1', 'Option 2', 'Option 3'],
    required: true,
  }
}

export function isQuestionComplete(q: SurveyQuestion): boolean {
  if (!q.text.trim()) return false
  if (['single_select', 'multi_select', 'single_choice', 'multiple_choice', 'ranking'].includes(q.type)) {
    if (!q.options || q.options.filter(o => o.trim()).length < 2) return false
  }
  return true
}

// ── State ──

export interface QuickPollState {
  selectedAudienceId: string
  questions: SurveyQuestion[]
  editingIndex: number
  showErrors: boolean
}

const initialState: QuickPollState = {
  selectedAudienceId: 'uk-pop',
  questions: [createEmptyQuestion()],
  editingIndex: 0,
  showErrors: false,
}

// ── Actions ──

type QuickPollAction =
  | { type: 'SELECT_AUDIENCE'; payload: string }
  | { type: 'ADD_QUESTION' }
  | { type: 'DELETE_QUESTION'; payload: number }
  | { type: 'UPDATE_QUESTION'; payload: { index: number; updates: Partial<SurveyQuestion> } }
  | { type: 'SET_EDITING_INDEX'; payload: number }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'SHOW_ERRORS' }

// ── Reducer ──

function quickPollReducer(state: QuickPollState, action: QuickPollAction): QuickPollState {
  switch (action.type) {
    case 'SELECT_AUDIENCE':
      return { ...state, selectedAudienceId: action.payload }

    case 'ADD_QUESTION': {
      const newQ = createEmptyQuestion()
      return {
        ...state,
        questions: [...state.questions, newQ],
        editingIndex: state.questions.length,
      }
    }

    case 'DELETE_QUESTION': {
      const idx = action.payload
      const filtered = state.questions.filter((_, i) => i !== idx)

      // If we deleted the last question, auto-create a new one
      if (filtered.length === 0) {
        return {
          ...state,
          questions: [createEmptyQuestion()],
          editingIndex: 0,
        }
      }

      // Adjust editingIndex
      let newEditingIndex = state.editingIndex
      if (state.editingIndex === idx) {
        newEditingIndex = -1
      } else if (state.editingIndex > idx) {
        newEditingIndex = state.editingIndex - 1
      }

      return { ...state, questions: filtered, editingIndex: newEditingIndex }
    }

    case 'UPDATE_QUESTION': {
      const { index, updates } = action.payload
      const questions = state.questions.map((q, i) =>
        i === index ? { ...q, ...updates } : q,
      )
      return { ...state, questions }
    }

    case 'SET_EDITING_INDEX':
      return { ...state, editingIndex: action.payload }

    case 'CLOSE_EDITOR':
      return { ...state, editingIndex: -1 }

    case 'SHOW_ERRORS':
      return { ...state, showErrors: true }

    default:
      return state
  }
}

// ── Hook ──

export function useQuickPoll() {
  const [state, dispatch] = useReducer(quickPollReducer, initialState)

  const selectedAudience: QuickPollAudience | undefined = useMemo(
    () => QUICK_POLL_AUDIENCES.find(a => a.id === state.selectedAudienceId),
    [state.selectedAudienceId],
  )

  const validQuestionCount = useMemo(
    () => state.questions.filter(isQuestionComplete).length,
    [state.questions],
  )

  const totalQuestionCount = state.questions.length

  const allQuestionsComplete = validQuestionCount === totalQuestionCount && totalQuestionCount > 0

  const canLaunch = allQuestionsComplete && !!selectedAudience

  return {
    state,
    dispatch,
    selectedAudience,
    validQuestionCount,
    totalQuestionCount,
    allQuestionsComplete,
    canLaunch,
  }
}
