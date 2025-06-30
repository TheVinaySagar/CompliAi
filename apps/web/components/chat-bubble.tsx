"use client"

import type { Message } from "@/lib/dummy"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface ChatBubbleProps {
  message: Message
  onGeneratePolicy?: (action: string) => void
}

export default function ChatBubble({ message, onGeneratePolicy }: ChatBubbleProps) {
  const isUser = message.sender === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-3xl rounded-lg px-4 py-3 ${
          isUser ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-900"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

        {message.hasGenerateButton && message.suggestedAction && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Button
              onClick={() => onGeneratePolicy?.(message.suggestedAction!)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {message.suggestedAction}
            </Button>
          </div>
        )}

        <div className={`text-xs mt-2 ${isUser ? "text-blue-100" : "text-gray-500"}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
