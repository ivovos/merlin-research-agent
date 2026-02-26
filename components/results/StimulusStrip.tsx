import React, { useState } from 'react'
import type { Stimulus } from '@/types'
import { Image as ImageIcon, ChevronDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface StimulusStripProps {
  stimuli: Stimulus[]
  className?: string
}

/**
 * Horizontal strip of stimulus thumbnails shown above findings
 * when all findings share the same stimulus set.
 * Clicking a thumbnail opens a lightbox.
 */
export const StimulusStrip: React.FC<StimulusStripProps> = ({ stimuli, className }) => {
  const [lightbox, setLightbox] = useState<Stimulus | null>(null)

  if (stimuli.length === 0) return null

  return (
    <>
      <div className={cn('flex flex-col gap-2 pb-1', className)}>
        <span className="text-xs font-medium text-muted-foreground">
          Stimulus
        </span>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {stimuli.map(stim => (
            <button
              key={stim.id}
              type="button"
              onClick={() => setLightbox(stim)}
              className="group flex flex-col items-center gap-1 shrink-0 focus:outline-none"
            >
              <div className="w-40 h-28 rounded-lg border border-border overflow-hidden bg-muted group-hover:ring-2 group-hover:ring-primary/30 transition-all">
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
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground leading-tight text-center max-w-40 line-clamp-2 group-hover:text-foreground transition-colors">
                {stim.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{lightbox?.name ?? 'Stimulus'}</DialogTitle>
          <DialogDescription className="sr-only">Enlarged view of stimulus</DialogDescription>
          {lightbox && (
            <div className="flex flex-col">
              <div className="bg-muted">
                {(lightbox.type === 'image' || lightbox.type === 'concept') ? (
                  <img
                    src={lightbox.url}
                    alt={lightbox.name}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border">
                <h3 className="font-semibold text-sm">{lightbox.name}</h3>
                {lightbox.description && (
                  <p className="text-xs text-muted-foreground mt-1">{lightbox.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Small inline stimulus indicators for individual finding cards
 * when all findings share the same stimulus (just text labels, very compact).
 */
export const StimulusIndicator: React.FC<{
  stimuli: Stimulus[]
  className?: string
}> = ({ stimuli, className }) => {
  if (stimuli.length === 0) return null

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {stimuli.map(stim => (
        <span
          key={stim.id}
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5"
        >
          {(stim.type === 'image' || stim.type === 'concept') && stim.url && (
            <img
              src={stim.url}
              alt=""
              className="w-3 h-3 rounded-sm object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          {stim.name}
        </span>
      ))}
    </div>
  )
}

/**
 * Collapsible stimulus section for finding cards.
 *
 * Collapsed (default): compact pill showing count + tiny preview thumbnails + expand chevron.
 * Expanded: proper-sized thumbnails with names, each clickable for lightbox.
 */
export const StimulusThumbnails: React.FC<{
  stimuli: Stimulus[]
  className?: string
}> = ({ stimuli, className }) => {
  const [expanded, setExpanded] = useState(false)
  const [lightbox, setLightbox] = useState<Stimulus | null>(null)

  if (stimuli.length === 0) return null

  return (
    <>
      <div className={cn('', className)}>
        {/* Collapsed — pill trigger */}
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors text-left w-full',
            'hover:bg-muted/80',
            expanded
              ? 'border-border bg-muted/50'
              : 'border-border/60 bg-transparent',
          )}
        >
          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Stimulus ({stimuli.length})
          </span>

          {/* Mini preview thumbs (only when collapsed) */}
          {!expanded && (
            <div className="flex items-center gap-1 ml-1">
              {stimuli.slice(0, 4).map(stim => (
                <div
                  key={stim.id}
                  className="w-6 h-6 rounded-sm border border-border/50 overflow-hidden bg-muted shrink-0"
                >
                  {(stim.type === 'image' || stim.type === 'concept') ? (
                    <img
                      src={stim.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-2.5 h-2.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {stimuli.length > 4 && (
                <span className="text-[10px] text-muted-foreground/60">
                  +{stimuli.length - 4}
                </span>
              )}
            </div>
          )}

          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-muted-foreground/50 ml-auto shrink-0 transition-transform duration-200',
              expanded && 'rotate-180',
            )}
          />
        </button>

        {/* Expanded — proper-sized thumbnails */}
        {expanded && (
          <div className="flex flex-wrap gap-3 pt-3 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {stimuli.map(stim => (
              <button
                key={stim.id}
                type="button"
                onClick={() => setLightbox(stim)}
                className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none"
              >
                <div className="w-28 h-20 rounded-md border border-border overflow-hidden bg-muted group-hover:ring-2 group-hover:ring-primary/30 transition-all">
                  {(stim.type === 'image' || stim.type === 'concept') ? (
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
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground leading-tight text-center max-w-28 line-clamp-2 group-hover:text-foreground transition-colors">
                  {stim.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{lightbox?.name ?? 'Stimulus'}</DialogTitle>
          <DialogDescription className="sr-only">Enlarged view of stimulus</DialogDescription>
          {lightbox && (
            <div className="flex flex-col">
              <div className="bg-muted">
                {(lightbox.type === 'image' || lightbox.type === 'concept') ? (
                  <img
                    src={lightbox.url}
                    alt={lightbox.name}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border">
                <h3 className="font-semibold text-sm">{lightbox.name}</h3>
                {lightbox.description && (
                  <p className="text-xs text-muted-foreground mt-1">{lightbox.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
