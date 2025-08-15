import type React from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import AuthGuard from "@/components/auth-guard"

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-100">
        <div className="fixed inset-y-0 left-0 z-50 w-64 h-full border-r bg-white">
        <Sidebar />
        </div>
        <div className="flex flex-1 flex-col ml-64 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
