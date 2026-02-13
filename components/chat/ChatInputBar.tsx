import React, { useState, useRef, useCallback } from 'react'
import { Plus, Users, FlaskConical, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatInputBarProps {
  onSend: (text: string) => void
  onAddStudy?: () => void
  onAddAudience?: () => void
  onAttach?: () => void
  placeholder?: string
  className?: string
  /** Whether this is the home-screen variant (larger, centered) */
  variant?: 'home' | 'chat'
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSend,
  onAddStudy,
  onAddAudience,
  onAttach,
  placeholder = 'What do you want to research?',
  className,
  variant = 'chat',
}) => {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleInput = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [])

  const isHome = variant === 'home'

  return (
    <div
      className={cn(
        'border rounded-2xl bg-card shadow-sm focus-within:ring-1 focus-within:ring-ring transition-shadow',
        isHome && 'shadow-md',
        className,
      )}
    >
      {/* Action buttons row */}
      <div className="flex items-center gap-1 px-3 pt-2.5 pb-0">
        {onAttach && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-foreground text-xs gap-1"
            onClick={onAttach}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        )}
        {onAddAudience && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-muted-foreground hover:text-foreground text-xs gap-1.5"
            onClick={onAddAudience}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Audience</span>
          </Button>
        )}
        {onAddStudy && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-muted-foreground hover:text-foreground text-xs gap-1.5"
            onClick={onAddStudy}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Add Study</span>
          </Button>
        )}
      </div>

      {/* Text input + send */}
      <div className="flex items-end gap-2 px-3 pb-2.5 pt-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => {
            setText(e.target.value)
            handleInput()
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed',
            isHome ? 'min-h-[40px] py-2' : 'min-h-[32px] py-1',
          )}
        />
        <Button
          size="icon"
          className="h-8 w-8 rounded-full flex-shrink-0"
          onClick={handleSend}
          disabled={!text.trim()}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
