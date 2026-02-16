import React, { useState } from 'react'
import type { Attachment } from '@/types'
import { FileText, Image as ImageIcon, File, BookOpen, ExternalLink, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

const ICON_MAP: Record<Attachment['type'], React.ElementType> = {
  pdf: FileText,
  image: ImageIcon,
  document: File,
  brief: BookOpen,
}

const TYPE_LABELS: Record<Attachment['type'], string> = {
  pdf: 'PDF',
  image: 'Image',
  document: 'Document',
  brief: 'Brief',
}

/** Vodafone report pages — hardcoded for demo */
const VODAFONE_REPORT_PAGES = [
  '/assets/stimulus/vodafone/Report_01_Cover.png',
  '/assets/stimulus/vodafone/Report_02_Context_Approach.png',
  '/assets/stimulus/vodafone/Report_03_Top_Propositions_Summary.png',
  '/assets/stimulus/vodafone/Report_04_Key_Findings.png',
  '/assets/stimulus/vodafone/Report_05_Overarching_Messages.png',
  '/assets/stimulus/vodafone/Report_06_Supporting_Claims.png',
  '/assets/stimulus/vodafone/Report_07_Full_Data_Table.png',
  '/assets/stimulus/vodafone/Report_08_Lower_Performers.png',
  '/assets/stimulus/vodafone/Report_09_Back_Cover.png',
]

interface AttachmentPreviewProps {
  attachment: Attachment
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment }) => {
  const Icon = ICON_MAP[attachment.type] ?? File
  const [viewerOpen, setViewerOpen] = useState(false)
  const hasUrl = !!attachment.url
  const typeLabel = TYPE_LABELS[attachment.type] ?? 'File'

  // File size display (mocked for demo)
  const fileSize = attachment.type === 'pdf' ? '2.4 MB' : '1.1 MB'

  return (
    <>
      <div className="flex justify-start animate-in fade-in duration-300">
        <button
          onClick={() => hasUrl && setViewerOpen(true)}
          className={cn(
            'inline-flex items-center gap-3 pl-3 pr-4 py-3 border rounded-xl bg-card text-left transition-all',
            hasUrl && 'hover:bg-muted/50 hover:border-border/80 hover:shadow-sm cursor-pointer group',
            !hasUrl && 'cursor-default',
          )}
        >
          {/* Icon container */}
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            attachment.type === 'pdf' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-muted',
          )}>
            <Icon className={cn(
              'w-5 h-5',
              attachment.type === 'pdf' ? 'text-red-500' : 'text-muted-foreground',
            )} />
          </div>

          {/* File info */}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground truncate max-w-[280px] group-hover:text-foreground/90">
              {attachment.name}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {typeLabel} · {fileSize}
            </div>
          </div>

          {/* Open indicator */}
          {hasUrl && (
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
          )}
        </button>
      </div>

      {/* Lightbox viewer for the report */}
      {viewerOpen && attachment.url && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setViewerOpen(false)}
          />

          {/* Viewer card */}
          <div className="relative z-10 w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col bg-popover border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={cn(
                  'w-4 h-4 shrink-0',
                  attachment.type === 'pdf' ? 'text-red-500' : 'text-muted-foreground',
                )} />
                <span className="text-sm font-medium text-foreground truncate">
                  {attachment.name}
                </span>
              </div>
              <button
                onClick={() => setViewerOpen(false)}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content — scrollable image pages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/30">
              {VODAFONE_REPORT_PAGES.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Report page ${i + 1}`}
                  className="w-full rounded-lg border border-border shadow-sm"
                  loading={i > 2 ? 'lazy' : undefined}
                />
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
