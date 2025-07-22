/**
 * Chat Storage Utilities
 * Utilities for managing chat data in localStorage
 */

import { STORAGE_KEYS } from './constants'

/**
 * Clear all chat-related data from localStorage
 * This is useful when user logs out or when cleaning up chat data
 */
export function clearAllChatData(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEYS.CHAT_CONVERSATIONS)
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID)
    
    console.log('Chat data cleared from localStorage')
  } catch (error) {
    console.error('Error clearing chat data:', error)
  }
}

/**
 * Check if chat data exists in localStorage
 */
export function hasChatData(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const conversations = localStorage.getItem(STORAGE_KEYS.CHAT_CONVERSATIONS)
    const messages = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)
    const conversationId = localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID)
    
    return !!(conversations || messages || conversationId)
  } catch (error) {
    console.error('Error checking chat data:', error)
    return false
  }
}

/**
 * Clear all user-related data including chat
 */
export function clearAllUserData(): void {
  if (typeof window === 'undefined') return

  try {
    // Clear auth data
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    
    // Clear chat data
    clearAllChatData()
    
    // Clear preferences
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
    localStorage.removeItem(STORAGE_KEYS.THEME)
    
    console.log('All user data cleared from localStorage')
  } catch (error) {
    console.error('Error clearing user data:', error)
  }
}