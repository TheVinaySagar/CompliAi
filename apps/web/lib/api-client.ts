/**
 * CompliAI API Client
 * Handles all API communications with the backend
 */

import { API_CONFIG, STORAGE_KEYS } from './constants'
import { type ApiResponse, type Source } from '@/types'
import { emitTokenExpired, emitUnauthorized } from './auth-events'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: {
    id: string
    email: string
    full_name: string
    role: string
    is_active: boolean
    department?: string
    permissions: string[]
    created_at: string
    updated_at: string
  }
}

interface ChatRequest {
  message: string
  conversation_id?: string
  framework_context?: string
  document_id?: string
  mode?: string
}

interface ChatResponse {
  response: string
  conversation_id: string
  clause_references: string[]
  control_ids: string[]
  confidence_score: number
  sources: Source[]
}

interface RegisterRequest {
  full_name: string
  email: string
  password: string
  role?: string
  department?: string
  permissions?: string[]
}
interface RegisterRequest {
  full_name: string
  email: string
  password: string
  role?: string
  department?: string
  permissions?: string[]
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl
    this.loadTokenFromStorage()
  }

  private loadTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    }
  }

  private saveTokenToStorage(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      this.token = token
    }
  }

  private removeTokenFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      this.token = null
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private shouldRetry(status: number, attempt: number): boolean {
    return attempt < API_CONFIG.RETRY_ATTEMPTS && 
           (status >= 500 || status === 0 || status === 408)
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1,
    customTimeout?: number | null
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    }

    if (this.token && !endpoint.includes('/auth/login')) {
      headers.Authorization = `Bearer ${this.token}`
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    let timeoutId: NodeJS.Timeout | null = null
    
    // Only set timeout if customTimeout is provided (not null/undefined)
    if (customTimeout !== null && customTimeout !== undefined) {
      timeoutId = setTimeout(() => controller.abort(), customTimeout)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      })

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      const contentType = response.headers.get('content-type')
      let data
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          this.removeTokenFromStorage()
          
          // Emit token expired event for the auth context to handle
          if (!endpoint.includes('/auth/login')) {
            emitTokenExpired()
          } else {
            emitUnauthorized()
          }
        }
        
        // Retry on server errors
        if (this.shouldRetry(response.status, attempt)) {
          await this.delay(1000 * attempt) // Exponential backoff
          return this.makeRequest(endpoint, options, attempt + 1, customTimeout)
        }
        
        return {
          error: data?.detail || data || `HTTP ${response.status}`,
          status: response.status,
          success: false
        }
      }

      return {
        data,
        status: response.status,
        success: true
      }
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Retry on timeout only if timeout was actually set
          if (customTimeout && this.shouldRetry(408, attempt)) {
            await this.delay(1000 * attempt)
            return this.makeRequest(endpoint, options, attempt + 1, customTimeout)
          }
          return {
            error: 'Request timeout',
            status: 408,
            success: false
          }
        }
        
        // Retry on network errors
        if (this.shouldRetry(0, attempt)) {
          await this.delay(1000 * attempt)
          return this.makeRequest(endpoint, options, attempt + 1, customTimeout)
        }
        
        return {
          error: error.message,
          status: 0,
          success: false
        }
      }
      
      return {
        error: 'Network error',
        status: 0,
        success: false
      }
    }
  }

  // Helper methods for different timeout scenarios
  private async makeRequestWithTimeout<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, options, attempt, API_CONFIG.TIMEOUT)
  }

  private async makeRequestWithoutTimeout<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, options, attempt, null)
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.makeRequestWithoutTimeout<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })

    if (response.data?.access_token) {
      this.saveTokenToStorage(response.data.access_token)
    }

    return response
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/auth/me')
  }

  async logout(): Promise<void> {
    this.removeTokenFromStorage()
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token
  }

  getToken(): string | null {
    return this.token
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  // Chat endpoints (NO TIMEOUT for local Ollama models)
  async sendMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.makeRequestWithoutTimeout<ChatResponse>('/chat/', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  async getConversations(): Promise<ApiResponse<any[]>> {
    return this.makeRequestWithoutTimeout<any[]>('/chat/conversations')
  }

  async getConversationHistory(conversationId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequestWithoutTimeout<any[]>(`/chat/conversations/${conversationId}`)
  }

  async deleteConversation(conversationId: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/chat/conversations/${conversationId}`, {
      method: 'DELETE'
    })
  }

  // Document endpoints
  async uploadDocument(file: File, documentName?: string): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append('file', file)
    if (documentName) {
      formData.append('document_name', documentName)
    }

    const url = `${this.baseUrl}/chat/documents/upload`
    const headers: Record<string, string> = {}
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data?.detail || `HTTP ${response.status}`,
          status: response.status,
          success: false
        }
      }

      return {
        data,
        status: response.status,
        success: true
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
        success: false
      }
    }
  }

  async getDocuments(): Promise<ApiResponse<any[]>> {
    return this.makeRequestWithoutTimeout<any[]>('/chat/documents')
  }

  async getDocumentInfo(documentId: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/chat/documents/${documentId}`)
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/chat/documents/${documentId}`, {
      method: 'DELETE'
    })
  }

  async queryDocument(documentId: string, query: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/chat/documents/${documentId}/query`, {
      method: 'POST',
      body: JSON.stringify({ query })
    })
  }

  async getDocumentMapping(documentId: string): Promise<ApiResponse<any>> {
    const url = `${this.baseUrl}/chat/documents/${documentId}/mapping`
    const headers: Record<string, string> = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }
    try {
      const response = await fetch(url, { method: 'GET', headers })
      const data = await response.json()
      if (!response.ok) {
        return {
          error: data?.detail || `HTTP ${response.status}`,
          status: response.status,
          success: false
        }
      }
      return {
        data,
        status: response.status,
        success: true
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
        success: false
      }
    }
  }

  // System endpoints
  async getHealth(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/health')
  }

  async getApiInfo(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/info')
  }

  // Admin endpoints
  async getSystemStatus(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/admin/status')
  }

  async getFrameworks(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/admin/frameworks')
  }

  async getFrameworkDetails(frameworkKey: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/admin/frameworks/${frameworkKey}`)
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export types for use in components
export type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  ChatRequest,
  ChatResponse,
  RegisterRequest
}
