/**
 * Authentication Event System
 * Handles authentication-related events across the application
 */

type AuthEventType = 'token_expired' | 'unauthorized' | 'logout' | 'login'

interface AuthEventListener {
  (event: AuthEventType, data?: any): void
}

class AuthEventManager {
  private listeners: Set<AuthEventListener> = new Set()

  /**
   * Subscribe to authentication events
   */
  subscribe(listener: AuthEventListener): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Emit an authentication event
   */
  emit(event: AuthEventType, data?: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, data)
      } catch (error) {
        console.error('Error in auth event listener:', error)
      }
    })
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear()
  }
}

// Export singleton instance
export const authEvents = new AuthEventManager()

// Helper functions for common auth events
export const emitTokenExpired = () => authEvents.emit('token_expired')
export const emitUnauthorized = () => authEvents.emit('unauthorized')
export const emitLogout = () => authEvents.emit('logout')
export const emitLogin = () => authEvents.emit('login')
