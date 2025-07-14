/**
 * Client Side Detector Hook
 * Safely detects if code is running on client side
 */

import { useEffect, useState } from 'react'

export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Safe Local Storage Hook
 * Prevents hydration issues when accessing localStorage
 */
export function useSafeLocalStorage(key: string, initialValue: string = '') {
  const [storedValue, setStoredValue] = useState(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(item)
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    } finally {
      setIsLoaded(true)
    }
  }, [key])

  const setValue = (value: string) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, value)
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, isLoaded] as const
}
