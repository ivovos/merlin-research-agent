import React, { useCallback, useState } from 'react'
import type { ChatMessageAI } from '@/types'
import { ActionStrip } from './ActionStrip'
import { ChevronRight, ChevronDown } from 'lucide-react'

// Simple markdown-like renderer for AI messages
function renderContent(content: string): React.ReactNode[] {
  const blocks = content.split(/\n\n+/)

  return blocks.map((block, blockIndex) => {
    const lines = block.split('\n')
    const isNumberedList = lines.every(
      line => /^\d+\.\s/.test(line.trim()) || line.trim() === '',
    )

    if (isNumberedList && lines.some(line => /^\d+\.\s/.test(line.trim()))) {
      const listItems = lines.filter(line => /^\d+\.\s/.test(line.trim()))
      return (
        <ol key={blockIndex} className="list-decimal list-inside space-y-1 my-2">
          {listItems.map((item, itemIndex) => (
            <li key={itemIndex} className="text-foreground/90">
              {renderInlineMarkdown(item.replace(/^\d+\.\s*/, ''))}
            </li>
          ))}
        </ol>
      )
    }

    return (
      <p key={blockIndex} className="text-foreground/90 leading-relaxed">
        {renderInlineMarkdown(block)}
      </p>
    )
  })
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// ── Collapsible thinking section ──

interface ThinkingSectionProps {
  thinking: string
  steps?: string[]
}

const ThinkingSection: React.FC<ThinkingSectionProps> = ({ thinking, steps }) => {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors group"
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center gap-1 font-medium">
          <span>{thinking}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-200">
      <div
        className="flex items-center gap-2 mb-3 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        onClick={() => setExpanded(false)}
      >
        <span>{thinking}</span>
        <ChevronDown className="w-4 h-4" />
      </div>
      {steps && steps.length > 0 && (
        <div className="space-y-1.5 pl-1">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── AI Message ──

interface AIMessageProps {
  message: ChatMessageAI
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.text)
  }, [message.text])

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="max-w-[80%] lg:max-w-[60%]">
        {/* Collapsible thinking section */}
        {message.thinking && (
          <div className="mb-3">
            <ThinkingSection thinking={message.thinking} steps={message.thinkingSteps} />
          </div>
        )}
        <div className="text-sm space-y-2">
          {renderContent(message.text)}
        </div>
        <ActionStrip
          variant="ai-interpretation"
          onCopy={handleCopy}
          onThumbsUp={() => {}}
          onThumbsDown={() => {}}
          onSave={() => {}}
          onShare={() => {}}
        />
      </div>
    </div>
  )
}
