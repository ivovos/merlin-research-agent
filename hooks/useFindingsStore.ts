import React, { createContext, useContext, useState } from 'react'
import type { Finding } from '@/types'

// ── Store interface ──

export interface FindingsStore {
  /** Map of studyId → saved Finding[] */
  findings: Record<string, Finding[]>
  /** Save a finding (sets savedAt, auto-generates conclusion) */
  saveFinding: (studyId: string, finding: Finding) => void
  /** Remove a finding by questionId */
  removeFinding: (studyId: string, questionId: string) => void
  /** Check if a finding is saved */
  isSaved: (studyId: string, questionId: string) => boolean
  /** Get saved count for a study */
  getCount: (studyId: string) => number
  /** Get all saved findings for a study */
  getSavedFindings: (studyId: string) => Finding[]
  /** Update the conclusion text for a finding */
  updateConclusion: (studyId: string, questionId: string, conclusion: string) => void
}

// ── Context ──

const FindingsContext = createContext<FindingsStore | null>(null)

/** Returns the findings store, or null if no FindingsProvider is in the tree */
export const useFindingsContext = (): FindingsStore | null => {
  return useContext(FindingsContext)
}

/** Returns the findings store, throwing if no FindingsProvider is in the tree */
export const useFindingsContextStrict = (): FindingsStore => {
  const ctx = useContext(FindingsContext)
  if (!ctx) throw new Error('useFindingsContextStrict must be used within <FindingsProvider>')
  return ctx
}

// ── Provider ──

export const FindingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [findings, setFindings] = useState<Record<string, Finding[]>>({})

  // Build store object with direct closures over current `findings` state.
  // No useCallback/useMemo — we intentionally create a new store object on every
  // render so that context consumers always re-render with the latest state.
  const store: FindingsStore = {
    findings,

    saveFinding(studyId: string, finding: Finding) {
      const saved: Finding = {
        ...finding,
        savedAt: Date.now(),
        conclusion: finding.conclusion ?? `This suggests ${finding.insight.charAt(0).toLowerCase()}${finding.insight.slice(1)}`,
      }
      setFindings(prev => ({
        ...prev,
        [studyId]: [...(prev[studyId] ?? []).filter(f => f.questionId !== finding.questionId), saved],
      }))
    },

    removeFinding(studyId: string, questionId: string) {
      setFindings(prev => ({
        ...prev,
        [studyId]: (prev[studyId] ?? []).filter(f => f.questionId !== questionId),
      }))
    },

    isSaved(studyId: string, questionId: string) {
      return (findings[studyId] ?? []).some(f => f.questionId === questionId)
    },

    getCount(studyId: string) {
      return (findings[studyId] ?? []).length
    },

    getSavedFindings(studyId: string) {
      return findings[studyId] ?? []
    },

    updateConclusion(studyId: string, questionId: string, conclusion: string) {
      setFindings(prev => ({
        ...prev,
        [studyId]: (prev[studyId] ?? []).map(f =>
          f.questionId === questionId ? { ...f, conclusion } : f,
        ),
      }))
    },
  }

  return React.createElement(FindingsContext.Provider, { value: store }, children)
}
