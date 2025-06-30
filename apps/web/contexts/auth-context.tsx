"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AuthUser, LoginCredentials, RegisterData } from "@/lib/dummy"
import { dummyUsers } from "@/lib/dummy"

interface AuthContextType {
  user: AuthUser | null
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem("compliai-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = dummyUsers.find((u) => u.email === credentials.email && u.password === credentials.password)

    if (foundUser) {
      const authUser: AuthUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        isAuthenticated: true,
      }
      setUser(authUser)
      localStorage.setItem("compliai-user", JSON.stringify(authUser))
      return { success: true }
    } else {
      return { success: false, error: "Invalid email or password" }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = dummyUsers.find((u) => u.email === data.email)
    if (existingUser) {
      return { success: false, error: "User with this email already exists" }
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: "Passwords do not match" }
    }

    // Create new user
    const newUser: AuthUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: "Viewer",
      isAuthenticated: true,
    }

    setUser(newUser)
    localStorage.setItem("compliai-user", JSON.stringify(newUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("compliai-user")
    // Redirect to login will be handled by the root page component
    window.location.href = "/login"
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
