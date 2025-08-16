"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MessageSquare,
  FileText,
  Upload,
  Settings,
  LayoutDashboard,
  Shield,
  GitBranch,
  Calendar,
  Users,
  LogOut,
  ChevronRight,
  Zap,
  BarChart3,
  X,
  Menu
} from "lucide-react"
import Logo from "@/components/ui/logo";

const navigation = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    badge: null,
    description: "Overview & analytics"
  },
  { 
    name: "Chat Assistant", 
    href: "/chat", 
    icon: MessageSquare,
    badge: "AI",
    description: "Ask compliance questions"
  },
  { 
    name: "Upload Documents", 
    href: "/upload", 
    icon: Upload,
    badge: null,
    description: "Add compliance docs"
  },
  { 
    name: "Policy Generator", 
    href: "/policy-generator", 
    icon: Zap,
    badge: null,
    description: "Build custom policies"
  },
  { 
    name: "Audit Planner", 
    href: "/audit-planner", 
    icon: Calendar,
    badge: null,
    description: "Build audit plans"
  },
  { 
    name: "Team Management", 
    href: "/team", 
    icon: Users,
    badge: null,
    description: "Manage team access"
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: Settings,
    badge: null,
    description: "App preferences"
  },
]

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <>
      {/* Sidebar Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-[1000] bg-black/40 transition-opacity md:hidden",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-[1001] h-full w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar navigation"
      >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
           <Logo size={46} rounded="lg" />
          <div>
            <span className="text-xl font-bold text-white">CompliAI</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-slate-400">Powered by AI</span>
            </div>
          </div>
        </div>
        {/* Close button inside sidebar header (mobile only) */}
          <button
            className="md:hidden flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-700/70 hover:text-white transition-colors duration-200"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-lg p-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                    )} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs px-1.5 py-0.5",
                              item.badge === "AI" 
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-blue-400 opacity-70" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <Separator className="my-4 bg-slate-700/50" />

        {/* Quick Stats */}
        {/* <div className="space-y-3 mb-4">
          <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Compliance Score</span>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">85%</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Logout Button */}
        {/* <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button> */}
      </nav>
    </aside>
    </>
  )
}
