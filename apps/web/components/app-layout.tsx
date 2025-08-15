"use client"

import React, { memo } from "react"
import AuthGuard from "@/components/auth-guard"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ErrorBoundary from "@/components/error-boundary"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
  requireRole?: string[]
  requirePermission?: string
  showSidebar?: boolean
  showHeader?: boolean
}

const AppLayout = memo(({
  children,
  className,
  requireRole,
  requirePermission,
  showSidebar = true,
  showHeader = true,
}: AppLayoutProps) => {
  return (
    <ErrorBoundary>
      <AuthGuard requireRole={requireRole} requirePermission={requirePermission}>
        <div className={cn("relative h-screen bg-slate-50", className)}>
          {showSidebar && <Sidebar />}
          <div className="flex flex-1 flex-col overflow-hidden md:ml-64 h-full">
            {showHeader && <Header />}
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </AuthGuard>
    </ErrorBoundary>
  )
})

AppLayout.displayName = "AppLayout"

export default AppLayout
