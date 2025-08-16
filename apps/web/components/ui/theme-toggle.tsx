"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ThemeSwitchProps {
  className?: string
}

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center">
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mr-2 sm:mr-3" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Choose your preferred theme</p>
          </div>
        </div>
        <div className="relative inline-flex h-5 w-10 sm:h-6 sm:w-11 items-center rounded-full bg-muted">
          <span className="inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-background transition-transform translate-x-1" />
        </div>
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        {isDark ? (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mr-2 sm:mr-3" />
        ) : (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mr-2 sm:mr-3" />
        )}
        <div>
          <p className="text-xs sm:text-sm font-medium text-foreground">Theme</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Currently using {theme === "system" ? "system" : theme} theme
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant={theme === "light" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("light")}
          className="h-8 px-2 text-xs"
        >
          <Sun className="h-3 w-3 mr-1" />
          Light
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("dark")}
          className="h-8 px-2 text-xs"
        >
          <Moon className="h-3 w-3 mr-1" />
          Dark
        </Button>
        <Button
          variant={theme === "system" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("system")}
          className="h-8 px-2 text-xs"
        >
          System
        </Button>
      </div>
    </div>
  )
}
