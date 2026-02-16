import React, { useState } from 'react'
import type { Stimulus } from '@/types'
import { Image as ImageIcon } from 'lucide-react'
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
      <div className={cn('flex items-start gap-3 overflow-x-auto pb-1', className)}>
        <span className="text-xs font-medium text-muted-foreground shrink-0 pt-2">
          Stimulus tested:
        </span>
        {stimuli.map(stim => (
          <button
            key={stim.id}
            type="button"
            onClick={() => setLightbox(stim)}
            className="group flex flex-col items-center gap-1 shrink-0 focus:outline-none"
          >
            <div className="w-16 h-12 rounded-md border border-border overflow-hidden bg-muted group-hover:ring-2 group-hover:ring-primary/30 transition-all">
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
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight text-center max-w-16 line-clamp-2 group-hover:text-foreground transition-colors">
              {stim.name}
            </span>
          </button>
        ))}
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
 * Larger inline stimulus thumbnails for finding cards
 * when findings have different stimulus sets.
 */
export const StimulusThumbnails: React.FC<{
  stimuli: Stimulus[]
  className?: string
}> = ({ stimuli, className }) => {
  const [lightbox, setLightbox] = useState<Stimulus | null>(null)

  if (stimuli.length === 0) return null

  return (
    <>
      <div className={cn('flex items-start gap-2 overflow-x-auto', className)}>
        {stimuli.map(stim => (
          <button
            key={stim.id}
            type="button"
            onClick={() => setLightbox(stim)}
            className="group flex flex-col items-center gap-1 shrink-0 focus:outline-none"
          >
            <div className="w-24 h-16 rounded-md border border-border overflow-hidden bg-muted group-hover:ring-2 group-hover:ring-primary/30 transition-all">
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
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight text-center max-w-24 line-clamp-1 group-hover:text-foreground transition-colors">
              {stim.name}
            </span>
          </button>
        ))}
      </div>

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
