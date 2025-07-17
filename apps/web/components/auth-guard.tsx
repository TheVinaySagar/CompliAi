"use client"

import React, { memo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingScreen } from "@/components/ui/loading"
import { ROUTES } from "@/lib/constants"

interface AuthGuardProps {
  children: React.ReactNode
  requireRole?: string[]
  requirePermission?: string
  fallback?: React.ReactNode
}

const AuthGuard = memo(({ children, requireRole, requirePermission, fallback }: AuthGuardProps) => {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(ROUTES.LOGIN)
    }
  }, [user, isLoading, router])

  // Show loading state
  if (isLoading) {
    return fallback || <LoadingScreen message="Authenticating..." />
  }

  // Show nothing if not authenticated (will redirect)
  if (!user) {
    return null
  }

  // Check role requirements
  if (requireRole && !requireRole.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Check permission requirements
  if (requirePermission && !user.permissions.includes(requirePermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required permission: {requirePermission}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
})

AuthGuard.displayName = "AuthGuard"

export default AuthGuard
