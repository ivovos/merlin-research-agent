import React from 'react'
import type { ProjectState } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import type { PickerMethod } from '@/components/chat/MethodsPicker'
import { Badge } from '@/components/ui/badge'
import { ChatInputBar } from '@/components/chat/ChatInputBar'
import {
  FileQuestion,
  Users,
  BarChart3,
} from 'lucide-react'

interface HomeProps {
  projects: ProjectState[]
  onSelectProject: (id: string) => void
  onCreateProject: (text: string) => void
  onSelectMethod: (method: PickerMethod) => void
  /** Current brand name — used to filter audiences in the picker */
  brand?: string
}

function getTypeLabel(type: string | undefined): string {
  if (!type) return 'Research'
  return SURVEY_TYPE_CONFIGS.find(c => c.key === type)?.label ?? type
}

function getTotalQuestions(p: ProjectState): number {
  return p.studies.reduce((sum, s) => sum + s.questions.length, 0)
}

function getTotalFindings(p: ProjectState): number {
  return p.studies.reduce((sum, s) => sum + (s.findings?.length ?? 0), 0)
}

export const Home: React.FC<HomeProps> = ({
  projects,
  onSelectProject,
  onCreateProject,
  onSelectMethod,
  brand,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero section with prompt — centered vertically */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <h1 className="text-3xl font-display font-bold tracking-tight text-center">
          Electric Twin
        </h1>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Synthetic research, real insights
        </p>

        {/* Input bar */}
        <div className="w-full max-w-2xl mt-8">
          <ChatInputBar
            onSend={onCreateProject}
            onSelectMethod={onSelectMethod}
            onAddAudience={() => {}  /* picker handles display */}
            onAttach={() => {}}
            placeholder="What do you want to research?"
            variant="home"
            brand={brand}
          />
        </div>
      </div>

      {/* Studies list */}
      <div className="px-6 pt-4 pb-8 max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Studies
          </h2>
          <span className="text-xs text-muted-foreground">
            {projects.length} {projects.length === 1 ? 'study' : 'studies'}
          </span>
        </div>

        <div className="divide-y divide-border border-t border-b">
          {projects.map(project => (
            <StudyRow
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Study row for home list ──

function StudyRow({
  project,
  onClick,
}: {
  project: ProjectState
  onClick: () => void
}) {
  const totalQuestions = getTotalQuestions(project)
  const totalFindings = getTotalFindings(project)
  const studyCount = project.studies.length

  return (
    <button
      type="button"
      className="w-full text-left flex items-center gap-4 py-3 px-2 hover:bg-muted/50 transition-colors group"
      onClick={onClick}
    >
      {/* Name + brand + type */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {project.name}
          </span>
          {project.surveyType && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
              {getTypeLabel(project.surveyType)}
            </Badge>
          )}
        </div>
        {project.brand && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {project.brand}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        {studyCount > 0 && (
          <span>{studyCount} {studyCount === 1 ? 'study' : 'studies'}</span>
        )}
        {totalQuestions > 0 && (
          <span className="flex items-center gap-1">
            <FileQuestion className="w-3 h-3" />
            {totalQuestions}
          </span>
        )}
        {totalFindings > 0 && (
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {totalFindings}
          </span>
        )}
        {project.audiences.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {project.audiences.length}
          </span>
        )}
      </div>
    </button>
  )
}
