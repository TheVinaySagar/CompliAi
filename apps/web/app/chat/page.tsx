"use client"

import React, { memo, useState, useEffect, useCallback } from "react"
import { useChat } from "@/contexts/chat-context"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import ChatBubble from "@/components/chat-bubble"
import { ChatMessageSkeleton, InlineLoading } from "@/components/ui/loading"
import { Send, Sparkles, Loader2, FileText, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CHAT_CONFIG } from "@/lib/constants"
import { debounce, getErrorMessage } from "@/lib/utils"
import { type UploadedDocument } from "@/types"

const QUICK_QUESTIONS = [
  "What are the key requirements for ISO 27001?",
  "How do I implement SOC 2 controls?", 
  "What's required for GDPR compliance?",
  "Help me create a data retention policy"
] as const

const DOCUMENT_QUESTIONS = [
  "Summarize this document",
  "What are the main compliance requirements?",
  "List all security controls mentioned",
  "What are the key policies outlined?"
] as const

const ChatPage = memo(() => {
  const [inputValue, setInputValue] = useState("")
  const [selectedFramework, setSelectedFramework] = useState<string>("")
  const [selectedDocument, setSelectedDocument] = useState<string>("general")
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearMessages,
    setError 
  } = useChat()
  const { user } = useAuth()

  // Clear any previous errors when component mounts and load documents
  useEffect(() => {
    setError(null)
    loadDocuments()
  }, [setError])

  const loadDocuments = useCallback(async () => {
    try {
      setLoadingDocuments(true)
      const response = await apiClient.getDocuments()
      
      if (response.success && response.data) {
        const formattedDocuments: UploadedDocument[] = response.data.map((doc: any) => ({
          id: doc.document_id || doc.id,
          name: doc.name || doc.document_name,
          file_type: doc.file_type || doc.type || 'unknown',
          file_size: doc.file_size || doc.size || 'Unknown',
          uploaded_at: new Date(doc.uploaded_at || doc.created_at),
          user_id: doc.user_id,
          status: doc.status || 'processed',
          chunks_created: doc.chunks_created || doc.chunks_count,
          controls_identified: doc.controls_identified,
          error_message: doc.error_message
        }))
        setDocuments(formattedDocuments)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setError('Failed to load documents')
    } finally {
      setLoadingDocuments(false)
    }
  }, [setError])

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    if (message.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
      setError(`Message too long. Maximum ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters allowed.`)
      return
    }

    try {
      await sendMessage(message, {
        framework_context: selectedFramework || undefined,
        document_id: selectedDocument !== "general" ? selectedDocument : undefined,
        mode: selectedDocument !== "general" ? "document" : undefined
      })
      setInputValue("")
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [inputValue, isLoading, selectedFramework, selectedDocument, sendMessage, setError])

  const handleQuickQuestion = useCallback(async (question: string) => {
    if (isLoading) return
    
    try {
      await sendMessage(question)
    } catch (error) {
      console.error('Failed to send quick question:', error)
    }
  }, [isLoading, sendMessage])

  const handleGeneratePolicy = useCallback((action: string) => {
    const policyPrompt = `Help me generate a ${action.replace("Generate ", "")} policy document. Please provide a comprehensive template that includes all necessary sections and compliance requirements.`
    handleQuickQuestion(policyPrompt)
  }, [handleQuickQuestion])

  // Debounced input validation
  const debouncedValidation = useCallback(
    debounce((value: string) => {
      if (value.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
        setError(`Message too long. Maximum ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters allowed.`)
      } else if (error && error.includes('Message too long')) {
        setError(null)
      }
    }, 300),
    [setError, error]
  )

  useEffect(() => {
    debouncedValidation(inputValue)
  }, [inputValue, debouncedValidation])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Compliance Assistant</h1>
            <p className="text-sm text-gray-600">Ask questions about compliance frameworks, policies, and requirements</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Document Selection */}
            <div className="flex items-center space-x-2">
              <Select value={selectedDocument} onValueChange={setSelectedDocument} disabled={loadingDocuments}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={loadingDocuments ? "Loading documents..." : "Select document"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Chat</SelectItem>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {documents.length === 0 && !loadingDocuments && (
                    <SelectItem value="no-documents" disabled>
                      No documents uploaded
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedDocument !== "general" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocument("general")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Upload Document Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/upload', '_blank')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
        
        {/* Selected Document Info */}
        {selectedDocument !== "general" && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md border">
            {(() => {
              const doc = documents.find(d => d.id === selectedDocument)
              return doc ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Chatting with: {doc.name}</p>
                      <p className="text-xs text-blue-600">
                        {doc.chunks_created} chunks • {doc.controls_identified} controls identified
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Document Mode</Badge>
                </div>
              ) : null
            })()}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Card className="mx-auto max-w-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <span>Welcome to CompliAI</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedDocument !== "general"
                      ? "Ask questions about your uploaded document" 
                      : "I'm here to help you navigate compliance requirements, create policies, and understand regulatory frameworks."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedDocument !== "general" ? "Try asking about your document:" : "Try asking one of these questions:"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedDocument !== "general" ? DOCUMENT_QUESTIONS : QUICK_QUESTIONS).map((question, index) => (
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
                  
                  {/* Document Upload CTA when no document selected */}
                  {selectedDocument === "general" && documents.length === 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 mb-1">No documents uploaded</p>
                        <p className="text-xs text-gray-600 mb-3">Upload compliance documents to chat with them</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/upload', '_blank')}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <Alert className="max-w-2xl mx-auto mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-red-600 hover:text-red-800"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} onGeneratePolicy={handleGeneratePolicy} />
          ))}

          {isLoading && messages.length > 0 && (
            <ChatMessageSkeleton />
          )}
        </div>
      </div>

      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={selectedDocument !== "general"
                ? "Ask questions about this document..." 
                : "Ask about compliance requirements, policies, or controls..."
              }
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-right">
            {inputValue.length}/{CHAT_CONFIG.MAX_MESSAGE_LENGTH}
          </div>
        </form>
      </div>
    </div>
  )
})

ChatPage.displayName = "ChatPage"

export default ChatPage
