"use client"

import React, { memo, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <ErrorBoundary>
      <AuthGuard requireRole={requireRole} requirePermission={requirePermission}>
        <div className={cn("relative h-screen bg-background", className)}>
          {showSidebar && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
          <div className="flex flex-1 flex-col overflow-hidden md:ml-64 h-full">
            {showHeader && <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
            <main className="flex-1 overflow-y-auto bg-background">{children}</main>
          </div>
        </div>
      </AuthGuard>
    </ErrorBoundary>
  )
})

AppLayout.displayName = "AppLayout"

export default AppLayout
