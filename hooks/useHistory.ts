import { useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Conversation } from '@/types'
import { mockHistory, mubiConversations } from '@/data/mockData'

const HISTORY_KEY = 'merlin_history'
const HISTORY_VERSION_KEY = 'merlin_history_version'
const CURRENT_VERSION = 3 // Increment this when adding new default conversations

// Combined default history with account info
const defaultHistory: Conversation[] = [
  ...mockHistory,
  ...mubiConversations,
]

export interface UseHistoryReturn {
  history: Conversation[]
  addToHistory: (conversation: Conversation) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  updateInHistory: (id: string, updates: Partial<Conversation>) => void
}

export function useHistory(accountId?: string): UseHistoryReturn {
  const [allHistory, setHistory] = useLocalStorage<Conversation[]>(
    HISTORY_KEY,
    defaultHistory
  )

  // Check version and merge in new default conversations if needed
  useEffect(() => {
    const storedVersion = localStorage.getItem(HISTORY_VERSION_KEY)
    const version = storedVersion ? parseInt(storedVersion, 10) : 0

    if (version < CURRENT_VERSION) {
      // Read fresh from localStorage to avoid stale closure
      const storedHistory = localStorage.getItem(HISTORY_KEY)
      const currentHistory: Conversation[] = storedHistory
        ? JSON.parse(storedHistory)
        : []

      // Merge in any missing default conversations
      const existingIds = new Set(currentHistory.map(c => c.id))
      const newConversations = defaultHistory.filter(c => !existingIds.has(c.id))

      if (newConversations.length > 0) {
        const mergedHistory = [...currentHistory, ...newConversations]
        localStorage.setItem(HISTORY_KEY, JSON.stringify(mergedHistory))
        setHistory(mergedHistory)
      }

      localStorage.setItem(HISTORY_VERSION_KEY, CURRENT_VERSION.toString())
    }
  }, [setHistory])

  // Filter history by account if provided
  const history = useMemo(() => {
    if (!accountId) return allHistory

    // Map audience IDs to account IDs
    const mubiAudienceIds = ['mubi-basic-global', 'mubi-us-market', 'mubi-potential-upgraders']

    return allHistory.filter(conv => {
      const audienceId = conv.audience?.id
      if (accountId === 'mubi') {
        return mubiAudienceIds.includes(audienceId || '')
      }
      // For other accounts, show conversations that don't belong to MUBI
      return !mubiAudienceIds.includes(audienceId || '')
    })
  }, [allHistory, accountId])

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
