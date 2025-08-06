import type React from "react"
import AppLayout from "@/components/app-layout"

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout requireRole={["admin", "editor"]}>
      {children}
    </AppLayout>
  )
}
