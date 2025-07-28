"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Mail, Settings, UserX, UserCheck, Loader2 } from "lucide-react"
import { type TeamMember } from "@/types"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface TeamMemberActionsProps {
  member: TeamMember
  onMemberUpdated?: () => void
}

export function TeamMemberActions({ member, onMemberUpdated }: TeamMemberActionsProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(member.role)

  const handleUpdateRole = async () => {
    if (selectedRole === member.role) {
      setRoleDialogOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.updateMemberRole(member.id, selectedRole.toLowerCase())
      
      if (response.success) {
        toast.success("Member role updated successfully!")
        setRoleDialogOpen(false)
        onMemberUpdated?.()
      } else {
        toast.error(response.error || "Failed to update member role")
      }
    } catch (error) {
      console.error("Error updating member role:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      const newStatus = member.status === "Active"
      const response = await apiClient.updateMemberStatus(member.id, !newStatus)
      
      if (response.success) {
        toast.success(`Member ${newStatus ? "deactivated" : "activated"} successfully!`)
        onMemberUpdated?.()
      } else {
        toast.error(response.error || "Failed to update member status")
      }
    } catch (error) {
      console.error("Error updating member status:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.removeTeamMember(member.id)
      
      if (response.success) {
        toast.success("Member removed successfully!")
        setRemoveDialogOpen(false)
        onMemberUpdated?.()
      } else {
        toast.error(response.error || "Failed to remove member")
      }
    } catch (error) {
      console.error("Error removing member:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = () => {
    // Open default email client
    window.location.href = `mailto:${member.email}`
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRoleDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Edit Role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {member.status === "Active" ? (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setRemoveDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <UserX className="h-4 w-4 mr-2" />
            Remove Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Update Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Member Role</DialogTitle>
            <DialogDescription>
              Change the role for {member.name}. This will update their permissions and access level.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="role-select">New Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: any) => setSelectedRole(value)}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Viewer">Viewer</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {member.name} from the team? This action cannot be undone.
              They will lose access to all systems and data immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
