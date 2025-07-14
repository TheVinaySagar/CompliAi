import type React from "react"
import AppLayout from "@/components/app-layout"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout className="overflow-hidden">
      {children}
    </AppLayout>
  )
}
