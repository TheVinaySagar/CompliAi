/**
 * CompliAI Frontend Constants
 * Centralized constant definitions
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // Note: Chat endpoints use no timeout for local Ollama models (2-3 min response time)
  RETRY_ATTEMPTS: 3,
} as const

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CHAT: '/chat',
  POLICIES: '/policies',
  UPLOAD: '/upload',
  MAPPING: '/mapping',
  AUDIT: '/audit',
  TEAM: '/team',
  SETTINGS: '/settings',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CHAT_CONVERSATIONS: 'chat_conversations',
  CHAT_MESSAGES: 'chat_messages',
  CURRENT_CONVERSATION_ID: 'current_conversation_id',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const

// UI Constants
export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  SIDEBAR_WIDTH: '16rem',
  SIDEBAR_WIDTH_COLLAPSED: '4rem',
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
} as const

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  ACCEPTED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt'],
} as const

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_MESSAGES: 100,
  MAX_MESSAGE_LENGTH: 5000,
  TYPING_DELAY: 1000,
  AUTO_SAVE_DELAY: 2000,
} as const

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const

// Status Colors
export const STATUS_COLORS = {
  SUCCESS: 'green',
  ERROR: 'red',
  WARNING: 'yellow',
  INFO: 'blue',
  PENDING: 'orange',
} as const

// Priority Colors
export const PRIORITY_COLORS = {
  High: 'red',
  Medium: 'yellow',
  Low: 'green',
} as const

// Framework Types
export const COMPLIANCE_FRAMEWORKS = [
  'ISO 27001',
  'SOC 2',
  'GDPR',
  'HIPAA',
  'PCI DSS',
  'NIST',
  'SOX',
  'CCPA',
  'Custom',
] as const

// User Roles and Permissions
export const USER_ROLES = {
  VIEWER: 'Viewer',
  EDITOR: 'Editor',
  ADMIN: 'Admin',
} as const

export const PERMISSIONS = {
  READ_POLICIES: 'read:policies',
  WRITE_POLICIES: 'write:policies',
  DELETE_POLICIES: 'delete:policies',
  MANAGE_USERS: 'manage:users',
  MANAGE_SETTINGS: 'manage:settings',
  UPLOAD_FILES: 'upload:files',
  VIEW_AUDIT: 'view:audit',
  MANAGE_AUDIT: 'manage:audit',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back! You have been logged in successfully.',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  REGISTER_SUCCESS: 'Account created successfully! Please log in.',
  PROFILE_UPDATED: 'Your profile has been updated successfully.',
  FILE_UPLOADED: 'File uploaded and processed successfully.',
  POLICY_CREATED: 'Policy created successfully.',
  POLICY_UPDATED: 'Policy updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
} as const

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  CHAT_HISTORY: true,
  FILE_PREVIEW: true,
  BULK_OPERATIONS: true,
  REAL_TIME_SYNC: false,
  ADVANCED_SEARCH: true,
} as const
