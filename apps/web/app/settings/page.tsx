"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { User, Shield, Key, Edit2, Save, X, Eye, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { ThemeSwitch } from "@/components/ui/theme-toggle"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  department?: string
  permissions: string[]
  created_at: string
  updated_at: string
  last_login?: string
}

export default function SettingsPage() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    department: ""
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserProfile()
      if (response.success && response.data) {
        setProfile(response.data)
        setProfileForm({
          full_name: response.data.full_name || "",
          department: response.data.department || ""
        })
      } else {
        toast.error("Failed to load profile")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Error loading profile")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await apiClient.updateUserProfile(profileForm)
      if (response.success) {
        setProfile(prev => prev ? {
          ...prev,
          full_name: profileForm.full_name,
          department: profileForm.department
        } : null)
        setIsEditingProfile(false)
        toast.success("Profile updated successfully")
      } else {
        toast.error(response.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error updating profile")
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordForm.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    try {
      const response = await apiClient.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      })

      if (response.success) {
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: ""
        })
        setIsChangingPassword(false)
        toast.success("Password changed successfully")
      } else {
        toast.error(response.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Error changing password")
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load profile information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account preferences and application settings</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* User Profile Section */}
        <div className="bg-card shadow rounded-lg border overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-medium text-card-foreground flex items-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Profile Information
            </h2>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-primary hover:text-primary/80"
            >
              {isEditingProfile ? (
                <>
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Edit
                </>
              )}
            </button>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {isEditingProfile ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter department"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 sm:space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileUpdate}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-medium rounded-md hover:bg-primary/90 flex items-center"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Save Changes
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm sm:text-base text-foreground break-all">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm sm:text-base text-foreground">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Department</label>
                    <p className="text-sm sm:text-base text-foreground">{profile.department || "Not specified"}</p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Role</label>
                    <div className="flex items-center">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                      <span className="capitalize px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Status</label>
                    <span className={`inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm ${
                      profile.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-sm sm:text-base text-foreground">{formatDate(profile.created_at)}</p>
                  </div>
                  {profile.last_login && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">Last Login</label>
                      <p className="text-sm sm:text-base text-foreground">{formatDate(profile.last_login)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-card shadow rounded-lg border overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-medium text-card-foreground flex items-center">
              <Key className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Password Security
            </h2>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="flex items-center px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-primary hover:text-primary/80"
            >
              {isChangingPassword ? (
                <>
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Change Password
                </>
              )}
            </button>
          </div>
          <div className="p-4 sm:p-6">
            {isChangingPassword ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.
                </div>
                <div className="flex justify-end space-x-2 sm:space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordForm({
                        current_password: "",
                        new_password: "",
                        confirm_password: ""
                      })
                    }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Change Password
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">Keep your account secure by using a strong password.</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Last password update: {formatDate(profile.updated_at)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="bg-card shadow rounded-lg border overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border">
            <h2 className="text-base sm:text-lg font-medium text-card-foreground flex items-center">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Permissions
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {profile.permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-primary/10 text-primary rounded-md text-sm"
                >
                  <Shield className="h-3 w-3 sm:h-3 sm:w-3 mr-1 sm:mr-2" />
                  {permission.replace('_', ' ').toUpperCase()}
                </div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3">
              Permissions are managed by administrators. Contact your admin to request changes.
            </p>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-card shadow rounded-lg border">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border">
            <h2 className="text-base sm:text-lg font-medium text-card-foreground">Appearance</h2>
          </div>
          <div className="p-4 sm:p-6">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </div>
  )
}
