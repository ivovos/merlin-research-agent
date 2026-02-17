import type { Finding, Survey, SurveyType, Stimulus } from './survey'
import type { StudyPlan } from './canvas'

// ── Attachment ──

export interface Attachment {
  id: string
  name: string
  type: 'pdf' | 'image' | 'document' | 'brief'
  url?: string
  thumbnailUrl?: string
}

// ── Chat message union ──

export type ChatMessage =
  | ChatMessageUser
  | ChatMessageAI
  | ChatMessageFindings
  | ChatMessageAttachment
  | ChatMessageDeliverable
  | ChatMessageSystem
  | ChatMessagePlan

export interface ChatMessageUser {
  id: string
  type: 'user'
  text: string
  attachments?: Attachment[]
  timestamp: number
}

export interface ChatMessageAI {
  id: string
  type: 'ai'
  text: string
  thinking?: string
  timestamp: number
}

export interface ChatMessageFindings {
  id: string
  type: 'findings'
  studyId: string
  studyName: string
  typeBadge?: string
  findings: Finding[]
  stimuli?: Stimulus[]
  respondents?: number
  timestamp: number
}

export interface ChatMessageAttachment {
  id: string
  type: 'attachment'
  attachment: Attachment
  timestamp: number
}

export interface ChatMessageDeliverable {
  id: string
  type: 'deliverable'
  content: string
  format: 'narrative' | 'report' | 'summary'
  timestamp: number
}

export interface ChatMessageSystem {
  id: string
  type: 'system'
  text: string
  timestamp: number
}

export interface ChatMessagePlan {
  id: string
  type: 'plan'
  planTitle: string
  planDescription: string
  bulletPoints: string[]
  expectedRuntime: string
  studyPlan: StudyPlan
  toolSelection: {
    toolName: string
    toolInput: Record<string, unknown>
    processSteps: string[]
  }
  status: 'pending' | 'approved'
  timestamp: number
}

// ── App navigation ──

export type AppView =
  | { screen: 'home' }
  | { screen: 'project'; projectId: string }

// ── Project state ──

export interface ProjectState {
  id: string
  name: string
  brand?: string
  icon?: string
  surveyType?: SurveyType
  description?: string
  messages: ChatMessage[]
  studies: Study[]
  stimuli?: Stimulus[]
  audiences: string[]
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

// Study = Survey (gradual rename for project-chat model)
export type Study = Survey
