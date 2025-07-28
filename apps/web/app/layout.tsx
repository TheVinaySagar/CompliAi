import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ChatProvider } from "@/contexts/chat-context"
import ErrorBoundary from "@/components/error-boundary"
import SessionExpiryHandler from "@/components/session-expiry-handler"
import { Toaster } from "sonner"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "CompliAI - AI-Powered Compliance Management",
  description: "AI-Powered Compliance, From Policy to Audit",
  generator: "CompliAI",
  keywords: ["compliance", "AI", "audit", "policy management", "regulatory"],
  authors: [{ name: "CompliAI Team" }],
  robots: "index, follow",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <ChatProvider>
              <SessionExpiryHandler>
                {children}
                <Toaster position="top-right" />
              </SessionExpiryHandler>
            </ChatProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
