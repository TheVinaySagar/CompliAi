/**
 * Session Expiry Handler Component
 * Displays notifications when user session expires
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authEvents } from "@/lib/auth-events"
import { ROUTES } from "@/lib/constants"
import { toast } from "@/hooks/use-toast"

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
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== ROUTES.LOGIN) {
        // console.log('Session expired - redirecting to login')
        
        toast({
          variant: "destructive",
          description: "Your session has expired. Please sign in again."
        })
      }
    }
  }

  return <>{children}</>
}
