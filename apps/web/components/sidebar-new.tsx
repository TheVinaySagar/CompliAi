"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import CompliAILogo from "@/components/ui/logo";
import {
  MessageSquare,
  Upload,
  Settings,
  LayoutDashboard,
  Calendar,
  Users,
  Zap,
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

  return (
    <div className={cn("flex w-full flex-1 overflow-hidden")}>
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
        <span className="whitespace-pre font-bold text-black dark:text-white">
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
