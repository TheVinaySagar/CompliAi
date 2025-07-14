import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns"
import { VALIDATION, ERROR_MESSAGES, DATE_FORMATS } from "./constants"

/**
 * Utility function to merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email)
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH && VALIDATION.PASSWORD_REGEX.test(password)
}

/**
 * Formats file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Formats date to various formats
 */
export function formatDate(date: Date | string, formatType: keyof typeof DATE_FORMATS = 'SHORT'): string {
  if (!date) return ''
  
  let dateObj: Date
  if (typeof date === 'string') {
    dateObj = parseISO(date)
  } else {
    dateObj = date
  }
  
  if (!isValid(dateObj)) return 'Invalid date'
  
  return format(dateObj, DATE_FORMATS[formatType])
}

/**
 * Returns relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  if (!date) return ''
  
  let dateObj: Date
  if (typeof date === 'string') {
    dateObj = parseISO(date)
  } else {
    dateObj = date
  }
  
  if (!isValid(dateObj)) return 'Invalid date'
  
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Truncates text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalizes first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Generates initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Generates a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Safely parses JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as any
  
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * Validates file type and size
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ACCEPTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]
  
  if (file.size > MAX_SIZE) {
    return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE }
  }
  
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE }
  }
  
  return { isValid: true }
}

/**
 * Extracts error message from various error types
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  if (error?.data?.message) return error.data.message
  return ERROR_MESSAGES.SERVER_ERROR
}

/**
 * Scrolls element into view smoothly
 */
export function scrollToElement(elementId: string): void {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  }
}

/**
 * Downloads content as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
