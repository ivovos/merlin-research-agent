import React, { useState, useRef, useEffect } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface EditableInsightProps {
  text: string
  editable?: boolean
  compact?: boolean
  onSave?: (newText: string) => void
  className?: string
}

export const EditableInsight: React.FC<EditableInsightProps> = ({
  text,
  editable = false,
  compact = false,
  onSave,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(text)
  const [isHovered, setIsHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(text)
  }, [text])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && onSave) {
      onSave(trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(text)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
          className="text-sm min-h-[80px] resize-y"
        />
        <div className="flex items-center gap-1.5">
          <Button variant="default" size="sm" className="h-7 gap-1 text-xs" onClick={handleSave}>
            <Check className="w-3 h-3" />
            Save
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={handleCancel}>
            <X className="w-3 h-3" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('relative group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p className={cn(
        'text-muted-foreground leading-relaxed',
        compact ? 'text-xs line-clamp-3' : 'text-sm',
      )}>
        {text}
      </p>
      {editable && onSave && (
        <button
          onClick={() => setIsEditing(true)}
          className={cn(
            'absolute -right-1 -top-1 h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Pencil className="h-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}
