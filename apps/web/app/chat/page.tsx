"use client"

import type React from "react"

import { useState } from "react"
import { dummyMessages, type Message } from "@/lib/dummy"
import ChatBubble from "@/components/chat-bubble"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(dummyMessages)
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I understand your question. As an AI compliance assistant, I can help you with various compliance-related queries. Please provide more specific details about what you'd like to know.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleGeneratePolicy = (action: string) => {
    // Simulate policy generation
    const policyMessage: Message = {
      id: Date.now().toString(),
      content: `I'll help you generate a ${action.replace("Generate ", "")}. Here's a draft template:

**${action.replace("Generate ", "")}**

This is a simulated policy generation. In the full version, this would create a comprehensive policy document that you can download and customize.

Key sections would include:
- Purpose and Scope
- Policy Statement
- Procedures and Controls
- Compliance Requirements
- Review and Update Process

Would you like me to create the full document or focus on a specific section?`,
      sender: "assistant",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, policyMessage])
  }

  const quickQuestions = [
    "What does ISO 27001 A.9.4.1 mean?",
    "Do I need a BYOD policy for SOC 2?",
    "How do I implement access controls?",
    "What are the GDPR data retention requirements?",
    "Help me create an incident response plan",
  ]

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">AI Compliance Assistant</h1>
        <p className="text-sm text-gray-600">Ask me anything about cybersecurity compliance frameworks</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-8">
                <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to CompliAI Assistant</h2>
                <p className="text-gray-600">I'm here to help you with compliance questions and policy generation.</p>
              </div>

              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Start Questions</CardTitle>
                  <CardDescription>Try asking me one of these common questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start h-auto p-3 bg-transparent"
                        onClick={() => setInputValue(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} onGeneratePolicy={handleGeneratePolicy} />
          ))}
        </div>
      </div>

      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about compliance requirements, policies, or controls..."
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
