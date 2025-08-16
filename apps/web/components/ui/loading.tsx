import React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <Loader2 
      className={cn("animate-spin", sizeClasses[size], className)} 
      aria-label="Loading"
    />
  )
}

interface LoadingScreenProps {
  message?: string
  className?: string
}

export function LoadingScreen({ message = "Loading...", className }: LoadingScreenProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-screen bg-gray-50", className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

interface InlineLoadingProps {
  message?: string
  className?: string
}

export function InlineLoading({ message = "Loading...", className }: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="flex items-center space-x-2">
        <LoadingSpinner className="text-blue-600" />
        <span className="text-sm text-gray-600">{message}</span>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      role="status"
      aria-label="Loading content"
    />
  )
}

export function ChatMessageSkeleton() {
  return (
    <div className="inline-flex items-center bg-gray-200 px-4 py-2 rounded-2xl">
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300" />
    </div>
  );
}


export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="flex space-x-2 mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}
