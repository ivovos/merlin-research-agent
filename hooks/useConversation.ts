import { useState, useCallback } from 'react'
import type { Conversation, Message, ProcessStep, Canvas, Audience } from '@/types'
import { initialProcessSteps, mockAudience } from '@/data/mockData'

// Generate a unique ID
const generateId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const createInitialConversation = (): Conversation => ({
  id: generateId(),
  query: '',
  messages: [],
  audience: mockAudience,
  processSteps: initialProcessSteps || [],
  thinkingTime: 0,
  explanation: '',
  canvas: null,
  status: 'idle',
})

export interface UseConversationReturn {
  conversation: Conversation
  setConversation: React.Dispatch<React.SetStateAction<Conversation>>
  // Actions
  startNewConversation: () => Conversation
  setQuery: (query: string) => void
  setAudience: (audience: Audience) => void
  addMessage: (message: Message) => void
  setStatus: (status: Conversation['status']) => void
  setProcessSteps: (steps: ProcessStep[]) => void
  updateProcessStep: (stepId: string, updates: Partial<ProcessStep>) => void
  setCanvas: (canvas: Canvas | null) => void
  setThinkingTime: (time: number) => void
  setExplanation: (explanation: string) => void
  resetConversation: () => void
}

export function useConversation(
  initialConversation?: Conversation
): UseConversationReturn {
  const [conversation, setConversation] = useState<Conversation>(
    initialConversation || createInitialConversation()
  )

  const startNewConversation = useCallback(() => {
    const newConv = createInitialConversation()
    setConversation(newConv)
    return newConv
  }, [])

  const setQuery = useCallback((query: string) => {
    setConversation((prev) => ({ ...prev, query }))
  }, [])

  const setAudience = useCallback((audience: Audience) => {
    setConversation((prev) => ({ ...prev, audience }))
  }, [])

  const addMessage = useCallback((message: Message) => {
    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }))
  }, [])

  const setStatus = useCallback((status: Conversation['status']) => {
    setConversation((prev) => ({ ...prev, status }))
  }, [])

  const setProcessSteps = useCallback((steps: ProcessStep[]) => {
    setConversation((prev) => ({ ...prev, processSteps: steps }))
  }, [])

  const updateProcessStep = useCallback(
    (stepId: string, updates: Partial<ProcessStep>) => {
      setConversation((prev) => ({
        ...prev,
        processSteps: prev.processSteps.map((step) =>
          step.id === stepId ? { ...step, ...updates } : step
        ),
      }))
    },
    []
  )

  const setCanvas = useCallback((canvas: Canvas | null) => {
    setConversation((prev) => ({ ...prev, canvas }))
  }, [])

  const setThinkingTime = useCallback((thinkingTime: number) => {
    setConversation((prev) => ({ ...prev, thinkingTime }))
  }, [])

  const setExplanation = useCallback((explanation: string) => {
    setConversation((prev) => ({ ...prev, explanation }))
  }, [])

  const resetConversation = useCallback(() => {
    setConversation(createInitialConversation())
  }, [])

  return {
    conversation,
    setConversation,
    startNewConversation,
    setQuery,
    setAudience,
    addMessage,
    setStatus,
    setProcessSteps,
    updateProcessStep,
    setCanvas,
    setThinkingTime,
    setExplanation,
    resetConversation,
  }
}
