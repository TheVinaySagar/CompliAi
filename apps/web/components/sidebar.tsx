"use client"

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
} from "lucide-react"

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
    name: "Policies", 
    href: "/policies", 
    icon: FileText,
    badge: null,
    description: "Manage policy documents"
  },
  { 
    name: "Control Mapping", 
    href: "/mapping", 
    icon: GitBranch,
    badge: null,
    description: "Map compliance controls"
  },
  { 
    name: "Audit Planner", 
    href: "/audit", 
    icon: Calendar,
    badge: "Pro",
    description: "Plan audit activities"
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

export default function Sidebar() {
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
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">CompliAI</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-slate-400">Powered by AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Info */}
      {/* {user && (
        <div className="px-4 py-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )} */}

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
        <div className="space-y-3 mb-4">
          <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Compliance Score</span>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">85%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </nav>
    </div>
  )
}
