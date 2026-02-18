import React, { useRef } from 'react'
import { Upload, X, ImageIcon, FileText, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SurveyType, Stimulus } from '@/types'

const TYPE_STIMULUS_HEADERS: Record<string, { title: string; description: string }> = {
  concept: { title: 'Add your concepts', description: 'Upload the concepts respondents will evaluate.' },
  message: { title: 'Add your messages', description: 'Upload the messages or taglines to test.' },
  creative: { title: 'Add your creative', description: 'Upload the ads, packaging, or visuals to evaluate.' },
}

interface StimulusStepProps {
  surveyType: SurveyType
  stimuli: Stimulus[]
  onAddStimulus: (stimulus: Stimulus) => void
  onRemoveStimulus: (id: string) => void
}

export const StimulusStep: React.FC<StimulusStepProps> = ({
  surveyType,
  stimuli,
  onAddStimulus,
  onRemoveStimulus,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const header = TYPE_STIMULUS_HEADERS[surveyType] || TYPE_STIMULUS_HEADERS.concept

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      const stimulus: Stimulus = {
        id: `stim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: isImage ? 'image' : isVideo ? 'video' : 'document',
        name: file.name,
        url,
        thumbnailUrl: isImage ? url : undefined,
      }
      onAddStimulus(stimulus)
    })

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStimulusIcon = (type: Stimulus['type']) => {
    switch (type) {
      case 'image': return ImageIcon
      case 'video': return Film
      default: return FileText
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold">{header.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{header.description}</p>
      </div>

      {/* Upload zone */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'w-full border-2 border-dashed rounded-lg p-8 text-center',
          'transition-colors hover:border-foreground/30 hover:bg-accent/30',
          'cursor-pointer',
        )}
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">Drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">
          Images, videos, or documents &middot; up to 5 items
        </p>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
      />

      {/* Uploaded stimulus cards */}
      {stimuli.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Uploaded ({stimuli.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stimuli.map((stim) => {
              const Icon = getStimulusIcon(stim.type)
              return (
                <div
                  key={stim.id}
                  className="relative group border rounded-lg overflow-hidden bg-muted/30"
                >
                  {/* Thumbnail or icon */}
                  {stim.type === 'image' && stim.url ? (
                    <div className="aspect-video">
                      <img
                        src={stim.url}
                        alt={stim.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center">
                      <Icon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Name */}
                  <div className="px-2 py-1.5">
                    <p className="text-xs truncate">{stim.name}</p>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveStimulus(stim.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
