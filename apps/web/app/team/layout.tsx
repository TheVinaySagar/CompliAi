import type React from "react"
import AuthGuard from "@/components/auth-guard"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
