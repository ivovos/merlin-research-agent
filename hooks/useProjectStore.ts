import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { ChatMessage, ProjectState, Attachment } from '@/types'
import type { Survey } from '@/types'
import { getAllDemoProjects } from '@/data/demoConversations'
import { getBrandNamesForAccount, ET_TEST_ACCOUNT_ID } from '@/data/brandRegistry'

// ── localStorage persistence ──

const STORAGE_KEY = 'merlin-projects'

/** Serialize projects → JSON, converting Date objects to ISO strings with a marker */
function saveToStorage(projects: ProjectState[]): void {
  try {
    const json = JSON.stringify(projects, (_key, value) => {
      if (value instanceof Date) return { __date__: value.toISOString() }
      return value
    })
    localStorage.setItem(STORAGE_KEY, json)
  } catch (e) {
    console.warn('[Merlin] Failed to save projects to localStorage:', e)
  }
}

/** Deserialize JSON → projects, reviving Date markers back to Date objects */
function loadFromStorage(): ProjectState[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw, (_key, value) => {
      if (value && typeof value === 'object' && '__date__' in value) {
        return new Date(value.__date__)
      }
      return value
    })
  } catch (e) {
    console.warn('[Merlin] Failed to load projects from localStorage:', e)
    return null
  }
}

// ── Name generation (simple heuristic — no AI call) ──

function generateProjectName(text: string): string {
  // Clean up and take first meaningful segment
  const cleaned = text
    .replace(/['"]/g, '')
    .replace(/\n/g, ' ')
    .trim()
  if (cleaned.length <= 50) return cleaned
  // Try to break at a word boundary
  const truncated = cleaned.slice(0, 50)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > 30 ? truncated.slice(0, lastSpace) + '...' : truncated + '...'
}

function generateStudyName(study: Partial<Survey>): string {
  const parts: string[] = []
  if (study.type) {
    const labels: Record<string, string> = {
      simple: 'Quick Question',
      concept: 'Proposition Test',
      message: 'Message Test',
      creative: 'Creative Test',
      audience_exploration: 'Audience Exploration',
    }
    parts.push(labels[study.type] ?? study.type)
  }
  if (study.name) parts.push(study.name)
  return parts.join(' — ') || 'New Study'
}

// ── Hook ──

export function useProjectStore(accountId?: string) {
  const [allProjects, setAllProjects] = useState<ProjectState[]>(() => {
    const saved = loadFromStorage()
    if (saved && saved.length > 0) return saved
    // First visit — seed with demo projects and persist them
    const demos = getAllDemoProjects()
    saveToStorage(demos)
    return demos
  })
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  // Persist to localStorage whenever projects change (skip initial mount)
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    saveToStorage(allProjects)
  }, [allProjects])

  // Filtered view: ET-Test or undefined → show all, otherwise filter by brand
  const projects = useMemo(() => {
    if (!accountId || accountId === ET_TEST_ACCOUNT_ID) return allProjects
    const brandNames = getBrandNamesForAccount(accountId)
    if (brandNames.length === 0) return allProjects
    return allProjects.filter(p => !p.brand || brandNames.includes(p.brand))
  }, [allProjects, accountId])

  // Active project resolves from ALL projects (not filtered) to prevent crashes on account switch
  const activeProject = useMemo(
    () => allProjects.find(p => p.id === activeProjectId) ?? null,
    [allProjects, activeProjectId],
  )

  const createProject = useCallback((firstMessage?: string, brand?: string): ProjectState => {
    const id = `proj_${Date.now()}`
    const today = new Date().toISOString().slice(0, 10)
    const name = firstMessage
      ? generateProjectName(firstMessage)
      : 'New Research Project'
    const newProject: ProjectState = {
      id,
      name,
      brand,
      messages: [],
      studies: [],
      audiences: [],
      attachments: [],
      createdAt: today,
      updatedAt: today,
    }
    setAllProjects(prev => [newProject, ...prev])
    setActiveProjectId(id)
    return newProject
  }, [])

  const addMessage = useCallback((projectId: string, msg: ChatMessage) => {
    setAllProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              messages: [...p.messages, msg],
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : p,
      ),
    )
  }, [])

  const updateMessage = useCallback((projectId: string, messageId: string, updates: Partial<ChatMessage>) => {
    setAllProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              messages: p.messages.map(m =>
                m.id === messageId ? { ...m, ...updates } as ChatMessage : m,
              ),
            }
          : p,
      ),
    )
  }, [])

  const addStudy = useCallback((projectId: string, study: Survey) => {
    setAllProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              studies: [...p.studies, study],
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : p,
      ),
    )
  }, [])

  const addAttachment = useCallback((projectId: string, attachment: Attachment) => {
    setAllProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              attachments: [...p.attachments, attachment],
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : p,
      ),
    )
  }, [])

  const renameProject = useCallback((projectId: string, name: string) => {
    setAllProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, name, updatedAt: new Date().toISOString().slice(0, 10) }
          : p,
      ),
    )
  }, [])

  const renameStudy = useCallback((projectId: string, studyId: string, name: string) => {
    setAllProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              studies: p.studies.map(s => (s.id === studyId ? { ...s, name } : s)),
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : p,
      ),
    )
  }, [])

  const deleteProject = useCallback((projectId: string) => {
    setAllProjects(prev => prev.filter(p => p.id !== projectId))
    // If we're deleting the active project, clear selection
    setActiveProjectId(prev => (prev === projectId ? null : prev))
  }, [])

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    addMessage,
    updateMessage,
    addStudy,
    addAttachment,
    renameProject,
    renameStudy,
    deleteProject,
    generateStudyName,
  }
}
