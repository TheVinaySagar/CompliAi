"use client"

import type { Policy } from "@/lib/dummy"
import { X } from "lucide-react"

interface PolicyModalProps {
  policy: Policy
  isOpen: boolean
  onClose: () => void
}

export default function PolicyModal({ policy, isOpen, onClose }: PolicyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">{policy.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{policy.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
