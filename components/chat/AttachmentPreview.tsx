import React from 'react'
import type { Attachment } from '@/types'
import { FileText, Image as ImageIcon, File, BookOpen } from 'lucide-react'

const ICON_MAP: Record<Attachment['type'], React.ElementType> = {
  pdf: FileText,
  image: ImageIcon,
  document: File,
  brief: BookOpen,
}

interface AttachmentPreviewProps {
  attachment: Attachment
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment }) => {
  const Icon = ICON_MAP[attachment.type] ?? File

  return (
    <div className="flex justify-center animate-in fade-in duration-300">
      <div className="inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg bg-card text-sm">
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-foreground truncate max-w-[300px]">{attachment.name}</span>
      </div>
    </div>
  )
}
