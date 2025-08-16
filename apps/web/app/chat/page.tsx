"use client"

import React, { memo, useState, useEffect, useCallback } from "react"
import { useChat } from "@/contexts/chat-context"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import ChatBubble from "@/components/chat-bubble"
import { ChatMessageSkeleton, InlineLoading } from "@/components/ui/loading"
import { 
  Send, 
  Sparkles, 
  Loader2, 
  FileText, 
  X, 
  Upload, 
  Bot, 
  MessageSquare,
  Zap,
  Search,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CHAT_CONFIG } from "@/lib/constants"
import { debounce, getErrorMessage } from "@/lib/utils"
import { type UploadedDocument } from "@/types"

const QUICK_QUESTIONS = [
  {
    text: "What are the key requirements for ISO 27001?",
    category: "ISO 27001"
  },
  {
    text: "How do I implement SOC 2 controls?",
    category: "SOC 2"
  },
  {
    text: "What's required for GDPR compliance?",
    category: "GDPR"
  },
  {
    text: "Help me create a data retention policy",
    category: "Policy"
  }
] as const

const DOCUMENT_QUESTIONS = [
  {
    text: "Summarize this document",
    category: "Summary"
  },
  {
    text: "What are the main compliance requirements?",
    category: "Requirements"
  },
  {
    text: "List all security controls mentioned",
    category: "Controls"
  },
  {
    text: "What are the key policies outlined?",
    category: "Policies"
  }
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
    <div className="flex flex-col h-full bg-background">
      {/* Enhanced Header */}
      <div className="bg-background/80 backdrop-blur-sm shadow-sm border-b border-border px-4 sm:px-6 py-2">
        <div className="flex flex-col gap-3">
          {/* Mobile Action Buttons (shown only on mobile) */}
      <div className="flex gap-2 sm:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearMessages}
          className="p-2 hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('/upload', '_blank')}
          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Document Selection */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <Select value={selectedDocument} onValueChange={setSelectedDocument} disabled={loadingDocuments}>
                <SelectTrigger className="w-full sm:w-48 bg-background border-border hover:border-border/80 transition-colors">
                  <SelectValue placeholder={loadingDocuments ? "Loading documents..." : "Select document"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>General Chat</span>
                    </div>
                  </SelectItem>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      <div className="flex items-center gap-2">
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
                  className="hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearMessages}
                className="hover:bg-accent border-border"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/upload', '_blank')}
                className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>
        
        {/* Selected Document Info */}
        {selectedDocument !== "general" && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            {(() => {
              const doc = documents.find(d => d.id === selectedDocument)
              return doc ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Document info */}
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Chatting with: {doc.name}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        {doc.chunks_created} chunks • {doc.controls_identified} controls identified
                      </p>
                    </div>
                  </div>
                  {/* Badge */}
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                  >
                    Document Mode
                  </Badge>
                </div>
              ) : null
            })()}
          </div>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Card className="mx-auto max-w-2xl border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-fit">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Welcome to CompliAI
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2">
                    {selectedDocument !== "general"
                      ? "Ask questions about your uploaded document" 
                      : "I'm here to help you navigate compliance requirements, create policies, and understand regulatory frameworks."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-4">
                      {selectedDocument !== "general" ? "Try asking about your document:" : "Try asking one of these questions:"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedDocument !== "general" ? DOCUMENT_QUESTIONS : QUICK_QUESTIONS).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start h-auto p-4 bg-transparent hover:bg-accent border-border"
                        onClick={() => setInputValue(question.text)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{question.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">{question.category}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Document Upload CTA when no document selected */}
                  {selectedDocument === "general" && documents.length === 0 && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-muted/50 to-muted rounded-lg border-2 border-dashed border-border">
                      <div className="text-center">
                        <div className="mx-auto mb-3 p-3 bg-muted rounded-full w-fit">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">No documents uploaded</p>
                        <p className="text-xs text-muted-foreground mb-4">Upload compliance documents to chat with them</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/upload', '_blank')}
                          className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-800 dark:hover:text-blue-300 transition-colors"
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
            <Alert className="max-w-2xl mx-auto mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
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

      {/* Enhanced Input Area */}
      <div className="bg-background/80 backdrop-blur-sm border-t border-border p-4 sm:p-2">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder={selectedDocument !== "general"
                  ? "Ask questions about this document..." 
                  : "Ask about compliance requirements, policies, or controls..."
                }
                className="min-h-[3rem] max-h-32 resize-none border-input focus:border-ring focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed bg-background"
                maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {inputValue.length}/{CHAT_CONFIG.MAX_MESSAGE_LENGTH}
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="self-end bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-12 px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="hidden sm:inline">Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
})

ChatPage.displayName = "ChatPage"

export default ChatPage
