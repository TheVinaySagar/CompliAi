"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { apiClient, type ChatRequest, type ChatResponse } from "@/lib/api-client"
import { type Message, type Conversation } from "@/types"
import { STORAGE_KEYS } from "@/lib/constants"
import { safeJsonParse, getErrorMessage, generateId } from "@/lib/utils"

interface ChatContextType {
  messages: Message[]
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  error: string | null
  sendMessage: (message: string, options?: {
    framework_context?: string
    document_id?: string
    mode?: string
  }) => Promise<void>
  loadConversations: () => Promise<void>
  loadConversationHistory: (conversationId: string) => Promise<void>
  createNewConversation: () => void
  deleteConversation: (conversationId: string) => Promise<void>
  clearMessages: () => void
  clearAllData: () => void
  setError: (error: string | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on client side before accessing localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load conversations and messages from localStorage on mount
  useEffect(() => {
    // Only run after client is mounted to avoid hydration issues
    if (!isClient) return

    const loadLocalData = () => {
      try {
        // Load conversations
        const storedConversations = localStorage.getItem(STORAGE_KEYS.CHAT_CONVERSATIONS)
        if (storedConversations) {
          const parsedConversations = safeJsonParse<Conversation[]>(storedConversations, [])
          setConversations(parsedConversations.map(conv => ({
            ...conv,
            created_at: new Date(conv.created_at),
            updated_at: new Date(conv.updated_at)
          })))
        }

        // Load messages for current conversation
        const storedMessages = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)
        const storedConversationId = localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID)
        
        if (storedMessages && storedConversationId) {
          const parsedMessages = safeJsonParse<Message[]>(storedMessages, [])
          setMessages(parsedMessages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })))
          setCurrentConversationId(storedConversationId)
        }
      } catch (error) {
        console.error('Error loading chat data:', error)
      }
    }

    loadLocalData()
    loadConversations()
  }, [isClient])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (isClient && conversations.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CHAT_CONVERSATIONS, JSON.stringify(conversations))
    }
  }, [conversations, isClient])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isClient && messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages))
    } else if (isClient && messages.length === 0) {
      // Clear messages from localStorage when messages array is empty
      localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES)
    }
  }, [messages, isClient])

  // Save current conversation ID to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      if (currentConversationId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID, currentConversationId)
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID)
      }
    }
  }, [currentConversationId, isClient])

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.getConversations()
      if (response.data) {
        const formattedConversations = response.data.map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          last_message: conv.last_message,
          created_at: new Date(conv.created_at),
          updated_at: new Date(conv.updated_at),
          message_count: conv.message_count || 0
        }))
        setConversations(formattedConversations)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      setError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadConversationHistory = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.getConversationHistory(conversationId)
      if (response.data) {
        const formattedMessages = response.data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp),
          conversation_id: msg.conversation_id,
          confidence_score: msg.confidence_score,
          sources: msg.sources || [],
          clause_references: msg.clause_references || [],
          control_ids: msg.control_ids || []
        }))
        setMessages(formattedMessages)
        setCurrentConversationId(conversationId)
      }
    } catch (error) {
      console.error('Error loading conversation history:', error)
      setError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (
    messageContent: string, 
    options: {
      framework_context?: string
      document_id?: string
      mode?: string
    } = {}
  ) => {
    if (!messageContent.trim()) return

    try {
      setIsLoading(true)
      setError(null)

      // Create user message
      const userMessage: Message = {
        id: generateId(),
        content: messageContent.trim(),
        sender: "user",
        timestamp: new Date(),
        conversation_id: currentConversationId || undefined
      }

      // Add user message to UI immediately
      setMessages(prev => [...prev, userMessage])

      // Prepare API request
      const request: ChatRequest = {
        message: messageContent.trim(),
        conversation_id: currentConversationId || undefined,
        framework_context: options.framework_context,
        document_id: options.document_id,
        mode: options.mode
      }

      // Send to API
      const response = await apiClient.sendMessage(request)
      
      if (response.data) {
        // Create assistant message
        const assistantMessage: Message = {
          id: generateId(),
          content: response.data.response,
          sender: "assistant",
          timestamp: new Date(),
          conversation_id: response.data.conversation_id,
          confidence_score: response.data.confidence_score,
          sources: response.data.sources || [],
          clause_references: response.data.clause_references || [],
          control_ids: response.data.control_ids || []
        }

        // Update messages
        setMessages(prev => [...prev, assistantMessage])

        // Update current conversation ID if new
        if (!currentConversationId && response.data.conversation_id) {
          setCurrentConversationId(response.data.conversation_id)
        }

        // Refresh conversations list
        await loadConversations()
      } else {
        throw new Error(response.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError(getErrorMessage(error))
      
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }, [currentConversationId, loadConversations])

  const createNewConversation = useCallback(() => {
    setMessages([])
    setCurrentConversationId(null)
    setError(null)
  }, [])

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.deleteConversation(conversationId)
      if (response.status === 200) {
        // Remove from local state
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        
        // Clear messages if this was the current conversation
        if (currentConversationId === conversationId) {
          setMessages([])
          setCurrentConversationId(null)
        }
      } else {
        throw new Error(response.error || 'Failed to delete conversation')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      setError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [currentConversationId])

  const clearMessages = useCallback(() => {
    setMessages([])
    setCurrentConversationId(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID)
  }, [])

  const clearAllData = useCallback(() => {
    setMessages([])
    setConversations([])
    setCurrentConversationId(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEYS.CHAT_CONVERSATIONS)
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID)
  }, [])

  const value: ChatContextType = {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    error,
    sendMessage,
    loadConversations,
    loadConversationHistory,
    createNewConversation,
    deleteConversation,
    clearMessages,
    clearAllData,
    setError,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
