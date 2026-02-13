import React, { useMemo, useState } from 'react'
import type { SurveyProject } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Search,
  FileQuestion,
  Image as ImageIcon,
  Users,
  BarChart3,
} from 'lucide-react'

interface DashboardProps {
  projects: SurveyProject[]
  onSelectProject: (project: SurveyProject) => void
}

function getTypeLabel(type: SurveyProject['surveyType']): string {
  return SURVEY_TYPE_CONFIGS.find(c => c.key === type)?.label ?? type
}

function getStatusStyle(status: SurveyProject['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-foreground text-background'
    case 'active':
      return 'border border-foreground text-foreground bg-transparent'
    case 'draft':
      return 'bg-muted text-muted-foreground'
  }
}

function getTotalQuestions(project: SurveyProject): number {
  return project.surveys.reduce((sum, s) => sum + s.questions.length, 0)
}

function getTotalFindings(project: SurveyProject): number {
  return project.surveys.reduce((sum, s) => sum + (s.findings?.length ?? 0), 0)
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const q = searchQuery.toLowerCase()
    return projects.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        getTypeLabel(p.surveyType).toLowerCase().includes(q)
    )
  }, [projects, searchQuery])

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-display font-bold tracking-tight">
          Projects
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {projects.length} research project{projects.length !== 1 ? 's' : ''}
        </p>
        <div className="relative mt-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Project Grid */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onSelectProject(project)}
          />
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No projects match your search.
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  onClick,
}: {
  project: SurveyProject
  onClick: () => void
}) {
  const totalQuestions = getTotalQuestions(project)
  const totalFindings = getTotalFindings(project)
  const stimulusCount = project.stimuli.length

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md overflow-hidden"
      onClick={onClick}
    >
      <div className="p-5">
        {/* Header: icon + name + status */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl leading-none flex-shrink-0">{project.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold leading-tight line-clamp-2">
              {project.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{project.brand}</p>
          </div>
          <Badge
            variant="secondary"
            className={cn('text-[10px] px-1.5 py-0 h-5 flex-shrink-0', getStatusStyle(project.status))}
          >
            {project.status}
          </Badge>
        </div>

        {/* Type badge */}
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 mb-3">
          {getTypeLabel(project.surveyType)}
        </Badge>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Stimulus thumbnails */}
        {stimulusCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {project.stimuli.slice(0, 4).map((stim) => (
              <div
                key={stim.id}
                className="w-10 h-10 rounded border border-border overflow-hidden bg-muted flex-shrink-0"
              >
                {stim.type === 'image' || stim.type === 'concept' ? (
                  <img
                    src={stim.url}
                    alt={stim.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide broken images
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {stimulusCount > 4 && (
              <span className="text-xs text-muted-foreground ml-0.5">
                +{stimulusCount - 4}
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1">
            <FileQuestion className="w-3.5 h-3.5" />
            {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
          </span>
          {totalFindings > 0 && (
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              {totalFindings} finding{totalFindings !== 1 ? 's' : ''}
            </span>
          )}
          {project.audienceIds.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {project.audienceIds.length}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
