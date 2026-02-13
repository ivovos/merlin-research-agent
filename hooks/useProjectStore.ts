import { useState, useCallback, useMemo } from 'react'
import type { ChatMessage, ProjectState, Attachment } from '@/types'
import type { Survey } from '@/types'
import { getAllDemoProjects } from '@/data/demoConversations'

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
      simple: 'Survey',
      concept: 'Concept Test',
      message: 'Message Test',
      creative: 'Creative Test',
      brand_tracking: 'Brand Tracker',
      audience_exploration: 'Audience Exploration',
    }
    parts.push(labels[study.type] ?? study.type)
  }
  if (study.name) parts.push(study.name)
  return parts.join(' — ') || 'New Study'
}

// ── Hook ──

export function useProjectStore() {
  const [projects, setProjects] = useState<ProjectState[]>(() => getAllDemoProjects())
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const activeProject = useMemo(
    () => projects.find(p => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  )

  const createProject = useCallback((firstMessage?: string): ProjectState => {
    const id = `proj_${Date.now()}`
    const today = new Date().toISOString().slice(0, 10)
    const name = firstMessage
      ? generateProjectName(firstMessage)
      : 'New Research Project'
    const newProject: ProjectState = {
      id,
      name,
      icon: '🔬',
      messages: [],
      studies: [],
      audiences: [],
      attachments: [],
      createdAt: today,
      updatedAt: today,
    }
    setProjects(prev => [newProject, ...prev])
    setActiveProjectId(id)
    return newProject
  }, [])

  const addMessage = useCallback((projectId: string, msg: ChatMessage) => {
    setProjects(prev =>
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

  const addStudy = useCallback((projectId: string, study: Survey) => {
    setProjects(prev =>
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
    setProjects(prev =>
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
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, name, updatedAt: new Date().toISOString().slice(0, 10) }
          : p,
      ),
    )
  }, [])

  const renameStudy = useCallback((projectId: string, studyId: string, name: string) => {
    setProjects(prev =>
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

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    addMessage,
    addStudy,
    addAttachment,
    renameProject,
    renameStudy,
    generateStudyName,
  }
}
