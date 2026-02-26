import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Plus, Users, Slash, ArrowUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MethodsPicker, type PickerMethod } from './MethodsPicker'
import { AudiencePicker, type PickerAudience } from './AudiencePicker'
import type { SelectedSegment } from '@/types'

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
  /** Selected segments shown as pills above the textarea */
  selectedSegments?: SelectedSegment[]
  /** Remove a segment pill */
  onRemoveSegment?: (questionId: string, answerLabel: string) => void
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
  selectedSegments,
  onRemoveSegment,
}) => {
  const params = {
    container: {
      borderRadius: 16,
      shadowBlur: 4,
      shadowOpacity: 0.08,
    },
    textarea: {
      minHeight: 48,
      maxHeight: 160,
      fontSize: 14,
    },
    sendButton: {
      size: 32,
      borderRadius: 12,
    },
    typewriter: {
      typeSpeed: 45,
      deleteSpeed: 20,
      pauseDuration: 3000,
      initialDelay: 800,
      initialHold: 2400,
      clearPause: 500,
    },
  }

  const [text, setText] = useState('')
  const [methodsOpen, setMethodsOpen] = useState(false)
  const [audienceOpen, setAudienceOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Animated placeholder (typewriter cycle) ──
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const [placeholderOpacity, setPlaceholderOpacity] = useState(1)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!animatedPlaceholders || animatedPlaceholders.length === 0) return

    cancelledRef.current = false
    const phrases = animatedPlaceholders
    const tw = params.typewriter

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
          // Pause to let it land, then delete
          schedule(() => { isDeleting = true; tick() }, tw.pauseDuration)
          return
        }
        schedule(tick, tw.typeSpeed + Math.random() * 20)
      } else {
        charIdx--
        setDisplayedPlaceholder(current.slice(0, charIdx))

        if (charIdx <= 0) {
          isDeleting = false
          phraseIdx = (phraseIdx + 1) % phrases.length
          schedule(tick, tw.clearPause)
          return
        }
        schedule(tick, tw.deleteSpeed)
      }
    }

    // Start with "Ask them anything", hold, then fade and begin cycling
    setDisplayedPlaceholder('Ask them anything')
    setPlaceholderOpacity(1)

    schedule(() => {
      // Fade out the initial text
      setPlaceholderOpacity(0)
      schedule(() => {
        setDisplayedPlaceholder('')
        setPlaceholderOpacity(1)
        // Begin typing the first prompt
        schedule(tick, 200)
      }, 400) // matches CSS transition duration
    }, tw.initialHold)

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
    el.style.height = Math.min(el.scrollHeight, params.textarea.maxHeight) + 'px'
  }, [params.textarea.maxHeight])

  const isHome = variant === 'home'

  // Parse animated placeholder into styled segments (memoised on the string value)
  const placeholderSegments = useMemo(
    () => (animatedPlaceholders ? parsePlaceholderTokens(displayedPlaceholder) : []),
    [animatedPlaceholders, displayedPlaceholder],
  )

  const showAnimatedOverlay = !!animatedPlaceholders && text.length === 0

  // Segment pill state
  const hasSegments = !!(selectedSegments && selectedSegments.length > 0)
  const segmentRespondentCount = hasSegments
    ? Math.round(selectedSegments!.reduce((sum, s) => sum + (s.respondents * s.percentage / 100), 0))
    : 0

  return (
    <div
      className={cn(
        'relative border bg-card focus-within:ring-1 focus-within:ring-ring transition-shadow',
        className,
      )}
      style={{
        borderRadius: params.container.borderRadius,
        boxShadow: variant === 'home' ? 'none' : `0 2px ${params.container.shadowBlur}px rgba(0,0,0,${params.container.shadowOpacity})`,
      }}
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

      {/* Text input with inline segment pill */}
      <div className="relative px-3 pt-2.5 pb-1">
        {/* Animated placeholder overlay with styled tokens */}
        {showAnimatedOverlay && !hasSegments && (
          <div
            aria-hidden
            className={cn(
              'absolute inset-0 px-3 pt-2.5 pointer-events-none text-sm leading-relaxed whitespace-pre-wrap transition-opacity duration-400',
              isHome ? 'py-[calc(0.625rem+0.75rem)]' : 'py-[calc(0.625rem+0.5rem)]',
            )}
            style={{ opacity: placeholderOpacity }}
          >
            {placeholderSegments.map((seg, i) => (
              <span
                key={i}
                className={seg.highlighted ? 'text-foreground font-semibold' : 'text-muted-foreground'}
              >
                {seg.text}
              </span>
            ))}
            <span className="text-muted-foreground animate-pulse">|</span>
          </div>
        )}
        <div className="flex items-start gap-2">
          {/* Inline segment pill */}
          {hasSegments && (
            <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full px-3 py-1.5 inline-flex items-center gap-1.5 animate-in fade-in duration-200 shadow-sm shrink-0 mt-1.5">
              New segment · {segmentRespondentCount.toLocaleString()}
              <button
                type="button"
                onClick={() => {
                  // Remove all selected segments
                  selectedSegments!.forEach(s => onRemoveSegment?.(s.questionId, s.answerLabel))
                }}
                className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors -mr-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
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
            placeholder={hasSegments ? 'Ask about this segment...' : (animatedPlaceholders ? undefined : placeholder)}
            rows={1}
            className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed relative z-10 py-2"
            style={{
              fontSize:  params.textarea.fontSize,
              minHeight: params.textarea.minHeight,
            }}
          />
        </div>
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
          className="flex-shrink-0 ml-auto"
          style={{
            height:       params.sendButton.size,
            width:        params.sendButton.size,
            borderRadius: params.sendButton.borderRadius,
          }}
          onClick={handleSend}
          disabled={!text.trim()}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
