import React from 'react'
import type { ProjectState } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChatInputBar } from '@/components/chat/ChatInputBar'
import {
  FileQuestion,
  Image as ImageIcon,
  Users,
  BarChart3,
} from 'lucide-react'

interface HomeProps {
  projects: ProjectState[]
  onSelectProject: (id: string) => void
  onCreateProject: (text: string) => void
  onOpenBuilder: () => void
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
  onOpenBuilder,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero section with prompt */}
      <div className="flex flex-col items-center pt-16 pb-10 px-6">
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
            onAddStudy={onOpenBuilder}
            onAddAudience={() => {}}
            onAttach={() => {}}
            placeholder="What do you want to research?"
            variant="home"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t mx-6" />

      {/* Project grid */}
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your Projects
          </h2>
          <span className="text-xs text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <HomeProjectCard
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project.id)}
            />
          ))}
        </div>

        {/* Shared section (placeholder for future) */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Shared with you
          </h2>
          <p className="text-sm text-muted-foreground">
            No shared projects yet.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Project card for home grid ──

function HomeProjectCard({
  project,
  onClick,
}: {
  project: ProjectState
  onClick: () => void
}) {
  const totalQuestions = getTotalQuestions(project)
  const totalFindings = getTotalFindings(project)
  const stimuli = project.stimuli ?? []
  const messageCount = project.messages.length
  const studyCount = project.studies.length

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md overflow-hidden"
      onClick={onClick}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl leading-none flex-shrink-0">
            {project.icon ?? '📊'}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold leading-tight line-clamp-2">
              {project.name}
            </h3>
            {project.brand && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {project.brand}
              </p>
            )}
          </div>
        </div>

        {/* Type badge */}
        {project.surveyType && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 mb-3">
            {getTypeLabel(project.surveyType)}
          </Badge>
        )}

        {/* Description */}
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Stimulus thumbnails */}
        {stimuli.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {stimuli.slice(0, 4).map(stim => (
              <div
                key={stim.id}
                className="w-10 h-10 rounded border border-border overflow-hidden bg-muted flex-shrink-0"
              >
                {stim.type === 'image' || stim.type === 'concept' ? (
                  <img
                    src={stim.url}
                    alt={stim.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {stimuli.length > 4 && (
              <span className="text-xs text-muted-foreground ml-0.5">
                +{stimuli.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
          {studyCount > 0 && (
            <span>
              {studyCount} {studyCount === 1 ? 'study' : 'studies'}
            </span>
          )}
          {totalQuestions > 0 && (
            <span className="flex items-center gap-1">
              <FileQuestion className="w-3.5 h-3.5" />
              {totalQuestions}
            </span>
          )}
          {totalFindings > 0 && (
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              {totalFindings}
            </span>
          )}
          {project.audiences.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {project.audiences.length}
            </span>
          )}
          {messageCount > 0 && (
            <span className="ml-auto">
              {messageCount} message{messageCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
