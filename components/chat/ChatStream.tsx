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
import { PlanCard } from './PlanCard'
import { ChatInputBar } from './ChatInputBar'
import { ProcessSteps } from '@/components/ProcessSteps'
import { Loader2 } from 'lucide-react'

interface ChatStreamProps {
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
  onSelectMethod?: (method: PickerMethod) => void
  onAddAudience?: (audience: PickerAudience) => void
  onOpenPlan?: (studyId: string) => void
  onApprovePlan?: (messageId: string) => void
  onReviewPlan?: (messageId: string) => void
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
  onApprovePlan,
  onReviewPlan,
  processing,
  brand,
  className,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMsgRef = useRef<HTMLDivElement>(null)
  const isInitialRef = useRef(true)

  // If the last message is findings, scroll to its top; otherwise scroll to bottom
  const lastMessage = messages[messages.length - 1]
  const scrollToStart = lastMessage?.type === 'findings'

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (scrollToStart && lastMsgRef.current) {
        lastMsgRef.current.scrollIntoView({
          behavior: isInitialRef.current ? 'auto' : 'smooth',
          block: 'start',
        })
      } else {
        messagesEndRef.current?.scrollIntoView({
          behavior: isInitialRef.current ? 'auto' : 'smooth',
        })
      }
      isInitialRef.current = false
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, processing, scrollToStart])

  return (
    <div className={`flex-1 flex flex-col h-full bg-background relative overflow-hidden ${className ?? ''}`}>
      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="py-6 space-y-6 max-w-3xl mx-auto px-6">
          {/* Messages */}
          <div className="space-y-6">
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1
              let node: React.ReactNode = null

              switch (msg.type) {
                case 'user':
                  node = <UserMessage key={msg.id} message={msg} />
                  break
                case 'ai':
                  node = <AIMessage key={msg.id} message={msg} />
                  break
                case 'findings':
                  node = <FindingsMessage key={msg.id} message={msg} onOpenPlan={onOpenPlan} />
                  break
                case 'system':
                  node = <SystemMessage key={msg.id} message={msg} />
                  break
                case 'attachment':
                  node = <AttachmentPreview key={msg.id} attachment={msg.attachment} />
                  break
                case 'deliverable':
                  node = <DeliverableCard key={msg.id} message={msg} />
                  break
                case 'plan':
                  node = (
                    <PlanCard
                      key={msg.id}
                      message={msg}
                      onApprove={onApprovePlan}
                      onReviewPlan={onReviewPlan}
                    />
                  )
                  break
              }

              // Wrap the last findings message with a ref so we can scroll to its top
              if (isLast && msg.type === 'findings') {
                return <div key={msg.id} ref={lastMsgRef}>{node}</div>
              }
              return node
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
