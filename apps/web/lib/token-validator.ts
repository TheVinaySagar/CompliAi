/**
 * Token Validation Service
 * Periodically validates the authentication token
 */

import { apiClient } from "./api-client"
import { STORAGE_KEYS } from "./constants"
import { emitTokenExpired } from "./auth-events"

class TokenValidator {
  private intervalId: NodeJS.Timeout | null = null
  private isValidating = false

  /**
   * Start periodic token validation
   * @param intervalMs - Validation interval in milliseconds (default: 5 minutes)
   */
  startValidation(intervalMs: number = 5 * 60 * 1000): void {
    if (this.intervalId) {
      this.stopValidation()
    }

    this.intervalId = setInterval(() => {
      this.validateToken()
    }, intervalMs)

    // Also validate immediately on start
    this.validateToken()
  }

  /**
   * Stop periodic token validation
   */
  stopValidation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * Validate the current token
   */
  private async validateToken(): Promise<void> {
    // Skip if already validating or no token exists
    if (this.isValidating || typeof window === 'undefined') {
      return
    }

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token) {
      return
    }

    try {
      this.isValidating = true
      
      // Try to fetch current user to validate token
      const response = await apiClient.getCurrentUser()
      
      if (!response.success && response.status === 401) {
        console.log('Token validation failed - token expired')
        emitTokenExpired()
      }
    } catch (error) {
      console.error('Error validating token:', error)
    } finally {
      this.isValidating = false
    }
  }

  /**
   * Get validation status
   */
  isRunning(): boolean {
    return this.intervalId !== null
  }
}

// Export singleton instance
export const tokenValidator = new TokenValidator()

/**
 * Hook to automatically start/stop token validation based on authentication status
 */
export function useTokenValidation(isAuthenticated: boolean): void {
  if (typeof window === 'undefined') return

  if (isAuthenticated && !tokenValidator.isRunning()) {
    tokenValidator.startValidation()
  } else if (!isAuthenticated && tokenValidator.isRunning()) {
    tokenValidator.stopValidation()
  }
}
