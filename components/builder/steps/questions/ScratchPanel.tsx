import React from 'react'
import { Pencil } from 'lucide-react'

interface ScratchPanelProps {
  hasQuestions: boolean
}

export const ScratchPanel: React.FC<ScratchPanelProps> = ({ hasQuestions }) => {
  if (hasQuestions) return null

  return (
    <div className="flex items-center gap-3 py-4 px-4 rounded-lg bg-muted border border-border">
      <Pencil className="w-4 h-4 text-muted-foreground shrink-0" />
      <p className="text-sm text-muted-foreground">
        Build your survey from scratch — add questions one by one using the button below.
      </p>
    </div>
  )
}
