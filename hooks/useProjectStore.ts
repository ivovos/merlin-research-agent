import { useState, useCallback, useMemo } from 'react'
import type { ChatMessage, ProjectState, Attachment } from '@/types'
import type { Survey } from '@/types'
import { getAllDemoProjects } from '@/data/demoConversations'
import { getBrandNamesForAccount, ET_TEST_ACCOUNT_ID } from '@/data/brandRegistry'

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
  const [allProjects, setAllProjects] = useState<ProjectState[]>(() => getAllDemoProjects())
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

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
