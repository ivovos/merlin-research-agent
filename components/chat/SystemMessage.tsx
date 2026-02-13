import React from 'react'
import type { ChatMessageSystem } from '@/types'

interface SystemMessageProps {
  message: ChatMessageSystem
}

export const SystemMessage: React.FC<SystemMessageProps> = ({ message }) => {
  return (
    <div className="flex justify-center animate-in fade-in duration-300">
      <span className="text-xs text-muted-foreground px-4 py-1.5 bg-muted/50 rounded-full">
        {message.text}
      </span>
    </div>
  )
}
