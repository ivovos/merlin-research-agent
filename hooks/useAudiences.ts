import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Audience } from '@/types'
import { mockAudiences } from '@/data/mockData'

const AUDIENCES_KEY = 'merlin_audiences'

export interface UseAudiencesReturn {
  audiences: Audience[]
  addAudience: (audience: Audience) => void
  createAudience: (name: string) => Audience
  removeAudience: (id: string) => void
  updateAudience: (id: string, updates: Partial<Audience>) => void
}

export function useAudiences(): UseAudiencesReturn {
  const [audiences, setAudiences] = useLocalStorage<Audience[]>(
    AUDIENCES_KEY,
    mockAudiences
  )

  const addAudience = useCallback(
    (audience: Audience) => {
      setAudiences((prev) => {
        const exists = prev.some((a) => a.id === audience.id)
        if (exists) {
          return prev.map((a) => (a.id === audience.id ? audience : a))
        }
        return [...prev, audience]
      })
    },
    [setAudiences]
  )

  const createAudience = useCallback(
    (name: string): Audience => {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const newAudience: Audience = {
        id,
        name,
        icon: name.charAt(0).toUpperCase(),
      }
      addAudience(newAudience)
      return newAudience
    },
    [addAudience]
  )

  const removeAudience = useCallback(
    (id: string) => {
      setAudiences((prev) => prev.filter((a) => a.id !== id))
    },
    [setAudiences]
  )

  const updateAudience = useCallback(
    (id: string, updates: Partial<Audience>) => {
      setAudiences((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      )
    },
    [setAudiences]
  )

  return {
    audiences,
    addAudience,
    createAudience,
    removeAudience,
    updateAudience,
  }
}
