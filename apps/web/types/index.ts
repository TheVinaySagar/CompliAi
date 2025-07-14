/**
 * CompliAI Frontend Types
 * Centralized type definitions for better maintainability
 */

// Authentication & User Types
export interface User {
  id: string
  name: string
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  department?: string
  permissions: string[]
  isAuthenticated: boolean
}

export type UserRole = "Viewer" | "Editor" | "Admin"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

// Chat & Messaging Types
export interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  conversation_id?: string
  confidence_score?: number
  sources?: Source[]
  clause_references?: string[]
  control_ids?: string[]
}

export interface Conversation {
  id: string
  title: string
  last_message: string
  created_at: Date
  updated_at: Date
  message_count: number
}

export interface Source {
  id?: string
  title?: string
  filename?: string
  name?: string
  url?: string
  link?: string
  page?: number
  section?: string
  framework?: string
  type?: string
  description?: string
  excerpt?: string
  document_id?: string
  downloadUrl?: string
}

// Policy & Compliance Types
export interface Policy {
  id: string
  title: string
  description: string
  framework: string
  status: PolicyStatus
  lastUpdated: Date
  content: string
  type: string
  version?: string
  approved_by?: string
  effective_date?: Date
}

export type PolicyStatus = "Draft" | "Active" | "Under Review" | "Archived"

export interface ComplianceFramework {
  id: string
  name: string
  version: string
  description: string
  category: string
  status: "Active" | "Deprecated"
  requirements_count: number
  last_updated: Date
}

// Control Mapping Types
export interface ControlMapping {
  id: string
  section: string
  mappedTo: string
  framework: string
  confidence: ConfidenceLevel
  status: MappingStatus
  description: string
  control_id?: string
  requirement?: string
  implementation_guidance?: string
}

export type ConfidenceLevel = "High" | "Medium" | "Low"
export type MappingStatus = "Mapped" | "Gap" | "Needs Review" | "In Progress"

// Audit Types
export interface AuditTask {
  id: string
  title: string
  description: string
  framework: string
  priority: Priority
  status: TaskStatus
  assignee?: string
  dueDate: Date
  category: string
  estimated_hours?: number
  completion_percentage?: number
}

export type Priority = "High" | "Medium" | "Low"
export type TaskStatus = "Not Started" | "In Progress" | "Completed" | "Blocked" | "Cancelled"

// Team Management Types
export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  status: MemberStatus
  joinDate: Date
  last_login?: Date
  department?: string
}

export type MemberStatus = "Active" | "Pending" | "Inactive" | "Suspended"

// File Upload Types
export interface UploadedFile {
  id: string
  name: string
  size: string
  uploadDate: Date
  extractedPolicies: number
  mappedControls: number
  status: FileStatus
  file_type?: string
  uploaded_by?: string
  processing_details?: string
}

export type FileStatus = "Processing" | "Completed" | "Failed" | "Pending"

// Document Types
export interface UploadedDocument {
  id: string
  name: string
  file_type: string
  file_size: string
  uploaded_at: Date
  user_id: string
  status: "processing" | "processed" | "error"
  chunks_created?: number
  controls_identified?: number
  error_message?: string
}

export interface DocumentUploadResponse {
  document_id: string
  status: "success" | "error"
  message: string
  controls_identified?: number
  chunks_created?: number
}

// Dashboard Types
export interface SummaryCard {
  id: string
  title: string
  value: string | number
  description: string
  icon: string
  trend?: TrendDirection
  trendValue?: string
  color?: string
}

export type TrendDirection = "up" | "down" | "stable"

// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

// Form Types
export interface FormState {
  isLoading: boolean
  error?: string
  success?: boolean
}

// Theme Types
export type Theme = "light" | "dark" | "system"

// Navigation Types
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
  badge?: string | number
}

// Settings Types
export interface UserSettings {
  theme: Theme
  notifications: NotificationSettings
  privacy: PrivacySettings
  preferences: UserPreferences
}

export interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  audit_reminders: boolean
  policy_updates: boolean
}

export interface PrivacySettings {
  profile_visibility: "public" | "team" | "private"
  data_sharing: boolean
  analytics: boolean
}

export interface UserPreferences {
  default_framework: string
  dashboard_layout: "compact" | "detailed"
  date_format: string
  timezone: string
}
