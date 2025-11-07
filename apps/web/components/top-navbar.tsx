"use client";
import React, { useState } from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { useAuth } from "@/contexts/auth-context";
import {
  Settings,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
  Home,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNavbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const links = [
    {
      title: "Home",
      icon: (
        <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/dashboard",
    },
    {
      title: theme === "dark" ? "Light Mode" : "Dark Mode",
      icon:
        theme === "dark" ? (
          <Sun className="h-full w-full text-neutral-500 dark:text-neutral-300" />
        ) : (
          <Moon className="h-full w-full text-neutral-500 dark:text-neutral-300" />
        ),
      href: "#",
      onClick: toggleTheme,
    },
    {
      title: user?.name || "Profile",
      icon: (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-xs">
          {user ? getInitials(user.name) : "U"}
        </div>
      ),
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setShowProfileMenu(!showProfileMenu);
      },
    },
  ];

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center pt-6 pointer-events-none">
      <div className="pointer-events-auto relative">
        <FloatingDock items={links} />

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div className="absolute right-0 top-20 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-start gap-2 p-3">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground max-w-[180px]">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-neutral-800">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  window.location.href = "/settings";
                }}
                className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-neutral-800">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
