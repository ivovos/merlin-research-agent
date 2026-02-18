import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Plus, Users, Slash, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MethodsPicker, type PickerMethod } from './MethodsPicker'
import { AudiencePicker, type PickerAudience } from './AudiencePicker'

// ── Helper: parse placeholder text into styled segments ──

interface PlaceholderSegment {
  text: string
  highlighted: boolean
}

/** Split text so that `@token` and `/token` runs are marked as highlighted. */
function parsePlaceholderTokens(raw: string): PlaceholderSegment[] {
  const segments: PlaceholderSegment[] = []
  // Match @word or /word at start-of-string or after whitespace
  const regex = /((?:^|\s)[/@]\S+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(raw)) !== null) {
    // Text before this token
    if (match.index > lastIndex) {
      segments.push({ text: raw.slice(lastIndex, match.index), highlighted: false })
    }
    segments.push({ text: match[1], highlighted: true })
    lastIndex = match.index + match[1].length
  }
  // Trailing text
  if (lastIndex < raw.length) {
    segments.push({ text: raw.slice(lastIndex), highlighted: false })
  }
  return segments
}

interface ChatInputBarProps {
  onSend: (text: string) => void
  onSelectMethod?: (method: PickerMethod) => void
  onAddAudience?: (audience: PickerAudience) => void
  onAttach?: () => void
  placeholder?: string
  /** Rotating placeholder phrases with typewriter animation. Overrides static placeholder. */
  animatedPlaceholders?: string[]
  className?: string
  /** Whether this is the home-screen variant (larger, centered) */
  variant?: 'home' | 'chat'
  /** Current brand — used to filter audiences in the picker */
  brand?: string
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSend,
  onSelectMethod,
  onAddAudience,
  onAttach,
  placeholder = 'What do you want to research?',
  animatedPlaceholders,
  className,
  variant = 'chat',
  brand,
}) => {
  const [text, setText] = useState('')
  const [methodsOpen, setMethodsOpen] = useState(false)
  const [audienceOpen, setAudienceOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Animated placeholder (typewriter cycle) ──
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!animatedPlaceholders || animatedPlaceholders.length === 0) return

    cancelledRef.current = false
    const phrases = animatedPlaceholders

    let phraseIdx = 0
    let charIdx = 0
    let isDeleting = false
    let timer: ReturnType<typeof setTimeout>

    const schedule = (fn: () => void, ms: number) => {
      timer = setTimeout(() => {
        if (!cancelledRef.current) fn()
      }, ms)
    }

    const tick = () => {
      if (cancelledRef.current) return
      const current = phrases[phraseIdx]

      if (!isDeleting) {
        charIdx++
        setDisplayedPlaceholder(current.slice(0, charIdx))

        if (charIdx >= current.length) {
          schedule(() => { isDeleting = true; tick() }, 2400)
          return
        }
        schedule(tick, 38 + Math.random() * 28)
      } else {
        charIdx--
        setDisplayedPlaceholder(current.slice(0, charIdx))

        if (charIdx <= 0) {
          isDeleting = false
          phraseIdx = (phraseIdx + 1) % phrases.length
          schedule(tick, 400)
          return
        }
        schedule(tick, 18)
      }
    }

    schedule(tick, 600)

    return () => {
      cancelledRef.current = true
      clearTimeout(timer)
    }
  }, [animatedPlaceholders])

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

  // Parse animated placeholder into styled segments (memoised on the string value)
  const placeholderSegments = useMemo(
    () => (animatedPlaceholders ? parsePlaceholderTokens(displayedPlaceholder) : []),
    [animatedPlaceholders, displayedPlaceholder],
  )

  const showAnimatedOverlay = !!animatedPlaceholders && text.length === 0

  return (
    <div
      className={cn(
        'relative border rounded-2xl bg-card shadow-sm focus-within:ring-1 focus-within:ring-ring transition-shadow',
        isHome && 'shadow-md',
        className,
      )}
    >
      {/* Methods picker lightbox — portaled to body */}
      <MethodsPicker
        open={methodsOpen}
        onClose={() => setMethodsOpen(false)}
        onSelect={(method) => {
          onSelectMethod?.(method)
          setMethodsOpen(false)
        }}
      />

      {/* Audience picker lightbox — portaled to body */}
      <AudiencePicker
        open={audienceOpen}
        onClose={() => setAudienceOpen(false)}
        brand={brand}
        onSelect={(audience) => {
          // Insert @audience-id into text if triggered by typing @
          let newText = text
          if (newText.endsWith('@')) {
            newText = newText.slice(0, -1)
          }
          setText(newText + `@${audience.id} `)
          onAddAudience?.(audience)
          setAudienceOpen(false)
          textareaRef.current?.focus()
        }}
      />

      {/* Text input */}
      <div className="relative px-3 pt-2.5 pb-1">
        {/* Animated placeholder overlay with styled tokens */}
        {showAnimatedOverlay && (
          <div
            aria-hidden
            className={cn(
              'absolute inset-0 px-3 pt-2.5 pointer-events-none text-sm leading-relaxed whitespace-pre-wrap',
              isHome ? 'py-[calc(0.625rem+0.75rem)]' : 'py-[calc(0.625rem+0.5rem)]',
            )}
          >
            {placeholderSegments.map((seg, i) => (
              <span
                key={i}
                className={seg.highlighted ? 'text-foreground/70 font-medium' : 'text-muted-foreground'}
              >
                {seg.text}
              </span>
            ))}
            <span className="text-muted-foreground animate-pulse">|</span>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => {
            const val = e.target.value
            setText(val)
            handleInput()

            // Trigger audience picker on @ at start or after whitespace
            if (onAddAudience && /(^|\s)@$/.test(val)) {
              setAudienceOpen(true)
              setMethodsOpen(false)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={animatedPlaceholders ? undefined : placeholder}
          rows={1}
          className={cn(
            'w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed relative z-10',
            isHome ? 'min-h-[60px] py-3' : 'min-h-[48px] py-2',
          )}
        />
      </div>

      {/* Action buttons row + send */}
      <div className="flex items-center gap-1 px-3 pb-2.5 pt-0">
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
            onClick={() => setAudienceOpen(prev => !prev)}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Audience</span>
          </Button>
        )}
        {onSelectMethod && variant !== 'home' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-muted-foreground hover:text-foreground text-xs gap-1.5"
            onClick={() => setMethodsOpen(prev => !prev)}
          >
            <Slash className="w-3.5 h-3.5" />
            <span>Add Method</span>
          </Button>
        )}
        <Button
          size="icon"
          className="h-8 w-8 rounded-xl flex-shrink-0 ml-auto"
          onClick={handleSend}
          disabled={!text.trim()}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
