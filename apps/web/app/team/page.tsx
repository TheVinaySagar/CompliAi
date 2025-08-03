"use client"

import { useState, useEffect } from "react"
import { type TeamMember, type TeamStats } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserCheck, Calendar, AlertCircle, Users, Shield, Eye, RefreshCw } from "lucide-react"
import { InviteMemberDialog } from "@/components/team/invite-member-dialog"
import { TeamMemberActions } from "@/components/team/team-member-actions"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load team data from API
  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [membersResponse, statsResponse] = await Promise.all([
        apiClient.getTeamMembers(),
        apiClient.getTeamStats()
      ])
      
      if (membersResponse.success && statsResponse.success && membersResponse.data) {
        // Transform backend data to frontend format
        const transformedMembers = membersResponse.data.map((member: any) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          role: capitalizeRole(member.role),
          status: capitalizeStatus(member.status),
          joinDate: new Date(member.join_date),
          last_login: member.last_login ? new Date(member.last_login) : undefined,
          department: member.department,
          permissions: member.permissions,
          added_by_name: member.added_by_name, // Include added_by_name
        }))
        
        setMembers(transformedMembers)
        setTeamStats(statsResponse.data)
      } else {
        setError(membersResponse.error || statsResponse.error || "Failed to load team data")
      }
    } catch (err) {
      setError("Failed to load team data")
      console.error("Error loading team data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const capitalizeRole = (role: string): "Admin" | "Editor" | "Viewer" => {
    switch (role.toLowerCase()) {
      case "admin": return "Admin"
      case "user": 
      case "auditor": return "Editor"
      case "viewer": return "Viewer"
      default: return "Viewer"
    }
  }

  const capitalizeStatus = (status: string): "Active" | "Pending" | "Inactive" => {
    switch (status.toLowerCase()) {
      case "active": return "Active"
      case "pending": return "Pending"  
      case "inactive": return "Inactive"
      default: return "Inactive"
    }
  }

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

  const getRoleIcon = (role: TeamMember["role"]) => {
    switch (role) {
      case "Admin":
        return <Shield className="h-4 w-4" />
      case "Editor":
        return <Users className="h-4 w-4" />
      case "Viewer":
        return <Eye className="h-4 w-4" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleRefresh = () => {
    loadTeamData()
    toast.success("Team data refreshed")
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage team members and their access permissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <InviteMemberDialog onMemberInvited={loadTeamData} />
          </div>
        </div>
      </div>

      {/* Team Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {isLoading ? "-" : teamStats?.total_members || members.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {isLoading ? "-" : teamStats?.active_members || members.filter((m) => m.status === "Active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {isLoading ? "-" : teamStats?.pending_members || members.filter((m) => m.status === "Pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {isLoading ? "-" : teamStats?.admin_count || members.filter((m) => m.role === "Admin").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage roles and permissions for your team</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadTeamData} variant="outline">
                Try Again
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <UserCheck className="h-12 w-12" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-sm text-gray-500 mb-4">Get started by inviting your first team member.</p>
              <InviteMemberDialog onMemberInvited={loadTeamData} />
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      {member.department && (
                        <p className="text-xs text-gray-400">{member.department}</p>
                      )}
                      {member.added_by_name && (
                        <p className="text-xs text-blue-500">Added by: {member.added_by_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(member.role)} variant="secondary">
                        <span className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </span>
                      </Badge>
                      <Badge className={getStatusColor(member.status)} variant="secondary">
                        {member.status}
                      </Badge>
                    </div>

                    <div className="text-right min-w-[120px]">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Joined {member.joinDate.toLocaleDateString()}
                      </p>
                      {member.last_login && (
                        <p className="text-xs text-gray-400">
                          Last login {member.last_login.toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <TeamMemberActions member={member} onMemberUpdated={loadTeamData} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Understanding different permission levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Badge className="bg-purple-100 text-purple-800" variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Administrator</h4>
                <ul className="text-xs text-gray-500 mt-1 space-y-1">
                  <li>• Full access to all features and settings</li>
                  <li>• Manage team members and permissions</li>
                  <li>• Configure system settings and integrations</li>
                  <li>• Access to detailed audit logs and reports</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Badge className="bg-blue-100 text-blue-800" variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                Editor  
              </Badge>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Editor</h4>
                <ul className="text-xs text-gray-500 mt-1 space-y-1">
                  <li>• Upload and manage compliance documents</li>
                  <li>• Generate and edit policies and procedures</li>
                  <li>• Access compliance mapping and gap analysis</li>
                  <li>• Create and manage audit planning projects</li> 
                  <li>• Can only see users they have added (if admin)</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Badge className="bg-gray-100 text-gray-800" variant="secondary">
                <Eye className="h-3 w-3 mr-1" />
                Viewer
              </Badge>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Viewer</h4>
                <ul className="text-xs text-gray-500 mt-1 space-y-1">
                  <li>• View uploaded documents and policies</li>
                  <li>• Access generated compliance reports</li>
                  <li>• View compliance status and frameworks</li>
                  <li>• Limited chat access for basic queries</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
