import type React from "react"
import AppLayout from "@/components/app-layout"

export default function AuditPlannerLayout({
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
