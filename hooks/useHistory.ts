import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Conversation } from '@/types'
import { mockHistory } from '@/data/mockData'

const HISTORY_KEY = 'merlin_history'

export interface UseHistoryReturn {
  history: Conversation[]
  addToHistory: (conversation: Conversation) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  updateInHistory: (id: string, updates: Partial<Conversation>) => void
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useLocalStorage<Conversation[]>(
    HISTORY_KEY,
    mockHistory
  )

  const addToHistory = useCallback(
    (conversation: Conversation) => {
      setHistory((prev) => {
        // Don't add empty conversations
        if (conversation.status === 'idle' && conversation.query === '') {
          return prev
        }
        // Check if already exists
        const exists = prev.some((c) => c.id === conversation.id)
        if (exists) {
          // Update existing
          return prev.map((c) =>
            c.id === conversation.id ? conversation : c
          )
        }
        // Add new at the beginning
        return [conversation, ...prev]
      })
    },
    [setHistory]
  )

  const removeFromHistory = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((c) => c.id !== id))
    },
    [setHistory]
  )

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [setHistory])

  const updateInHistory = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setHistory((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      )
    },
    [setHistory]
  )

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    updateInHistory,
  }
}
