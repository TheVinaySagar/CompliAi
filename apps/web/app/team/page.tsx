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
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage team members and their access permissions</p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} className="w-full sm:w-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <InviteMemberDialog onMemberInvited={loadTeamData} triggerClassName="w-full sm:w-auto" />
          </div>
        </div>
      </div>

      {/* Team Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <Card className="min-h-[100px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {isLoading ? "-" : teamStats?.total_members || members.length}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[100px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {isLoading ? "-" : teamStats?.active_members || members.filter((m) => m.status === "Active").length}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[100px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {isLoading ? "-" : teamStats?.pending_members || members.filter((m) => m.status === "Pending").length}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[100px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">
              {isLoading ? "-" : teamStats?.admin_count || members.filter((m) => m.role === "Admin").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Team Members</CardTitle>
          <CardDescription className="text-sm sm:text-base">Manage roles and permissions for your team</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-300 rounded-full"></div>
                  <div className="ml-3 sm:ml-4 flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/3 sm:w-1/4"></div>
                    <div className="h-2 sm:h-3  bg-gray-300 rounded w-1/2 sm:w-1/3"></div>
                  </div>
                  <div className="hidden sm:flex gap-2 ml-4"> 
                   <div className="h-6 bg-gray-300 rounded w-16"></div>
                   <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                   <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-300 rounded ml-auto"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 sm:py-8">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-red-600 mb-3 sm:mb-4">{error}</p>
              <Button onClick={loadTeamData} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4">
                <UserCheck className="h-full w-full" />
              </div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Get started by inviting your first team member.</p>
              <InviteMemberDialog onMemberInvited={loadTeamData} />
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {members.map((member) => (
                <div key={member.id} className="lex flex-col xs:flex-row xs:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-xs sm:text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{member.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{member.email}</p>
                      {member.department && (
                        <p className="text-xs text-gray-400 truncate">{member.department}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-4 ml-0 xs:ml-4">
                    <div className="flex gap-1 sm:gap-2">
                      <Badge className={`${getRoleColor(member.role)} text-xs sm:text-sm`} variant="secondary">
                        <span className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </span>
                      </Badge>
                      <Badge className={`${getStatusColor(member.status)} text-xs sm:text-sm`} variant="secondary">
                        {member.status}
                      </Badge>
                    </div>

                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 sm:gap-2">
                     <div className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 mr-1" />
                      <span className="text-xs sm:text-sm text-gray-500">
                        Joined {member.joinDate.toLocaleDateString()}
                      </span>
                      </div>
                      {member.last_login && (
                        <div className="flex items-center">
                          <span className="hidden xs:inline text-gray-300 mx-1">•</span>
                          <span className="text-xs sm:text-sm text-gray-400">
                            Last login {member.last_login.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-auto">
                    <TeamMemberActions member={member} onMemberUpdated={loadTeamData}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Information */}
      <Card className="mt-4 sm:mt-6">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Role Permissions</CardTitle>
          <CardDescription className="text-sm sm:text-base">Understanding different permission levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <Badge className="bg-purple-100 text-purple-800 w-fit" variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900">Administrator</h4>
                <ul className="text-xs sm:text-sm text-gray-500 mt-1 space-y-1">
                  <li>• Full access to all features and settings</li>
                  <li>• Manage team members and permissions</li>
                  <li>• Configure system settings and integrations</li>
                  <li>• Access to detailed audit logs and reports</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <Badge className="bg-blue-100 text-blue-800 w-fit" variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                Editor  
              </Badge>
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900">Editor</h4>
                <ul className="text-xs sm:text-sm text-gray-500 mt-1 space-y-1">
                  <li>• Upload and manage compliance documents</li>
                  <li>• Generate and edit policies and procedures</li>
                  <li>• Access compliance mapping and gap analysis</li>
                  <li>• Create and manage audit planning projects</li> 
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <Badge className="bg-gray-100 text-gray-800 w-fit" variant="secondary">
                <Eye className="h-3 w-3 mr-1" />
                Viewer
              </Badge>
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900">Viewer</h4>
                <ul className="text-xs sm:text-sm text-gray-500 mt-1 space-y-1">
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
