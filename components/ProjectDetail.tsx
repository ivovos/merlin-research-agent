import React from 'react'
import type { SurveyProject } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileQuestion, BarChart3, Users, Image as ImageIcon } from 'lucide-react'

interface ProjectDetailProps {
  project: SurveyProject
  onBack: () => void
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const typeConfig = SURVEY_TYPE_CONFIGS.find(c => c.key === project.surveyType)
  const survey = project.surveys[0]
  const totalQuestions = project.surveys.reduce((sum, s) => sum + s.questions.length, 0)
  const totalFindings = project.surveys.reduce((sum, s) => sum + (s.findings?.length ?? 0), 0)

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <span className="text-4xl leading-none">{project.icon}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold tracking-tight">{project.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{project.brand}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {typeConfig?.label ?? project.surveyType}
            </Badge>
            <Badge variant="secondary" className="text-xs capitalize">
              {project.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          {project.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FileQuestion className="w-4 h-4" />} label="Questions" value={totalQuestions} />
        <StatCard icon={<BarChart3 className="w-4 h-4" />} label="Findings" value={totalFindings} />
        <StatCard icon={<Users className="w-4 h-4" />} label="Audiences" value={project.audienceIds.length} />
        <StatCard icon={<ImageIcon className="w-4 h-4" />} label="Stimuli" value={project.stimuli.length} />
      </div>

      {/* Stimulus gallery */}
      {project.stimuli.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3">Stimulus</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {project.stimuli.map((stim) => (
              <div key={stim.id} className="rounded-lg border border-border overflow-hidden bg-muted">
                <div className="aspect-video relative">
                  {stim.type === 'image' || stim.type === 'concept' ? (
                    <img
                      src={stim.url}
                      alt={stim.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs font-medium truncate">{stim.name}</p>
                  {stim.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{stim.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Survey overview */}
      {survey && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3">Survey</h2>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">{survey.name}</h3>
              <Badge variant="secondary" className="text-xs capitalize">{survey.status}</Badge>
            </div>
            {survey.methodology && (
              <p className="text-xs text-muted-foreground">Methodology: {survey.methodology}</p>
            )}
            {survey.sampleSize && (
              <p className="text-xs text-muted-foreground">Sample: n={survey.sampleSize.toLocaleString()}</p>
            )}
            {survey.fieldworkDuration && (
              <p className="text-xs text-muted-foreground">Fieldwork: {survey.fieldworkDuration}</p>
            )}
          </div>
        </div>
      )}

      {/* Placeholder for findings */}
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">Findings canvas coming in Phase 3</p>
        <p className="text-xs mt-1">
          {totalFindings} finding{totalFindings !== 1 ? 's' : ''} with charts and AI insights
        </p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-display font-bold">{value}</p>
    </div>
  )
}
