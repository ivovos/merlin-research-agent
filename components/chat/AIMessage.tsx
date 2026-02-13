import React from 'react'
import type { ChatMessageAI } from '@/types'

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

interface AIMessageProps {
  message: ChatMessageAI
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="max-w-[80%] lg:max-w-[60%] text-sm space-y-2">
        {renderContent(message.text)}
      </div>
    </div>
  )
}
