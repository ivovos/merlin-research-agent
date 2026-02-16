import React, { useRef, useEffect } from 'react'
import type { ChatMessage, ProcessStep } from '@/types'
import type { PickerMethod } from './MethodsPicker'
import type { PickerAudience } from './AudiencePicker'
import { UserMessage } from './UserMessage'
import { AIMessage } from './AIMessage'
import { FindingsMessage } from './FindingsMessage'
import { SystemMessage } from './SystemMessage'
import { AttachmentPreview } from './AttachmentPreview'
import { DeliverableCard } from './DeliverableCard'
import { ChatInputBar } from './ChatInputBar'
import { ProcessSteps } from '@/components/ProcessSteps'
import { Loader2 } from 'lucide-react'

interface ChatStreamProps {
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
  onSelectMethod?: (method: PickerMethod) => void
  onAddAudience?: (audience: PickerAudience) => void
  onOpenPlan?: (studyId: string) => void
  /** Processing state — shown as inline indicator at end of stream */
  processing?: {
    steps?: ProcessStep[]
    isComplete?: boolean
    thinkingTime?: number
  }
  /** Current brand — used to filter audiences in the picker */
  brand?: string
  className?: string
}

export const ChatStream: React.FC<ChatStreamProps> = ({
  messages,
  onSendMessage,
  onSelectMethod,
  onAddAudience,
  onOpenPlan,
  processing,
  brand,
  className,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isInitialRef = useRef(true)

  // Scroll to bottom: instant on first render, smooth on subsequent updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: isInitialRef.current ? 'auto' : 'smooth',
      })
      isInitialRef.current = false
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, processing])

  return (
    <div className={`flex-1 flex flex-col h-full bg-background relative overflow-hidden ${className ?? ''}`}>
      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="py-6 space-y-6 max-w-3xl mx-auto px-6">
          {/* Messages */}
          <div className="space-y-6">
            {messages.map(msg => {
              switch (msg.type) {
                case 'user':
                  return <UserMessage key={msg.id} message={msg} />
                case 'ai':
                  return <AIMessage key={msg.id} message={msg} />
                case 'findings':
                  return <FindingsMessage key={msg.id} message={msg} onOpenPlan={onOpenPlan} />
                case 'system':
                  return <SystemMessage key={msg.id} message={msg} />
                case 'attachment':
                  return <AttachmentPreview key={msg.id} attachment={msg.attachment} />
                case 'deliverable':
                  return <DeliverableCard key={msg.id} message={msg} />
                default:
                  return null
              }
            })}

            {/* Processing indicator */}
            {processing && !processing.isComplete && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {processing.steps ? (
                  <ProcessSteps
                    steps={processing.steps}
                    isComplete={false}
                    thinkingTime={processing.thinkingTime}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scroll anchor with spacing for floating input */}
          <div ref={messagesEndRef} className="h-24" />
        </div>
      </div>

      {/* Floating input bar */}
      <div className="absolute bottom-0 left-0 right-0 py-6 z-10 pointer-events-none">
        <div className="max-w-[576px] mx-auto px-6 pointer-events-auto">
          <ChatInputBar
            onSend={onSendMessage}
            onSelectMethod={onSelectMethod}
            onAddAudience={onAddAudience}
            onAttach={() => {}}
            placeholder="Ask another question"
            variant="chat"
            brand={brand}
          />
        </div>
      </div>
    </div>
  )
}
