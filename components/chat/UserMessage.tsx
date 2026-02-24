import React from 'react'
import type { ChatMessageUser } from '@/types'
import { FileText, Image as ImageIcon } from 'lucide-react'

interface UserMessageProps {
  message: ChatMessageUser
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="flex justify-end animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="max-w-[50%] space-y-2">
        {/* Attachment previews */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex justify-end gap-2 flex-wrap">
            {message.attachments.map(att =>
              att.type === 'image' && (att.thumbnailUrl || att.url) ? (
                <div key={att.id} className="w-16 h-24 rounded-lg overflow-hidden bg-muted/60 flex-shrink-0">
                  <img
                    src={att.thumbnailUrl || att.url}
                    alt={att.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  key={att.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 rounded-lg text-xs text-muted-foreground"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[180px]">{att.name}</span>
                </div>
              )
            )}
          </div>
        )}
        {/* Message bubble */}
        <div className="bg-user-bubble p-6 rounded-[20px] text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </div>
      </div>
    </div>
  )
}
