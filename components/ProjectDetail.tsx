import React, { useState, useCallback } from 'react'
import type { SurveyProject, Stimulus } from '@/types'
import { SURVEY_TYPE_CONFIGS } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FindingsCanvas } from '@/components/results/FindingsCanvas'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  FileQuestion,
  BarChart3,
  Users,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface ProjectDetailProps {
  project: SurveyProject
  onBack: () => void
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const typeConfig = SURVEY_TYPE_CONFIGS.find(c => c.key === project.surveyType)
  const survey = project.surveys[0]
  const totalQuestions = project.surveys.reduce((sum, s) => sum + s.questions.length, 0)
  const totalFindings = project.surveys.reduce((sum, s) => sum + (s.findings?.length ?? 0), 0)

  // Lightbox state
  const [lightboxStim, setLightboxStim] = useState<Stimulus | null>(null)
  const lightboxIndex = lightboxStim
    ? project.stimuli.findIndex(s => s.id === lightboxStim.id)
    : -1

  const handlePrevStim = useCallback(() => {
    if (lightboxIndex > 0) setLightboxStim(project.stimuli[lightboxIndex - 1])
  }, [lightboxIndex, project.stimuli])

  const handleNextStim = useCallback(() => {
    if (lightboxIndex < project.stimuli.length - 1) setLightboxStim(project.stimuli[lightboxIndex + 1])
  }, [lightboxIndex, project.stimuli])

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevStim()
    if (e.key === 'ArrowRight') handleNextStim()
  }, [handlePrevStim, handleNextStim])

  // Collect all findings across surveys for key findings summary
  const allFindings = project.surveys.flatMap(s => s.findings ?? [])

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
          {/* Dates */}
          <p className="text-xs text-muted-foreground mt-2">
            Created {formatDate(project.createdAt)}
            {project.updatedAt && project.updatedAt !== project.createdAt && (
              <> &middot; Updated {formatDate(project.updatedAt)}</>
            )}
          </p>
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

      {/* Key Findings Summary */}
      {allFindings.length > 0 && (
        <div className="mb-8 rounded-lg border border-border bg-muted/30 p-4">
          <h2 className="text-sm font-semibold mb-3">Key Findings</h2>
          <div className="space-y-2">
            {allFindings.slice(0, 3).map((f, i) => {
              const statMatch = f.headline.match(/^(\d+%?)\s*/)
              const stat = statMatch?.[1]
              const rest = stat ? f.headline.slice(statMatch[0].length) : f.headline
              return (
                <div key={f.questionId} className="flex items-start gap-3">
                  <span className="text-lg font-display font-bold text-foreground flex-shrink-0 w-14 text-right">
                    {stat || `#${i + 1}`}
                  </span>
                  <p className="text-sm text-muted-foreground pt-0.5">{rest}</p>
                </div>
              )
            })}
            {allFindings.length > 3 && (
              <p className="text-xs text-muted-foreground pl-[68px]">
                +{allFindings.length - 3} more findings below
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stimulus gallery */}
      {project.stimuli.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-3">Stimulus</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {project.stimuli.map((stim) => (
              <div
                key={stim.id}
                className="rounded-lg border border-border overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                onClick={() => setLightboxStim(stim)}
              >
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

      {/* Findings */}
      {project.surveys.map((s) => (
        s.findings && s.findings.length > 0 ? (
          <div key={s.id} className="mb-8">
            <FindingsCanvas
              findings={s.findings}
              title={s.name}
              typeBadge={typeConfig?.label}
              respondents={s.sampleSize}
              stimuli={project.stimuli}
            />
          </div>
        ) : null
      ))}

      {/* Stimulus Lightbox */}
      <Dialog open={!!lightboxStim} onOpenChange={() => setLightboxStim(null)}>
        <DialogContent
          className="max-w-3xl p-0 overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          <DialogTitle className="sr-only">
            {lightboxStim?.name ?? 'Stimulus'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged view of stimulus material
          </DialogDescription>
          {lightboxStim && (
            <div className="flex flex-col">
              <div className="relative bg-muted">
                {(lightboxStim.type === 'image' || lightboxStim.type === 'concept') ? (
                  <img
                    src={lightboxStim.url}
                    alt={lightboxStim.name}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {/* Prev/Next navigation */}
                {lightboxIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={handlePrevStim}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}
                {lightboxIndex < project.stimuli.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={handleNextStim}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
                {/* Counter */}
                <span className="absolute bottom-2 right-2 text-xs bg-background/80 px-2 py-0.5 rounded-full text-muted-foreground">
                  {lightboxIndex + 1} / {project.stimuli.length}
                </span>
              </div>
              <div className="p-4 border-t border-border">
                <h3 className="font-semibold text-sm">{lightboxStim.name}</h3>
                {lightboxStim.description && (
                  <p className="text-xs text-muted-foreground mt-1">{lightboxStim.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}
