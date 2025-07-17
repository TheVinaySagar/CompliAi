import type React from "react"
import AppLayout from "@/components/app-layout"

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout requirePermission="chat_access">
      {children}
    </AppLayout>
  )
}
