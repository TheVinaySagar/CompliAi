import type { Message } from "@/lib/dummy"
import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  message: Message
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === "user"

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm",
          isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-200 text-gray-900 rounded-bl-none",
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={cn("text-xs mt-1", isUser ? "text-blue-100" : "text-gray-500")}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
