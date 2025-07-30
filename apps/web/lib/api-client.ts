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

  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/auth/profile')
  }

  async updateUserProfile(profileData: { full_name?: string; department?: string }): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  async changePassword(passwordData: { 
    current_password: string; 
    new_password: string 
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    })
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

  // Audit Planner endpoints
  async generatePolicy(request: {
    project_title: string
    source_document_id: string
    target_framework: string
    description?: string
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/audit-planner/generate', {
      method: 'POST',
      body: JSON.stringify({
        project_title: request.project_title,
        source_document_id: request.source_document_id,
        target_framework: request.target_framework,
        description: request.description
      })
    })
  }

  async getAuditProjects(): Promise<ApiResponse<any[]>> {
    return this.makeRequestWithoutTimeout('/audit-planner/projects')
  }

  async getAuditProject(projectId: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/audit-planner/projects/${projectId}`)
  }

  async getAuditProjectStatus(projectId: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/audit-planner/projects/${projectId}/status`)
  }

  async refreshAuditProject(projectId: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/audit-planner/projects/${projectId}/refresh`)
  }

  async exportPolicy(projectId: string, format: 'pdf' | 'docx' | 'txt', options?: {
    include_citations?: boolean
    include_audit_trail?: boolean
  }): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseUrl}/audit-planner/projects/${projectId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          project_id: projectId,
          format,
          include_citations: options?.include_citations ?? true,
          include_audit_trail: options?.include_audit_trail ?? true
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.detail || `HTTP ${response.status}`,
          status: response.status
        }
      }

      const blob = await response.blob()
      return {
        success: true,
        data: blob,
        status: response.status
      }
    } catch (error) {
      console.error('Export policy error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0
      }
    }
  }

  async updateAuditProject(projectId: string, updateData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/audit-planner/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  async deleteAuditProject(projectId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/audit-planner/projects/${projectId}`, {
      method: 'DELETE'
    })
  }

  async getSupportedFrameworks(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/audit-planner/frameworks')
  }

  async getAuditPlannerHealth(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/audit-planner/health')
  }

  // Policy Generator endpoints
  async generatePolicyFromPrompt(request: {
    title: string
    framework: string
    prompt: string
    description?: string
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/policy-generator/generate', {
      method: 'POST',
      body: JSON.stringify({
        title: request.title,
        framework: request.framework,
        prompt: request.prompt,
        description: request.description
      })
    })
  }

  async getPolicyProjects(): Promise<ApiResponse<any[]>> {
    return this.makeRequestWithoutTimeout('/policy-generator/projects')
  }

  async getPolicyProject(projectId: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/policy-generator/projects/${projectId}`)
  }

  async updatePolicyContent(projectId: string, content: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/policy-generator/projects/${projectId}/content`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    })
  }

  async exportPolicyProject(projectId: string, format: 'pdf' | 'docx' | 'txt', options?: {
    include_metadata?: boolean
  }): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseUrl}/policy-generator/projects/${projectId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({
          project_id: projectId,
          format,
          include_metadata: options?.include_metadata ?? true
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.detail || `HTTP ${response.status}`,
          status: response.status
        }
      }

      const blob = await response.blob()
      return {
        success: true,
        data: blob,
        status: response.status
      }
    } catch (error) {
      console.error('Export policy project error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0
      }
    }
  }

  async deletePolicyProject(projectId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/policy-generator/projects/${projectId}`, {
      method: 'DELETE'
    })
  }

  async getPolicyFrameworks(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/policy-generator/frameworks')
  }

  // Team Management endpoints
  async getTeamMembers(): Promise<ApiResponse<any[]>> {
    return this.makeRequestWithoutTimeout('/team/members')
  }

  async getTeamStats(): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout('/team/stats')
  }

  async inviteTeamMember(request: {
    email: string
    full_name: string
    role: string
    department?: string
    permissions?: string[]
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/team/invite', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  async getTeamMember(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequestWithoutTimeout(`/team/members/${userId}`)
  }

  async updateMemberRole(userId: string, role: string, permissions?: string[]): Promise<ApiResponse<any>> {
    return this.makeRequest(`/team/members/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, permissions })
    })
  }

  async updateMemberStatus(userId: string, isActive: boolean): Promise<ApiResponse<any>> {
    return this.makeRequest(`/team/members/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive })
    })
  }

  async removeTeamMember(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/team/members/${userId}`, {
      method: 'DELETE'
    })
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
