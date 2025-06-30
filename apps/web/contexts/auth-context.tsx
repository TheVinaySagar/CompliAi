"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dummyUsers, type AuthUser, type LoginCredentials, type RegisterData } from "@/lib/dummy"

interface AuthContextType {
  user: AuthUser | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem("compliai-user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem("compliai-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
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
      router.push("/dashboard")
      return true
    }

    return false
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = dummyUsers.find((u) => u.email === data.email)
    if (existingUser) {
      return false
    }

    // Create new user
    const newUser: AuthUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: "Viewer", // Default role for new users
      isAuthenticated: true,
    }

    setUser(newUser)
    localStorage.setItem("compliai-user", JSON.stringify(newUser))
    router.push("/dashboard")
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("compliai-user")
    router.push("/login")
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
