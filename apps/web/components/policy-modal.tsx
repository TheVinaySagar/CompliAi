"use client"

import type { Policy } from "@/lib/dummy"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Download, Edit } from "lucide-react"

interface PolicyModalProps {
  policy: Policy
  isOpen: boolean
  onClose: () => void
}

export default function PolicyModal({ policy, isOpen, onClose }: PolicyModalProps) {
  const getStatusColor = (status: Policy["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Draft":
        return "bg-yellow-100 text-yellow-800"
      case "Under Review":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{policy.title}</DialogTitle>
              <DialogDescription className="mt-2">{policy.description}</DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{policy.framework}</Badge>
              <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">Last updated: {policy.lastUpdated.toLocaleDateString()}</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{policy.content}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
