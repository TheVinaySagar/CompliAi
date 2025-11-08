"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import CompliAILogo from "@/components/ui/logo";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import {
  MessageSquare,
  Upload,
  Settings,
  LayoutDashboard,
  Calendar,
  Users,
  Zap,
  Menu,
  X,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <LayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    badge: null,
  },
  {
    label: "Chat Assistant",
    href: "/chat",
    icon: (
      <MessageSquare className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    badge: "AI",
  },
  {
    label: "Upload Documents",
    href: "/upload",
    icon: (
      <Upload className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    badge: null,
  },
  {
    label: "Policy Generator",
    href: "/policy-generator",
    icon: (
      <Zap className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    badge: null,
  },
  {
    label: "Audit Planner",
    href: "/audit-planner",
    icon: (
      <Calendar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    badge: null,
  },
  {
    label: "Team Management",
    href: "/team",
    icon: (
      <Users className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    badge: null,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <Settings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    badge: null,
  },
];

interface SidebarDemoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

export default function SidebarDemo({
  sidebarOpen,
  setSidebarOpen,
  children,
}: SidebarDemoProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      setMobileOpen(false);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={cn("flex w-full flex-1 overflow-hidden relative")}>
      {/* Mobile Header with Hamburger and Logo */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-center px-4 py-3 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        {/* Hamburger Toggle Button - Left */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="absolute left-4 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1 w-6 h-5 items-center justify-center">
            <span className="block w-full h-0.5 bg-neutral-800 dark:bg-neutral-200 rounded-full transition-all" />
            <span className="block w-full h-0.5 bg-neutral-800 dark:bg-neutral-200 rounded-full transition-all" />
            <span className="block w-full h-0.5 bg-neutral-800 dark:bg-neutral-200 rounded-full transition-all" />
          </div>
        </button>

        {/* Logo - Center */}
        <div className="flex items-center gap-3">
          <CompliAILogo size={32} rounded="lg" />
          <div className="flex flex-col">
            <span
              className="font-[900] text-base text-black dark:text-white"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              CompliAI
            </span>
          </div>
        </div>

        {/* Theme Toggle Button - Right */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute right-4 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
          ) : (
            <Moon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {/* Logo Section */}
              {open ? <Logo /> : <LogoIcon />}

              {/* Navigation */}
              <div className="mt-8 flex flex-col gap-2">
                {navigation.map((link, idx) => {
                  const isActive = pathname === link.href;
                  return (
                    <div key={idx} className="relative">
                      <SidebarLink
                        link={link}
                        className={cn(
                          "relative rounded-lg px-2 py-2 transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-neutral-900 dark:text-white"
                            : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        )}
                      />
                      {link.badge && open && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5",
                            link.badge === "AI"
                              ? "bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-300"
                              : "bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-300"
                          )}
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Mobile Overlay Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-neutral-800 z-50 md:hidden border-r border-neutral-200 dark:border-neutral-700 shadow-xl"
            >
              <div className="flex flex-col h-full p-4">
                {/* Header with Logo and Close Button */}
                <div className="relative mb-8 pr-12">
                  {/* Logo */}
                  <Logo />

                  {/* Close Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMobileOpen(false);
                    }}
                    className="absolute top-0 right-0 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 z-20"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                  {navigation.map((link, idx) => {
                    const isActive = pathname === link.href;
                    return (
                      <a
                        key={idx}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-neutral-900 dark:text-white"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                        )}
                      >
                        {link.icon}
                        <span className="text-sm font-medium">
                          {link.label}
                        </span>
                        {link.badge && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "ml-auto text-xs px-1.5 py-0.5",
                              link.badge === "AI"
                                ? "bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-300"
                                : "bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-300"
                            )}
                          >
                            {link.badge}
                          </Badge>
                        )}
                      </a>
                    );
                  })}
                </div>

                {/* Profile Section - Bottom */}
                {user && (
                  <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-sm">
                        {getInitials(user.name)}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                          {user.name}
                        </span>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    {/* Profile Actions */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          window.location.href = "/settings";
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-all duration-200"
                      >
                        <UserIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Profile</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm font-medium">Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {children && <div className="flex flex-1">{children}</div>}
    </div>
  );
}

// Logo component when sidebar is expanded
export const Logo = () => {
  return (
    <a
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
    >
      <CompliAILogo size={32} rounded="lg" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col"
      >
        <span
          className="whitespace-pre font-[900] text-black dark:text-white"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          CompliAI
        </span>
        <span className="whitespace-pre text-xs text-neutral-600 dark:text-neutral-400">
          Powered by AI
        </span>
      </motion.div>
    </a>
  );
};

// Logo icon when sidebar is collapsed
export const LogoIcon = () => {
  return (
    <a
      href="/dashboard"
      className="relative z-20 flex items-center justify-center py-1 text-sm font-normal"
    >
      <CompliAILogo size={32} rounded="lg" />
    </a>
  );
};
