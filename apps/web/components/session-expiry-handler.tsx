/**
 * Session Expiry Handler Component
 * Displays notifications when user session expires
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authEvents } from "@/lib/auth-events"
import { ROUTES } from "@/lib/constants"

interface SessionExpiryHandlerProps {
  children: React.ReactNode
}

export default function SessionExpiryHandler({ children }: SessionExpiryHandlerProps) {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = authEvents.subscribe((event) => {
      if (event === 'token_expired') {
        // Show a user-friendly notification
        showSessionExpiredNotification()
      }
    })

    return unsubscribe
  }, [])

  const showSessionExpiredNotification = () => {
    // You can integrate with your toast system here
    // For now, we'll use a simple alert (can be replaced with a proper toast)
    if (typeof window !== 'undefined') {
      // Only show notification if not already on login page
      if (window.location.pathname !== ROUTES.LOGIN) {
        console.log('Session expired - redirecting to login')
        
        // Optional: Show a toast notification instead of alert
        // toast.error('Your session has expired. Please sign in again.')
      }
    }
  }

  return <>{children}</>
}
