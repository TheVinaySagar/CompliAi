"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient, type LoginRequest, type RegisterRequest } from "@/lib/api-client"
import { 
  type User, 
  type LoginCredentials, 
  type RegisterData 
} from "@/types"
import { STORAGE_KEYS, ROUTES } from "@/lib/constants"
import { safeJsonParse, getErrorMessage } from "@/lib/utils"

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  const clearError = () => setError(null)

  // Ensure we're on client side before accessing localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run after client is mounted to avoid hydration issues
    if (!isClient) return

    // Check for stored token on app load
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA)
        
        if (token && userData) {
          const parsedUser = safeJsonParse<User | null>(userData, null)
          if (parsedUser) {
            setUser(parsedUser)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid data
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER_DATA)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [isClient])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.login(credentials)
      
      if (response.data?.access_token && response.data?.user) {
        const authUser: User = {
          id: response.data.user.id,
          name: response.data.user.full_name,
          full_name: response.data.user.full_name,
          email: response.data.user.email,
          role: response.data.user.role as any,
          is_active: response.data.user.is_active,
          department: response.data.user.department,
          permissions: response.data.user.permissions || [],
          isAuthenticated: true,
        }
        
        // Store token and user data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.access_token)
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authUser))
        
        setUser(authUser)
        return true
      }
      
      setError('Invalid login response')
      return false
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      
      if (!data.agreeToTerms) {
        setError('You must agree to the terms and conditions')
        return false
      }
      
      const registerData: RegisterRequest = {
        full_name: data.name,
        email: data.email,
        password: data.password,
        role: "Viewer",
        permissions: ["chat_access"],
      }
      
      const response = await apiClient.register(registerData)
      
      if (response.data?.user) {
        const authUser: User = {
          id: response.data.user.id,
          name: response.data.user.full_name || response.data.user.name,
          full_name: response.data.user.full_name || response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          is_active: response.data.user.is_active,
          department: response.data.user.department,
          permissions: response.data.user.permissions || [],
          isAuthenticated: true,
        }
        
        // Store token and user data if token is provided
        if (response.data.token) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token)
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authUser))
          setUser(authUser)
        }
        
        return true
      }
      
      setError('Registration failed')
      return false
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    localStorage.removeItem(STORAGE_KEYS.CHAT_CONVERSATIONS)
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
    
    // Reset state
    setUser(null)
    setError(null)
    
    // Redirect to login
    router.push(ROUTES.LOGIN)
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    error,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
