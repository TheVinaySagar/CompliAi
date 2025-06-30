"use client"

import { useState } from "react"
import { dummyTeamMembers, type TeamMember } from "@/lib/dummy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Mail, MoreHorizontal, UserCheck, UserX, Settings, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function TeamPage() {
  const [members] = useState<TeamMember[]>(dummyTeamMembers)

  const getRoleColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800"
      case "Editor":
        return "bg-blue-100 text-blue-800"
      case "Viewer":
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage team members and their access permissions</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {members.filter((m) => m.status === "Active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {members.filter((m) => m.status === "Pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{members.filter((m) => m.role === "Admin").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage roles and permissions for your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Joined {member.joinDate.toLocaleDateString()}</span>
                  </div>

                  <Badge className={getRoleColor(member.role)}>{member.role}</Badge>

                  <Badge className={getStatusColor(member.status)}>{member.status}</Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                      {member.status === "Active" ? (
                        <DropdownMenuItem className="text-red-600">
                          <UserX className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Overview of what each role can do in CompliAI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge className="bg-gray-100 text-gray-800">Viewer</Badge>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View policies and reports</li>
                <li>• Access chat assistant</li>
                <li>• View control mappings</li>
                <li>• Export basic reports</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">Editor</Badge>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All Viewer permissions</li>
                <li>• Upload documents</li>
                <li>• Create and edit policies</li>
                <li>• Manage control mappings</li>
                <li>• Assign audit tasks</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All Editor permissions</li>
                <li>• Manage team members</li>
                <li>• Configure system settings</li>
                <li>• Access audit logs</li>
                <li>• Export all reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
