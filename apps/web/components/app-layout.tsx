"use client";

import React, { memo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import SidebarDemo from "@/components/sidebar-new";
import { TopNavbar } from "@/components/top-navbar";
import ErrorBoundary from "@/components/error-boundary";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  requireRole?: string[];
  requirePermission?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
}

const AppLayout = memo(
  ({
    children,
    className,
    requireRole,
    requirePermission,
    showSidebar = true,
    showHeader = true,
  }: AppLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
      setSidebarOpen(false);
    }, [pathname]);

    return (
      <ErrorBoundary>
        <AuthGuard
          requireRole={requireRole}
          requirePermission={requirePermission}
        >
          <div
            className={cn(
              "h-screen overflow-hidden bg-white dark:bg-neutral-800",
              className
            )}
          >
            {/* Top Navbar */}
            {showHeader && <TopNavbar />}

            {/* Main Content Area */}
            <div className="flex h-full">
              {showSidebar ? (
                <SidebarDemo
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                >
                  <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-800 pt-24">
                    <main className="flex-1 overflow-y-auto">{children}</main>
                  </div>
                </SidebarDemo>
              ) : (
                <div className="flex h-full w-full flex-1 flex-col overflow-hidden pt-24">
                  <main className="flex-1 overflow-y-auto bg-white dark:bg-neutral-800">
                    {children}
                  </main>
                </div>
              )}
            </div>
          </div>
        </AuthGuard>
      </ErrorBoundary>
    );
  }
);

AppLayout.displayName = "AppLayout";

export default AppLayout;
